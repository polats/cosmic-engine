'use server';

import { db } from '@/app/lib/drizzle';
import { nft_collection } from '@/drizzle/schema'; 
import { NewNftCollection } from '@/types'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addNftCollection (
    formState: { message: string },
    formData: FormData
  ){
    try {
      const name = formData.get('name');
      const description = formData.get('description');
  
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
  
      const nftCollectionToInsert:NewNftCollection = {
        name,
        description,
      }
      await db.insert(nft_collection).values(nftCollectionToInsert).execute();
    } catch (error: unknown) {
      if(error instanceof Error){
        return {
          message: error.message,
        }
      } else {
        return {
          message: "Something went wrong..."
        }
      }
    }
    revalidatePath('/nft-collections');
    redirect('/nft-collections');
  }
  