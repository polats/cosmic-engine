'use server';

import { db } from '@/app/lib/drizzle';
import { nft_collection } from '@/drizzle/schema'; 

export async function getNftCollections(){
    try{
      const queriedNFT = await db.query.nft_collection.findMany();
      return queriedNFT;
    } catch (error: unknown) {
        throw new Error('Error fetching data');
    }
}