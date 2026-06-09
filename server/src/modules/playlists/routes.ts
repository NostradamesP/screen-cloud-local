import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { playlists, playlistItems, contentItems } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { logAudit } from "../../lib/audit";
import { cacheDel } from "../../lib/cache";

const createPlaylistSchema = z.object({
  name: z.string().min(1).max(255),
});

const addItemSchema = z.object({
  contentItemId: z.string().uuid(),
  position: z.number().int().min(0),
  durationOverride: z.number().int().positive().optional(),
});

export async function playlistRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/playlists", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    return db.select().from(playlists).where(eq(playlists.organizationId, orgId));
  });

  fastify.get("/api/playlists/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [playlist] = await db.select().from(playlists).where(
      and(eq(playlists.id, id), eq(playlists.organizationId, orgId))
    );
    if (!playlist) return reply.status(404).send({ error: "Playlist not found" });
    const items = await db.select({
      item: playlistItems,
      contentItem: contentItems,
    })
      .from(playlistItems)
      .leftJoin(contentItems, eq(playlistItems.contentItemId, contentItems.id))
      .where(eq(playlistItems.playlistId, id))
      .orderBy(playlistItems.position);
    const formattedItems = items.map(({ item, contentItem }) => ({
      ...item,
      contentItem,
    }));
    return { ...playlist, items: formattedItems };
  });

  fastify.post("/api/playlists", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createPlaylistSchema.parse(request.body);
    const { orgId } = request.user;
    const [playlist] = await db.insert(playlists).values({
      organizationId: orgId,
      name: body.name,
    }).returning();
    logAudit({ orgId, userId: request.user.userId, action: "create", entityType: "playlist", entityId: playlist.id });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return reply.status(201).send(playlist);
  });

  fastify.put("/api/playlists/:id", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createPlaylistSchema.partial().parse(request.body);
    const [updated] = await db.update(playlists)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(playlists.id, id), eq(playlists.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Playlist not found" });
    logAudit({ orgId, userId: request.user.userId, action: "update", entityType: "playlist", entityId: id });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return updated;
  });

  fastify.delete("/api/playlists/:id", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(playlists)
      .where(and(eq(playlists.id, id), eq(playlists.organizationId, orgId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Playlist not found" });
    logAudit({ orgId, userId: request.user.userId, action: "delete", entityType: "playlist", entityId: id });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return reply.status(204).send();
  });

  fastify.post("/api/playlists/:id/items", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = addItemSchema.parse(request.body);
    const { orgId } = request.user;
    const [playlist] = await db.select().from(playlists).where(
      and(eq(playlists.id, id), eq(playlists.organizationId, orgId))
    );
    if (!playlist) return reply.status(404).send({ error: "Playlist not found" });
    const [contentItem] = await db.select({ id: contentItems.id }).from(contentItems).where(
      and(eq(contentItems.id, body.contentItemId), eq(contentItems.organizationId, orgId))
    );
    if (!contentItem) return reply.status(404).send({ error: "Content item not found" });
    const [item] = await db.insert(playlistItems).values({
      playlistId: id,
      contentItemId: body.contentItemId,
      position: body.position,
      durationOverride: body.durationOverride,
    }).returning();
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return reply.status(201).send(item);
  });

  fastify.put("/api/playlists/:playlistId/items/reorder", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { playlistId } = request.params as { playlistId: string };
    const { orgId } = request.user;
    const body = z.object({ items: z.array(z.object({ id: z.string().uuid(), position: z.number().int().min(0) })) }).parse(request.body);
    const [playlist] = await db.select().from(playlists).where(
      and(eq(playlists.id, playlistId), eq(playlists.organizationId, orgId))
    );
    if (!playlist) return reply.status(404).send({ error: "Playlist not found" });
    for (const item of body.items) {
      await db.update(playlistItems)
        .set({ position: item.position })
        .where(and(eq(playlistItems.id, item.id), eq(playlistItems.playlistId, playlistId)));
    }
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return reply.status(200).send({ ok: true });
  });

  fastify.delete("/api/playlists/:playlistId/items/:itemId", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId } = request.user;
    const { playlistId, itemId } = request.params as { playlistId: string; itemId: string };
    const [playlist] = await db.select({ id: playlists.id }).from(playlists).where(
      and(eq(playlists.id, playlistId), eq(playlists.organizationId, orgId))
    );
    if (!playlist) return reply.status(404).send({ error: "Playlist not found" });
    const [deleted] = await db.delete(playlistItems)
      .where(and(eq(playlistItems.id, itemId), eq(playlistItems.playlistId, playlistId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Item not found" });
    logAudit({ orgId, userId: request.user.userId, action: "delete", entityType: "playlist_item", entityId: itemId });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return reply.status(204).send();
  });
}
