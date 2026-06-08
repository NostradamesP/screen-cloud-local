import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { proofOfPlay } from "../../db/schema";
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
    const conditions = [];
    if (query.screenId) conditions.push(eq(proofOfPlay.screenId, query.screenId));
    if (query.from) conditions.push(gte(proofOfPlay.playedAt, new Date(query.from)));
    if (query.to) conditions.push(lte(proofOfPlay.playedAt, new Date(query.to)));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    return db.select().from(proofOfPlay).where(where).orderBy(proofOfPlay.playedAt);
  });

  fastify.get("/api/proof-of-play/stats", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest) => {
    const query = request.query as Record<string, string>;
    const conditions = [];
    if (query.screenId) conditions.push(eq(proofOfPlay.screenId, query.screenId));
    if (query.from) conditions.push(gte(proofOfPlay.playedAt, new Date(query.from)));
    if (query.to) conditions.push(lte(proofOfPlay.playedAt, new Date(query.to)));
    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const logs = await db.select().from(proofOfPlay).where(where);
    const totalPlayed = logs.length;
    const uniqueContent = new Set(logs.map(l => l.contentItemId)).size;
    return { totalPlayed, uniqueContent, logs };
  });
}
