CREATE TABLE IF NOT EXISTS "screen_group_screens" (
	"screen_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	CONSTRAINT "screen_group_screens_screen_id_group_id_pk" PRIMARY KEY("screen_id","group_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "screen_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "group_id" uuid;--> statement-breakpoint
ALTER TABLE "schedules" ADD COLUMN "priority" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN "idle_content_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "screen_group_screens" ADD CONSTRAINT "screen_group_screens_screen_id_screens_id_fk" FOREIGN KEY ("screen_id") REFERENCES "public"."screens"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "screen_group_screens" ADD CONSTRAINT "screen_group_screens_group_id_screen_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."screen_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "screen_groups" ADD CONSTRAINT "screen_groups_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "schedules" ADD CONSTRAINT "schedules_group_id_screen_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."screen_groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "screens" ADD CONSTRAINT "screens_idle_content_id_content_items_id_fk" FOREIGN KEY ("idle_content_id") REFERENCES "public"."content_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
