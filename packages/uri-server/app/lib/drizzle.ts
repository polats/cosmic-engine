import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import * as schema from '@/drizzle/schema'
// Connect to Vercel Postgres
export const db = drizzle(sql, { schema });
