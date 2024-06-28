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
import { getParsedError, notification } from "~~/utils/scaffold-eth";

interface EquipButtonProps {
    item: Item;
    tier: number;
    index: number;
    triggerRefreshDisplayVariables: () => void;
}

const EquipButton = ({ 
    item, 
    tier, 
    index, 
    triggerRefreshDisplayVariables
}: EquipButtonProps) => {
    const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(JJ_CONTRACT_NAME);
    const { data: result, isPending, writeContractAsync } = useWriteContract();
    const writeTxn = useTransactor();

    const handleClick = async () => {

        if (writeContractAsync && deployedContractData) {

            try {
                const indexWithTier = index + ((tier - 1) * ITEM_ID_IMAGE_LAYER_NAMES.length);

                console.log("indexWithTier", indexWithTier)

                const makeWriteWithParams = async() =>
                    await writeContractAsync({
                      address: deployedContractData.address,
                      // @ts-ignore
                      functionName: "equip",
                      abi: deployedContractData.abi,
                      args: [[BigInt(indexWithTier.toString())]],
                  });

                  const res = await writeTxn(makeWriteWithParams);
                  notification.success("Item equipped")
                  triggerRefreshDisplayVariables();

                } catch (error) {
                    const parsedError = getParsedError(error);
                    if (parsedError.includes("Sender doesn't have enough funds"))
                    {
                      toast.error("Not enougn funds, please grab funds from faucet");
                    }
                    else {
                      toast.error(parsedError);
                    }              
                }
        
        }
    };

    return (
        <button className="absolute bottom-0 left-1/2 transform -translate-x-1/2 m-1 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleClick}
        >
            Equip
        </button>
    );
}

export default EquipButton;