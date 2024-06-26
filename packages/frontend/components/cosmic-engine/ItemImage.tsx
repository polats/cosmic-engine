
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
    itemId,
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
        <div className="h-full w-full flex flex-col gap-y-4 bg-[#F0974C] border border-black border-[1px] rounded-xl p-4">
          <div className="relative rounded h-[70%] p-2">
            <Image
              src={'/card-mask.png'}
              alt={'card background'}
              fill
            />
            {
                image && <div className="h-full w-full relative">
                  <Image 
                      src={image} 
                      alt={itemId} 
                      fill
                      style={{
                        objectFit: 'contain',
                      }}                
                      />
                </div>
            }
          </div>
          <div className="grow">
            <div className="flex flex-col text-black border border-[black] rounded-lg h-full py-2">
              <h3 className="text-lg font-jost font-semibold p-0 m-0">
                Sample Title
              </h3>
              <span className="text-sm">lorem ipsum dolor sit amet</span>
            </div>
          </div>
        </div>
    );
  };
  
  export default ItemImage;
  