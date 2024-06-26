import { pgTable, pgEnum, serial, text, foreignKey, unique, varchar, integer, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const attributeTypes = pgEnum("attributeTypes", ['Left Hand', 'Right Hand', 'Head', 'Mouth', 'Eyes', 'Top', 'Bottom', 'Skin', 'Shadow', 'Background'])


export const attributes = pgTable("attributes", {
	id: serial("id").primaryKey().notNull(),
	attribute_type: text("attribute_type").notNull(),
	value: text("value"),
});

export const nfts = pgTable("nfts", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 256 }).notNull(),
	description: text("description").notNull(),
	image: text("image").notNull(),
	collection_id: integer("collection_id").references(() => nft_collection.id).notNull(),
},
(table) => {
	return {
		nfts_name_unique: unique("nfts_name_unique").on(table.name),
		nfts_description_unique: unique("nfts_description_unique").on(table.description),
		nfts_image_unique: unique("nfts_image_unique").on(table.image),
	}
});

export const nft_collection = pgTable("nft_collection", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 256 }).notNull(),
	description: text("description").notNull(),
});

export const nft_attributes = pgTable("nft_attributes", {
	nft_id: integer("nft_id").notNull().references(() => nfts.id),
	attribute_id: integer("attribute_id").notNull().references(() => attributes.id),
},
(table) => {
	return {
		nft_attributes_nft_id_attribute_id_pk: primaryKey({ columns: [table.nft_id, table.attribute_id], name: "nft_attributes_nft_id_attribute_id_pk"}),
	}
});