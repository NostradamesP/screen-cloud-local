import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { notifications } from "../../db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/notifications", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const query = request.query as Record<string, string>;
    const conditions = [eq(notifications.organizationId, orgId)];
    if (query.unread === "true") conditions.push(eq(notifications.read, false));
    return db.select().from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
  });

  fastify.put("/api/notifications/:id/read", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [updated] = await db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.id, id), eq(notifications.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Notification not found" });
    return updated;
  });

  fastify.put("/api/notifications/read-all", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    await db.update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.organizationId, orgId), eq(notifications.read, false)));
    return { ok: true };
  });
}
