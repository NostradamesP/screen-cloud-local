import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { contentItems } from "./content";

export const playlists = pgTable("playlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const playlistItems = pgTable("playlist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  playlistId: uuid("playlist_id")
    .references(() => playlists.id, { onDelete: "cascade" })
    .notNull(),
  contentItemId: uuid("content_item_id")
    .references(() => contentItems.id, { onDelete: "cascade" })
    .notNull(),
  position: integer("position").notNull(),
  durationOverride: integer("duration_override"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
