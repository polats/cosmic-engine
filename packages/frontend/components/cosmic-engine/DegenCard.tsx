import Image from 'next/image';
import { formatGwei } from 'viem';

interface DegenCardProps {
    type: string;
    degen: string;
}

const DegenCard = ({type, degen}: DegenCardProps) => {
    const typeParsed = parseInt(type);
    const typeImage = () => {
        if (typeParsed === 3) { //medium
            return '/medium-coins.png'
        } else if (typeParsed === 4) { //large
            return '/jackpot-coins.png'
        } else { //small
            return '/small-coins.png'
        } 
    }
    const darkenColor = (hexColor: string) => {
        const percentage = 30;
      // Convert hex to RGB
        hexColor = hexColor.replace('#', '');
        let r = parseInt(hexColor.substring(0, 2), 16);
        let g = parseInt(hexColor.substring(2, 4), 16);
        let b = parseInt(hexColor.substring(4, 6), 16);
  
        // Calculate the darker shade
        r = Math.max(0, Math.floor(r * (1 - percentage / 100)));
        g = Math.max(0, Math.floor(g * (1 - percentage / 100)));
        b = Math.max(0, Math.floor(b * (1 - percentage / 100)));
  
        const darkerHexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  
        return darkerHexColor;
    }

    return (
        <div 
            className={`h-full w-full flex flex-col gap-y-4 border bg-[#ffff00] border-black border-[1px] rounded-xl p-4`} 
        >
            <div className="relative flex items-center justify-center rounded h-[70%] p-2">
                <Image
                    src={'/card-mask.png'}
                    alt={'card background'}
                    fill
                />
                <div className="h-[80%] w-full relative">
                    <Image 
                        src={typeImage()} 
                        alt={'degen value'} 
                        fill
                        style={{
                            objectFit: 'contain',
                        }}                
                        />
                </div>
                
            </div>
            <div className="grow">
                <div 
                    className="flex flex-col justify-center items-center text-[white] border border-[white] rounded-lg h-full py-2" 
                    style={{
                    backgroundColor: darkenColor("#ffff00")
                    }}
                >
                    <h3 className="text-lg font-jost font-semibold p-0 m-0">
                    {`${formatGwei(BigInt(degen))} GWEI`}
                    </h3>
                </div>
            </div>
        </div>
    )
}

export default DegenCard;