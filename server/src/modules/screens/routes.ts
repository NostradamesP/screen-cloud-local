import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { contentItems, screens, SCREEN_PURPOSES } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { cacheDel } from "../../lib/cache";
import { randomBytes } from "crypto";

const screenPurposes = SCREEN_PURPOSES as readonly string[];

const createScreenSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
  resolution: z.string().default("1920x1080"),
  orientation: z.enum(["landscape", "portrait"]).default("landscape"),
  purpose: z.enum(screenPurposes as [string, ...string[]]).default("other"),
  idleContentId: z.string().uuid().optional(),
  settings: z.record(z.unknown()).optional(),
});

const heartbeatSchema = z.object({
  screenId: z.string(),
  playbackState: z.enum(["offline", "empty", "playing_idle", "playing_schedule", "error"]).optional(),
  currentContentId: z.string().uuid().nullable().optional(),
  currentContentTitle: z.string().max(255).nullable().optional(),
  currentScheduleId: z.string().uuid().nullable().optional(),
  currentPlaylistId: z.string().uuid().nullable().optional(),
  playbackMessage: z.string().max(500).nullable().optional(),
});

const pairSchema = z.object({
  code: z.string().length(6),
  name: z.string().max(255).optional(),
});

function generatePairCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[bytes[i] % chars.length];
  return code;
}

function generateScreenToken(screenId: string, orgId: string, fastify: FastifyInstance): string {
  return fastify.signScreenToken(screenId, orgId);
}

function normalizeSettings(settings: unknown): Record<string, unknown> {
  if (!settings) return {};
  if (typeof settings === "string") {
    try {
      const parsed = JSON.parse(settings);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
      return {};
    }
  }
  return typeof settings === "object" && !Array.isArray(settings) ? settings as Record<string, unknown> : {};
}

