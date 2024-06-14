
type CardProps = {
    name: string;
    imageUrl: string;
    tier: number;
}

interface WagonCardProps {
    cardData: CardProps;
}

export default function WagonCard (props: WagonCardProps) {
    return (
        <div className="border w-[56px] h-[93px] bg-[#848484]">
            
        </div>
    )
}