import { ContractName } from "~~/utils/scaffold-eth/contract";

export const JJ_CONTRACT_NAME = "JackpotJunction";

export const ROLL_COST = 100;

export type UniversalButtonParams = {
    contractName: ContractName;
    functionName: string;
    args: any[];
    value: BigInt
    offchainButton?: any;
}