import path from 'path'
import AdmZip from 'adm-zip'
import xml2js from 'xml2js'
import sharp from 'sharp'
import { ITEM_ID_IMAGE_LAYER_NAMES } from '@/lib/constants'

export type LayerInfo = {
    src: string;
    name: string;
    visibility: string;
    x: string;
    y: string;
  };
  
export type ImageBufferWithOffset = {
  buffer: Buffer;
  x: number;
  y: number;
  };

  // load the ora file and read the stack.xml file
  const zipPath = path.join(process.cwd(), 'assets', 'wagons.ora');
  const zip = new AdmZip(zipPath);
  const stackXmlEntry = zip.getEntry('stack.xml');
  const stackXmlBuffer = stackXmlEntry?.getData();  
  
  const getStackNamesFromRootNode = (rootNode: any) => {
    const stackChildren = rootNode.stack
  
    if (!stackChildren) {
      return []
    }
  
    const stackNames: string[] = stackChildren.map((stack: any) => stack.$.name)
    return stackNames
  }
  
  const findLayerStack = (component: any, targetLayerName: string): any => {
  
    if (component.$.name === targetLayerName) {
      return component
    }
  
    if (component.stack) {
      for (const childStack of component.stack) {
        const result = findLayerStack(childStack, targetLayerName)
        if (result) {
          return result
        }
      }
    }
  
    return null
  }
  
  const getLayersFromXml = async (xmlBuffer: Buffer) => {
    const parser = new xml2js.Parser()
    const xmlString = xmlBuffer.toString()
  
    const result = await parser.parseStringPromise(xmlString)
    const rootNode = result?.image.stack[0].stack[0] // assumes a parent Root layer in the ORA file
  
    if (!rootNode) {
      throw new Error('Root node not found in stack.xml')
    }
  
    const stackNames = getStackNamesFromRootNode(rootNode)
  
    const allLayerInfoArray: Array<LayerInfo> = []
  
    for (const targetLayerName of stackNames) {
      const targetStack = findLayerStack(rootNode, targetLayerName)
  
      if (!targetStack) {
        continue
      }
  
      const layerComponents = targetStack.layer
  
      const layerInfoArray: Array<LayerInfo> = layerComponents
      .map((layer: any) => ({
        src: layer.$.src,
        name: layer.$.name,
        visibility: layer.$.visibility,
        x: layer.$.x,
        y: layer.$.y
      }))
  
  
      if (layerInfoArray.length > 0) {
        for (var i = 0; i < layerInfoArray.length; i++) {
            allLayerInfoArray.push(layerInfoArray[i])
        }
      }
    }
  
    return allLayerInfoArray
  }
  
  const getImageSizeFromXml = async (xmlBuffer: Buffer) => {
    const parser = new xml2js.Parser()
    const xmlString = xmlBuffer.toString()
  
    const result = await parser.parseStringPromise(xmlString)
    const imageComponent = result?.image
  
    if (!imageComponent) {
      throw new Error('No image component found in stack.xml')
    }
  
    const width = parseInt(imageComponent.$.w, 10)
    const height = parseInt(imageComponent.$.h, 10)
  
    return { width, height }
  }
  
  const combineImages = async (
    imageBuffersWithOffsets: ImageBufferWithOffset[],
    combinedWidth: number,
    combinedHeight: number
  ) => {
    let compositeImage = await sharp({
      create: {
        width: combinedWidth,
        height: combinedHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });
  
    const compositeOperations = imageBuffersWithOffsets.map((imageBufferWithOffset) => ({
      input: imageBufferWithOffset.buffer,
      left: imageBufferWithOffset.x,
      top: imageBufferWithOffset.y,
    }));
  
    compositeImage = await compositeImage.composite(compositeOperations).png();
  
    return compositeImage.toBuffer();
  };
  
  const selectImagesFromZip = async (partsArray: Array<LayerInfo>, attributesArray:  any) => {
    const imageBuffersWithOffsets  = Array<ImageBufferWithOffset>();
  
  // Extract the values from the attributesArray
  const attributeValues = attributesArray.map((attribute: any) => attribute.value);
    
  
    for (const part of partsArray) {
      const entry = zip.getEntry(part.src);
      if (!entry?.isDirectory && attributeValues.includes(part.name)) {
        imageBuffersWithOffsets.push({
            buffer: entry?.getData() as Buffer, x: parseInt(part.x), y: parseInt(part.y)
        });
      }
    }
  
    return imageBuffersWithOffsets;
  };  
  
  const getAllImagesFromZip = async (partsArray: Array<LayerInfo>) => {
    const imageBuffersWithOffsets  = Array<ImageBufferWithOffset>();     
  
    for (const part of partsArray) {
      const entry = zip.getEntry(part.src);
      if (!entry?.isDirectory) {
        imageBuffersWithOffsets.push({
            buffer: entry?.getData() as Buffer, x: parseInt(part.x), y: parseInt(part.y)
        });
      }
    }
  
    return imageBuffersWithOffsets;
  };  
  

  


  export async function getAllOraLayerData() {

    try {  
        const partsArray = (await getLayersFromXml(stackXmlBuffer as Buffer)).reverse();    
        const imageBuffers = [];
 
     for (let i = 0; i < ITEM_ID_IMAGE_LAYER_NAMES.length; i++) {
        const itemName = ITEM_ID_IMAGE_LAYER_NAMES[i][0];
        const itemLayer = itemName.split('_')[1];
    
        const attributes = [
            { trait_type: itemLayer, value: itemName }
          ]

        const imageBuffer = await selectImagesFromZip(partsArray, attributes);  
        imageBuffers.push(imageBuffer[0]);

      
     }

      return JSON.stringify(imageBuffers);              

    } catch (error) {
      console.error('Error :', error);
    }    
  }

  export async function getOraLayerData(id: string) {
    const itemName = ITEM_ID_IMAGE_LAYER_NAMES[parseInt(id)][0];
    const itemLayer = itemName.split('_')[1];

    const attributes = [
      { trait_type: itemLayer, value: itemName }
    ]

    try {
  
      const partsArray = (await getLayersFromXml(stackXmlBuffer as Buffer)).reverse();    
      const imageBuffers = await selectImagesFromZip(partsArray, attributes);  

      return JSON.stringify(imageBuffers);        

      // const { width, height } = await getImageSizeFromXml(stackXmlBuffer as Buffer);
      // const combinedImageBuffer = await combineImages(imageBuffers, width, height);
      // return JSON.stringify(combinedImageBuffer);
      
  
    } catch (error) {
      console.error('Error :', error);
    }    


  }

  export async function getCombinedImageFromAttributes(attributes: any) {
    try {
  
      const partsArray = (await getLayersFromXml(stackXmlBuffer as Buffer)).reverse();    
      const imageBuffers = await selectImagesFromZip(partsArray, attributes);  

      const { width, height } = await getImageSizeFromXml(stackXmlBuffer as Buffer);
      const combinedImageBuffer = await combineImages(imageBuffers, width, height);
      return JSON.stringify(combinedImageBuffer);
      
  
    } catch (error) {
      console.error('Error :', error);
    }    
  }


  