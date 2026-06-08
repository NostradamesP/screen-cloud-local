import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { screens } from "./screens";
import { contentItems } from "./content";

export const proofOfPlay = pgTable("proof_of_play", {
  id: uuid("id").defaultRandom().primaryKey(),
  screenId: uuid("screen_id")
    .references(() => screens.id, { onDelete: "cascade" })
    .notNull(),
  contentItemId: uuid("content_item_id")
    .references(() => contentItems.id, { onDelete: "cascade" }),
  playlistId: uuid("playlist_id"),
  scheduleId: uuid("schedule_id"),
  playedAt: timestamp("played_at").defaultNow().notNull(),
  duration: integer("duration"),
});
