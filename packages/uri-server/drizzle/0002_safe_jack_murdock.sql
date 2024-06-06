DO $$ BEGIN
 CREATE TYPE "public"."attributeTypes" AS ENUM('Left Hand', 'Right Hand', 'Head', 'Mouth', 'Eyes', 'Top', 'Bottom', 'Skin', 'Shadow', 'Background');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "nfts" ALTER COLUMN "collection_id" SET NOT NULL;