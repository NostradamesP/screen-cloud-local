import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { widgetDefinitions, widgets } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const createWidgetSchema = z.object({
  widgetDefinitionId: z.string().uuid(),
  name: z.string().min(1).max(255),
  config: z.record(z.unknown()).optional(),
});

export async function widgetRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/widget-definitions", async () => {
    return db.select().from(widgetDefinitions).orderBy(widgetDefinitions.name);
  });

  fastify.get("/api/widgets", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    return db.select().from(widgets).where(eq(widgets.organizationId, orgId)).orderBy(widgets.name);
  });

  fastify.get("/api/widgets/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [widget] = await db.select().from(widgets).where(and(eq(widgets.id, id), eq(widgets.organizationId, orgId)));
    if (!widget) return reply.status(404).send({ error: "Widget not found" });
    return widget;
  });

  fastify.post("/api/widgets", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createWidgetSchema.parse(request.body);
    const { orgId } = request.user;
    const [widget] = await db.insert(widgets).values({
      organizationId: orgId,
      widgetDefinitionId: body.widgetDefinitionId,
      name: body.name,
      config: body.config as Record<string, unknown> ?? {},
    }).returning();
    return reply.status(201).send(widget);
  });

  fastify.put("/api/widgets/:id", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createWidgetSchema.partial().parse(request.body);
    const [updated] = await db.update(widgets)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(widgets.id, id), eq(widgets.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Widget not found" });
    return updated;
  });

  fastify.delete("/api/widgets/:id", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(widgets)
      .where(and(eq(widgets.id, id), eq(widgets.organizationId, orgId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Widget not found" });
    return reply.status(204).send();
  });
}
