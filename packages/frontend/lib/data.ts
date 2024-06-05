'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { db, Users } from '@/db/schema'
import { eq } from "drizzle-orm";


export async function getUser(id: string) {
    noStore();

    try {
      const user = await db.select()
        .from(Users)
        .where(eq(Users.id, id))

    return user[0];

    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw new Error('Failed to fetch user.');
    }
}
