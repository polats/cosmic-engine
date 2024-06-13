'use client';

import { Suspense } from 'react';
import { JackpotJunction } from '~~/components/cosmic-engine'

export default function NavigationContent ({tab}: {tab: string | null}) {
    return(
        <>
            { tab === 'wagon' ?
            <div>Wagon</div>
            : tab === 'market' ?
            <div>Market</div>
            : <Suspense>
                <JackpotJunction />
            </Suspense>
            }
        </>
    )
} 