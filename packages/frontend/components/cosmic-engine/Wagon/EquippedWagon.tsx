
import Image from 'next/image';
import { drawEquippedWagon } from "@/lib/actions/ora"
import { getCombinedBase64Image } from "@/utils/cosmic-engine/ora-client"
import { ITEM_ID_IMAGE_LAYER_NAMES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { set } from 'nprogress';

interface EquippedWagonProps {
    equippedBeasts: bigint | undefined;
    equippedBody: bigint | undefined;
    equippedCover: bigint | undefined;
    equippedWheels: bigint | undefined;
}


export default function EquippedWagon (props: EquippedWagonProps) {
   // image is base64 string
   const [image, setImage] = useState<string>();
   
   async function loadImage(props: EquippedWagonProps) {

    try {

        let attributes = [];
        let hasEquipped = false;

        // example attributes
        // const attributes = [
        //     { trait_type: 'beast', value: "swamp_beast"}, 
        //     { trait_type: 'fwheel', value: "plains_fwheel"},
        //     { trait_type: 'bwheel', value: "plains_bwheel"},
        //     { trait_type: 'body', value: "swamp_body"},
        //     { trait_type: 'cover', value: "plains_cover"},
        //   ]
        
        // add attribute if prop is greater than 0
        if (props.equippedBeasts) {
            const index = parseInt(props.equippedBeasts.toString()) - 1 % ITEM_ID_IMAGE_LAYER_NAMES.length;
            const layerName = ITEM_ID_IMAGE_LAYER_NAMES[index][0];
            attributes.push({ trait_type: 'beast', value: layerName});
            hasEquipped = true;
        }

        if (props.equippedBody) {
            const index = parseInt(props.equippedBody.toString()) - 1 % ITEM_ID_IMAGE_LAYER_NAMES.length;
            const layerName = ITEM_ID_IMAGE_LAYER_NAMES[index][0];
            attributes.push({ trait_type: 'body', value: layerName});
            hasEquipped = true;
        }

        if (props.equippedCover) {
            const index = parseInt(props.equippedCover.toString()) - 1 % ITEM_ID_IMAGE_LAYER_NAMES.length;
            const layerName = ITEM_ID_IMAGE_LAYER_NAMES[index][0];
            attributes.push({ trait_type: 'cover', value: layerName});
            hasEquipped = true;
        }

        if (props.equippedWheels) {
            const index = parseInt(props.equippedWheels.toString()) - 1 % ITEM_ID_IMAGE_LAYER_NAMES.length;
            const layerName = ITEM_ID_IMAGE_LAYER_NAMES[index][0];
            attributes.push({ trait_type: 'fwheel', value: layerName});
            attributes.push({ trait_type: 'bwheel', value: layerName});
            hasEquipped = true;
        }
        
        if (hasEquipped) {
            const layerData = await drawEquippedWagon(attributes);
            
            if (layerData) {
            const fetchedImage = getCombinedBase64Image(layerData);
            setImage(fetchedImage);
            }
        }

        else setImage(undefined);
    
    } catch (error) {
        console.log(error);
    }


    }

    useEffect(() => {
        loadImage(props);
      }, [props]);  

    return (
        <div>
        { image ?
              <Image 
                  src={image} 
                  alt={"your wagon"} 
                  fill
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                  }}                
                />
                  :
                <Image 
                    src="/wagon-sample.png" 
                    alt="wagon-sample" 
                    fill
                    style={{
                        objectFit: 'contain',
                        filter: 'grayscale(100%) brightness(0%)'
                      }}                                        
                    />                  

            }            
    </div>
    )
}

        {/* <Image src="/wagon-sample.png" alt="wagon-sample" fill/> */}
