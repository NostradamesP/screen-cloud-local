import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { screenGroups, screenGroupScreens } from "../../db/schema";
import { eq, and } from "drizzle-orm";

const createGroupSchema = z.object({
  name: z.string().min(1).max(255),
  screenIds: z.array(z.string().uuid()).optional(),
});

export async function screenGroupRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/screen-groups", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const groups = await db.select().from(screenGroups)
      .where(eq(screenGroups.organizationId, orgId))
      .orderBy(screenGroups.name);

    const result = [];
    for (const group of groups) {
      const members = await db.select()
        .from(screenGroupScreens)
        .where(eq(screenGroupScreens.groupId, group.id));
      result.push({ ...group, screenCount: members.length, screenIds: members.map(m => m.screenId) });
    }
    return result;
  });

  fastify.get("/api/screen-groups/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [group] = await db.select().from(screenGroups).where(
      and(eq(screenGroups.id, id), eq(screenGroups.organizationId, orgId))
    );
    if (!group) return reply.status(404).send({ error: "Group not found" });
    const members = await db.select()
      .from(screenGroupScreens)
      .where(eq(screenGroupScreens.groupId, id));
    return { ...group, screenIds: members.map(m => m.screenId) };
  });

  fastify.post("/api/screen-groups", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createGroupSchema.parse(request.body);
    const { orgId } = request.user;
    const [group] = await db.insert(screenGroups).values({
      organizationId: orgId,
      name: body.name,
    }).returning();

    if (body.screenIds && body.screenIds.length > 0) {
      await db.insert(screenGroupScreens).values(
        body.screenIds.map(screenId => ({ screenId, groupId: group.id }))
      );
    }

    return reply.status(201).send({ ...group, screenIds: body.screenIds ?? [] });
  });

  fastify.put("/api/screen-groups/:id", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createGroupSchema.partial().parse(request.body);
    const [group] = await db.update(screenGroups)
      .set(body.name ? { name: body.name } : {})
      .where(and(eq(screenGroups.id, id), eq(screenGroups.organizationId, orgId)))
      .returning();
    if (!group) return reply.status(404).send({ error: "Group not found" });

    if (body.screenIds !== undefined) {
      await db.delete(screenGroupScreens)
        .where(eq(screenGroupScreens.groupId, id));
      if (body.screenIds.length > 0) {
        await db.insert(screenGroupScreens).values(
          body.screenIds.map(screenId => ({ screenId, groupId: id }))
        );
      }
    }

    return { ...group, screenIds: body.screenIds ?? [] };
  });

  fastify.delete("/api/screen-groups/:id", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(screenGroups)
      .where(and(eq(screenGroups.id, id), eq(screenGroups.organizationId, orgId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Group not found" });
    return reply.status(204).send();
  });
}