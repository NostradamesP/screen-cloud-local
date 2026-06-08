import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  settings: jsonb("settings").$type<{
    timezone?: string;
    dateFormat?: string;
    branding?: {
      logoUrl?: string;
      primaryColor?: string;
    };
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
