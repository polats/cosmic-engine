'use server';

import { eq } from 'drizzle-orm';
import { db, Users } from '@/db/schema'

const ROLL_COST = 100;

export async function performRoll(
    id: string,
  ) {
    try {
        // get user's currency
        const user = await db.select()
            .from(Users)
            .where(eq(Users.id, id))

        if (user[0].currency != null) {
        // subtract roll cost
        const currency = user[0].currency;
        if (currency < ROLL_COST) {
            throw new Error('Insufficient funds.');
        }
        
        await db.update(Users)
            .set({ currency: currency - ROLL_COST})
            .where(eq(Users.id, id));
        } else {
            throw new Error('User not found.');
        }
    } catch (error) {
        console.error('Failed to perform roll:', error);
        throw new Error('Failed to perform roll.');
      }
  }  
  