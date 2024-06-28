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
import Loader from '~~/components/cosmic-engine/AcceptLoader';

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
        { color: '#242424', type: 0 },
        { color: '#7a4f9b', type: 1 },
        { color: '#242424', type: 2 },
        { color: '#7a4f9b', type: 3 },
        { color: '#242424', type: 4 },
        { color: '#7a4f9b', type: 0 },
        { color: '#242424', type: 1 },
        { color: '#7a4f9b', type: 2 },
        { color: '#242424', type: 3 },
        { color: '#7a4f9b', type: 4 },
    ];
    const slices = prizes.length;
    const angle = 360 / slices;
    const [ initialLoop, setInitialLoop ] = useState(true);
    const [ loopCount, setLoopCount ] = useState(0);
    const [ prizeAngle, setPrizeAngle ] = useState(0);
    const [ isPrizeVisible, setIsPrizeVisible ] = useState(false);
    const [ isLightActive, setIsLightActive ] = useState(false);
    // contract
    const { chain } = useAccount();
    const writeTxn = useTransactor();
    const { targetNetwork } = useTargetNetwork();
    const writeDisabled = !chain || chain?.id !== targetNetwork.id;

    const { data: result, isPending, writeContractAsync } = useWriteContract();
    const [currentScreenSize, setCurrentScreenSize] = useState<number | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const updateScreenSize = () => {
                setCurrentScreenSize(window.innerWidth);
            };

            updateScreenSize();

            window.addEventListener('resize', updateScreenSize);
            return () => window.removeEventListener('resize', updateScreenSize);
        }
    }, []);
    
    const getScreenBreakpoint = () => {
        if (currentScreenSize === null) return 'default';
        const width = currentScreenSize;
        if( width > 475  && width <= 1024){
            return 'xs';
        } else if ( width > 1024 && width <= 1280) {
            return 'lg';
        } else if ( width > 1280) {
            return 'xl';
        } else {
            return 'def'; //default
        }
    }
    {/*
        if( width > 475  && width <= 1024){
                return 'xs';
            } else if ( width > 1024 && width <= 1280) {
                return 'lg';
            } else if ( width > 1280 && width <= 1536) {
                return 'xl';
            } else if ( width > 1536  && width <= 1800) {
                return '2xl';
            } else if ( width > 1536) {
                return '3xl';
            }    
    */}

    const closePrizeVisibility = () => {
        setIsPrizeVisible(false);
    }

    const handleAccept = () => {
        setIsShaking(true);
        confetti({
            particleCount: 200,
            spread: 140,
            origin: { y: 0.5},
        });
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

    useEffect(() => {
        if(wheelState === "accelerating"){
            setIsLightActive(true);
        }
    }, [wheelState]);

    const rotateSpring = useSpring({
        from: { rotation: 0},
        to: async(next, cancel) => {
            if (wheelState === 'notMoving') {
                await next({ rotation: isNaN(prizeAngle) ? 70 : prizeAngle });
            }
            else if(wheelState === 'accelerating'){
                await next({ rotation: 360 * 4, config: {duration: 1500, easing: easings.easeInQuad } })
                await next({ rotation: 0, config: { duration: 0 } });
                setIsPrizeVisible(false);
            }
            else if(wheelState === 'spinning'){
                while(isWheelActive && prizeWon === null){
                    await next({ to: [{rotation: 360}], delay:0, config: { duration: 200, easing: t => t}}); 
                    await next({ rotation: 0, config: { duration: 0 }});
                }
            } 
            else if (wheelState === 'decelerating') {
                await next({ rotation: (360 * 9)+ prizeAngle, config: { duration: 1500, easing: easings.easeOutSine } });
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
            else if ( (isWheelActive && (prizeWon === null || loopCount <= 10))) { //loop for minimum turns
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
            const x = 50 + 50 * Math.cos((Math.PI / 180) * midAngle);
            const y = 50 + 50 * Math.sin((Math.PI / 180) * midAngle);
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

    const closePrizeLayer = () => {
        handlePrizeWon(null);
        setIsPrizeVisible(false);
        handleWheelState('notMoving');
        setInitialLoop(true);
        handleReroll(false);
        setIsLightActive(false);
    }

    const acceptPrize = () => {
        handleWrite();
        handlePrizeWon(null);
        handleWheelState('notMoving');
        setInitialLoop(true);
        handleReroll(false);
        setIsLightActive(false);
    }
    /*
        Wheel Active: False (Undergoing animation)
        Wheel State: Not Moving
        Prize: NULL
        InitialLoop: true
        isReroll: False
    */

    const lightbulbCount = 20; // Number of lightbulbs

    const Lightbulbs = ({ count, radius }: {count:number, radius:number}) => {
        const bulbs = [];
        const bulbSize = ( getScreenBreakpoint() === 'def' ? 10 
            : getScreenBreakpoint() === 'xs' ? 15
            : getScreenBreakpoint() === 'lg'? 20
            : 20
        );
        const offsetRadius = radius + bulbSize / 2;
    
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * 2 * Math.PI;
            const x = (offsetRadius + offsetRadius * Math.cos(angle) - bulbSize / 2) + (
                getScreenBreakpoint() === 'def' ? 6 
                : getScreenBreakpoint() === 'xs'? 9 
                : getScreenBreakpoint() === 'lg'? 14 
                : 14
            );
            const y = (offsetRadius + offsetRadius * Math.sin(angle) - bulbSize / 2) + (
                getScreenBreakpoint() === 'def' ? 13 
                : getScreenBreakpoint() === 'xs'? 25 
                : getScreenBreakpoint() === 'lg'? 28
                : 28
            );
    
            bulbs.push(
                <div
                    key={i}
                    className={`${isLightActive ? 'lightbulb' : ''}`}
                    style={{
                        position: 'absolute',
                        width: `${bulbSize}px`,
                        height: `${bulbSize}px`,
                        borderRadius: '50%',
                        backgroundColor: 'black',
                        top: `${y}px`,
                        left: `${x}px`,
                    }}
                />
            );
        }
    
        return <>{bulbs}</>;
    };
    const [isShaking, setIsShaking] = useState(false);
    const shakeSpring = useSpring({
        from: { x: 0 },
        to: isShaking
        ? [
            { x: 10 },
            { x: -10 },
            { x: 8 },
            { x: -8 },
            { x: 6 },
            { x: 0 },
          ]
        : { x: 0 },
        reset: isShaking,
        onRest: async () => {
            if(isShaking){
                setIsShaking(false)
                await new Promise(resolve => setTimeout(resolve,800));
                acceptPrize()
            }
        },
        config: { 
            duration: 120,
            mass: 1,
            tension: 500,
            friction: 20,
            easing: easings.easeOutCubic,
        },
      })

    return (
        <div className="relative flex flex-col border justify-end items-center h-full w-full">
            { isPrizeVisible && prizeWon && prizeWon?.prizeType !== '0'? 
                <div className="absolute prize-div h-full w-full z-20">
                    <animated.div 
                        className="absolute h-full w-full" 
                        style={{
                            ...shakeSpring,
                        }}
                    >
                        <div className="absolute z-40 top-[-3.5rem] sm:top-[-2rem] left-0 w-full h-full flex justify-center items-start">
                            <div className="h-[80%] w-[63%] relative">
                                {
                                    prizeWon?.prizeType === '1' ?
                                        <ItemImage itemId={prizeWon?.prizeValue}/>
                                    :
                                        <DegenCard type={prizeWon?.prizeType} degen={prizeWon?.prizeValue}/>
                                }
                            </div>
                        </div>
                        <div className="absolute top-0 left-0 h-full w-full flex justify-center items-center">
                            <div className={`overflow-hidden flex-col flex border ease-in border-[5px] bg-[#B053AA] rounded-[50%] h-full w-full`}>
                                <div className="h-[70%] overflow-hidden "> 
                                    <Lottie options={defaultOptions} height="150%" width="100%" />
                                </div>
                                <button className="grow z-50 accept-ring cursor-pointer flex flex-col justify-start hover:animate-none" onClick={handleAccept}>
                                    <Loader totalCount={10} closePrizeLayer={closePrizeLayer}/>
                                    <p className={` text-4xl font-bold`}>
                                        ACCEPT
                                    </p>
                                </button>
                            </div>
                        </div>
                    </animated.div>
                </div>
            : null
            } 
            {/* 
                67% for side banner 
                38% jackpot
            */}
            <div className="absolute flex justify-center w-[260px] h-[260px] xs:w-[400px] xs:h-[400px] lg:w-[530px] lg:h-[530px] my-4 ">
                <div className="absolute top-[-20%] h-[40%] w-[150%] flex justify-center items-center  ">
                    <div className=" relative top-[0px] xs:top-[-10px] lg:top-[-5px] left-[-10px] xs:left-[-0px] lg:left-[5px]
                        w-[95px] h-[150px] xs:w-[118px] xs:h-[176px] lg:w-[159px] lg:h-[237px]
                        "
                    >
                        <Image
                            src={'/jackpotWheel/banner-small.png'}
                            alt="jackpot-banner"
                            fill
                        />
                    </div>
                    <div className="relative z-10 px-[-5px] top-[-70px] xs:top-[-80px] lg:top-[-100px]
                         w-[110px] h-[60px] xs:w-[218px] xs:h-[83px] lg:w-[291px] lg:h-[110px]
                    ">
                        <Image
                            src={'/jackpotWheel/banner-jackpot.png'}
                            alt="jackpot-banner"
                            fill
                        />
                    </div>
                    <div className="
                            relative top-[0px] xs:top-[-10px] lg:top-[-5px] left-[10px] xs:left-[0px] lg:left-[5px]
                            w-[95px] h-[150px] xs:w-[118px] xs:h-[176px] lg:w-[159px] lg:h-[237px]
                        "
                    >
                        <Image
                            src={'/jackpotWheel/banner-medium.png'}
                            alt="jackpot-banner"
                            fill
                        />
                    </div>
                </div>
            </div>
            <div className="relative h-full w-full flex justify-center items-center">
                <animated.div
                    className="
                        z-[10] sm:border sm:border-[black] sm:border-[5px] relative flex justify-center items-center my-4 rounded-[50%]
                        w-[260px] h-[260px] xs:w-[400px] xs:h-[400px] lg:w-[530px] lg:h-[530px]
                    "
                    style={{ 
                        transform: rotateSpring.rotation.to((r) => {
                            return `rotate(${r}deg)`
                        })
                    }}
                >
                    <CircleWithSlices />
                </animated.div>
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                    <div 
                        className="relative z-[0] bg-[#493313] w-full h-full rounded-full border-black border-[5px]" 
                        style={{ 
                            width: `${
                                getScreenBreakpoint() === 'def' ? '315' 
                                : getScreenBreakpoint() === 'xs'? '480'
                                : getScreenBreakpoint() === 'lg'? "600" 
                                : ""
                            }px`, 
                            height: `${
                                getScreenBreakpoint() === 'def' ? '315' 
                                : getScreenBreakpoint() === 'xs'? '480' 
                                : getScreenBreakpoint() === 'lg'? "625" 
                                : ""
                            }px` 
                        }}
                    >
                        <Lightbulbs count={lightbulbCount} radius={(
                            getScreenBreakpoint() === 'def' ? 
                                307-40 
                            :  getScreenBreakpoint() === 'xs'? 
                                470-60 
                            : getScreenBreakpoint() === 'lg'? 
                                620-80
                            : 620-80
                            )/2} />
                    </div>
                </div>
            </div>
            <div className="absolute z-[10] left-[50%] bottom-[5px] sm:bottom-[0] lg:bottom-[8px] transform -translate-x-1/2 translate-y-0 h-[45px]">
                <svg width={(getScreenBreakpoint() === 'def' || getScreenBreakpoint() === 'xs' ) ? "40" : '55'} height={(getScreenBreakpoint() === 'def' || getScreenBreakpoint() === 'xs' ) ? "40" : '55'} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4 L35 40 Q20 40 5 40 Z" fill="white"/>
                </svg>
            </div>    
        </div>
    )    
}