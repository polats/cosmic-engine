'use client';

import { useState, useEffect, Suspense } from 'react';
import { JackpotJunction } from "~~/components/cosmic-engine/JackpotJunction";
import Image from 'next/image';
import RollIcon from '~~/public/roll-icon.png';
import WagonIcon from '~~/public/wagon-icon.png';
import MarketIcon from '~~/public/market-icon.png';
import { useRouter, useSearchParams } from 'next/navigation';

export default function NavigationPage ({searchParams}: {searchParams: {tab: string | null; }}) {
    const router = useRouter();
    const { tab } = searchParams;

    const tabs = [
        { id: 0, title: 'roll', icon: RollIcon },
        { id: 1, title: 'wagon', icon: WagonIcon},
        { id: 2, title: 'market', icon: MarketIcon},
    ];
    
    return (
        <div className="flex w-full justify-center p-4">
            <div className="w-full z-10 bg-[#E292DD] shadow-lg rounded-lg p-2 sm:p-4 flex justify-center items-center gap-x-2 sm:gap-x-4 lg:-gap-x-6">
                {tabs.map((currentTab, index) => (
                    <div key={currentTab.id} className={`px-4 ${index === 1 ? 'border-r border-l':''}`}>
                        <button
                            key={currentTab.id}
                            className={`flex justify-center items-center px-4 py-2 rounded ${
                            tab === currentTab.title ? 'bg-gray-200' : (tab !== 'market' && tab !== 'wagon' && currentTab.id === 0) ? 'bg-gray-200': ''
                            }`}
                            onClick={() => router.push(`/?tab=${currentTab.title}`)}
                        >
                            { index === 1 ?
                            <Image src={currentTab.icon} alt={`${currentTab.title} icon`} width={60} height={60} />
                            :
                            <Image src={currentTab.icon} alt={`${currentTab.title} icon`} width={40} height={40} />

                            }
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}