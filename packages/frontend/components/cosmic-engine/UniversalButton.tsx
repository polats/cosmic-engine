"use client";

import { useEffect, useState } from "react";
import { TransactionReceipt } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { Prize } from '~~/components/cosmic-engine/JackpotJunction';

type UniversalButtonProps = {
  fnName: string;
  deployedContractData: Contract<ContractName>;
  buttonLabel: string;
  handleIsSpinning?: (val: boolean) => void;
  handlePrizeWon?: (prize: Prize | null) => void;
  onChange: () => void;
  args?: any;
  payableValue?: string;
};

export const UniversalButton = ({
  fnName,
  deployedContractData,
  buttonLabel,
  handleIsSpinning,
  handlePrizeWon,
  onChange,
  args,
  payableValue,
}: UniversalButtonProps) => {

  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const handleWrite = async () => {
  
    if (writeContractAsync) {
      try {
        if(fnName === 'roll' && handleIsSpinning){
          handleIsSpinning(true);
        }
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: deployedContractData.address,
            // @ts-ignore
            functionName: fnName,
            abi: deployedContractData.abi,
            args: args,
            // @ts-ignore
            value: payableValue ? BigInt(payableValue) : BigInt("0"), 
          });
        const res = await writeTxn(makeWriteWithParams);
        if(fnName === 'roll' && handleIsSpinning && handlePrizeWon){
          handleIsSpinning(false);
          handlePrizeWon({prize: 'This is the reward!'});
        }
        onChange();
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
        if(fnName === 'roll' && handleIsSpinning && handlePrizeWon){
          handleIsSpinning(false);
          handlePrizeWon(null);
        }
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
            <button className="bg-red-600 hover:bg-red-700 py-3 px-6 text-white rounded-lg" 
              disabled={writeDisabled || isPending} onClick={handleWrite}>
              {isPending && <span className="loading loading-spinner loading-xs"></span>}
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
