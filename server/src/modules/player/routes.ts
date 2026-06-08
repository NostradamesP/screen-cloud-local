import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db";
import { screens, schedules, playlists, playlistItems, contentItems, screenGroupScreens } from "../../db/schema";
import { eq, and, or, isNull, inArray, desc } from "drizzle-orm";
import { cacheGet, cacheSet, cacheDel } from "../../lib/cache";

async function resolveActiveSchedule(screenId: string) {
  const screen = await db.select().from(screens).where(eq(screens.id, screenId)).then(r => r[0]);
  if (!screen) return null;

  const now = new Date();
  const dayOfWeek = now.getDay();
  const timeStr = now.toTimeString().substring(0, 5);

  const groupIds = await db.select({ groupId: screenGroupScreens.groupId })
    .from(screenGroupScreens)
    .where(eq(screenGroupScreens.screenId, screenId));

  const groupIdList = groupIds.map(g => g.groupId);

  const allSchedules = await db.select().from(schedules).where(
    and(
      eq(schedules.active, true),
      eq(schedules.organizationId, screen.organizationId),
      or(
        eq(schedules.screenId, screenId),
        isNull(schedules.screenId),
        groupIdList.length > 0 ? inArray(schedules.groupId, groupIdList) : undefined,
      ),
    )
  ).orderBy(desc(schedules.priority));

  let matchedSchedule = null;
  for (const schedule of allSchedules) {
    if (schedule.daysOfWeek && !schedule.daysOfWeek.includes(dayOfWeek)) continue;
    if (schedule.startDate && now < new Date(schedule.startDate)) continue;
    if (schedule.endDate && now > new Date(schedule.endDate + "T23:59:59")) continue;
    if (schedule.timeStart && timeStr < schedule.timeStart) continue;
    if (schedule.timeEnd && timeStr > schedule.timeEnd) continue;
    matchedSchedule = schedule;
    break;
  }

  return matchedSchedule;
}

const PLAYER_VERSION = "1.0.0";

export async function playerRoutes(fastify: FastifyInstance) {
  fastify.get("/api/player/version", async () => ({ version: PLAYER_VERSION }));
  fastify.get("/api/player/:screenId", async (request: FastifyRequest, reply: FastifyReply) => {
    const { screenId } = request.params as { screenId: string };

    const cacheKey = `player:${screenId}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;

    const [screen] = await db.select().from(screens).where(eq(screens.id, screenId));
    if (!screen) return reply.status(404).send({ error: "Screen not found" });

    const matchedSchedule = await resolveActiveSchedule(screenId);

    if (!matchedSchedule) {
      if (screen.idleContentId) {
        const [idleContent] = await db.select().from(contentItems).where(eq(contentItems.id, screen.idleContentId));
        return {
          screen: { id: screen.id, name: screen.name },
          schedule: null,
          playlist: null,
          items: idleContent ? [{
            id: idleContent.id,
            position: 0,
            duration: idleContent.duration ?? 10,
            content: {
              id: idleContent.id,
              type: idleContent.type,
              title: idleContent.title,
              url: idleContent.url,
              filePath: idleContent.filePath,
              settings: idleContent.settings,
            },
          }] : [],
          message: idleContent ? "Showing idle content" : "No active schedule for this screen",
        };
      }
      return {
        screen: { id: screen.id, name: screen.name },
        schedule: null,
        playlist: null,
        items: [],
        message: "No active schedule for this screen",
      };
    }

    const playlist = await db.select().from(playlists)
      .where(eq(playlists.id, matchedSchedule.playlistId))
      .then((r) => r[0]);

    const items = await db.select({
      item: playlistItems,
      content: contentItems,
    })
      .from(playlistItems)
      .leftJoin(contentItems, eq(playlistItems.contentItemId, contentItems.id))
      .where(eq(playlistItems.playlistId, matchedSchedule.playlistId))
      .orderBy(playlistItems.position);

    const formattedItems = items.map(({ item, content }) => ({
      id: item.id,
      position: item.position,
      duration: item.durationOverride ?? content?.duration ?? 10,
      content: content ? {
        id: content.id,
        type: content.type,
        title: content.title,
        url: content.url,
        filePath: content.filePath,
        settings: content.settings,
      } : null,
    }));

    const response = {
      screen: { id: screen.id, name: screen.name },
      schedule: matchedSchedule,
      playlist,
      items: formattedItems,
    };
    cacheSet(cacheKey, response, 15);
    return response;
  });

  fastify.post("/api/player/cache-flush", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest) => {
    const { screenId } = request.body as { screenId?: string };
    if (screenId) {
      await cacheDel(`player:${screenId}`);
    } else {
      await cacheDel("player:*");
    }
    return { ok: true };
  });

  fastify.get("/api/scheduler/now", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const orgScreens = await db.select().from(screens).where(eq(screens.organizationId, orgId));
    const result = [];
    for (const screen of orgScreens) {
      const schedule = await resolveActiveSchedule(screen.id);
      const isOnline = screen.lastHeartbeat
        ? (Date.now() - new Date(screen.lastHeartbeat).getTime()) < 60000
        : false;
      result.push({
        screenId: screen.id,
        screenName: screen.name,
        location: screen.location,
        status: isOnline ? "online" : "offline",
        activeSchedule: schedule ? {
          id: schedule.id,
          name: schedule.name,
          playlistId: schedule.playlistId,
        } : null,
      });
    }
    return result;
  });
}