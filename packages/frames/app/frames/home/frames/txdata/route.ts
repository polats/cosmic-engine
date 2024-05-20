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

export const POST = frames(async (ctx) => {
  if (!ctx?.message) {
    throw new Error("Invalid frame message");
  }

  const chain = hardhat;
  const chainId = chain.id;
  const contractName = "JackpotJunction";
  const contractAddress = deployedContracts[chainId][contractName].address;
  const contractAbi = deployedContracts[chainId][contractName].abi;  
  const functionName = "roll";

  const calldata = encodeFunctionData({
    abi: contractAbi,
    functionName: functionName,
    args: []
  });

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  const contractInstance = getContract({
    address: contractAddress,
    abi: contractAbi,
    client: publicClient
  });

  const costToRoll = await contractInstance.read.CostToRoll();

  return transaction({
    chainId: "eip155:" + chainId,
    method: "eth_sendTransaction",
    params: {
      abi: contractAbi as Abi,
      to: contractAddress,
      data: calldata,
      value: costToRoll.toString(),
    },
  });
});
