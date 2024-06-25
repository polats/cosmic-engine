'use server';

import { 
  getOraLayerData, 
  getAllOraLayerData,
} from "~~/utils/cosmic-engine/ora";

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