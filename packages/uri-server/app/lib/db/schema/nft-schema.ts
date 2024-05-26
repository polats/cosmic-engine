import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { serial, varchar, text, pgTable, pgSchema, integer, pgEnum } from 'drizzle-orm/pg-core';

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
  attributeLeftHand: integer('attribute_left_hand').references(() => attributes.id),
  attributeRightHand: integer('attribute_right_hand').references(() => attributes.id),
  attributeHead: integer('attribute_head').references(() => attributes.id),
  attributeMouth: integer('attribute_mouth').references(() => attributes.id),
  attributeEyes: integer('attribute_eyes').references(() => attributes.id),
  attributeTop: integer('attribute_top').references(() => attributes.id),
  attributeBottom: integer('attribute_bottom').references(() => attributes.id),
  attributeSkin: integer('attribute_skin').references(() => attributes.id),
  attributeShadow: integer('attribute_shadow').references(() => attributes.id),
  attributeBackground: integer('attribute_background').references(() => attributes.id),
});

