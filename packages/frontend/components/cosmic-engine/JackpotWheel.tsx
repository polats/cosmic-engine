'use client';

import React, { useEffect, useState } from "react";
import { TransactionReceipt } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Contract, ContractName } from "~~/utils/scaffold-eth/contract";
import { useSpring, useSpringRef, animated, config, easings } from '@react-spring/web';
import { Prize } from './JackpotJunction';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { confetti } from "@tsparticles/confetti";
import Image from 'next/image';
import "~~/styles/roll-button.scss";
import ItemImage from "./ItemImage";
import DegenCard from "./DegenCard";
import Lottie from 'react-lottie';
import "~~/styles/roll-button.scss";

ChartJS.register(ArcElement, Tooltip, Legend);

interface JackpotWheelProps {
    wheelState: string,
    prizeWon?: Prize | null;
    isReroll: boolean;
    handleReroll: (val: boolean) => void;
    handleLoading: (val:boolean) => void;
    handleWheelState: (val: string) => void;
    handlePrizeWon: (prize:Prize | null) => void;
    deployedContractData: Contract<ContractName> | null;
    isWheelActive: boolean;
    handleWheelActivity: (val: boolean) => void;
}  

export const JackpotWheel = (props:JackpotWheelProps) => {
    const {
        isWheelActive,
        wheelState,
        prizeWon, 
        isReroll,
        handleWheelActivity,
        handleWheelState,
        handlePrizeWon,
        handleReroll,
        handleLoading, 
        deployedContractData, 
    } = props;
    const prizes = [
        { color: '#f25449', type: 0 },
        { color: '#2896f8', type: 1 },
        { color: '#9B59B6', type: 2 },
        { color: '#b1ff37', type: 3 },
        { color: '#fae10a', type: 4 },
        { color: '#ef3705', type: 0 },
        { color: '#8415dd', type: 1 },
        { color: '#9C27B0', type: 2 },
        { color: '#10e4ce', type: 3 }
    ];
    const slices = prizes.length;
    const angle = 360 / slices;
    const [ initialLoop, setInitialLoop ] = useState(true);
    const [ loopCount, setLoopCount ] = useState(0);
    const [ prizeAngle, setPrizeAngle ] = useState(0);
    const [ isPrizeVisible, setIsPrizeVisible ] = useState(false)

    // contract
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
    const [count, setCount] = useState(10);
    const totalCount = 10

    useEffect(() => {
        setDisplayedTxResult(txResult);
    }, [txResult]);
    useEffect(() => {
        const intervalId = setInterval(() => {
          setCount(prevCount => {
            if (prevCount > 0) {
              return prevCount - 1;
            } else {
              return 10;
            }
          });
        }, 3000);
    
        // Cleanup function to clear the interval on component unmount
        return () => clearInterval(intervalId);
      }, []);
    

    const rotateSpring = useSpring({
        from: { rotation: 0},
        to: async(next, cancel) => {

            if (wheelState === 'notMoving') {
                await next({ rotation: isNaN(prizeAngle) ? 70 : prizeAngle });
            }
            else if(wheelState === 'accelerating'){
                await next({ rotation: 360, config: {duration: 1000, easing: easings.easeInQuad } })
                await next({ rotation: 0, config: { duration: 0 } });
                setIsPrizeVisible(false);
            }
            else if(wheelState === 'spinning'){
                await next({ rotation: 360, delay:0, config: { duration: 400, easing: t => t}}); 
                await next({ rotation: 0, config: { duration: 0 }});
            } 
            else if (wheelState === 'decelerating') {
                await next({ rotation: (360)+ prizeAngle, config: { duration: 1000, easing: easings.easeOutSine } }); //TODO: Change 360 to the actual point on where the wheel should land
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
        reset: wheelState === 'notMoving',
        onRest: () => {
            if (isWheelActive && initialLoop){
                handleWheelState('accelerating')
                setInitialLoop(false)
            }
            else if ( (isWheelActive && (prizeWon === null || loopCount <= 15))) { //loop for minimum turns
                setLoopCount(prev => prev+1);
                handleWheelState('spinning');
            } else if ( isWheelActive && prizeWon) {
                handleWheelState('decelerating')
                setInitialLoop(true);
                handleWheelActivity(false)
                setLoopCount(0);
            } else if ( !isWheelActive && wheelState === 'spinning' ) {
                handleWheelState('decelerating')
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

    const animationData = require('~~/assets/falling-confetti.json');

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData,
        speed: 0.1
    };


    const CircleWithSlices = () => {
        // Function to create a single slice path
        const createSlicePath = (startAngle: number, endAngle: number) => {
            const x1 = 50 + 50 * Math.cos((Math.PI / 180) * startAngle);
            const y1 = 50 + 50 * Math.sin((Math.PI / 180) * startAngle);
            const x2 = 50 + 50 * Math.cos((Math.PI / 180) * endAngle);
            const y2 = 50 + 50 * Math.sin((Math.PI / 180) * endAngle);
            const largeArcFlag = angle > 180 ? 1 : 0;
            return `M 50,50 L ${x1},${y1} A 50,50 0 ${largeArcFlag} 1 ${x2},${y2}Z`;
        };
    
        // Function to calculate text transformation
        const calculateTextTransform = (startAngle: number, endAngle: number) => {
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
                        fontSize={prize.type === 2 ? "4" : "5"} // Adjust font size as needed
                        transform={`translate(50,50) rotate(${(startAngle - (angle/2))}) rotate(${189+angle}) translate(-40,-20)`}
                        style={{ fontFamily: 'Playwrite NZ, cursive', fontWeight: '700' }}
                    >
                        {prize.type === 0 ? 'Bust'
                            : prize.type === 1 ? 'Item'
                            : prize.type === 2 ? 'Itty bitty WEI'
                            : prize.type === 3 ? 'NICE WEI'
                            : prize.type === 4 ? 'JACKPOT'
                            : null}
                        {/* {prize.color} */}
                    </text>
                );
            });
        };
    
        return (
            <svg viewBox="0 0 100 100">
                {/*<circle cx="50" cy="50" r="50" fill='black' stroke='black' /> */}
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

    
  const Segment = ({index}: {index: number}) => {
    return (
      <div key={index} className={`grow-1 w-full
        ${index === 0 ? 'rounded-l-3xl': index === totalCount-1 ? 'rounded-r-3xl' : ''}
        ${index < count ?
          'bg-white opacity-80 border-r-2'
        : index === count ?
          'loader-pulse'
        :
          'bg-slate-800 opacity-100'
        }
      `}>
      </div>
    )
  }


    const Loader = () => {
        return (
            <div className="w-[95%] flex justify-center border rounded-3xl h-[15px]">
              {Array(totalCount).fill(null).map((value, index) => <Segment key={index} index={index}/>)}
            </div>
        )
      }
    
    return (
        <div className="relative flex flex-col justify-end items-center h-full w-full">
            { isPrizeVisible && prizeWon && prizeWon?.prizeType !== '0'? 
                <div className="prize-div z-20">
                    <div className="absolute z-40 top-[-3.5rem] sm:top-[-2rem] left-0 w-full h-full flex justify-center items-start">
                        <div className="h-[80%] w-[63%] max-h-[380px] max-w-[265px] relative">
                            {
                                prizeWon?.prizeType === '1' ?
                                    <ItemImage itemId={prizeWon?.prizeValue}/>
                                :
                                    <DegenCard type={prizeWon?.prizeType} degen={prizeWon?.prizeValue}/>
                            }
                        </div>
                    </div>
                    <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center">
                        <div className={`overflow-hidden flex-col flex border ease-in border-[5px] bg-[#B053AA] rounded-[50%] h-full w-full max-h-[500px] max-w-[500px]`}>
                            <div className="h-[70%] overflow-hidden "> 
                                <Lottie options={defaultOptions} height="150%" width="100%" />
                            </div>
                            <button className="grow z-50 accept-ring cursor-pointer flex flex-col justify-start hover:animate-none" onClick={handleAccept}>
                                <Loader />
                                <p className={` text-4xl font-bold`}>
                                    ACCEPT
                                </p>
                            </button>
                        </div>
                    </div>
                </div>
            : null
            } 
            {/* 
                67% for side banner 
                38% jackpot
            */}
            <div className="absolute flex justify-center h-full w-full max-h-[500px] my-4 ">
                <div className="absolute top-[-20%] h-[40%] w-[150%] flex justify-center items-center  ">
                    <div className="relative sm:top-[70px] lg:top-[80px]  sm:w-[120px] sm:h-[179px] sm:left-[-15px]">
                    {/* top-[100px]  w-[80px] h-[119px]  left-[0] */}
                        <Image
                            src={'/jackpotWheel/banner-small.png'}
                            alt="jackpot-banner"
                            fill
                        />
                    </div>
                    <div className="relative z-10 sm:top-[-10%] px-[-5px] sm:w-[257px] sm:h-[98px]">
                        {/*  top-[45px] w-[160px] h-[60px]  */}
                        <Image
                            src={'/jackpotWheel/banner-jackpot.png'}
                            alt="jackpot-banner"
                            fill
                        />
                    </div>
                    <div className="relative sm:top-[70px] lg:top-[80px] sm:w-[120px] sm:h-[179px] sm:left-[15px]">
                        {/*  top-[100px]  w-[80px] h-[119px] left-[0]*/}
                        <Image
                            src={'/jackpotWheel/banner-medium.png'}
                            alt="jackpot-banner"
                            fill
                        />
                    </div>
                </div>

            </div>
            <animated.div
                className={`${
                    isWheelActive ? 
                    'pulsate-border sm:border-[red] ' : 
                    (
                        'sm:border-[black] '                        
                    )
                }
                sm:border sm:border-[5px]  h-full relative w-full flex justify-center items-center my-4 rounded-[50%] max-h-[500px] max-w-[500px]`}
                style={{ 
                    transform: rotateSpring.rotation.to((r) => {
                        return `rotate(${r}deg)`
                    })
                }}
            >
                <CircleWithSlices />
            </animated.div>
            <div className="absolute left-[50%] bottom-[5px] sm:bottom-[0] transform -translate-x-1/2 translate-y-0 h-[50px]">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* <polygon points="20,4 35,40 5,40" fill="white"/> */}
                    <path d="M20 4 L35 40 Q20 40 5 40 Z" fill="white"/>
                </svg>
            </div>    
        </div>
    )    
}