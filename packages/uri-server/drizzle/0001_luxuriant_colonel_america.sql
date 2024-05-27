CREATE TABLE IF NOT EXISTS "nft_attributes" (
	"nft_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	CONSTRAINT "nft_attributes_nft_id_attribute_id_pk" PRIMARY KEY("nft_id","attribute_id")
);
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_left_hand_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_right_hand_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_head_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_mouth_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_eyes_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_top_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_bottom_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_skin_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_shadow_attributes_id_fk";
--> statement-breakpoint
ALTER TABLE "nfts" DROP CONSTRAINT "nfts_attribute_background_attributes_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nft_attributes" ADD CONSTRAINT "nft_attributes_nft_id_nfts_id_fk" FOREIGN KEY ("nft_id") REFERENCES "public"."nfts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nft_attributes" ADD CONSTRAINT "nft_attributes_attribute_id_attributes_id_fk" FOREIGN KEY ("attribute_id") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_left_hand";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_right_hand";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_head";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_mouth";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_eyes";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_top";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_bottom";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_skin";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_shadow";--> statement-breakpoint
ALTER TABLE "nfts" DROP COLUMN IF EXISTS "attribute_background";