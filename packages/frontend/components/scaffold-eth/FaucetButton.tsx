"use client";

import { useState } from "react";
import { Address, createWalletClient, http, parseEther, zeroAddress } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useWatchBalance } from "~~/hooks/scaffold-eth/useWatchBalance";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { privateKeyToAccount } from 'viem/accounts'
import { parse } from "path";

// Number of ETH faucet sends to an address
const NUM_OF_ETH = "0.0001";
const HARDHAT_NUM_OF_ETH ="0.1";
const HARDHAT_FAUCET_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const NEXT_PUBLIC_FAUCET_ADDRESS=process.env.NEXT_PUBLIC_FAUCET_ADDRESS;
const NEXT_PUBLIC_FAUCET_PK=process.env.NEXT_PUBLIC_FAUCET_PK;


/**
 * FaucetButton button which lets you grab eth.
 */
export const FaucetButton = () => {
  const { address, chain: ConnectedChain } = useAccount();

  const { data: balance } = useWatchBalance({ address });

  const [loading, setLoading] = useState(false);

  const { targetNetwork } = useTargetNetwork();

  const walletClient = createWalletClient({
    chain: targetNetwork,
    transport: http(),
  });
  

  const faucetTxn = useTransactor(walletClient);

  const sendETH = async () => {
    try {
      setLoading(true);

      // do scaffold-eth faucet txn if connected to hardhat
      if (ConnectedChain?.id === hardhat.id) {

        await faucetTxn({
          chain: hardhat,
          account: HARDHAT_FAUCET_ADDRESS,
          to: address,
          value: parseEther(HARDHAT_NUM_OF_ETH),
        });
      }

      else {
          const account = privateKeyToAccount(NEXT_PUBLIC_FAUCET_PK as Address);

          if (address) {
          // do custom faucet txn if connected to a different chain
            await faucetTxn({
              chain: targetNetwork,
              account: account,
              to: address,
              value: parseEther(NUM_OF_ETH),
            });
        }
      }

      setLoading(false);

    } catch (error) {
      console.error("⚡️ ~ file: FaucetButton.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  // if (ConnectedChain?.id !== hardhat.id) {
  //   return null;
  // }

  const isBalanceZero = balance && balance.value === 0n;

  return (
    <div
      className={
        !isBalanceZero
          ? "ml-1"
          : "ml-1 tooltip tooltip-bottom tooltip-secondary tooltip-open font-bold before:left-auto before:transform-none before:content-[attr(data-tip)] before:right-0"
      }
      data-tip="Grab funds from faucet"
    >
      <button className="btn btn-secondary btn-sm px-2 rounded-full" onClick={sendETH} disabled={loading}>
        {!loading ? (
          <BanknotesIcon className="h-4 w-4" />
        ) : (
          <span className="loading loading-spinner loading-xs"></span>
        )}
      </button>
    </div>
  );
};
