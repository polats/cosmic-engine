'use client';

import { Suspense } from 'react';
import { JackpotJunction } from '~~/components/cosmic-engine'
import Wagon from '~~/components/cosmic-engine/Wagon'
import DegenGuy from '~~/public/degen-guy.png';
import Image from 'next/image';

export default function NavigationContent ({tab}: {tab: string | null}) {
    return(
        <div className="flex flex-col grow ">
            { tab === 'wagon' ?
                <Suspense>
                    <Wagon />
                </Suspense>
            : tab === 'market' ?
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                position: 'relative'
            }}>
                <Image src={DegenGuy} alt="Degen Guy" style={{ 
                    width: '50%', 
                }}/>
                <div style={{ 
                    position: 'absolute', 
                    top: '65%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    fontSize: '2em', 
                    color: '#333',
                    background: '#f9f9f9', 
                    border: '5px solid #333',
                    padding: '10px',
                    borderRadius: '5px'
                }}>
                    Market coming soon!
                </div>
            </div>
            : 
                <Suspense>
                    <JackpotJunction />
                </Suspense>
            }
        </div>
    )
} 