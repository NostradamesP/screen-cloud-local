import { pgTable, uuid, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { contentItems } from "./content";

export const screens = pgTable("screens", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  resolution: varchar("resolution", { length: 50 }).default("1920x1080"),
  orientation: varchar("orientation", { length: 20 }).default("landscape"),
  status: varchar("status", { length: 50 }).default("offline"),
  lastHeartbeat: timestamp("last_heartbeat"),
  pairCode: varchar("pair_code", { length: 10 }).unique(),
  idleContentId: uuid("idle_content_id")
    .references(() => contentItems.id, { onDelete: "set null" }),
  settings: jsonb("settings").$type<{
    brightness?: number;
    volume?: number;
    rebootTime?: string;
    timezone?: string;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
