import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { layouts, layoutZones } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const createLayoutSchema = z.object({
  name: z.string().min(1).max(255),
  resolution: z.string().default("1920x1080"),
  orientation: z.enum(["landscape", "portrait"]).default("landscape"),
});

const createZoneSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.string().default("content"),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  width: z.number().int().min(1),
  height: z.number().int().min(1),
  playlistId: z.string().uuid().optional(),
  contentItemId: z.string().uuid().optional(),
  settings: z.record(z.unknown()).optional(),
});

export async function layoutRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/layouts", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const all = await db.select().from(layouts).where(eq(layouts.organizationId, orgId)).orderBy(layouts.name);
    const result = [];
    for (const layout of all) {
      const zones = await db.select().from(layoutZones).where(eq(layoutZones.layoutId, layout.id)).orderBy(layoutZones.name);
      result.push({ ...layout, zones });
    }
    return result;
  });

  fastify.get("/api/layouts/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [layout] = await db.select().from(layouts).where(and(eq(layouts.id, id), eq(layouts.organizationId, orgId)));
    if (!layout) return reply.status(404).send({ error: "Layout not found" });
    const zones = await db.select().from(layoutZones).where(eq(layoutZones.layoutId, id)).orderBy(layoutZones.name);
    return { ...layout, zones };
  });

  fastify.post("/api/layouts", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createLayoutSchema.parse(request.body);
    const { orgId } = request.user;
    const [layout] = await db.insert(layouts).values({
      organizationId: orgId,
      name: body.name,
      resolution: body.resolution,
      orientation: body.orientation,
    }).returning();
    return reply.status(201).send(layout);
  });

  fastify.put("/api/layouts/:id", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createLayoutSchema.partial().parse(request.body);
    const [updated] = await db.update(layouts)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(layouts.id, id), eq(layouts.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Layout not found" });
    return updated;
  });

  fastify.delete("/api/layouts/:id", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(layouts)
      .where(and(eq(layouts.id, id), eq(layouts.organizationId, orgId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Layout not found" });
    return reply.status(204).send();
  });

  fastify.post("/api/layouts/:id/zones", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [layout] = await db.select().from(layouts).where(and(eq(layouts.id, id), eq(layouts.organizationId, orgId)));
    if (!layout) return reply.status(404).send({ error: "Layout not found" });
    const body = createZoneSchema.parse(request.body);
    const [zone] = await db.insert(layoutZones).values({
      layoutId: id,
      name: body.name,
      type: body.type,
      x: body.x,
      y: body.y,
      width: body.width,
      height: body.height,
      playlistId: body.playlistId ?? null,
      contentItemId: body.contentItemId ?? null,
      settings: body.settings as Record<string, unknown> ?? {},
    }).returning();
    return reply.status(201).send(zone);
  });

  fastify.put("/api/layouts/:layoutId/zones/:zoneId", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { layoutId, zoneId } = request.params as { layoutId: string; zoneId: string };
    const { orgId } = request.user;
    const [layout] = await db.select().from(layouts).where(and(eq(layouts.id, layoutId), eq(layouts.organizationId, orgId)));
    if (!layout) return reply.status(404).send({ error: "Layout not found" });
    const body = createZoneSchema.partial().parse(request.body);
    const [updated] = await db.update(layoutZones)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(layoutZones.id, zoneId), eq(layoutZones.layoutId, layoutId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Zone not found" });
    return updated;
  });

  fastify.delete("/api/layouts/:layoutId/zones/:zoneId", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { layoutId, zoneId } = request.params as { layoutId: string; zoneId: string };
    const [deleted] = await db.delete(layoutZones)
      .where(and(eq(layoutZones.id, zoneId), eq(layoutZones.layoutId, layoutId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Zone not found" });
    return reply.status(204).send();
  });
}
