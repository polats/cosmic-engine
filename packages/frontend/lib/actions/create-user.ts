'use server';

import { db, Users } from '@/db/schema'

const INITIAL_AMOUNT = 10000;

export async function createUser(
    id: string,
  ) {
    try {
        await db.insert(Users).values({ id: id, currency: INITIAL_AMOUNT });
    } catch (error) {
        console.error('Failed to create user:', error);
        throw new Error('Failed to create user.');
      }
}  