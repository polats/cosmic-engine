'use server';

import { 
  getImageBufferFromLayerName, 
  getAllImagesAsImageBuffers
} from "~~/utils/cosmic-engine/ora";

export async function getItemImage(
    id: string,
  ) {

    const imageBuffer = await getImageBufferFromLayerName(id);
    return imageBuffer;
}  

export async function getAllLayerImages() {
  const imageBuffers = await getAllImagesAsImageBuffers();
  return imageBuffers;
}