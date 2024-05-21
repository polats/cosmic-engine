import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  getContract,
  http,
} from "viem";
import { hardhat, optimism } from "viem/chains";
import { frames } from "../frames";
import deployedContracts from "../../../contracts/deployedContracts";
import { transaction } from "frames.js/core";
import { getJackpotJunctionContract, getChain } from "../../../../utils";


export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error("Invalid frame message");
  }

  const contractInstance = getJackpotJunctionContract();
  const functionName = "roll";

  const calldata = encodeFunctionData({
    abi: contractInstance.abi,
    functionName: functionName,
    args: []
  });

  const costToRoll = await contractInstance.read.CostToRoll();

  return transaction({
    chainId: "eip155:" + getChain().id,
    method: "eth_sendTransaction",
    params: {
      abi: contractInstance.abi as Abi,
      to: contractInstance.address,
      data: calldata,
      value: costToRoll.toString(),
    },
  });
});
