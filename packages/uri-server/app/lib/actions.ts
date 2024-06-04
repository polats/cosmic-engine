'use server';
  
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from '@/app/lib/drizzle';
import { nfts, attributes, nft_attributes, nft_collection } from '@/drizzle/schema'; 
import { eq } from 'drizzle-orm';


export type NewAttribute = typeof attributes.$inferInsert;
export type NewNft = typeof nfts.$inferInsert;
export type NewNftAttribute = typeof nft_attributes.$inferInsert;
export type NewNftCollection = typeof nft_collection.$inferInsert;

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

export async function addNft(
  formState: { message: string },
  formData: FormData
){
  try {
    const name = formData.get('name');
    const description = formData.get('description');
    const image = formData.get('image');
  
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
      image
    }
    await db.insert(nfts).values(nftToInsert).execute();
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
  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function getNftCollections(){
  try{
    const queriedNFT = await db.query.nft_collection.findMany();
    return queriedNFT;
  } catch (error: unknown) {
      throw new Error('Error fetching data');
  }
}

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

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
      .number()
      .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select an invoice status.',
    }),
    date: z.string(),
  });

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
  };

  export async function createInvoice(prevState: State, formData: FormData) {
    // Validate form using Zod
    const validatedFields = CreateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Create Invoice.',
      };
    }
   
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
   
    // Insert data into the database
    try {
      await sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
      `;
    } catch (error) {
      // If a database error occurs, return a more specific error.
      return {
        message: 'Database Error: Failed to Create Invoice.',
      };
    }
   
    // Revalidate the cache for the invoices page and redirect the user.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
  ) {
    const validatedFields = UpdateInvoice.safeParse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing Fields. Failed to Update Invoice.',
      };
    }
   
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
   
    try {
      await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
      return { message: 'Database Error: Failed to Update Invoice.' };
    }
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }

  export async function deleteInvoice(id: string) {
    try {
      await sql`DELETE FROM invoices WHERE id = ${id}`;
      revalidatePath('/dashboard/invoices');
      return { message: 'Deleted Invoice.' };
    } catch (error) {
      return { message: 'Database Error: Failed to Delete Invoice.' };
    }
  }

  export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }
  