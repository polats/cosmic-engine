import { integer, text, pgTable } from "drizzle-orm/pg-core";
export const user = pgTable("user", {
  id: text("id")
    .primaryKey(),
  currency: integer("currency")
});