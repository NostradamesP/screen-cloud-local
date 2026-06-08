import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { screens, SCREEN_PURPOSES } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { cacheDel } from "../../lib/cache";

const screenPurposes = SCREEN_PURPOSES as readonly string[];

const createScreenSchema = z.object({
  name: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
  resolution: z.string().default("1920x1080"),
  orientation: z.enum(["landscape", "portrait"]).default("landscape"),
  purpose: z.enum(screenPurposes as [string, ...string[]]).default("other"),
  idleContentId: z.string().uuid().optional(),
});

const heartbeatSchema = z.object({
  screenId: z.string(),
});

const pairSchema = z.object({
  code: z.string().length(6),
  name: z.string().max(255).optional(),
});

function generatePairCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function screenRoutes(fastify: FastifyInstance) {
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
    const pairCode = generatePairCode();
    const [screen] = await db.insert(screens).values({
      organizationId: orgId,
      name: body.name,
      location: body.location ?? null,
      resolution: body.resolution,
      orientation: body.orientation,
      purpose: body.purpose,
      idleContentId: body.idleContentId ?? null,
      pairCode,
      status: "offline",
    }).returning();
    return reply.status(201).send(screen);
  });

  fastify.put("/api/screens/:id", {
    preHandler: [fastify.authenticate, fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createScreenSchema.partial().parse(request.body);
    const [updated] = await db.update(screens)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(screens.id, id), eq(screens.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Screen not found" });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
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
    return reply.status(204).send();
  });

  fastify.post("/api/screens/pair", async (request: FastifyRequest, reply: FastifyReply) => {
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
        pairCode: null,
      })
      .where(eq(screens.id, screen.id))
      .returning();
    return updated;
  });

  fastify.post("/api/screens/heartbeat", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = heartbeatSchema.parse(request.body);
    const [updated] = await db.update(screens)
      .set({ status: "online", lastHeartbeat: new Date() })
      .where(eq(screens.id, body.screenId))
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
    }).returning();
    return { screenId: screen.id, pairCode: code };
  });
}
