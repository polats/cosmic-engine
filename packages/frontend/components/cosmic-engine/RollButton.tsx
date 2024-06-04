import { performRoll } from "@/lib/actions"
import { useAccount } from "wagmi"

export const RollButton = () => {
    const { address } = useAccount();

    function handleClick() {
        
        if (address == null) return;

        performRoll(address);
    }
    
    return (
    <button
    className="bg-red-600 hover:bg-red-700 py-3 px-6 text-white rounded-lg"
    onClick={handleClick}
  >
      Roll
  </button> 
    )  
}