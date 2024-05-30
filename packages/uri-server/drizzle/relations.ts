import { relations } from "drizzle-orm/relations";
import { nfts, nft_attributes, attributes } from "./schema";

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

export const nftsRelations = relations(nfts, ({many}) => ({
	nft_attributes: many(nft_attributes),
}));

export const attributesRelations = relations(attributes, ({many}) => ({
	nft_attributes: many(nft_attributes),
}));