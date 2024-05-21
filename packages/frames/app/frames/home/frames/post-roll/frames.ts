import { createFrames } from "frames.js/next";
import { 
  appURL, 
  getJackpotJunctionContract,
  getViemPublicClient 
} from "../../../../utils";
import { FramesMiddleware } from "frames.js/types";

type State = {
  startBlock: string;  
  fromAddress: string;
};

type RollOutcomeContext = {
  currentBlock: bigint;
  blocksToAct: bigint;
  outcome: any;
  callResult: string;
}

const rollOutcomeMiddleware: FramesMiddleware<State, RollOutcomeContext> = async (
  ctx,
  next
) => {
  const contractInstance = getJackpotJunctionContract();
  const publicClient = getViemPublicClient();

  // get blocks to act
  const blocksToAct = await contractInstance.read.BlocksToAct();

  // get the current block number
  const currentBlock = await publicClient.getBlockNumber();

  // cast ctx to any to access message
  const anyCtx = ctx as any;
  let outcome;
  let fromAddress;
  let callResult;

  if (anyCtx.message?.state) {
    fromAddress = JSON.parse(anyCtx.message.state).fromAddress;
  }
  
  if (fromAddress) {
    try {
      outcome = await contractInstance.read.outcome(
        [fromAddress, false]
      )
      callResult = "success";

    }
    catch (error:any) {
      callResult = error.metaMessages?.[0];
    }
  }

  return next({
    currentBlock,
    blocksToAct,
    outcome,
    callResult
  })
}

export const frames = createFrames<State>({
  initialState: {
    startBlock: "",
    fromAddress: ""
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