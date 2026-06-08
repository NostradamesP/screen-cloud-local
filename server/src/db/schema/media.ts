import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: integer("size").notNull(),
  url: varchar("url", { length: 1000 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
