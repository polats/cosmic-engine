'use client';

import { useEffect, useState } from "react";
import { TransactionReceipt } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { useSpring, useSpringRef, animated, config, easings } from '@react-spring/web';
import { Prize, PrizePool } from './JackpotJunction';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { confetti } from "@tsparticles/confetti";
import Image from 'next/image';
import "~~/styles/roll-button.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

interface JackpotWheelProps {
    prizePool: PrizePool;
    prizeWon?: Prize | null;
    isSpinning: boolean;
    handleReroll: (val: boolean) => void;
    handleLoading: (val:boolean) => void;
    handlePrizeWon: (prize:Prize | null) => void;
    deployedContractData: Contract<ContractName> | null;
}  

export const JackpotWheel = (props:JackpotWheelProps) => {
    const { 
        prizePool, 
        prizeWon, 
        isSpinning, 
        handleLoading, 
        deployedContractData, 
        handlePrizeWon,
        handleReroll 
    } = props;
    const wheelApiRef = useSpringRef();
    const [ state, setState ] = useState('notMoving');
    const [ initialLoop, setInitialLoop ] = useState(true);
    const [ prizeState, setPrizeState ] = useState(prizeWon); //used to update state, will not cause a re render if prizeWon is used
    const [ currentAngle, setCurrentAngle ] = useState(0);
    const [ springConfig, setSpringConfig ] = useState({
        duration: 300, // This determines the distributed speed, the lower this is, the faster it spins
        easing: (t:number ) => t, // This controls the easing after each loop of rotation, if you do not make this consistent, it will slow down after each rotation. Change in next step.
    })

    {/*
        Will involve different steps
        Step 1: Loading. While fetching data, wheel rotates consistently
        Step 2: Prize fetched. When a prize is won (or failed) it will move into the next animation
                where it starts to ease(slows down) into  the targeted slice which contains the prize(or lackthereof)
        Step 3: Stop. Stops at the designated slice and shows a modal to either accept or reroll
    */}

    const { chain } = useAccount();
    const writeTxn = useTransactor();
    const { targetNetwork } = useTargetNetwork();
    const writeDisabled = !chain || chain?.id !== targetNetwork.id;

    const { data: result, isPending, writeContractAsync } = useWriteContract();

    const handleAccept = () => {
        handleWrite()
    }

    const handleWrite = async () => {
        if (writeContractAsync && deployedContractData) {
        try {
            const makeWriteWithParams = () =>
            writeContractAsync({
                address: deployedContractData.address,
                // @ts-ignore
                functionName: "accept",
                abi: deployedContractData.abi,
                // @ts-ignore
                value: BigInt("0"), 
            });
            const res = await writeTxn(makeWriteWithParams);
            handlePrizeWon(null);
            handleReroll(false);
        } catch (e: any) {
            console.error("⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error", e);
            handlePrizeWon(null);
        }
        }
    };

    const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
    const { data: txResult } = useWaitForTransactionReceipt({
        hash: result,
    });

    useEffect(() => {
        setDisplayedTxResult(txResult);
    }, [txResult]);


    const rotateSpring = useSpring({
        from: { rotation: 0},
        to: async(next, cancel) => {
            if (state === 'notMoving') {
                await next({ rotation: 0});
            }
            else if(state === 'accelerating'){
                setInitialLoop(false)
                await next({ rotation: 360 * 4, config: {duration: 2000, easing: easings.easeInQuad } })
                await next({ rotation: 0, config: { duration: 0 } });
            }
            else if(state === 'spinning'){
                while(isSpinning || !prizeWon){
                    await next({ rotation: 360, delay:0, config: { duration: 200, easing: t => t}}); 
                    await next({ rotation: 0, config: { duration: 0 }});
                }
            } 
            else if (state === 'decelerating' && !initialLoop) {
                await next({ rotation: 360 * 10, config: { duration: 5000, easing: easings.easeOutCubic } }); //TODO: Change 360 to the actual point on where the wheel should land
                await setInitialLoop(true);
                if(prizeWon && prizeWon.prizeType !== '0'){
                    confetti({
                        particleCount: 200,
                        spread: 140,
                        origin: { y: 0.5},
                    });
                }
                handleLoading(false)
              }  else {
                console.log('Reached undocumented state')
              }
        },
        reset: state === 'notMoving',
        onRest: () => {
            if (isSpinning && initialLoop){
                setState('accelerating')
            }
            else if ( isSpinning && !initialLoop) {
                setState('spinning');
            } else if ( !isSpinning && prizeWon && state === 'spinning' ) {
                setState('decelerating')
            } else if ( state === 'decelerating') {
                setState('notMoving')
            }
        },
    })

    const Slices = () => {
        return (
            <>
                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill='none'/>
                    <path d="M16 16 L16 0 A16 16 0 0 1 28.78 7.22 Z" fill="#FF6347"/>
                    <path d="M16 16 L28.78 7.22 A16 16 0 0 1 31.42 16 Z" fill="#FFD700"/>
                    <path d="M16 16 L31.42 16 A16 16 0 0 1 28.78 24.78 Z" fill="#ADFF2F"/>
                    <path d="M16 16 L28.78 24.78 A16 16 0 0 1 16 32 Z" fill="#1E90FF"/>
                    <path d="M16 16 L16 32 A16 16 0 0 1 3.22 24.78 Z" fill="#FF69B4"/>
                    <path d="M16 16 L3.22 24.78 A16 16 0 0 1 0.58 16 Z" fill="#8A2BE2"/>
                    <path d="M16 16 L0.58 16 A16 16 0 0 1 3.22 7.22 Z" fill="#00CED1"/>
                    <path d="M16 16 L3.22 7.22 A16 16 0 0 1 16 0 Z" fill="#FF4500"/>
                </svg>
            </>
        )
    }

    return (
        <div className="relative flex justify-center items-center h-full w-full">
            { prizeWon && prizeWon.prizeType !== '0' && state === 'notMoving' ?
                <div className="prize-div z-10">
                    <div className="absolute z-10 top-[-2rem] sm:top-[-1rem] left-0 w-full h-full flex justify-center items-start">
                        <div className="h-[75%] w-[63%] max-h-[300px] max-w-[252px] bg-white relative">
                            <Image src={'/card-sample.png'} alt={`card`} fill />
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center">
                        <div className={`overflow-hidden flex-col flex border ease-in border-[5px] bg-[#B053AA] rounded-[50%] h-full w-full max-h-[400px] max-w-[400px]`}>
                            {/* Prize Won Card */}
                            <div className="h-[70%]"> 
                            
                            </div>
                            {/* Accept button */}
                            <button className="grow z-20 accept-ring cursor-pointer flex justify-center hover:animate-none" onClick={handleAccept}>
                                <p className={` text-4xl font-bold`}>
                                    ACCEPT
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            : null
            }
            <animated.div
                className="h-full w-full flex justify-center items-center my-4 rounded-[50%] max-h-[400px] max-w-[400px]"
                style={{ transform: rotateSpring.rotation.to((r) => `rotate(${r}deg)`),}}
            >
                <Slices />
            </animated.div>
        </div>
    )    
}