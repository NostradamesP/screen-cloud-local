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

const PLAYER_VERSION = "1.6.0";

function templateForPurpose(purpose?: string | null) {
  switch (purpose) {
    case "manufacturing_logistics":
    case "production":
      return "media_right";
    case "office_communications":
    case "office":
    case "meeting_room":
    case "lobby":
      return "center_stage";
    case "cafeteria_restaurant":
    case "menu_board":
      return "media_left";
    case "retail_promotions":
      return "hero_overlay";
    case "healthcare":
    case "public_information":
    case "public_info":
      return "media_right";
    case "events":
      return "hero_overlay";
    case "other":
      return "media_left";
    default:
      return "full_bleed";
  }
}

function playerScreenPayload(screen: any) {
  let settings = (screen.settings ?? {}) as Record<string, unknown> | string;
  if (typeof settings === "string") {
    try {
      settings = JSON.parse(settings) as Record<string, unknown>;
    } catch {
      settings = {};
    }
  }
  return {
    id: screen.id,
    name: screen.name,
    purpose: screen.purpose,
    template: typeof settings.template === "string" ? settings.template : templateForPurpose(screen.purpose),
    templateText: {
      badge: typeof settings.templateBadge === "string" ? settings.templateBadge : "",
      headline: typeof settings.templateHeadline === "string" ? settings.templateHeadline : "",
      subtitle: typeof settings.templateSubtitle === "string" ? settings.templateSubtitle : "",
      qrText: typeof settings.templateQrText === "string" ? settings.templateQrText : "",
      weatherLocation: typeof settings.templateWeatherLocation === "string" ? settings.templateWeatherLocation : "",
      temperature: typeof settings.templateTemperature === "string" ? settings.templateTemperature : "",
      ticker: typeof settings.templateTicker === "string" ? settings.templateTicker : "",
      logoText: typeof settings.templateLogoText === "string" ? settings.templateLogoText : "",
    },
    templateStyle: {
      primaryColor: typeof settings.templatePrimaryColor === "string" ? settings.templatePrimaryColor : null,
      bgColor: typeof settings.templateBgColor === "string" ? settings.templateBgColor : null,
      textColor: typeof settings.templateTextColor === "string" ? settings.templateTextColor : null,
      tickerBg: typeof settings.templateTickerBg === "string" ? settings.templateTickerBg : null,
      tickerText: typeof settings.templateTickerText === "string" ? settings.templateTickerText : null,
      widgetBg: typeof settings.templateWidgetBg === "string" ? settings.templateWidgetBg : null,
      accentColor: typeof settings.templateAccentColor === "string" ? settings.templateAccentColor : null,
      fontFamily: typeof settings.templateFontFamily === "string" ? settings.templateFontFamily : null,
      fontSizeScale: typeof settings.templateFontSizeScale === "string" ? settings.templateFontSizeScale : null,
      cornerRadius: typeof settings.templateCornerRadius === "string" ? settings.templateCornerRadius : null,
      tickerSpeed: typeof settings.templateTickerSpeed === "string" ? settings.templateTickerSpeed : null,
      transition: typeof settings.templateTransition === "string" ? settings.templateTransition : null,
      mediaFit: typeof settings.templateMediaFit === "string" ? settings.templateMediaFit : null,
      showWeather: typeof settings.templateShowWeather === "string" ? settings.templateShowWeather : null,
      showTicker: typeof settings.templateShowTicker === "string" ? settings.templateShowTicker : null,
      customCSS: typeof settings.templateCustomCSS === "string" ? settings.templateCustomCSS : null,
      qrUrl: typeof settings.templateQrUrl === "string" ? settings.templateQrUrl : null,
      logoUrl: typeof settings.templateLogoUrl === "string" ? settings.templateLogoUrl : null,
      gradientColor1: typeof settings.templateGradientColor1 === "string" ? settings.templateGradientColor1 : null,
      gradientColor2: typeof settings.templateGradientColor2 === "string" ? settings.templateGradientColor2 : null,
      gradientDirection: typeof settings.templateGradientDirection === "string" ? settings.templateGradientDirection : null,
    },
  };
}

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
        const [idleContent] = await db.select().from(contentItems).where(
          and(eq(contentItems.id, screen.idleContentId), eq(contentItems.organizationId, screen.organizationId))
        );
        return {
          screen: playerScreenPayload(screen),
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
        screen: playerScreenPayload(screen),
        schedule: null,
        playlist: null,
        items: [],
        message: "No active schedule for this screen",
      };
    }

    const playlist = await db.select().from(playlists)
      .where(and(eq(playlists.id, matchedSchedule.playlistId), eq(playlists.organizationId, screen.organizationId)))
      .then((r) => r[0]);

    const items = await db.select({
      item: playlistItems,
      content: contentItems,
    })
      .from(playlistItems)
      .leftJoin(contentItems, and(eq(playlistItems.contentItemId, contentItems.id), eq(contentItems.organizationId, screen.organizationId)))
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
      screen: playerScreenPayload(screen),
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

  fastify.post("/api/player/sync", {
    preHandler: [fastify.authenticate],
  }, async () => {
    await cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return { ok: true, message: "Sync triggered: cache flushed and all screens notified" };
  });

  fastify.post("/api/player/clear-cache", {
    preHandler: [fastify.authenticate],
  }, async () => {
    await cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "hard_reset" });
    return { ok: true, message: "Hard reset sent: screens will clear all caches and reload" };
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
      const connectionStatus = isOnline ? "online" : "offline";
      const playbackState = isOnline ? (screen.playbackState || "empty") : "offline";
      let idleContent = null;
      if (screen.idleContentId) {
        const [content] = await db.select().from(contentItems).where(eq(contentItems.id, screen.idleContentId));
        if (content) {
          idleContent = { id: content.id, title: content.title, type: content.type };
        }
      }
      result.push({
        screenId: screen.id,
        screenName: screen.name,
        location: screen.location,
        purpose: screen.purpose,
        status: connectionStatus,
        connectionStatus,
        playbackState,
        playbackMessage: isOnline ? screen.playbackMessage : "Sin conexión reciente.",
        playbackUpdatedAt: screen.playbackUpdatedAt,
        currentContent: screen.currentContentId || screen.currentContentTitle ? {
          id: screen.currentContentId,
          title: screen.currentContentTitle,
        } : null,
        activeSchedule: schedule ? {
          id: schedule.id,
          name: schedule.name,
          playlistId: schedule.playlistId,
        } : null,
        idleContent,
      });
    }
    return result;
  });
}
