"use client";

import { useEffect, useState } from "react";
import { TransactionReceipt } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { Prize } from '~~/components/cosmic-engine/JackpotJunction';
import "~~/styles/roll-button.scss";

type RollButtonProps = {
  isReroll: boolean;
  handleReroll: (val: boolean) => void;
  deployedContractData: Contract<ContractName>;
  buttonLabel: string;
  handleIsSpinning?: (val: boolean) => void;
  handlePrizeWon?: (prize: Prize | null) => void;
  handleLoading: (val: boolean)=> void;
  onChange: () => void;
  args?: any;
  payableValue?: string;
  loading: boolean;
};

export const RollButton = ({
  isReroll,
  handleReroll,
  deployedContractData,
  buttonLabel,
  handleIsSpinning,
  handleLoading,
  handlePrizeWon,
  onChange,
  args,
  payableValue,
  loading,
}: UniversalButtonProps) => {

  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const handleWrite = async () => {
    if (writeContractAsync) {
      try {
        handleLoading(true);
        handleIsSpinning(true);
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: deployedContractData.address,
            // @ts-ignore
            functionName: "roll",
            abi: deployedContractData.abi,
            args: args,
            // @ts-ignore
            value: payableValue ? BigInt(payableValue) : BigInt("0"), 
          });
        const res = await writeTxn(makeWriteWithParams);
        handleIsSpinning(false);
        handlePrizeWon({prize: 'This is the reward!'});
        handleReroll(true);
        onChange();
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
        handleIsSpinning(false);
        handleLoading(false)
        handlePrizeWon(null);
      }
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
