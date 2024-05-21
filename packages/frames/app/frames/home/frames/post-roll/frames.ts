import { createFrames } from "frames.js/next";
import { appURL } from "../../../../utils";
import { FramesMiddleware } from "frames.js/types";
import {
  createPublicClient,
  http,
  getContract  
} from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "../../../contracts/deployedContracts";

type State = {
  transactionBlock: string;  
  transactionId: string;
  outcome: string;
  lastRollBlock: string;
};

type RollOutcomeContext = {
  currentBlock: bigint;
  blocksToAct: bigint;
  // transactionBlock: string;
}

const rollOutcomeMiddleware: FramesMiddleware<State, RollOutcomeContext> = async (
  ctx,
  next
) => {
  const chain = hardhat;
  const chainId = chain.id;
  const contractName = "JackpotJunction";
  const contractAddress = deployedContracts[chainId][contractName].address;
  const contractAbi = deployedContracts[chainId][contractName].abi;  

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  const contractInstance = getContract({
    address: contractAddress,
    abi: contractAbi,
    client: publicClient
  });  

  // get blocks to act
  const blocksToAct = await contractInstance.read.BlocksToAct();

  // get the current block number
  const currentBlock = await publicClient.getBlockNumber();

  // get transaction block from transactionId  

  return next({
    currentBlock,
    blocksToAct
  })
}

export const frames = createFrames<State>({
  initialState: {
    transactionBlock: "",
    transactionId: "",
    outcome: "",
    lastRollBlock: ""
  },
  basePath: "/frames/home/frames/post-roll",
  baseUrl: appURL(),
  middleware: [rollOutcomeMiddleware],
});



/*
type PriceContext = { ethPrice?: number };

const priceMiddleware: FramesMiddleware<any, PriceContext> = async (
  ctx,
  next
) => {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const {
      ethereum: { usd: ethPrice },
    } = await res.json();
    return next({ ethPrice });
  } catch (error) {
    console.error("Error fetching ETH price:", error);
  }
  return next();
};

export const frames = createFrames({
  basePath: "/",
  initialState: {
    pageIndex: 0,
  },
  middleware: [priceMiddleware],
});


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
*/