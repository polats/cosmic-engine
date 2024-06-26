
import { getItemLayerData } from "@/lib/actions"
import { getBase64Image } from "@/utils/cosmic-engine/ora-client"
import { useEffect, useState } from "react";
import Image from "next/image";

type ItemImageProps = {
    itemId: string;
  };

  export const ItemImage = ({
    itemId,
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
  