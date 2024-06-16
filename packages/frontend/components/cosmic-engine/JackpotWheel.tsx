'use client';

import { useState, useEffect } from 'react';
import { useSpring, useSpringRef, animated, config, easings } from '@react-spring/web';
import { Prize, PrizePool } from './JackpotJunction';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { confetti } from "@tsparticles/confetti"

ChartJS.register(ArcElement, Tooltip, Legend);

interface JackpotWheelProps {
    prizePool: PrizePool;
    prizeWon?: Prize | null;
    isSpinning: boolean;
}

export const JackpotWheel = (props:JackpotWheelProps) => {
    const wheelApiRef = useSpringRef();
    const [ state, setState ] = useState('notMoving');
    const [ initialLoop, setInitialLoop ] = useState(true);
    const { prizePool, prizeWon, isSpinning } = props;
    const [ prizeState, setPrizeState ] = useState(prizeWon); //used to update state, will not cause a re render if prizeWon is used
    const [ currentAngle, setCurrentAngle ] = useState(0);
    const [ springConfig, setSpringConfig ] = useState({
        duration: 300, // This determines the distributed speed, the lower this is, the faster it spins
        easing: (t:number ) => t, // This controls the easing after each loop of rotation, if you do not make this consistent, it will slow down after each rotation. Change in next step.
    })

    {/*
        1) Land on winning slice
        2) Reset to notMoving    
    */}

    {/*
        Will involve different steps
        Step 1: Loading. While fetching data, wheel rotates consistently
        Step 2: Prize fetched. When a prize is won (or failed) it will move into the next animation
                where it starts to ease(slows down) into  the targeted slice which contains the prize(or lackthereof)
        Step 3: Stop. Stops at the designated slice and shows a modal to either accept or reroll
    */}

    const { rotation } = useSpring({
        from: { rotation: 0},
        to: async(next, cancel) => {
            if(state === 'accelerating'){
                setInitialLoop(false)
                await next({ rotation: 360 * 4, config: {duration: 2000, easing: easings.easeInQuad } })
                await next({ rotation: 0, config: { duration: 0 } });
            }
            else if(state === 'spinning' && state !== ''){
                while(isSpinning){
                    await next({ rotation: 360, config: { duration: 180} }); 
                    await next({ rotation: 0, config: { duration: 0 } });
                }
            } else if (state === 'decelerating') {
                await next({ rotation: 360 * 10, config: { duration: 5000, easing: easings.easeOutCubic } }); //TODO: Change 360 to the actual point on where the wheel should land
                confetti({
                    particleCount: 200,
                    spread: 140,
                    origin: { y: 0.5},
                });
                setInitialLoop(true);
              } else {
                await next({ rotation: 0});
              }
        },
        reset: state === 'notMoving',
        onRest: () => {
            if (isSpinning && initialLoop){
                setState('accelerating')
            }
            else if ( isSpinning && !initialLoop) {
                setState('spinning');
            } else if ( !isSpinning && prizeWon ) {
                setState('decelerating')
            } else if ( state === 'decelerating') {
                setState('notMoving')
            }
        },
    })

    const Slices = () => {
        const data = {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Orange', 'Pink'], // Define the labels here
            datasets: [
                {
                    data: [25, 25, 25, 25,25,25], // Define the data values here
                    backgroundColor: ['red', 'blue', 'yellow', 'green', 'orange', 'pink'],
                },
            ],
        };
        const options = {
            plugins: {
                legend: {
                    display: false, // Hide legend
                },
                tooltip: {
                    enabled: false, // Disable tooltips
                },
            },
            animation: false, // Disable animations
        };
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
        <>
        <animated.div
            className="h-full w-full flex justify-center items-center my-4 grow rounded-[50%] h-full w-full max-h-[400px] max-w-[400px]"
            style={{ transform: rotation.to((r) => `rotate(${r}deg)`),}}
        >
            <Slices />
        </animated.div>
        Wheel Status: {state}
        </>
    )    
}