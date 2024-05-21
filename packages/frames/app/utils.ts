import { headers } from "next/headers";
import {
  createPublicClient,
  http,
  getContract  
} from "viem";
import { hardhat } from "viem/chains";
import deployedContracts from "./frames/contracts/deployedContracts";


export function currentURL(pathname: string): URL {
  const headersList = headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") || "http";

  try {
    return new URL(pathname, `${protocol}://${host}`);
  } catch (error) {
    return new URL("http://localhost:3002");
  }
}

export function appURL() {
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  } else {
    const url = process.env.APP_URL || vercelURL() || "http://localhost:3002";
    console.warn(
      `Warning: APP_URL environment variable is not set. Falling back to ${url}.`
    );
    return url;
  }
}

export function vercelURL() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
}

// hardcode chain to hardhat for now
const chain = hardhat;

export function getChain() {
  return chain;
}

export function getViemPublicClient() {
  return createPublicClient({
    chain: chain,
    transport: http(),
  });
}

export function getJackpotJunctionContract(){
  const chainId = chain.id;
  const contractName = "JackpotJunction";
  const contractAddress = deployedContracts[chainId][contractName].address;
  const contractAbi = deployedContracts[chainId][contractName].abi;  

  const publicClient = getViemPublicClient();

  const contractInstance = getContract({
    address: contractAddress,
    abi: contractAbi,
    client: publicClient
  });  

  return contractInstance
}