'use client';
 
import Image from 'next/image';
import WagonCard from '~~/components/cosmic-engine/Wagon/WagonCard';
import { getAllLayerImages } from "@/lib/actions/ora"

export default function Market(){
    const sampleData = {
        name: "Sample Card",
        imageUrl: "https://robohash.org/Any robot you dont click on, they dismantle.",
        tier: 3,
    }

    // const itemImages = getAllItemImages

    return (
        <div className="flex justify-center h-full">
            <div className="overflow-x-hidden text-[black] h-full justify-center items-center px-[1rem] pt-3 max-w-[720px]">
                <div className="bg-gray-300 w-full flex flex-col grow h-full gap-y-4 px-4 rounded-b-2xl">
                    {/* Wagon Section */}
                    <div className="flex flex-col h-full max-h-[45%] gap-x-4 gap-y-4">
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
                        <div className="flex grow w-full justify-center items-end gap-x-4">
                            <WagonCard cardData={sampleData}/>
                            <WagonCard cardData={sampleData}/>
                            <WagonCard cardData={sampleData}/>
                            <WagonCard cardData={sampleData}/>
                        </div>
                    </div>

                    <div className="w-full border border-[1px] border-[black]" /> {/* divider */}
                    {/* Market/Inventory Section */}
                    <div className="grow bg-gray-400">

                    </div>
                </div>
            </div>
        </div>
    )
}