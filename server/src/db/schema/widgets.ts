import { pgTable, uuid, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const widgetDefinitions = pgTable("widget_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 500 }),
  defaultConfig: jsonb("default_config").$type<Record<string, unknown>>().default({}),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const widgets = pgTable("widgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  widgetDefinitionId: uuid("widget_definition_id")
    .references(() => widgetDefinitions.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  config: jsonb("config").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
