'use client';

import { useState, useEffect } from 'react';
import { useSpring, useSpringRef, animated, config, easings } from '@react-spring/web';
import { Prize, PrizePool } from './JackpotJunction';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface JackpotWheelProps {
    prizePool: PrizePool;
    prizeWon?: Prize | null;
    isSpinning: boolean;
}

export const JackpotWheel = (props:JackpotWheelProps) => {
    const wheelApiRef = useSpringRef();
    const { prizePool, prizeWon, isSpinning } = props;
    const [ prizeState, setPrizeState ] = useState(prizeWon); //used to update state, will not cause a re render if prizeWon is used
    const [ currentAngle, setCurrentAngle ] = useState(0);
    const [ springConfig, setSpringConfig ] = useState({
        duration: 300, // This determines the distributed speed, the lower this is, the faster it spins
        easing: (t:number ) => t, // This controls the easing after each loop of rotation, if you do not make this consistent, it will slow down after each rotation. Change in next step.
    })

    useEffect(() => {
        setPrizeState(prizeWon);
        if(!!prizeWon){
            setSpringConfig({
                duration: 1500, // This determines the distributed speed, the lower this is, the faster it spins
                easing: easings.easeOutQuad,
            });
        }
    }, [prizeWon]);

    {/*
        Will involve different steps
        Step 1: Loading. While fetching data, wheel rotates consistently
        Step 2: Prize fetched. When a prize is won (or failed) it will move into the next animation
                where it starts to ease(slows down) into  the targeted slice which contains the prize(or lackthereof)
        Step 3: Stop. Stops at the designated slice and shows a modal to either accept or reroll
    */}

    const rotateSpring = useSpring({
        from: { rotate: 0 },
        to: async (next, cancel) => { 
            if(isSpinning || prizeWon){
                console.log("prizeWon", prizeState)
                await next({ rotate: 360 , loop: !prizeState});
                if(!!prizeState){
                    await next({rotate: 360, immediate: true});
                    await next ({ rotate: 180+2160, immediate: true});
                } //dummy value to where to stop
            }
        },
        immediate: !isSpinning,
        config: springConfig
    });
    // Next step is when a prize is won, it should start easing into the slice that contains the slot it landed

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
                <Pie data={data} options={options} />
            </>
        )
    }

    return (
        <animated.div
            className="flex justify-center items-center my-4 grow rounded-[50%] h-full w-full max-h-[400px] max-w-[400px]"
            style={{...rotateSpring}}
        >
            <Slices />
        </animated.div>
    )    
}