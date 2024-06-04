"use client";

import { Address } from "viem";
import { useAccount } from "wagmi";
import { useInitializeGameAccount } from "~~/hooks/cosmic-engine/useInitializeGameAccount"; 

export const GameAccountDisplay = () => {
  const account = useAccount();
  const { data, isLoading, error } = useInitializeGameAccount(account.address as Address);

  if (account?.address) {

  if (isLoading) return <div>Loading...</div>
  if (error)
    return <div>Error initializing: {error}</div>
  return <div>$CAPS: {data}</div>

  }
  else {
    return null;      
  }


};
