import { pgTable, uuid, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { playlists } from "./playlists";
import { contentItems } from "./content";

export const layouts = pgTable("layouts", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  resolution: varchar("resolution", { length: 50 }).default("1920x1080"),
  orientation: varchar("orientation", { length: 20 }).default("landscape"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const layoutZones = pgTable("layout_zones", {
  id: uuid("id").defaultRandom().primaryKey(),
  layoutId: uuid("layout_id")
    .references(() => layouts.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().default("content"),
  x: integer("x").notNull().default(0),
  y: integer("y").notNull().default(0),
  width: integer("width").notNull().default(100),
  height: integer("height").notNull().default(100),
  playlistId: uuid("playlist_id").references(() => playlists.id, { onDelete: "set null" }),
  contentItemId: uuid("content_item_id").references(() => contentItems.id, { onDelete: "set null" }),
  settings: jsonb("settings").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
