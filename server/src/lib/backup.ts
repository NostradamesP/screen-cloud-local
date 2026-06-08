import { db } from "../db";
import { contentItems, playlists, playlistItems, schedules, screens, screenGroups, screenGroupScreens } from "../db/schema";
import { eq } from "drizzle-orm";

export async function exportOrg(orgId: string) {
  const [content, playlistList, scheduleList, screenList, groupList] = await Promise.all([
    db.select().from(contentItems).where(eq(contentItems.organizationId, orgId)),
    db.select().from(playlists).where(eq(playlists.organizationId, orgId)),
    db.select().from(schedules).where(eq(schedules.organizationId, orgId)),
    db.select().from(screens).where(eq(screens.organizationId, orgId)),
    db.select().from(screenGroups).where(eq(screenGroups.organizationId, orgId)),
  ]);

  const groupsWithScreens = await Promise.all(groupList.map(async (g) => {
    const members = await db.select().from(screenGroupScreens).where(eq(screenGroupScreens.groupId, g.id));
    return { ...g, screenIds: members.map(m => m.screenId) };
  }));

  const playlistItemsMap: Record<string, any[]> = {};
  for (const pl of playlistList) {
    playlistItemsMap[pl.id] = await db.select().from(playlistItems).where(eq(playlistItems.playlistId, pl.id));
  }

  return { content, playlists: playlistList, playlistItems: playlistItemsMap, schedules: scheduleList, screens: screenList, groups: groupsWithScreens };
}
