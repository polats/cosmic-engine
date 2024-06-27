import { useState } from 'react';
import Image from "next/image";
import { 
    TIER_COLORS, 
    CRAFT_COST,
    Item } from '@/lib/constants';
import CraftButton from './CraftButton';
import EquipButton from './EquipButton';

interface InventoryProps {
    data: Item[];
    tier: number;
}

export default function Inventory (inventory: InventoryProps) {
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    const handleItemClick = (item: Item) => {
        setSelectedItem(item);
    }

    return (
        <div className="grid grid-cols-4 gap-4">
            {inventory.data.map((item, index) => (
                <div 
                    className={`relative border w-[80px] h-[80px] bg-[#B4B4B4] ${item === selectedItem ? 'selected' : ''}`} 
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
                    <div className={`${parseInt(item.amount) >= CRAFT_COST ? 'bg-blue-500' : 'bg-gray-500'}
                    absolute -top-4 -right-2 m-1 rounded-full text-white text-center w-6 h-6 flex items-center justify-center`}>{item.amount}</div>
                    {
                        item === selectedItem && (
                            parseInt(item.amount) >= 1 && 
                            <div className="absolute px-10 text-center">
                            <EquipButton item={item} tier={inventory.tier} index={index} />                            
                            </div>
                        )
                    }                    

                    {
                        item === selectedItem && (
                            parseInt(item.amount) >= CRAFT_COST && 
                            <div className="absolute -bottom-6 right-1/2">
                            <CraftButton item={item} tier={inventory.tier} index={index}/>                            
                            </div>
                        )
                    }                    
                </div>
            ))}
        </div>
    )
}