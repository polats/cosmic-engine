// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.13;

import {ERC1155} from "../lib/openzeppelin-contracts/contracts/token/ERC1155/ERC1155.sol";
import {ReentrancyGuard} from "../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Base64} from "../lib/openzeppelin-contracts/contracts/utils/Base64.sol";
import {Strings} from "../lib/openzeppelin-contracts/contracts/utils/Strings.sol";

/// @title Jackpot Junction game contract
/// @author Moonstream Engineering (engineering@moonstream.to)
///
/// @notice This is the game contract for The Degen Trail: Jackpot Junction, a game in world of The Degen Trail.
contract JackpotJunction is ERC1155, ReentrancyGuard {
    // Cumulative mass functions for probability distributions. Total mass for each distribution is 2^20 = 1048576.
    /// Cumulative mass function for the unmodified distribution over outcomes.
    uint256[5] public UnmodifiedOutcomesCumulativeMass = [
        524288,
        524288 + 408934,
        524288 + 408934 + 104857,
        524288 + 408934 + 104857 + 10487,
        524288 + 408934 + 104857 + 10487 + 10
    ];
    /// Cumulative mass function for the improved distribution over outcomes.
    uint256[5] public ImprovedOutcomesCumulativeMass = [
        469283,
        469283 + 408934,
        469283 + 408934 + 154857,
        469283 + 408934 + 154857 + 15487,
        469283 + 408934 + 154857 + 15487 + 15
    ];

    /// How many blocks a player has to act (reroll/accept).
    uint256 public BlocksToAct;

    /// The block number of the last roll/re-roll by each player.
    mapping(address => uint256) public LastRollBlock;

    /// Cost (finest denomination of native token on the chain) to roll.
    uint256 public CostToRoll;
    /// Cost (finest denomination of native token on the chain) to reroll.
    uint256 public CostToReroll;

    /// Specifies the largest tier that has been unlocked for a given (itemType, terrainType) pair.
    /// @notice Item types: 0 (wagon cover), 1 (wagon body), 2 (wagon wheel), 3 (beast)
    /// @notice Terrain types: 0 (plains), 1 (forest), 2 (swamp), 3 (water), 4 (mountain), 5 (desert), 6 (ice)
    /// @notice Encoding of ERC1155 pool IDs: tier*28 + terrainType*4 + itemType
    /// @notice itemType => terrainType => tier
    mapping(uint256 => mapping(uint256 => uint256)) public CurrentTier;

    // NOTE: Only EquippedCover has a meaningful 0 value. Pool ID 0 is the tier 0 plain cover. This means that
    // we need not add 1 to the pool ID for EquippedBody, EquippedWheels, and EquippedBeasts. This will save gas
    // at the expense of making our code harder to understand. This is why I haven't implemented this optimization
    // at the moment. Just recording the possibility of making it here.
    /// EquippedCover indicates the poolID of the cover that is currently equipped by the given player.
    /// @notice The mapping is address(player) => poolID + 1.
    /// @notice The value stored is poolID + 1 so that 0 indicates that no item is currently equipped in the slot.
    mapping(address => uint256) public EquippedCover;
    /// EquippedBody indicates the poolID of the body that is currently equipped by the given player.
    /// @notice The mapping is address(player) => poolID + 1.
    /// @notice The value stored is poolID + 1 so that 0 indicates that no item is currently equipped in the slot.
    mapping(address => uint256) public EquippedBody;
    /// EquippedWheels indicates the poolID of the wheels that are currently equipped by the given player.
    /// @notice The mapping is address(player) => poolID + 1.
    /// @notice The value stored is poolID + 1 so that 0 indicates that no item is currently equipped in the slot.
    mapping(address => uint256) public EquippedWheels;
    /// EquippedBeasts indicates the poolID of the beasts that are currently equipped by the given player.
    /// @notice The mapping is address(player) => poolID + 1.
    /// @notice The value stored is poolID + 1 so that 0 indicates that no item is currently equipped in the slot.
    mapping(address => uint256) public EquippedBeasts;

    /// Fired when a new tier is unlocked for the givem itemType and terrainType. Specifies the tier and
    /// its pool ID.
    event TierUnlocked(uint256 indexed itemType, uint256 indexed terrainType, uint256 indexed tier, uint256 poolID);
    /// Fired when a player rolls (and rerolls).
    event Roll(address indexed player);
    /// Fired when a player accepts the outcome of a roll.
    event Award(address indexed player, uint256 indexed outcome, uint256 value);

    /// Signifies that the player is no longer able to act because too many blocks elapsed since their
    /// last action.
    error DeadlineExceeded();
    /// Signifies that a player cannot take an action that requires them to be out of a roll because it
    /// is too soon since they rolled. This error is raised when a player tries to equip or unequip items
    /// while they are in the middle of a roll.
    error RollInProgress();
    /// This error is raised to signify that the player needs to wait for at least one more block to elapse.
    error WaitForTick();
    /// Signifies that the player has not provided enough value to perform the action.
    error InsufficientValue();
    /// Signifies that the player attempted to use an invalid item to perform a certain action.
    error InvalidItem(uint256 poolID);
    /// Signifies that the player does not have enough items in their possession to perform an action.
    error InsufficientItems(uint256 poolID);

   function supportsInterface(bytes4 interfaceID) public pure override returns (bool) {
      return
            interfaceID == 0x01ffc9a7 ||    // ERC-165 support (i.e. `bytes4(keccak256('supportsInterface(bytes4)'))`).
            interfaceID == 0xd9b67a26 ||     // ERC1155 interface ID
            interfaceID == 0x4e2312e0 ||     // ERC-1155 `ERC1155TokenReceiver` support (i.e. `bytes4(keccak256("onERC1155Received(address,address,uint256,uint256,bytes)")) ^ bytes4(keccak256("onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)"))`).
            interfaceID == 0xc46a2148;       // IJackpotJunction interface ID
    }

    /// Creates a JackpotJunction game contract.
    /// @param blocksToAct The number of blocks a player has to either reroll or accept the outcome of their current roll.
    /// @param costToRoll The cost in the finest denomination of the native token on the chain to roll.
    /// @param costToReroll The cost in the finest denomination of the native token on the chain to reroll.
    constructor(uint256 blocksToAct, uint256 costToRoll, uint256 costToReroll)
        ERC1155("https://github.com/moonstream-to/degen-trail")
    {
        BlocksToAct = blocksToAct;
        CostToRoll = costToRoll;
        CostToReroll = costToReroll;

        for (uint256 i = 0; i < 4; i++) {
            for (uint256 j = 0; j < 7; j++) {
                emit TierUnlocked(i, j, 0, 4 * j + i);
            }
        }
    }

    /// Allows the contract to receive the native token on its blockchain.
    receive() external payable {}

    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        return 0xf23a6e61;
    }

    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        return 0xbc197c81;
    }

    function _enforceDeadline(address degenerate) internal view {
        if (block.number > LastRollBlock[degenerate] + BlocksToAct) {
            revert DeadlineExceeded();
        }
    }

    function _enforceNotRolling(address degenerate) internal view {
        if (block.number <= LastRollBlock[degenerate] + BlocksToAct) {
            revert RollInProgress();
        }
    }

    /// Returns the itemType, terrainType, and tier of a given pool ID.
    function genera(uint256 poolID) public pure returns (uint256 itemType, uint256 terrainType, uint256 tier) {
        tier = poolID / 28;
        terrainType = (poolID % 28) / 4;
        itemType = poolID % 4;
    }

    /// Returns true if the given player currently has a bonus applied to them from their equipped items and false otherwise.
    function hasBonus(address degenerate) public view returns (bool bonus) {
        bonus = false;

        uint256 wagonCover = EquippedCover[degenerate];
        uint256 wagonBody = EquippedBody[degenerate];
        uint256 wheels = EquippedWheels[degenerate];
        uint256 beastTrain = EquippedBeasts[degenerate];

        if (wagonCover != 0 && wagonBody != 0 && wheels != 0 && beastTrain != 0) {
            // Decrement each equipped item by 1 to get its pool ID.
            wagonCover--;
            wagonBody--;
            wheels--;
            beastTrain--;

            uint256 terrainType;

            uint256 currentItemType;
            uint256 currentTier;
            uint256 currentTerrainType;

            (currentItemType, currentTerrainType, currentTier) = genera(wagonCover);
            if (CurrentTier[currentItemType][currentTerrainType] == currentTier) {
                bonus = true;
            }
            terrainType = currentTerrainType;

            if (bonus) {
                (currentItemType, currentTerrainType, currentTier) = genera(wagonBody);
                if (CurrentTier[currentItemType][currentTerrainType] != currentTier || currentTerrainType != terrainType) {
                    bonus = false;
                }
            }

            if (bonus) {
                (currentItemType, currentTerrainType, currentTier) = genera(wheels);
                if (CurrentTier[currentItemType][currentTerrainType] != currentTier || currentTerrainType != terrainType) {
                    bonus = false;
                }
            }

            if (bonus) {
                (currentItemType, currentTerrainType, currentTier) = genera(beastTrain);
                if (CurrentTier[currentItemType][currentTerrainType] != currentTier || currentTerrainType != terrainType) {
                    bonus = false;
                }
            }
        }
    }

    /// Samples from unmodified distribution over outcomes.
    function sampleUnmodifiedOutcomeCumulativeMass(uint256 entropy) public view returns (uint256) {
        uint256 sample = entropy << 236 >> 236;
        if (sample < UnmodifiedOutcomesCumulativeMass[0]) {
            return 0;
        } else if (sample < UnmodifiedOutcomesCumulativeMass[1]) {
            return 1;
        } else if (sample < UnmodifiedOutcomesCumulativeMass[2]) {
            return 2;
        } else if (sample < UnmodifiedOutcomesCumulativeMass[3]) {
            return 3;
        }
        return 4;
    }

    /// Samples from bonus distribution over outcomes.
    function sampleImprovedOutcomesCumulativeMass(uint256 entropy) public view returns (uint256) {
        uint256 sample = entropy << 236 >> 236;
        if (sample < ImprovedOutcomesCumulativeMass[0]) {
            return 0;
        } else if (sample < ImprovedOutcomesCumulativeMass[1]) {
            return 1;
        } else if (sample < ImprovedOutcomesCumulativeMass[2]) {
            return 2;
        } else if (sample < ImprovedOutcomesCumulativeMass[3]) {
            return 3;
        }
        return 4;
    }

    /// Rolls or rerolls for the `msg.sender`, depending on whether or not whether `BlocksToAct` blocks
    /// have elapsed since their last roll. If that number of blocks has elapsed, then the player is rolling
    /// and must pay `CostToRoll`. Otherwise, the player is rerolling and must be `CostToReroll`.
    function roll() external payable {
        uint256 requiredFee = CostToRoll;
        if (block.number <= LastRollBlock[msg.sender] + BlocksToAct) {
            requiredFee = CostToReroll;
        }

        if (msg.value < requiredFee) {
            revert InsufficientValue();
        }

        LastRollBlock[msg.sender] = block.number;

        emit Roll(msg.sender);
    }

    function _entropy(address degenerate) internal view virtual returns (uint256) {
        return uint256(keccak256(abi.encode(blockhash(LastRollBlock[degenerate]), degenerate)));
    }

    /// @notice Returns the current small, medium, and large rewards based on the game contract's native
    /// token balance.
    /// @return small The current small reward (in Wei)
    /// @return medium The current medium reward (in Wei)
    /// @return large The current large reward (in Wei)
    function currentRewards() public view returns (uint256 small, uint256 medium, uint256 large) {
        small = CostToRoll + (CostToRoll >> 1);
        if (small > address(this).balance >> 6) {
            small = address(this).balance >> 6;
        }
        medium = address(this).balance >> 6;
        large = address(this).balance >> 1;
    }

    /// @notice If `outcome` is called at least one block after the player last rolled and before the players
    /// block deadline expires, it shows the outcome of the player's last roll.
    /// @param degenerate The address of the player
    /// @param bonus This boolean signifies whether the outcome should be sampled from the unmodified or the improved outcome distribution
    /// @return entropy The randomness that was used to determine the outcome of the player's last roll
    /// @return _outcome The outcome of the player's last roll - this is 0, 1, 2, 3, or 4 and represents an index in either `UnmodifiedOutcomesCumulativeMass` or `ImprovedOutcomesCumulativeMass` (depending on whether a bonus was applied)
    /// @return reward This represents a numerical parameter representing the reward that the player should receive. If the `_outcome` was `0`, this value is irrelevant and should be ignored. If the `_outcome` was `1`, signifying that the player will receive an item, this value is the ERC1155 `tokenID` of the item that will be transferred to the player if they accept the outcome, if the `_outcome` was `2`, `3`, or `4`, this value is the amount of native tokens that will be transferred to the player if they accept the outcome.
    function outcome(address degenerate, bool bonus) public view returns (uint256, uint256, uint256) {
        if (block.number <= LastRollBlock[degenerate]) {
            revert WaitForTick();
        }

        _enforceDeadline(degenerate);

        // entropy layout:
        // |- 118 bits -|- 118 bits -|- 20 bits -|
        //    item type  terrain type   outcome
        uint256 entropy = _entropy(degenerate);

        uint256 _outcome;
        if (bonus) {
            _outcome = sampleImprovedOutcomesCumulativeMass(entropy);
        } else {
            _outcome = sampleUnmodifiedOutcomeCumulativeMass(entropy);
        }

        uint256 value;

        if (_outcome == 1) {
            uint256 terrainType = (entropy << 118 >> 138) % 7;
            uint256 itemType = (entropy >> 138) % 4;
            value = 4 * terrainType + itemType;
        } else if (_outcome == 2) {
            value = CostToRoll + (CostToRoll >> 1);
            if (value > address(this).balance >> 6) {
                value = address(this).balance >> 6;
            }
        } else if (_outcome == 3) {
            value = address(this).balance >> 6;
        } else if (_outcome == 4) {
            value = address(this).balance >> 1;
        }

        return (entropy, _outcome, value);
    }

    function _award(uint256 _outcome, uint256 value) internal {
        if (_outcome == 1) {
            _mint(msg.sender, value, 1, "");
        } else if (_outcome == 2 || _outcome == 3 || _outcome == 4) {
            payable(msg.sender).transfer(value);
        }

        emit Award(msg.sender, _outcome, value);
    }

    function _clearRoll() internal {
        LastRollBlock[msg.sender] = 0;
    }

    /// If a player calls this method at least one block after they last rolled and before their block deadline expires,
    /// it accepts the outcome of their last roll and transfers the corresponding reward to their account.
    /// @return entropy The randomness that was used to determine the outcome of the player's last roll
    /// @return _outcome The outcome of the player's last roll - this is 0, 1, 2, 3, or 4 and represents an index in either `UnmodifiedOutcomesCumulativeMass` or `ImprovedOutcomesCumulativeMass` (depending on whether a bonus was applied)
    /// @return reward This represents a numerical parameter representing the reward that the player should receive. If the `_outcome` was `0`, this value is irrelevant and should be ignored. If the `_outcome` was `1`, signifying that the player will receive an item, this value is the ERC1155 `tokenID` of the item that will be transferred to the player if they accept the outcome, if the `_outcome` was `2`, `3`, or `4`, this value is the amount of native tokens that will be transferred to the player if they accept the outcome.
    function accept() external nonReentrant returns (uint256, uint256, uint256) {
        // The call to outcome() enforces the following constraints:
        // - At least one block has passed after the player rolled.
        // - The player last rolled at most BlocksToAct blocks ago.
        (uint256 entropy, uint256 _outcome, uint256 value) = outcome(msg.sender, hasBonus(msg.sender));

        _award(_outcome, value);
        _clearRoll();
        return (entropy, _outcome, value);
    }

    function equip(uint256[] calldata poolIDs) external nonReentrant {
        _enforceNotRolling(msg.sender);

        for (uint256 i = 0; i < poolIDs.length; i++) {
            (uint256 itemType,,) = genera(poolIDs[i]);
            if (itemType == 0) {
                uint256 currentPoolID;
                if (EquippedCover[msg.sender] != 0) {
                    currentPoolID = EquippedCover[msg.sender] - 1;
                    _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
                }
                _safeTransferFrom(msg.sender, address(this), poolIDs[i], 1, "");
                EquippedCover[msg.sender] = poolIDs[i] + 1;
            } else if (itemType == 1) {
                uint256 currentPoolID;
                if (EquippedBody[msg.sender] != 0) {
                    currentPoolID = EquippedBody[msg.sender] - 1;
                    _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
                }
                _safeTransferFrom(msg.sender, address(this), poolIDs[i], 1, "");
                EquippedBody[msg.sender] = poolIDs[i] + 1;
            } else if (itemType == 2) {
                uint256 currentPoolID;
                if (EquippedWheels[msg.sender] != 0) {
                    currentPoolID = EquippedWheels[msg.sender] - 1;
                    _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
                }
                _safeTransferFrom(msg.sender, address(this), poolIDs[i], 1, "");
                EquippedWheels[msg.sender] = poolIDs[i] + 1;
            } else if (itemType == 3) {
                uint256 currentPoolID;
                if (EquippedBeasts[msg.sender] != 0) {
                    currentPoolID = EquippedBeasts[msg.sender] - 1;
                    _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
                }
                _safeTransferFrom(msg.sender, address(this), poolIDs[i], 1, "");
                EquippedBeasts[msg.sender] = poolIDs[i] + 1;
            } else {
                // If you end up in this branch, there's a bug in "genera".
                revert InvalidItem(poolIDs[i]);
            }
        }
    }

    function unequip() external nonReentrant {
        _enforceNotRolling(msg.sender);

        uint256 currentPoolID;
        if (EquippedCover[msg.sender] != 0) {
            currentPoolID = EquippedCover[msg.sender] - 1;
            _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
            delete EquippedCover[msg.sender];
        }

        if (EquippedBody[msg.sender] != 0) {
            currentPoolID = EquippedBody[msg.sender] - 1;
            _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
            delete EquippedBody[msg.sender];
        }

        if (EquippedWheels[msg.sender] != 0) {
            currentPoolID = EquippedWheels[msg.sender] - 1;
            _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
            delete EquippedWheels[msg.sender];
        }

        if (EquippedBeasts[msg.sender] != 0) {
            currentPoolID = EquippedBeasts[msg.sender] - 1;
            _safeTransferFrom(address(this), msg.sender, currentPoolID, 1, "");
            delete EquippedBeasts[msg.sender];
        }
    }

    function craft(uint256 poolID, uint256 numOutputs) external nonReentrant returns (uint256 newPoolID) {
        if (balanceOf(msg.sender, poolID) < 2 * numOutputs) {
            revert InsufficientItems(poolID);
        }

        newPoolID = poolID + 28;

        _burn(msg.sender, poolID, 2 * numOutputs);
        _mint(msg.sender, newPoolID, numOutputs, "");

        (uint256 itemType, uint256 terrainType, uint256 tier) = genera(newPoolID);
        if (CurrentTier[itemType][terrainType] < tier) {
            CurrentTier[itemType][terrainType] = tier;
            emit TierUnlocked(itemType, terrainType, tier, newPoolID);
        }
    }

    function burn(uint256 poolID, uint256 amount) external {
        _burn(msg.sender, poolID, amount);
    }

    function burnBatch(uint256[] memory poolIDs, uint256[] memory amounts) external {
        _burnBatch(msg.sender, poolIDs, amounts);
    }

    function poolMetadata(uint256 poolID) public pure returns (bytes memory json) {
        (uint256 itemType, uint256 terrainType, uint256 tier) = genera(poolID);
        string memory name = string(abi.encodePacked("Tier ", Strings.toString(tier)));
        string memory terrainTypeName;
        string memory itemTypeName;
        if (terrainType == 0) {
            terrainTypeName = "plains";
        } else if (terrainType == 1) {
            terrainTypeName = "forest";
        } else if (terrainType == 2) {
            terrainTypeName = "swamp";
        } else if (terrainType == 3) {
            terrainTypeName = "water";
        } else if (terrainType == 4) {
            terrainTypeName = "mountain";
        } else if (terrainType == 5) {
            terrainTypeName = "desert";
        } else if (terrainType == 6) {
            terrainTypeName = "ice";
        }

        if (itemType == 0) {
            itemTypeName = "cover";
        } else if (itemType == 1) {
            itemTypeName = "body";
        } else if (itemType == 2) {
            itemTypeName = "wheels";
        } else if (itemType == 3) {
            itemTypeName = "beasts";
        }

        name = string(abi.encodePacked(name, unicode" ", terrainTypeName, unicode" ", itemTypeName));

        json = abi.encodePacked(
            '{"name": "',
            name,
            '", "decimals": 0, "attributes": [{"trait_type": "tier", "display_type": "number", "value": "',
            Strings.toString(tier),
            '"}, {"trait_type": "terrain_type", "display_type": "string", "value": "',
            terrainTypeName,
            '"}, {"trait_type": "item_type", "display_type": "string", "value": "',
            itemTypeName,
            '"}]}'
        );
    }

    function uri(uint256 poolID) public pure override returns (string memory) {
        return string(abi.encodePacked("data:application/json;base64,", Base64.encode(poolMetadata(poolID))));
    }
}
