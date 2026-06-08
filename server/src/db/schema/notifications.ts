import { pgTable, uuid, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: varchar("message", { length: 500 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull().default("info"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
