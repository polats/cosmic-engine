'use server';

import { db } from '@/app/lib/drizzle';
import { nfts } from '@/drizzle/schema'; 
import { NewNft } from '@/types'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addNft(
    collection: {id: number},
    formState: { message: string },
    formData: FormData
  ){
    try {
        const name = formData.get('name');
        const description = formData.get('description');
        const image = formData.get('image');
        const collection_id = collection.id
        
        if(typeof name !== 'string' || name.length < 3) {
            return {
            message: "Name must be longer",
            };
        }
        
        if(typeof description !== 'string' || description.length < 1) {
            return {
            message: "Description cannot be empty",
            };
        }
    
        if(typeof image !== 'string' || image.length < 1) {
            return {
            message: "Image cannot be empty",
            };
        }
        
        const nftToInsert: NewNft = {
            name,
            description,
            image,
            collection_id,
        }
      await db.insert(nfts).values(nftToInsert).execute();
    } catch (error: unknown) {
      if(error instanceof Error){
        console.log("Error: ", error.message);
        return {
          message: "Something went wrong... ",
        }
      } else {
        return {
          message: "Something went wrong..."
        }
      }
    }
    revalidatePath(`/nft-collections/${collection.id}`);
    redirect(`/nft-collections/${collection.id}`);
  }