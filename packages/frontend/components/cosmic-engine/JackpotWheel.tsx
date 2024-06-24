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
    const prizes = [
        { color: '#6F4E94', type: 0 },
        { color: '#E74C3C', type: 1 },
        { color: '#2ECC71', type: 2 },
        { color: '#9B59B6', type: 3 },
        { color: '#F39C12', type: 4 },
        { color: '#3498DB', type: 0 },
        { color: '#E91E63', type: 1 },
        { color: '#9C27B0', type: 2 },
        { color: '#4CAF50', type: 3 }
    ];
    const slices = prizes.length;
    const angle = 360 / slices;
    const wheelApiRef = useSpringRef();
    const [ state, setState ] = useState('notMoving');
    const [ initialLoop, setInitialLoop ] = useState(true);
    const [ loops, setLoops ] = useState(0);
    const [ prizeState, setPrizeState ] = useState(prizeWon); //used to update state, will not cause a re render if prizeWon is used
    const [ currentAngle, setCurrentAngle ] = useState(0);
    const [ springConfig, setSpringConfig ] = useState({
        duration: 300, // This determines the distributed speed, the lower this is, the faster it spins
        easing: (t:number ) => t, // This controls the easing after each loop of rotation, if you do not make this consistent, it will slow down after each rotation. Change in next step.
    })

    // useEffect(() => {
        
    // }, [prizeWon]);

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
                await next({ rotation: 360 * 4, config: {duration: 1500, easing: easings.easeInQuad } })
                await next({ rotation: 0, config: { duration: 0 } });
            }
            else if(state === 'spinning'){
                while(isSpinning || !prizeWon){
                    await next({ rotation: 360, delay:0, config: { duration: 200, easing: t => t}}); 
                    await next({ rotation: 0, config: { duration: 0 }});
                }
            } 
            else if (state === 'decelerating' && !initialLoop) {
                await next({ rotation: (360 * 9) + getAngle() + 180, config: { duration: 1500, easing: easings.easeOutCubic } }); //TODO: Change 360 to the actual point on where the wheel should land
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

    const getAngle = () => {
        // if(type === 1) {
            const startAngle = (4 * angle);
            const endAngle = startAngle + angle;
            const midAngle = (startAngle + endAngle) / 2;
            return (midAngle) ;
        // }
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
                        fill="white"
                        fontSize="6" // Adjust font size as needed
                        transform={`translate(50,50) rotate(${(startAngle - (angle/2))}) rotate(${185+angle}) translate(-40,-20)`}
                    >
                        {prize.type === 0 ? 'Bankrupt'
                            : prize.type === 1 ? 'Item'
                            : prize.type === 2 ? '100 WEI'
                            : prize.type === 3 ? '1000 WEI'
                            : prize.type === 4 ? 'JACKPOT'
                            : "something"}
                        {/* {prize.color} */}
                    </text>
                );
            });
        };
    
        return (
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill='none' />
                <React.Fragment>
                    <defs>
                        {prizes.map((prize, index) => (
                            <clipPath key={`clipPath${index}`} id={`sliceClip${index}`}>
                                <path d={createSlicePath(index * angle, (index + 1) * angle)} />
                            </clipPath>
                        ))}
                    </defs>
                    {renderPaths()}
                    {renderTexts()}
                </React.Fragment>
            </svg>
        );
    };
    const numberOfSlices = 10;
    const sliceAngle = 360 / numberOfSlices;

    const sliceStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        clipPath: 'polygon(80% 100%, 15% 0%, 50% 0%)',
        transformOrigin: '50% 50%',
        
    };

  const slicesDiv = Array.from({ length: numberOfSlices }).map((_, index) => {
    const rotation = index * sliceAngle;
    return (
      <div
        key={index}
        className="bg-[red]"
        style={{
          ...sliceStyle,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Slice {index + 1}
        </div>
      </div>
    );
  });
    return (
        <div className="relative flex justify-center items-center h-full w-full">
            { prizeWon && prizeWon.prizeType !== '0' && state === 'notMoving' ?
                <div className="prize-div z-10">
                    <div className="absolute z-10 top-[-2rem] sm:top-[-1rem] left-0 w-full h-full flex justify-center items-start">
                        <div className="h-[75%] w-[63%] max-h-[300px] max-w-[252px] bg-white relative">
                            {
                                prizeWon.prizeType === '1' ?
                                <ItemImage itemId={prizeWon.prizeValue}/>
                                :
                                <p className={`text-4xl font-bold bg-[#B053AA]`}>
                                    {prizeWon.prizeValue} WEI
                                </p>
                            }
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
                className="h-full border relative w-full flex justify-center items-center my-4 rounded-[50%] max-h-[400px] max-w-[400px]"
                style={{ transform: rotateSpring.rotation.to((r) => `rotate(${r}deg)`),}}
            >
                <CircleWithSlices />
                {/* {slicesDiv} */}
            </animated.div>
        </div>
    )    
}