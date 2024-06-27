import { DisplayVariable } from "~~/app/debug/_components/contract";
import { Abi, AbiFunction } from "abitype";
import { Contract, ContractName, GenericContract, InheritedFunctions } from "~~/utils/scaffold-eth/contract";

export const ReadContractDisplay = ({
  fnName,
  args,
  refreshDisplayVariables,
  deployedContractData,
}: {
  fnName: string;
  args: any;
  refreshDisplayVariables: boolean;
  deployedContractData: Contract<ContractName>;
}) => {
  if (!deployedContractData) {
    return null;
  }


  const functionsToDisplay = (
    (deployedContractData.abi as Abi).filter(part => part.type === "function") as AbiFunction[]
  )

  .filter(fn => {
    const isQueryableWithParams =
      (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length > 0;
    return isQueryableWithParams;
  })
    
    .filter(fn => fn.name == fnName)
    .map(fn => {
      return {
        fn,
        inheritedFrom: ((deployedContractData as GenericContract)?.inheritedFunctions as InheritedFunctions)?.[fn.name],
      };
    })
    .sort((a, b) => (b.inheritedFrom ? b.inheritedFrom.localeCompare(a.inheritedFrom) : 1));

  if (!functionsToDisplay.length) {
    return <>No contract variables</>;
  }

  return (
    <>
      {functionsToDisplay.map(({ fn, inheritedFrom }) => (
        <DisplayVariable
          abi={deployedContractData.abi as Abi}
          abiFunction={fn}
          contractAddress={deployedContractData.address}
          key={fn.name}
          args={args}
          refreshDisplayVariables={refreshDisplayVariables}
        />
      ))}
    </>
  );
};
