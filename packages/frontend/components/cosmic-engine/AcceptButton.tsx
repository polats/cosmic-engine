"use client";

import { useEffect, useState } from "react";
import { TransactionReceipt } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { Prize } from '~~/components/cosmic-engine/JackpotJunction';
import "~~/styles/roll-button.scss";

type AcceptButtonProps = {
  deployedContractData: Contract<ContractName>;
};

export const AcceptButton = ({
  deployedContractData,
}: AcceptButtonProps) => {
  const { chain } = useAccount();
  const writeTxn = useTransactor();
  const { targetNetwork } = useTargetNetwork();
  const writeDisabled = !chain || chain?.id !== targetNetwork.id;

  const { data: result, isPending, writeContractAsync } = useWriteContract();

  const handleWrite = async () => {
    if (writeContractAsync) {
      try {
        const makeWriteWithParams = () =>
          writeContractAsync({
            address: deployedContractData.address,
            // @ts-ignore
            functionName: "accept",
            abi: deployedContractData.abi,
            // @ts-ignore
            value: BigInt("0"), 
          });
        const res = await writeTxn(makeWriteWithParams);
      } catch (e: any) {
        console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
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

  const [count, setCount] = useState(10);
  const totalCount = 10

  // Artificial function to emulate a countdown
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCount(prevCount => {
        if (prevCount > 0) {
          return prevCount - 1;
        } else {
          return 10;
        }
      });
    }, 3000);

    // Cleanup function to clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);


  const Segment = ({index}: {index: number}) => {
    return (
      <div key={index} className={`grow-1 w-full
        ${index === 0 ? 'rounded-l-3xl': index === totalCount-1 ? 'rounded-r-3xl' : ''}
        ${index < count ?
          'bg-white opacity-80 border-r-2'
        : index === count ?
          'loader-pulse bg-red-800'
        :
          'bg-none opacity-100'
        }
      `}>
      </div>
    )
  }

  const Loader = () => {
    return (
        <div className="mt-[-5px] w-[95%] flex justify-center border rounded-3xl h-[30px]">
          {Array(totalCount).fill(null).map((value, index) => <Segment key={index} index={index}/>)}
        </div>
    )
  }

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 flex-row justify-between items-center`}>
        <div className="flex justify-between gap-2">
          <div
            className={`flex${
              writeDisabled &&
              "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <div className="flex flex-col items-center">
                <button 
                    className={`alt w-[150px] h-[64px] z-[10] text-xl text-center `}
                    disabled={writeDisabled || isPending} onClick={handleWrite}
                >
                    {isPending ? <span className="loading loading-spinner loading-xs"></span> : 'ACCEPT'}
                </button>
                <Loader />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptButton;