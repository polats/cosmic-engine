import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { serial, varchar, text, pgTable, pgSchema, integer, pgEnum,primaryKey } from 'drizzle-orm/pg-core';

export const attributeTypes = pgEnum('attributeTypes', ['Left Hand', 'Right Hand', 'Head', 'Mouth', 'Eyes', 'Top', 'Bottom', 'Skin', 'Shadow', 'Background']);

export const attributes = pgTable('attributes', {
    id: serial('id').primaryKey(),
    attributeType: attributeTypes('attribute_type').notNull(),
    value: text('value'),
});

export const nfts = pgTable('nfts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 256 }).notNull().unique(),
  description: text('description').notNull().unique(),
  image: text('image').notNull().unique(),
});

export const nftAttributes = pgTable('nft_attributes',{
  nftId: integer('nft_id').notNull().references(() => nfts.id),
  attributeId: integer('attribute_id').notNull().references(() => attributes.id)
}, (table) => {
  return {
    pk: primaryKey({columns: [table.nftId, table.attributeId]})
  };
});

