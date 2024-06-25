
type Item = {
    name: string;
    base64image: string;
    amount: string;
}

interface InventoryProps {
    data: Item[];
}
import Image from "next/image";

export default function Inventory (inventory: InventoryProps) {

    return (
        <div className="grid grid-cols-4 gap-4">
            {inventory.data.map((item) => (
                <div className="border w-[80px] h-[80px] bg-[#848484]" key={item.name}>
                    <Image 
                src={item.base64image} 
                alt={item.name} 
                width={80}
                height={80}
                />                    
                <div className="text-center">{item.amount}</div>
                </div>
            ))}
        </div>
    )
}

// const [itemImages, setItemImages] = useState<string>();

// async function loadAllItemImages() {
//     const allItemLayerData = await getAllItemLayerData();


//     if (allItemLayerData) {
//         setItemImages(itemImages);
//     }

// }

// useEffect(() => {
//     loadAllItemImages();
//   }, []);  
