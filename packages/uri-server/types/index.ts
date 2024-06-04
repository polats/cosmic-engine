import { nfts, attributes, nft_attributes, nft_collection } from '@/drizzle/schema';

export type NewAttribute = typeof attributes.$inferInsert;
export type NewNft = typeof nfts.$inferInsert;
export type NewNftAttribute = typeof nft_attributes.$inferInsert;
export type NewNftCollection = typeof nft_collection.$inferInsert;