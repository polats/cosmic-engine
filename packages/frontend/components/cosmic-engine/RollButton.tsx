import { performRoll } from "@/lib/actions"
import { useAccount } from "wagmi"
import { useGlobalState } from "~~/services/store/store"
import { useState } from "react"

export const RollButton = () => {
    const { address } = useAccount();
    const [ loading, setLoading ] = useState(false);
    const userCurrency = useGlobalState(({ userCurrency }) => userCurrency);
    const setUserCurrency = useGlobalState(({ setUserCurrency }) => setUserCurrency);

    async function handleClick() {
        if (!address) return;
        setLoading(true);

        await performRoll(address);
        setUserCurrency(userCurrency - 100);
        setLoading(false);
    }
    
    return (
    <button
    disabled={(userCurrency <= 0) || loading}
    className="bg-red-600 hover:bg-red-700 py-3 px-6 text-white rounded-lg"
    onClick={handleClick}
  >
      Roll
  </button> 
    )  
}