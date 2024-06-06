import { relations } from "drizzle-orm/relations";
import { nft_collection, nfts, nft_attributes, attributes } from "./schema";

export const nftsRelations = relations(nfts, ({one, many}) => ({
	nft_collection: one(nft_collection, {
		fields: [nfts.collection_id],
		references: [nft_collection.id]
	}),
	nft_attributes: many(nft_attributes),
}));

export const nft_collectionRelations = relations(nft_collection, ({many}) => ({
	nfts: many(nfts),
}));

export const nft_attributesRelations = relations(nft_attributes, ({one}) => ({
	nft: one(nfts, {
		fields: [nft_attributes.nft_id],
		references: [nfts.id]
	}),
	attribute: one(attributes, {
		fields: [nft_attributes.attribute_id],
		references: [attributes.id]
	}),
}));

export const attributesRelations = relations(attributes, ({many}) => ({
	nft_attributes: many(nft_attributes),
}));