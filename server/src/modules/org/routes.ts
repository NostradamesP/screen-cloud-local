import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { users, organizationMembers } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { exportOrg } from "../../lib/backup";
import { sendMail } from "../../lib/mail";

export async function orgRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/org/members", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const members = await db.select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      email: users.email,
      name: users.name,
    }).from(organizationMembers)
      .leftJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, orgId));
    return members;
  });

  fastify.put("/api/org/members/:id/role", { preHandler: [fastify.requireRole("admin")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = z.object({ role: z.enum(["admin", "editor", "viewer"]) }).parse(request.body);
    const [updated] = await db.update(organizationMembers)
      .set({ role: body.role })
      .where(and(eq(organizationMembers.id, id), eq(organizationMembers.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Member not found" });
    return updated;
  });

  fastify.put("/api/content/:id/status", { preHandler: [fastify.requireRole("admin", "editor")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = z.object({ status: z.enum(["draft", "review", "published"]) }).parse(request.body);
    const { contentItems } = await import("../../db/schema");
    const [updated] = await db.update(contentItems)
      .set({ status: body.status })
      .where(and(eq(contentItems.id, id), eq(contentItems.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Content not found" });
    return updated;
  });

  fastify.get("/api/org/export", async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId } = request.user;
    const backup = await exportOrg(orgId);
    reply.header("Content-Type", "application/json");
    reply.header("Content-Disposition", "attachment; filename=signage-backup.json");
    return backup;
  });

  fastify.post("/api/org/test-email", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const body = z.object({ to: z.string().email() }).parse(request.body);
    await sendMail({ to: body.to, subject: "Prueba de email", text: "Notificación de prueba desde Screen Cloud Local" });
    return { ok: true };
  });

  fastify.post("/api/content/import", { preHandler: [fastify.requireRole("admin")] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId } = request.user;
    const body = z.array(z.object({
      type: z.string(), title: z.string(), url: z.string().optional(), duration: z.number().optional(),
    })).parse(request.body);
    const { contentItems } = await import("../../db/schema");
    for (const item of body) {
      await db.insert(contentItems).values({ organizationId: orgId, type: item.type, title: item.title, url: item.url ?? null, duration: item.duration ?? 10 });
    }
    return { imported: body.length };
  });
}
