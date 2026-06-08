import { pgTable, uuid, varchar, integer, timestamp, boolean, date, time, jsonb } from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { playlists } from "./playlists";
import { screens } from "./screens";
import { screenGroups } from "./screenGroups";

export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  playlistId: uuid("playlist_id")
    .references(() => playlists.id, { onDelete: "cascade" })
    .notNull(),
  screenId: uuid("screen_id")
    .references(() => screens.id, { onDelete: "cascade" }),
  groupId: uuid("group_id")
    .references(() => screenGroups.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  startDate: date("start_date"),
  endDate: date("end_date"),
  timeStart: time("time_start"),
  timeEnd: time("time_end"),
  daysOfWeek: integer("days_of_week").array(),
  active: boolean("active").default(true),
  priority: integer("priority").default(0),
  settings: jsonb("settings").$type<{
    loopPlaylist?: boolean;
  }>().default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
