
import { getItemLayerData } from "@/lib/actions"
import { getBase64Image } from "@/utils/cosmic-engine/ora-client"
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
  
  const terrain = [
    {terrain: "plain", color: "#a6d13f"}, 
    {terrain: "forest", color: "#103500"},
    {terrain:"swamp", color: "#638206"},
    {terrain:"water", color: "#5a7998"},
    {terrain:"mountain", color: "#726681"},
    {terrain:"desert", color: "#fb7724"},
    {terrain:"ice", color: "#6befff"},
  ]

  const types = [ "Cover", "Body", "Wheel", "Beast"];


  export const ItemImage = ({
    itemId,
  }: ItemImageProps) => {
    
    // image is base64 string
    const [image, setImage] = useState<string>();
    const itemIdBase = (parseInt(itemId) % 28);
    const itemTerrain =  Math.floor(itemIdBase/4);
    const itemType = itemIdBase%4;
    const itemTier = Math.floor(parseInt(itemId)/28);

    async function loadImage(itemId: string) {
        const layerData = await getItemLayerData(itemId);

        if (layerData) {
          const fetchedImage = getBase64Image(layerData);
          setImage(fetchedImage);
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

    useEffect(() => {
        loadImage(itemId);
      }, [itemId]);  

    return (
        <div 
          className={`h-full w-full flex flex-col gap-y-4 border border-black border-[1px] rounded-3xl p-4`} 
          style={{
            backgroundColor: terrain[itemTerrain].color
          }}
        >
          <div className="relative h-[70%] p-2">
            <Image
              src={'/card-mask.png'}
              alt={'card background'}
              fill
            />
            {
                image && <div className="h-full w-full relative rounded-3xl">
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
            <div 
              className="flex flex-col text-[white] border border-[white] rounded-lg h-full py-2" 
              style={{
                backgroundColor: darkenColor(terrain[itemTerrain].color)
              }}
            >
              <h3 className="text-lg font-jost font-semibold p-0 m-0">
                {`${types[itemType].toUpperCase()} - ${terrain[itemTerrain].terrain.toUpperCase()}`}
              </h3>
              <span className="text-sm">lorem ipsum dolor sit amet</span>
            </div>
          </div>
        </div>
    );
  };
  
  export default ItemImage;
  