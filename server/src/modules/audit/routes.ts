import { FastifyInstance, FastifyRequest } from "fastify";
import { db } from "../../db";
import { auditLogs } from "../../db/schema";
import { eq, and, desc, lte, gte } from "drizzle-orm";

export async function auditRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/audit-logs", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const query = request.query as Record<string, string>;
    const conditions = [eq(auditLogs.organizationId, orgId)];

    if (query.entityType) conditions.push(eq(auditLogs.entityType, query.entityType));
    if (query.action) conditions.push(eq(auditLogs.action, query.action));
    if (query.from) conditions.push(gte(auditLogs.createdAt, new Date(query.from)));
    if (query.to) conditions.push(lte(auditLogs.createdAt, new Date(query.to)));

    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
    const offset = (page - 1) * limit;

    const [items, countResult] = await Promise.all([
      db.select().from(auditLogs)
        .where(and(...conditions))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit).offset(offset),
      db.select({ count: auditLogs.id }).from(auditLogs)
        .where(and(...conditions)),
    ]);

    return {
      items,
      total: countResult.length,
      page,
      limit,
      totalPages: Math.ceil(countResult.length / limit),
    };
  });
}
