import { integer, text, pgTable } from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { sql } from "@vercel/postgres";
import { drizzle } from 'drizzle-orm/vercel-postgres'
  
export const Users = pgTable("Users", {
  id: text("id")
    .primaryKey(),
  currency: integer("currency")
});

export type User = InferSelectModel<typeof Users>
export type NewUser = InferInsertModel<typeof Users>

// Connect to Vercel Postgres
export const db = drizzle(sql)

  