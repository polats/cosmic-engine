'use server';

import { db } from '@/app/lib/drizzle';
import { nfts } from '@/drizzle/schema'; 
import { eq } from 'drizzle-orm';

export async function getNftData(nft_id:number){
    try {
      const queriedNFT = await db.query.nfts.findFirst({
        where: (nfts,{eq}) => eq(nfts.id, nft_id)
      });
      return queriedNFT;
    } catch (error: unknown) {
      throw new Error('Error fetching data');
    }
}