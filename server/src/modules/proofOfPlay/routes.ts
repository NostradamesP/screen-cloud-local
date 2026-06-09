import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { contentItems, proofOfPlay, screens } from "../../db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

const logPlaySchema = z.object({
  screenId: z.string().uuid(),
  contentItemId: z.string().uuid().optional(),
  playlistId: z.string().optional(),
  scheduleId: z.string().optional(),
  duration: z.number().int().positive().optional(),
});

export async function proofOfPlayRoutes(fastify: FastifyInstance) {
  fastify.post("/api/proof-of-play/log", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = logPlaySchema.parse(request.body);
    const [screen] = await db.select({ id: screens.id, organizationId: screens.organizationId }).from(screens).where(eq(screens.id, body.screenId));
    if (!screen) return reply.status(404).send({ error: "Screen not found" });
    if (body.contentItemId) {
      const [content] = await db.select({ id: contentItems.id }).from(contentItems).where(
        and(eq(contentItems.id, body.contentItemId), eq(contentItems.organizationId, screen.organizationId))
      );
      if (!content) return reply.status(404).send({ error: "Content not found" });
    }
    const [log] = await db.insert(proofOfPlay).values({
      screenId: body.screenId,
      contentItemId: body.contentItemId ?? null,
      playlistId: body.playlistId ?? null,
      scheduleId: body.scheduleId ?? null,
      duration: body.duration ?? null,
    }).returning();
    return reply.status(201).send(log);
  });

  fastify.get("/api/proof-of-play", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest) => {
    const query = request.query as Record<string, string>;
    const { orgId } = request.user;
    const conditions = [eq(screens.organizationId, orgId)];
    if (query.screenId) conditions.push(eq(proofOfPlay.screenId, query.screenId));
    if (query.from) conditions.push(gte(proofOfPlay.playedAt, new Date(query.from)));
    if (query.to) conditions.push(lte(proofOfPlay.playedAt, new Date(query.to)));
    return db.select({ log: proofOfPlay })
      .from(proofOfPlay)
      .innerJoin(screens, eq(proofOfPlay.screenId, screens.id))
      .where(and(...conditions))
      .orderBy(proofOfPlay.playedAt)
      .then((rows) => rows.map((row) => row.log));
  });

  fastify.get("/api/proof-of-play/stats", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest) => {
    const query = request.query as Record<string, string>;
    const { orgId } = request.user;
    const conditions = [eq(screens.organizationId, orgId)];
    if (query.screenId) conditions.push(eq(proofOfPlay.screenId, query.screenId));
    if (query.from) conditions.push(gte(proofOfPlay.playedAt, new Date(query.from)));
    if (query.to) conditions.push(lte(proofOfPlay.playedAt, new Date(query.to)));
    const logs = await db.select({ log: proofOfPlay })
      .from(proofOfPlay)
      .innerJoin(screens, eq(proofOfPlay.screenId, screens.id))
      .where(and(...conditions))
      .then((rows) => rows.map((row) => row.log));
    const totalPlayed = logs.length;
    const uniqueContent = new Set(logs.map(l => l.contentItemId)).size;
    return { totalPlayed, uniqueContent, logs };
  });
}
