'use client'

import { useState, useEffect } from 'react';
import { Prize } from '~~/components/cosmic-engine/JackpotJunction';

interface AcceptLoader {
    totalCount: number;
    closePrizeLayer: () => void;
}

const AcceptLoader = ({totalCount, closePrizeLayer}: AcceptLoader) => {
    const [count, setCount] = useState(10);

    useEffect(() => {
        const intervalId = setInterval(() => {
          setCount(prevCount => {
            if (prevCount > 0) {
              return prevCount - 1;
            } else {
                closePrizeLayer()
            }
          });
        }, 2000);
    
        // Cleanup function to clear the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);


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
    
    return (
        <div className="w-[95%] flex justify-center border rounded-3xl h-[15px]">
            {Array(totalCount).fill(null).map((value, index) => <Segment key={index} index={index}/>)}
        </div>
    )

}

export default AcceptLoader;