'use client';

import React, { useEffect, useState } from "react";
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
import ItemImage from "./ItemImage";
import DegenCard from "./DegenCard";

ChartJS.register(ArcElement, Tooltip, Legend);

interface JackpotWheelProps {
    prizePool: PrizePool;
    prizeWon?: Prize | null;
    isSpinning: boolean;
    handleReroll: (val: boolean) => void;
    handleLoading: (val:boolean) => void;
    handleIsSpinning: (val: boolean) => void;
    handlePrizeWon: (prize:Prize | null) => void;
    deployedContractData: Contract<ContractName> | null;
}  

export const JackpotWheel = (props:JackpotWheelProps) => {
    const { 
        prizePool, 
        prizeWon, 
        isSpinning, 
        handleLoading, 
        handleIsSpinning,
        deployedContractData, 
        handlePrizeWon,
        handleReroll,
    } = props;
    const prizes = [
        { color: 'black', type: 0 },
        { color: '#1b8372', type: 1 },
        { color: '#cc5f3b', type: 2 },
        { color: '#d38c42', type: 3 },
        { color: '#d1bd29', type: 4 },
        { color: 'black', type: 0 },
        { color: '#1b8372', type: 1 },
        { color: '#cc5f3b', type: 2 },
        { color: '#d38c42', type: 3 }
    ];
    const slices = prizes.length;
    const angle = 360 / slices;
    const wheelApiRef = useSpringRef();
    const [ state, setState ] = useState('notMoving');
    const [ initialLoop, setInitialLoop ] = useState(true);
    const [ loopCount, setLoopCount ] = useState(0);
    const [ prizeAngle, setPrizeAngle ] = useState(0);
    const [ isPrizeVisible, setIsPrizeVisible ] = useState(false)
    const { chain } = useAccount();
    const writeTxn = useTransactor();
    const { targetNetwork } = useTargetNetwork();
    const writeDisabled = !chain || chain?.id !== targetNetwork.id;

    const { data: result, isPending, writeContractAsync } = useWriteContract();

    const handleAccept = () => {
        handleWrite()
    }

    useEffect(() => {
        setPrizeAngle(getAngle())
    }, [prizeWon]);

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
            setIsPrizeVisible(false)
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
                await next({ rotation: isNaN(prizeAngle) ? 70 : prizeAngle });
            }
            else if(state === 'accelerating'){
                await next({ rotation: 360 * 4, config: {duration: 1500, easing: easings.easeInQuad } })
                await next({ rotation: 0, config: { duration: 0 } });
                setIsPrizeVisible(false);
            }
            else if(state === 'spinning'){
                //  while((isSpinning || prizeWon === null) && !initialLoop){
                    await next({ rotation: 360, delay:0, config: { duration: 200, easing: t => t}}); 
                    await next({ rotation: 0, config: { duration: 0 }});
                // }
            } 
            else if (state === 'decelerating') {
                await next({ rotation: (360 * 9)+ prizeAngle, config: { duration: 5000, easing: easings.easeOutSine } }); //TODO: Change 360 to the actual point on where the wheel should land
                if(prizeWon && prizeWon.prizeType !== '0'){
                    confetti({
                        particleCount: 200,
                        spread: 140,
                        origin: { y: 0.5},
                    });
                }
                handleLoading(false)
                if(prizeWon && prizeWon.prizeType !== '0'){
                    const timer = setTimeout(() => {
                        setIsPrizeVisible(true);
                    }, 500);
                }
              }  else {
                console.log('Reached unexpected state')
              }
        },
        // reset: state === 'notMoving',
        onRest: () => {
            if (isSpinning && initialLoop && prizeWon === null){
                setState('accelerating')
                setInitialLoop(false)
            }
            else if ( (isSpinning && (prizeWon === null || loopCount <= 10))) {
                setLoopCount(prev => prev+1);
                setState('spinning');
            } else if ( isSpinning && prizeWon) {
                setState('decelerating')
                setInitialLoop(true);
                handleIsSpinning(false)
                setLoopCount(0);
            }
        },
    })

    const getAngle = () => {
        if (prizeWon) {
            const sliceIndex = parseInt(prizeWon.prizeType); // Get the index of the selected prize
            const sliceMiddleAngle = (sliceIndex * angle) - (angle / 2); // Calculate the middle of the slice
            return 360 - sliceIndex* angle + 70;
        }
        return 0; 
    }


    const CircleWithSlices = () => {
        // Function to create a single slice path
        const createSlicePath = (startAngle, endAngle) => {
            const x1 = 50 + 50 * Math.cos((Math.PI / 180) * startAngle);
            const y1 = 50 + 50 * Math.sin((Math.PI / 180) * startAngle);
            const x2 = 50 + 50 * Math.cos((Math.PI / 180) * endAngle);
            const y2 = 50 + 50 * Math.sin((Math.PI / 180) * endAngle);
            const largeArcFlag = angle > 180 ? 1 : 0;
            return `M 50,50 L ${x1},${y1} A 50,50 0 ${largeArcFlag} 1 ${x2},${y2}Z`;
        };
    
        // Function to calculate text transformation
        const calculateTextTransform = (startAngle, endAngle) => {
            const midAngle = (startAngle + endAngle) / 2;
            const x = 50 + 50 * Math.cos((Math.PI / 180) * midAngle); // Adjust 35 to place text inside the circle
            const y = 50 + 50 * Math.sin((Math.PI / 180) * midAngle); // Adjust 35 to place text inside the circle
            return `rotate(${midAngle}, ${x}, ${y})`;
        };
    
        const renderPaths = () => {
            return prizes.map((prize, index) => {
                const startAngle = index * angle;
                const endAngle = startAngle + angle;
                return (
                    <path
                        key={index}
                        d={createSlicePath(startAngle, endAngle)}
                        fill={prize.color}
                    />
                )
            })
        };
    
        const renderTexts = () => {
            return prizes.map((prize, index) => {
                const startAngle = index * angle;
                const endAngle = startAngle + angle;
    
                return (
                    <text
                        key={index}
                        x="10"
                        y="25" // Adjust this to center vertically inside the slice
                        textAnchor="middle"
                        fill={index === 0 || index === 5 ? "white" : "black"}
                        fontSize="5" // Adjust font size as needed
                        transform={`translate(50,50) rotate(${(startAngle - (angle/2))}) rotate(${185+angle}) translate(-40,-20)`}
                        style={{ fontFamily: 'Playwrite NZ, cursive', fontWeight: '700' }}
                    >
                        {prize.type === 0 ? 'Bankrupt'
                            : prize.type === 1 ? 'Item'
                            : prize.type === 2 ? '100 WEI'
                            : prize.type === 3 ? '1000 WEI'
                            : prize.type === 4 ? 'JACKPOT'
                            : null}
                        {/* {prize.color} */}
                    </text>
                );
            });
        };
    
        return (
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill='black' />
                <React.Fragment>
                    <defs>
                        {prizes.map((prize, index) => (
                            <clipPath key={`clipPath${index}`} id={`sliceClip${index}`}>
                                <path d={createSlicePath(index * angle, (index + 1) * angle)} />
                            </clipPath>
                        ))}
                        <pattern id="feltTexture" href="feltTexture.svg#feltTexture" />
                    </defs>
                    {renderPaths()}
                    {renderTexts()}
                </React.Fragment>
            </svg>
        );
    };
    return (
        <div className="relative flex flex-col justify-end items-center h-full w-full">
            { isPrizeVisible && prizeWon && prizeWon?.prizeType !== '0'? 
                <div className="prize-div z-10">
                    <div className="absolute z-10 top-[-2rem] sm:top-[-2rem] left-0 w-full h-full flex justify-center items-start">
                        <div className="h-[75%] w-[63%] max-h-[320px] max-w-[252px] border rounded-xl bg-white relative">
                            {
                                prizeWon?.prizeType === '1' ?
                                    <ItemImage itemId={prizeWon?.prizeValue}/>
                                :
                                    // <DegenCard degen={prizeWon?.prizeValue}/>
                                    null
                            }
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center">
                        <div className={`overflow-hidden flex-col flex border ease-in border-[5px] bg-[#B053AA] rounded-[50%] h-full w-full max-h-[400px] max-w-[400px]`}>
                            <div className="h-[70%]"> 
                            
                            </div>
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
                className="h-full border border-[black] border-[5px] relative w-full flex justify-center items-center my-4 rounded-[50%] max-h-[500px] max-w-[500px]"
                style={{ transform: rotateSpring.rotation.to((r) => `rotate(${r}deg)`),}}
            >
                <CircleWithSlices />
            </animated.div>
            <div className="absolute bottom-0 left-[50%] transform -translate-x-1/2 translate-y-0 h-[50px]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* <polygon points="20,4 35,40 5,40" fill="white"/> */}
                    <path d="M20 4 L35 40 Q20 40 5 40 Z" fill="white"/>
                </svg>
            </div>    
        </div>
    )    
}