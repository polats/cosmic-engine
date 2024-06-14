'use client';

import { Suspense } from 'react';
import { JackpotJunction } from '~~/components/cosmic-engine'
import Wagon from '~~/components/cosmic-engine/Wagon'
export default function NavigationContent ({tab}: {tab: string | null}) {
    return(
        <div className="flex flex-col grow ">
            { tab === 'wagon' ?
                <Suspense>
                    <Wagon />
                </Suspense>
            : tab === 'market' ?
                <div>Market</div>
            : 
                <Suspense>
                    <JackpotJunction />
                </Suspense>
            }
        </div>
    )
} 