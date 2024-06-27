import { 
    Item,
    JJ_CONTRACT_NAME,
    ITEM_ID_IMAGE_LAYER_NAMES,
} from '@/lib/constants';
import {    
    useDeployedContractInfo,
    useTransactor 
 } from "~~/hooks/scaffold-eth";
import { useWriteContract } from "wagmi";
import { toast } from 'react-hot-toast';

interface CraftButtonProps {
    item: Item;
    tier: number;
    index: number;
}

const CraftButton = ({ item, tier, index }: CraftButtonProps) => {
    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(JJ_CONTRACT_NAME);
    const { data: result, isPending, writeContractAsync } = useWriteContract();
    const writeTxn = useTransactor();

    const handleClick = async () => {

        if (writeContractAsync && deployedContractData) {

            try {
                const indexWithTier = index + ((tier - 1) * ITEM_ID_IMAGE_LAYER_NAMES.length);

                const makeWriteWithParams = async() =>
                    await writeContractAsync({
                      address: deployedContractData.address,
                      // @ts-ignore
                      functionName: "craft",
                      abi: deployedContractData.abi,
                      args: [BigInt(indexWithTier.toString()), BigInt("1")],
                  });

                  const res = await writeTxn(makeWriteWithParams);

                } catch (error) {
                  toast.error("Failed to do transaction, are you sure you have enough funds?");
                }
        
        }
    };

    return (
        <button className="absolute bottom-0 left-1/2 transform -translate-x-1/2 m-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
        >
            Craft
        </button>
    );
}

export default CraftButton;