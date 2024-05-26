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
	"attribute_left_hand" integer,
	"attribute_right_hand" integer,
	"attribute_head" integer,
	"attribute_mouth" integer,
	"attribute_eyes" integer,
	"attribute_top" integer,
	"attribute_bottom" integer,
	"attribute_skin" integer,
	"attribute_shadow" integer,
	"attribute_background" integer,
	CONSTRAINT "nfts_name_unique" UNIQUE("name"),
	CONSTRAINT "nfts_description_unique" UNIQUE("description"),
	CONSTRAINT "nfts_image_unique" UNIQUE("image")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_left_hand_attributes_id_fk" FOREIGN KEY ("attribute_left_hand") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_right_hand_attributes_id_fk" FOREIGN KEY ("attribute_right_hand") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_head_attributes_id_fk" FOREIGN KEY ("attribute_head") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_mouth_attributes_id_fk" FOREIGN KEY ("attribute_mouth") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_eyes_attributes_id_fk" FOREIGN KEY ("attribute_eyes") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_top_attributes_id_fk" FOREIGN KEY ("attribute_top") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_bottom_attributes_id_fk" FOREIGN KEY ("attribute_bottom") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_skin_attributes_id_fk" FOREIGN KEY ("attribute_skin") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_shadow_attributes_id_fk" FOREIGN KEY ("attribute_shadow") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "nfts" ADD CONSTRAINT "nfts_attribute_background_attributes_id_fk" FOREIGN KEY ("attribute_background") REFERENCES "public"."attributes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
