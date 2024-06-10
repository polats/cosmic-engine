'use client';

import { useState, useEffect } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { Prize, PrizePool } from './JackpotJunction';

interface JackpotWheelProps {
    prizePool: PrizePool;
    prizeWon?: Prize;
    isSpinning: boolean;
}

export const JackpotWheel = (props:JackpotWheelProps) => {
    const { prizePool, prizeWon, isSpinning } = props;
    {/*
        Will involve different steps
        Step 1: Loading. While fetching data, wheel rotates consistently
        Step 2: Prize fetched. When a prize is won (or failed) it will move into the next animation
                where it starts to ease(slows down) into  the targeted slice which contains the prize(or lackthereof)
        Step 3: Stop. Stops at the designated slice and shows a modal to either accept or reroll
    */}

    // Step 1: Loading
    const rotateSpring = useSpring({
        from: { rotate: 0 },
        to: { rotate: 360 },
        loop: isSpinning && !prizeWon, //Will continue to spin until a prize is won. 
        immediate: !isSpinning,
        cancel: !isSpinning, //TODO: change cancel to step 2 so that if a prize is won, it will start slowing down 
        config: {
            duration: 300, // This determines the distributed speed, the lower this is, the faster it spins
            easing: t => t, // This controls the easing after each loop of rotation, if you do not make this consistent, it will slow down after each rotation. Change in next step.
        }
    });
    // Next step is when a prize is won, it should start easing into the slice that contains the slot it landed

    return (
        <animated.div
            className="flex bg-white justify-center items-center my-4 grow border border-[3px] border-black rounded-[50%] h-full w-full max-h-[400px] max-w-[400px]"
            style={{
                ...rotateSpring,
                transform: rotateSpring.rotate.to(r => {
                    console.log('r is: ', r)
                    if( r === 360) return `rotate(${0}deg)`}),
            }}
        >
            {isSpinning ? 'around we go':'not spinning'}
        </animated.div>
    )    
}