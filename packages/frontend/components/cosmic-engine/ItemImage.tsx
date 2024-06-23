
import { getItemImage } from "@/lib/actions"
import { useEffect, useState } from "react";
import Image from "next/image";

type ItemImageProps = {
    itemId: string;
  };

  function arrayBufferToBase64(buffer: Buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function uint8ArrayToSrc(uint8Array: Buffer, mimeType = 'image/png') {
    const base64String = arrayBufferToBase64(uint8Array);
    return `data:${mimeType};base64,${base64String}`;
  }
  

  export const ItemImage = ({
    itemId
  }: ItemImageProps) => {
    const [image, setImage] = useState<string>();

    async function loadImage(itemId: string) {
        const fetchedImage = await getItemImage(itemId);

        if (fetchedImage) {
            const imageJSON = JSON.parse(fetchedImage);
            const imageData = uint8ArrayToSrc(imageJSON[0].buffer.data);
            setImage(imageData);
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
  