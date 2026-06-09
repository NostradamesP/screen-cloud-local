ALTER TABLE "screens" ADD COLUMN IF NOT EXISTS "playback_state" varchar(50) DEFAULT 'offline';--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN IF NOT EXISTS "current_content_id" uuid;--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN IF NOT EXISTS "current_content_title" varchar(255);--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN IF NOT EXISTS "current_schedule_id" uuid;--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN IF NOT EXISTS "current_playlist_id" uuid;--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN IF NOT EXISTS "playback_message" varchar(500);--> statement-breakpoint
ALTER TABLE "screens" ADD COLUMN IF NOT EXISTS "playback_updated_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "screens" ADD CONSTRAINT "screens_current_content_id_content_items_id_fk" FOREIGN KEY ("current_content_id") REFERENCES "public"."content_items"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