export async function screenRoutes(fastify: FastifyInstance) {
  async function validateIdleContent(orgId: string, idleContentId: string | undefined, reply: FastifyReply) {
    if (!idleContentId) return true;
    const [content] = await db.select({ id: contentItems.id }).from(contentItems).where(
      and(eq(contentItems.id, idleContentId), eq(contentItems.organizationId, orgId))
    );
    if (!content) {
      reply.status(404).send({ error: "Idle content not found" });
      return false;
    }
    return true;
  }

  fastify.get("/api/screens", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest) => {
    const { orgId } = request.user;
    return db.select().from(screens).where(eq(screens.organizationId, orgId));
  });

  fastify.get("/api/screens/:id", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [screen] = await db.select().from(screens).where(
      and(eq(screens.id, id), eq(screens.organizationId, orgId))
    );
    if (!screen) return reply.status(404).send({ error: "Screen not found" });
    return screen;
  });

  fastify.post("/api/screens", {
    preHandler: [fastify.authenticate, fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createScreenSchema.parse(request.body);
    const { orgId } = request.user;
    if (!(await validateIdleContent(orgId, body.idleContentId, reply))) return;
    const pairCode = generatePairCode();
    const [screen] = await db.insert(screens).values({
      organizationId: orgId,
      name: body.name,
      location: body.location ?? null,
      resolution: body.resolution,
      orientation: body.orientation,
      purpose: body.purpose,
      idleContentId: body.idleContentId ?? null,
      settings: normalizeSettings(body.settings),
      pairCode,
      status: "offline",
      playbackState: "offline",
    }).returning();
    return reply.status(201).send(screen);
  });

  fastify.put("/api/screens/:id", {
    preHandler: [fastify.authenticate, fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createScreenSchema.partial().parse(request.body);
    if (!(await validateIdleContent(orgId, body.idleContentId, reply))) return;
    const updateData = {
      ...body,
      ...(body.settings ? { settings: normalizeSettings(body.settings) } : {}),
      updatedAt: new Date(),
    };
    const [updated] = await db.update(screens)
      .set(updateData)
      .where(and(eq(screens.id, id), eq(screens.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Screen not found" });
    await cacheDel("player:*");
    const s = normalizeSettings(updated.settings);
    fastify.wsNotifier.notifyAllScreens({
      type: "purpose_update",
      screenId: id,
      purpose: updated.purpose,
      template: s.template,
      templateText: {
        badge: s.templateBadge,
        headline: s.templateHeadline,
        subtitle: s.templateSubtitle,
        qrText: s.templateQrText,
        weatherLocation: s.templateWeatherLocation,
        temperature: s.templateTemperature,
        ticker: s.templateTicker,
        logoText: s.templateLogoText,
      },
      templateStyle: {
        primaryColor: s.templatePrimaryColor || null,
        bgColor: s.templateBgColor || null,
        textColor: s.templateTextColor || null,
        tickerBg: s.templateTickerBg || null,
        tickerText: s.templateTickerText || null,
        widgetBg: s.templateWidgetBg || null,
        accentColor: s.templateAccentColor || null,
        fontFamily: s.templateFontFamily || null,
        fontSizeScale: s.templateFontSizeScale || null,
        cornerRadius: s.templateCornerRadius || null,
        tickerSpeed: s.templateTickerSpeed || null,
        transition: s.templateTransition || null,
        mediaFit: s.templateMediaFit || null,
        showWeather: s.templateShowWeather || null,
        showTicker: s.templateShowTicker || null,
        customCSS: s.templateCustomCSS || null,
        qrUrl: s.templateQrUrl || null,
        logoUrl: s.templateLogoUrl || null,
        gradientColor1: s.templateGradientColor1 || null,
        gradientColor2: s.templateGradientColor2 || null,
        gradientDirection: s.templateGradientDirection || null,
      },
    });
    return updated;
  });

  fastify.delete("/api/screens/:id", {
    preHandler: [fastify.authenticate, fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(screens)
      .where(and(eq(screens.id, id), eq(screens.organizationId, orgId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Screen not found" });
    fastify.wsNotifier.notifyScreen(id, { type: "screen_deleted" });
    await cacheDel("player:*");
    return reply.status(204).send();
  });

  fastify.post("/api/screens/pair", {
    config: {
      rateLimit: { max: 10, timeWindow: "1 minute" },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = pairSchema.parse(request.body);
    const [screen] = await db.select().from(screens).where(
      and(eq(screens.pairCode, body.code), eq(screens.status, "offline"))
    );
    if (!screen) return reply.status(404).send({ error: "Invalid or already paired code" });
    const [updated] = await db.update(screens)
      .set({
        name: body.name ? `${screen.name} (${body.name})` : screen.name,
        status: "online",
        lastHeartbeat: new Date(),
        playbackState: "empty",
        playbackMessage: "Pantalla vinculada. Esperando contenido.",
        playbackUpdatedAt: new Date(),
        pairCode: null,
      })
      .where(eq(screens.id, screen.id))
      .returning();
    const screenToken = generateScreenToken(updated.id, updated.organizationId, fastify);
    return { ...updated, screenToken };
  });

  fastify.post("/api/screens/heartbeat", {
    preHandler: [fastify.authenticateScreen],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = heartbeatSchema.parse(request.body);
    const screenAuth = await fastify.authenticateScreen(request, reply);
    if (!screenAuth) return;
    if (body.screenId !== screenAuth.screenId) {
      return reply.status(403).send({ error: "Screen token does not match" });
    }
    const hasPlayback = typeof body.playbackState === "string";
    const [updated] = await db.update(screens)
      .set({
        status: "online",
        lastHeartbeat: new Date(),
        ...(hasPlayback ? {
          playbackState: body.playbackState,
          currentContentId: body.currentContentId ?? null,
          currentContentTitle: body.currentContentTitle ?? null,
          currentScheduleId: body.currentScheduleId ?? null,
          currentPlaylistId: body.currentPlaylistId ?? null,
          playbackMessage: body.playbackMessage ?? null,
          playbackUpdatedAt: new Date(),
        } : {}),
      })
      .where(and(eq(screens.id, body.screenId), eq(screens.organizationId, screenAuth.orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Screen not found" });
    return { ok: true };
  });

  fastify.get("/api/screens/pair-code", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId } = request.user;
    const code = generatePairCode();
    const [screen] = await db.insert(screens).values({
      organizationId: orgId,
      name: "Unnamed Screen",
      pairCode: code,
      status: "offline",
      playbackState: "offline",
    }).returning();
    return { screenId: screen.id, pairCode: code };
  });
}
