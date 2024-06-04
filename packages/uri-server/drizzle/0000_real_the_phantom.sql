-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

DO $$ BEGIN
 CREATE TYPE "public"."attributeTypes" AS ENUM('Left Hand', 'Right Hand', 'Head', 'Mouth', 'Eyes', 'Top', 'Bottom', 'Skin', 'Shadow', 'Background');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"attribute_type" "attributeTypes" NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nfts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text NOT NULL,
	"image" text NOT NULL,
	CONSTRAINT "nfts_name_unique" UNIQUE("name"),
	CONSTRAINT "nfts_description_unique" UNIQUE("description"),
	CONSTRAINT "nfts_image_unique" UNIQUE("image")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "nft_attributes" (
	"nft_id" integer NOT NULL,
	"attribute_id" integer NOT NULL,
	CONSTRAINT "nft_attributes_nft_id_attribute_id_pk" PRIMARY KEY("nft_id","attribute_id")
);
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

