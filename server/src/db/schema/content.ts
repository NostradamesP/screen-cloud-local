import { pgTable, uuid, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const contentItems = pgTable("content_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  url: varchar("url", { length: 1000 }),
  filePath: varchar("file_path", { length: 500 }),
  mimeType: varchar("mime_type", { length: 100 }),
  duration: integer("duration").default(10),
  status: varchar("status", { length: 20 }).default("published"),
  expiresAt: timestamp("expires_at"),
  settings: jsonb("settings").$type<{
    scaleMode?: "fit" | "fill" | "stretch";
    backgroundColor?: string;
    transition?: "fade" | "slide" | "none";
    autoRefresh?: number;
    showControls?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
