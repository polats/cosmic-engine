'use server';

import { db } from '@/app/lib/drizzle';
import { nft_collection } from '@/drizzle/schema'; 
import { eq } from 'drizzle-orm';

export async function getNftCollectionData(collection_id:number){
    try {
      const queriedNFT = await db.query.nft_collection.findFirst({
        where: (nftCollection,{eq}) => eq(nftCollection.id, collection_id)
      });
      return queriedNFT;
    } catch (error: unknown) {
      throw new Error('Error fetching data');
    }
}