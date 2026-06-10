import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { contentItems } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { logAudit } from "../../lib/audit";
import { cacheDel } from "../../lib/cache";
import { deleteFile } from "../../storage";

const createContentSchema = z.object({
  type: z.enum(["webpage", "image", "video", "dashboard", "rss", "html"]),
  title: z.string().min(1).max(255),
  url: z.string().max(1000).optional(),
  filePath: z.string().max(1000).optional(),
  mimeType: z.string().max(100).optional(),
  duration: z.number().int().positive().default(10),
  expiresAt: z.string().optional(),
  settings: z.object({
    scaleMode: z.enum(["fit", "fill", "stretch"]).optional(),
    backgroundColor: z.string().optional(),
    transition: z.enum(["fade", "slide", "none"]).optional(),
    autoRefresh: z.number().int().optional(),
    showControls: z.boolean().optional(),
  }).optional(),
});

function parseFilePath(filePath: string): { orgId: string; filename: string } | null {
  const match = filePath.match(/^\/api\/public\/file\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { orgId: match[1], filename: match[2] };
}

export async function contentRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/content", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    return db.select().from(contentItems).where(eq(contentItems.organizationId, orgId));
  });

  fastify.get("/api/content/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [item] = await db.select().from(contentItems).where(
      and(eq(contentItems.id, id), eq(contentItems.organizationId, orgId))
    );
    if (!item) return reply.status(404).send({ error: "Content not found" });
    return item;
  });

  fastify.post("/api/content", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createContentSchema.parse(request.body);
    const { orgId } = request.user;
    const [item] = await db.insert(contentItems).values({
      organizationId: orgId,
      type: body.type,
      title: body.title,
      url: body.url,
      filePath: body.filePath,
      mimeType: body.mimeType,
      duration: body.duration,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      settings: body.settings as Record<string, unknown> ?? {},
    }).returning();
    logAudit({ orgId, userId: request.user.userId, action: "create", entityType: "content", entityId: item.id });
    fastify.wsNotifier.notifyAllScreens({ type: "content_update" });
    return reply.status(201).send(item);
  });

  fastify.put("/api/content/:id", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createContentSchema.partial().parse(request.body);
    const updateData: Record<string, unknown> = { ...body, updatedAt: new Date() };
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }
    const [updated] = await db.update(contentItems)
      .set(updateData)
      .where(and(eq(contentItems.id, id), eq(contentItems.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Content not found" });
    logAudit({ orgId, userId: request.user.userId, action: "update", entityType: "content", entityId: id, changes: updateData });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "content_update" });
    return updated;
  });

  fastify.delete("/api/content/:id", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(contentItems)
      .where(and(eq(contentItems.id, id), eq(contentItems.organizationId, orgId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Content not found" });
    
    if (deleted.filePath) {
      const parsed = parseFilePath(deleted.filePath);
      if (parsed) {
        const [otherContent] = await db.select().from(contentItems)
          .where(and(eq(contentItems.filePath, deleted.filePath), eq(contentItems.organizationId, orgId)))
          .limit(1);
        if (!otherContent) {
          await deleteFile(parsed.orgId, parsed.filename);
        }
      }
    }
    
    logAudit({ orgId, userId: request.user.userId, action: "delete", entityType: "content", entityId: id });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "content_update" });
    return reply.status(204).send();
  });
}
