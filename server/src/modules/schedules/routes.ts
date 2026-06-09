import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { playlists, schedules, screenGroups, screens } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { cacheDel } from "../../lib/cache";

const createScheduleSchema = z.object({
  playlistId: z.string().uuid(),
  screenId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeStart: z.string().optional(),
  timeEnd: z.string().optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  active: z.boolean().optional(),
  priority: z.number().int().min(0).default(0),
});

export async function scheduleRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  async function validateScheduleRefs(orgId: string, body: z.infer<typeof createScheduleSchema> | Partial<z.infer<typeof createScheduleSchema>>, reply: FastifyReply) {
    if (body.playlistId) {
      const [playlist] = await db.select({ id: playlists.id }).from(playlists).where(and(eq(playlists.id, body.playlistId), eq(playlists.organizationId, orgId)));
      if (!playlist) {
        reply.status(404).send({ error: "Playlist not found" });
        return false;
      }
    }
    if (body.screenId) {
      const [screen] = await db.select({ id: screens.id }).from(screens).where(and(eq(screens.id, body.screenId), eq(screens.organizationId, orgId)));
      if (!screen) {
        reply.status(404).send({ error: "Screen not found" });
        return false;
      }
    }
    if (body.groupId) {
      const [group] = await db.select({ id: screenGroups.id }).from(screenGroups).where(and(eq(screenGroups.id, body.groupId), eq(screenGroups.organizationId, orgId)));
      if (!group) {
        reply.status(404).send({ error: "Group not found" });
        return false;
      }
    }
    return true;
  }

  fastify.get("/api/schedules", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    return db.select().from(schedules).where(eq(schedules.organizationId, orgId));
  });

  fastify.get("/api/schedules/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [schedule] = await db.select().from(schedules).where(
      and(eq(schedules.id, id), eq(schedules.organizationId, orgId))
    );
    if (!schedule) return reply.status(404).send({ error: "Schedule not found" });
    return schedule;
  });

  fastify.post("/api/schedules", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = createScheduleSchema.parse(request.body);
    const { orgId } = request.user;
    if (!(await validateScheduleRefs(orgId, body, reply))) return;
    const [schedule] = await db.insert(schedules).values({
      organizationId: orgId,
      playlistId: body.playlistId,
      screenId: body.screenId ?? null,
      groupId: body.groupId ?? null,
      name: body.name,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      timeStart: body.timeStart ?? null,
      timeEnd: body.timeEnd ?? null,
      daysOfWeek: body.daysOfWeek ?? null,
      active: body.active ?? true,
      priority: body.priority,
    }).returning();
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return reply.status(201).send(schedule);
  });

  fastify.put("/api/schedules/:id", {
    preHandler: [fastify.requireRole("admin", "editor")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const body = createScheduleSchema.partial().parse(request.body);
    if (!(await validateScheduleRefs(orgId, body, reply))) return;
    const [updated] = await db.update(schedules)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(schedules.id, id), eq(schedules.organizationId, orgId)))
      .returning();
    if (!updated) return reply.status(404).send({ error: "Schedule not found" });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return updated;
  });

  fastify.delete("/api/schedules/:id", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [deleted] = await db.delete(schedules)
      .where(and(eq(schedules.id, id), eq(schedules.organizationId, orgId)))
      .returning();
    if (!deleted) return reply.status(404).send({ error: "Schedule not found" });
    cacheDel("player:*");
    fastify.wsNotifier.notifyAllScreens({ type: "playlist_update" });
    return reply.status(204).send();
  });
}
