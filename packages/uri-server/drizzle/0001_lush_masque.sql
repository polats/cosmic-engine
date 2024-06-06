CREATE TABLE IF NOT EXISTS "nft_collection" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attributes" ALTER COLUMN "attribute_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "nfts" ADD COLUMN "collection_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_collection_id_nft_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."nft_collection"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
