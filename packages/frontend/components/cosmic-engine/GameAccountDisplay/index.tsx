"use client";

import { Address } from "viem";
import { useAccount } from "wagmi";
import { useInitializeGameAccount } from "~~/hooks/cosmic-engine/useInitializeGameAccount"; 
import { useGlobalState } from "~~/services/store/store";

export const GameAccountDisplay = () => {
  const account = useAccount();
  const { isLoading, error } = useInitializeGameAccount(account.address as Address);
  const currency = useGlobalState(state => state.userCurrency);
 
  if (account?.address) {

  if (isLoading) return <div>Loading...</div>
  if (error)
    return <div>Error initializing: {error}</div>
  return <div>$CAPS: {currency}</div>

  }
  else {
    return null;      
  }


};
