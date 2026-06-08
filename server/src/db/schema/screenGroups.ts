import { pgTable, uuid, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { screens } from "./screens";

export const screenGroups = pgTable("screen_groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const screenGroupScreens = pgTable("screen_group_screens", {
  screenId: uuid("screen_id")
    .references(() => screens.id, { onDelete: "cascade" })
    .notNull(),
  groupId: uuid("group_id")
    .references(() => screenGroups.id, { onDelete: "cascade" })
    .notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.screenId, table.groupId] }),
}));
