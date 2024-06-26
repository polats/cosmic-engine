'use client';
 
import Image from 'next/image';
import WagonCard from '~~/components/cosmic-engine/Wagon/WagonCard';
import Inventory from '~~/components/cosmic-engine/Wagon/Inventory';
import { getItemLayerData } from "@/lib/actions/ora"
import { uint8ArrayToSrc } from '@/utils/cosmic-engine/ora-client';
import { 
    JJ_CONTRACT_NAME,
    ITEM_ID_IMAGE_LAYER_NAMES,
    TIER_COLORS,
    TIER_TEXT_COLORS
} from '@/lib/constants';
import { useEffect, useState } from "react";
import { get } from 'http';
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi"
import { Address } from 'viem';
import { useGlobalState } from "~~/services/store/store";

export default function WagonScreen(){

    type Item = {
        name: string;
        base64image: string;
        amount: string;
    }
    
    const sampleData = {
        name: "Sample Card",
        imageUrl: "https://robohash.org/Any robot you dont click on, they dismantle.",
        tier: 3,
    }

    const { address } = useAccount();
    const [inventoryData, setInventoryData] = useState<Item[]>();
    const [tier, setTier] = useState(1);
    const itemImages = useGlobalState(state => state.itemImages);

    // const { data: hasBonus } = useScaffoldReadContract({
    //     contractName: JJ_CONTRACT_NAME,
    //     functionName: "hasBonus",
    //     args: [address],
    //     interval: 5000
    // });

    const { data: balanceOfBatch } = useScaffoldReadContract({
        contractName: JJ_CONTRACT_NAME,
        functionName: "balanceOfBatch",
        args: [accountsArray(), idsArray()],
        watch: false
    });

    function accountsArray() {

        let accounts : Address[] = [];

        for (let i=0; i < ITEM_ID_IMAGE_LAYER_NAMES.length; i++) {
            if (address) {
                accounts.push(address);
                }
            }

        return accounts;
    }

    function idsArray() {

        let ids : bigint[] = [];

        for (let i=0; i < ITEM_ID_IMAGE_LAYER_NAMES.length; i++) {
            ids.push(BigInt(((tier - 1) * ITEM_ID_IMAGE_LAYER_NAMES.length) + i));
        }

        return ids;
    }

    const incrementTier = () => {
        setTier(prevTier => prevTier + 1);
    }
    
    const decrementTier = () => {
        setTier(prevTier => prevTier > 1 ? prevTier - 1 : 1);
    }

    async function loadInventory() {
        
        // example inventoryData
        let inventoryData: Item[] = [];

        for (let i=0; i < ITEM_ID_IMAGE_LAYER_NAMES.length; i++) {
            const amount = balanceOfBatch ? balanceOfBatch[i].toString() : "0";

            inventoryData.push({
                name: ITEM_ID_IMAGE_LAYER_NAMES[i][1],
                base64image: uint8ArrayToSrc(itemImages[i]), 
                amount: amount,
            });

        }

        setInventoryData(inventoryData);
    }    

    useEffect(() => {
        loadInventory();
        }, [balanceOfBatch, tier]);  
              

    return (
        <div className="flex justify-center h-full">
            <div className="overflow-x-hidden text-[black] h-full justify-center items-center px-[1rem] pt-3 max-w-[720px]">
                <div className="bg-gray-300 w-full flex flex-col grow h-full gap-y-4 px-4 rounded-b-2xl">
                    {/* Wagon Section */}
                    <div className="flex flex-col h-full max-h-[20%] gap-x-4 gap-y-4">
                        <div className="flex justify-between py-2">
                            <div className="flex px-4 py-1 rounded border-[1px] border-[black]  text-sm">
                                Money
                            </div>
                            <div className="flex px-4 py-1 rounded border-[1px] border-[black] text-sm">
                                Profile
                            </div>
                        </div>
                        {/* 2.60 */}
                        <div className="flex justify-between items-center gap-x-6 w-full h-full sm:max-h-[60%] lg:pr-4 xl:pr-0">
                            <div className="flex">
                                <div className="w-[145px] sm:w-[280px] h-[50px] sm:h-[100px]  relative">
                                    <Image src="/wagon-sample.png" alt="wagon-sample" fill/>
                                    
                                </div>
                            </div>
                            <div className="flex flex-col grow gap-y-1 sm:gap-y-3 max-w-[200px] sm:max-w-[300px] md:max-w-[400px] overflow-x-hidden xl:pl-[4rem]">
                                <div className="flex w-full justify-between">
                                    <p className="text-sm m-0">Type</p>
                                    <span className="text-sm font-bold m-0 truncate pl-2">Unmatched</span>
                                </div>
                                <div className="flex w-full justify-between">
                                    <p className="text-sm m-0">Tier</p>
                                    <p className="text-sm font-bold m-0 truncate pl-2">2</p>
                                </div>
                                <div className="flex w-full justify-between">
                                    <p className="text-sm m-0">No Bonus</p>
                                </div>
                            </div>
                            {/* <div className="hidden xl:flex min-w-[380px] justify-center items-center gap-x-4">
                                <WagonCard cardData={sampleData}/>
                                
                            </div> */}
                        </div>
                        {/*
                        <div className="flex grow w-full justify-center items-end gap-x-4">
                            <WagonCard cardData={sampleData}/>
                            <WagonCard cardData={sampleData}/>
                            <WagonCard cardData={sampleData}/>
                            <WagonCard cardData={sampleData}/>
                        </div>
                        */}
                    </div>

                    <div className="w-full border border-[1px] border-[black]" /> {/* divider */}                    
                    <div className="flex justify-between items-center">
                        <button onClick={decrementTier} style={{ fontSize: '2rem' }}>⬅️</button>
                        <div className="text-center">
                            <p className="font-bold" style={{ lineHeight: '0.5rem', color: TIER_TEXT_COLORS[tier] }}>Tier {tier} </p>
                            <p style={{ fontSize: '0.75rem', lineHeight: '0.5rem'}}>(Need {Math.pow(2, tier)} to craft next tier) </p>
                        </div>
                        <button onClick={incrementTier} style={{ fontSize: '2rem' }}>➡️</button>
                    </div>                    
                    {/* Market/Inventory Section */}
                    {
                        inventoryData?.length ?
                        <Inventory data={inventoryData} tier={tier} />
                        :
                        <div className="flex justify-center items-center h-full">
                            <p className="text-lg">Loading items...</p>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}