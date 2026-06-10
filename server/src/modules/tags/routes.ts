import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { contentItems, tags, contentTags } from "../../db/schema";
import { eq, and, inArray } from "drizzle-orm";

const createTagSchema = z.object({ name: z.string().min(1).max(100), color: z.string().optional() });

export async function tagRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/tags", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    return db.select().from(tags).where(eq(tags.organizationId, orgId)).orderBy(tags.name);
  });

  fastify.post("/api/tags", { preHandler: [fastify.requireRole("admin", "editor")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createTagSchema.parse(request.body);
    const { orgId } = request.user;
    const [tag] = await db.insert(tags).values({ organizationId: orgId, name: body.name, color: body.color ?? "#6366f1" }).returning();
    return reply.status(201).send(tag);
  });

  fastify.put("/api/tags/:id", { preHandler: [fastify.requireRole("admin", "editor")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createTagSchema.partial().parse(request.body);
    const [updated] = await db.update(tags).set(body).where(and(eq(tags.id, id), eq(tags.organizationId, orgId))).returning();
    if (!updated) return reply.status(404).send({ error: "Tag not found" });
    return updated;
  });

  fastify.delete("/api/tags/:id", { preHandler: [fastify.requireRole("admin")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(tags).where(and(eq(tags.id, id), eq(tags.organizationId, orgId))).returning();
    if (!deleted) return reply.status(404).send({ error: "Tag not found" });
    return reply.status(204).send();
  });

  fastify.post("/api/content/:id/tags", { preHandler: [fastify.requireRole("admin", "editor")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = z.object({ tagIds: z.array(z.string().uuid()) }).parse(request.body);
    const [content] = await db.select({ id: contentItems.id }).from(contentItems).where(and(eq(contentItems.id, id), eq(contentItems.organizationId, orgId)));
    if (!content) return reply.status(404).send({ error: "Content not found" });
    if (body.tagIds.length > 0) {
      const uniqueTagIds = [...new Set(body.tagIds)];
      const orgTags = await db.select({ id: tags.id }).from(tags).where(and(inArray(tags.id, uniqueTagIds), eq(tags.organizationId, orgId)));
      if (orgTags.length !== uniqueTagIds.length) return reply.status(404).send({ error: "One or more tags were not found" });
    }
    await db.delete(contentTags).where(eq(contentTags.contentId, id));
    if (body.tagIds.length > 0) await db.insert(contentTags).values(body.tagIds.map(tagId => ({ contentId: id, tagId })));
    return reply.status(200).send({ ok: true });
  });

  fastify.get("/api/content/:id/tags", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [content] = await db.select({ id: contentItems.id }).from(contentItems).where(and(eq(contentItems.id, id), eq(contentItems.organizationId, orgId)));
    if (!content) return reply.status(404).send({ error: "Content not found" });
    const rows = await db.select({ tagId: contentTags.tagId }).from(contentTags).where(eq(contentTags.contentId, id));
    return rows.map(r => r.tagId);
  });

  fastify.get("/api/content/tags/batch", async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId } = request.user;
    const query = request.query as Record<string, string>;
    const idsParam = query.ids;
    if (!idsParam) return reply.status(400).send({ error: "ids query parameter is required" });
    const ids = idsParam.split(",").filter(Boolean);
    if (ids.length === 0) return {};
    const orgContent = await db.select({ id: contentItems.id }).from(contentItems).where(
      and(inArray(contentItems.id, ids), eq(contentItems.organizationId, orgId))
    );
    const validIds = new Set(orgContent.map(c => c.id));
    const rows = await db.select({ contentId: contentTags.contentId, tagId: contentTags.tagId })
      .from(contentTags)
      .where(inArray(contentTags.contentId, [...validIds]));
    const result: Record<string, string[]> = {};
    for (const id of validIds) result[id] = [];
    for (const row of rows) {
      if (result[row.contentId]) result[row.contentId].push(row.tagId);
    }
    return result;
  });
}
