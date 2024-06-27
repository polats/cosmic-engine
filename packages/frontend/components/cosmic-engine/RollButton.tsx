"use client";

import { useEffect, useState } from "react";
import { TransactionReceipt, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { toast } from 'react-hot-toast';
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { Prize } from '~~/components/cosmic-engine/JackpotJunction';
import "~~/styles/roll-button.scss";

type RollButtonProps = {
  isReroll: boolean;
  handleReroll: (val: boolean) => void;
  deployedContractData?: Contract<ContractName>;
  buttonLabel: string;
  isWheelActive: boolean;
  handleIsSpinning: (val: boolean) => void;
  handleLoading: (val: boolean)=> void;
  handlePrizeWon: (prize: Prize | null) => void;
  handleWheelActivity: (val: boolean) => void;
  onChange: () => void;
  args?: any;
  payableValue?: string;
  loading: boolean;
  outcome: any,
};

export const RollButton = ({
  isReroll,
  handleReroll,
  deployedContractData,
  buttonLabel,
  handleIsSpinning,
  isWheelActive,
  handleWheelActivity,
  handlePrizeWon,
  handleLoading,
  onChange,
  args,
  payableValue,
  loading,
  outcome
}: RollButtonProps) => {

  const { address: userAddress, chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;
  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const handleWrite = async () => {
    if (writeContractAsync && deployedContractData) {
      
      try {
          handleWheelActivity(true);
          handleLoading(true);
          const makeWriteWithParams = async() =>
            await writeContractAsync({
              address: deployedContractData.address,
              // @ts-ignore
              functionName: "roll",
              abi: deployedContractData.abi,
              args: args,
              // @ts-ignore
              value: payableValue ? BigInt(payableValue) : BigInt("0"), 
          });
          const res = await writeTxn(makeWriteWithParams);
          handlePrizeWon(null);
        } catch (error) {
          toast.error("Failed to do transaction, are you sure you have enough funds?");
          handleLoading(false);
          handleWheelActivity(false);
          handlePrizeWon(null);
        }
        // perform another transaction on localhost to make block tick
        try {
          if (chain?.id === hardhat.id) {
            await writeTxn({
              chain: hardhat,
              account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
              to: userAddress,
              value: parseEther("0"),
            });        
          }
        } catch (error) {
          // toast.error(error);
          handleLoading(false)
          handleWheelActivity(false);
        }
        onChange();
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransactionReceipt({
    hash: result,
  });

  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 flex-row justify-between items-center`}>
        <div className="flex justify-between gap-2">
          <div
            className={`flex ${
              writeDisabled &&
              "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button 
              className={`spin w-[150px] h-[64px] text-xl text-center`}
              disabled={writeDisabled || isPending} onClick={handleWrite}
            >
              {isPending || loading? <span className="loading loading-spinner loading-xs"></span> : isReroll ? 'Reroll' : buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RollButton;
