
type Item = {
    name: string;
    base64image: string;
    amount: string;
}

interface InventoryProps {
    data: Item[];
    tier: number;
}
import { useState } from 'react';
import Image from "next/image";
import { TIER_COLORS } from '@/lib/constants';

export default function Inventory (inventory: InventoryProps) {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const handleItemClick = (item: Item) => {
        setSelectedItem(item);
    }

    return (
        <div className="grid grid-cols-4 gap-4">
            {inventory.data.map((item) => (
                <div 
                    className={`border w-[80px] h-[80px] bg-[#B4B4B4] ${item === selectedItem ? 'selected' : ''}`} 
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                    style={
                        item === selectedItem 
                        ? {outline: "2px solid red", backgroundColor: TIER_COLORS[inventory.tier]} 
                        : {backgroundColor: TIER_COLORS[inventory.tier]}}
                >
                    <Image 
                        src={item.base64image} 
                        alt={item.name} 
                        width={80}
                        height={80}
                        style={
                            item.amount === '0' ?
                            {
                            filter: 'grayscale(100%) brightness(25%)',
                            }: {}
                        }                                            
                    />                    
                    <div className="text-center">{item.amount}</div>
                </div>
            ))}
        </div>
    )
}