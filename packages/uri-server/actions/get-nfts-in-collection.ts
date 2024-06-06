'use server';


import { eq } from 'drizzle-orm';
import { db } from '@/app/lib/drizzle';
import { nfts } from '@/drizzle/schema'; 

export async function getNftsInCollection(collection_id:number){
    try{
      const queriedNFT = await db.query.nfts.findMany({
        where: (nfts,{eq}) => eq(nfts.collection_id, collection_id)
      });
      return queriedNFT;
    } catch (error: unknown) {
        throw new Error('Error fetching data');
    }
}