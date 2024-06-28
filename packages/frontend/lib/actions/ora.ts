'use server';

import { 
  getOraLayerData, 
  getAllOraLayerData,
  getCombinedImageFromAttributes,
} from "~~/utils/cosmic-engine/ora";

import { ITEM_ID_IMAGE_LAYER_NAMES } from "../constants";

export async function drawEquippedWagon(attributes: any) {
  const layerData = await getCombinedImageFromAttributes(attributes);

  return layerData;
}

export async function getItemLayerData(
    id: string,
  ) {

    const layerData = await getOraLayerData(id);
    return layerData;
}  

export async function getAllItemLayerData() {
  const layerData = await getAllOraLayerData();
  return layerData;
}