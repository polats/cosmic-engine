
import { getItemLayerData } from "@/lib/actions"
import { getBase64Image } from "@/utils/cosmic-engine/ora-client"
import { useEffect, useState } from "react";
import Image from "next/image";

type ItemImageProps = {
    itemId: string;
  };

  export const ItemImage = ({
    itemId
  }: ItemImageProps) => {
    
    // image is base64 string
    const [image, setImage] = useState<string>();

    async function loadImage(itemId: string) {
        const layerData = await getItemLayerData(itemId);

        if (layerData) {
          const fetchedImage = getBase64Image(layerData);
          setImage(fetchedImage);

        }

    }

    useEffect(() => {
        loadImage(itemId);
      }, [itemId]);  
      
    

    return (
        <div style={{width: '100%', height: '100%', position: 'relative'}}>
        {
            image && 
            <Image 
                src={image} 
                alt={itemId} 
                fill
                style={{
                  objectFit: 'contain',
                }}                
                />
        }
        </div>
    );
  };
  
  export default ItemImage;
  