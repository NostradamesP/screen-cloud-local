import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db";
import { mediaAssets } from "../../db/schema";
import { and, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import path from "path";
import { saveFile, deleteFile, getFileStream, getFileSize, getContentType, getDiskUsage, getUploadDirSize, listAllFiles } from "../../storage";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/webm", "video/ogg",
];

export async function mediaRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", fastify.authenticate);

  fastify.get("/api/media", async (request: FastifyRequest) => {
    const { orgId } = request.user;
    return db.select().from(mediaAssets).where(eq(mediaAssets.organizationId, orgId));
  });

  fastify.post("/api/media/upload", async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId } = request.user;
    const data = await request.file();
    if (!data) return reply.status(400).send({ error: "No file provided" });

    const mimeType = data.mimetype;
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return reply.status(400).send({ error: `File type ${mimeType} not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}` });
    }

    const ext = path.extname(data.filename).toLowerCase();
    const allowedExt = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".webm", ".ogg"];
    if (!allowedExt.includes(ext)) {
      return reply.status(400).send({ error: "File extension not allowed" });
    }
    const filename = `${uuid()}${ext}`;
    const buffer = await data.toBuffer();
    const size = buffer.length;

    await saveFile(orgId, filename, buffer);

    const url = `/api/public/file/${orgId}/${filename}`;

    const [asset] = await db.insert(mediaAssets).values({
      organizationId: orgId,
      filename: filename,
      originalName: data.filename,
      mimeType: mimeType,
      size: size,
      url: url,
    }).returning();

    return reply.status(201).send(asset);
  });

  fastify.delete("/api/media/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const { orgId } = request.user;
    const [asset] = await db.select().from(mediaAssets).where(
      and(eq(mediaAssets.id, id), eq(mediaAssets.organizationId, orgId))
    );
    if (!asset) {
      return reply.status(404).send({ error: "Media not found" });
    }
    await deleteFile(orgId, asset.filename);
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return reply.status(204).send();
  });

  fastify.get("/api/media/file/:orgId/:filename", async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId, filename } = request.params as { orgId: string; filename: string };
    try {
      if (request.user.orgId !== orgId) return reply.status(404).send({ error: "File not found" });
      const [asset] = await db.select({ id: mediaAssets.id, mimeType: mediaAssets.mimeType }).from(mediaAssets).where(
        and(eq(mediaAssets.organizationId, orgId), eq(mediaAssets.filename, filename))
      );
      if (!asset) return reply.status(404).send({ error: "File not found" });
      const stream = getFileStream(orgId, filename);
      const mimeType = asset.mimeType || getContentType(filename);
      reply.header("Content-Type", mimeType);
      reply.header("Cache-Control", "public, max-age=31536000");
      return reply.send(stream);
    } catch {
      return reply.status(404).send({ error: "File not found" });
    }
  });

  fastify.get("/api/media/stats", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const [diskUsage, uploadDirSize, allFiles] = await Promise.all([
      getDiskUsage(),
      getUploadDirSize(),
      listAllFiles(),
    ]);
    const orgFiles = allFiles.filter(f => f.orgId === orgId);
    const orgSize = orgFiles.reduce((sum, f) => sum + f.size, 0);
    return {
      disk: diskUsage,
      uploads: {
        total: uploadDirSize,
        org: orgSize,
        files: orgFiles.length,
      },
    };
  });

  fastify.get("/api/media/orphans", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const allFiles = await listAllFiles();
    const orgFiles = allFiles.filter(f => f.orgId === orgId);
    const dbAssets = await db.select({ filename: mediaAssets.filename }).from(mediaAssets)
      .where(eq(mediaAssets.organizationId, orgId));
    const dbFilenames = new Set(dbAssets.map(a => a.filename));
    const orphans = orgFiles.filter(f => !dbFilenames.has(f.filename));
    return orphans;
  });

  fastify.post("/api/media/cleanup-orphans", {
    preHandler: [fastify.requireRole("admin")],
  }, async (request: FastifyRequest) => {
    const { orgId } = request.user;
    const allFiles = await listAllFiles();
    const orgFiles = allFiles.filter(f => f.orgId === orgId);
    const dbAssets = await db.select({ filename: mediaAssets.filename }).from(mediaAssets)
      .where(eq(mediaAssets.organizationId, orgId));
    const dbFilenames = new Set(dbAssets.map(a => a.filename));
    const orphans = orgFiles.filter(f => !dbFilenames.has(f.filename));
    let deleted = 0;
    for (const orphan of orphans) {
      await deleteFile(orphan.orgId, orphan.filename);
      deleted++;
    }
    return { deleted, totalSize: orphans.reduce((sum, f) => sum + f.size, 0) };
  });
}

export async function publicMediaRoutes(fastify: FastifyInstance) {
  fastify.get("/api/public/file/:orgId/:filename", async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId, filename } = request.params as { orgId: string; filename: string };

    try {
      const [asset] = await db.select({ id: mediaAssets.id, mimeType: mediaAssets.mimeType }).from(mediaAssets).where(
        and(eq(mediaAssets.organizationId, orgId), eq(mediaAssets.filename, filename))
      );
      if (!asset) return reply.status(404).send({ error: "File not found" });
      const totalSize = await getFileSize(orgId, filename);
      const mimeType = asset.mimeType || getContentType(filename);
      const rangeHeader = request.headers.range;

      reply.header("Accept-Ranges", "bytes");
      reply.header("Cache-Control", "public, max-age=31536000");

      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (!match) {
          return reply.status(416).send({ error: "Range Not Satisfiable" });
        }
        const start = parseInt(match[1], 10);
        const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
        const chunkSize = end - start + 1;

        if (start >= totalSize || end >= totalSize) {
          reply.header("Content-Range", `bytes */${totalSize}`);
          return reply.status(416).send({ error: "Range Not Satisfiable" });
        }

        const stream = getFileStream(orgId, filename, { start, end });
        reply.status(206);
        reply.header("Content-Range", `bytes ${start}-${end}/${totalSize}`);
        reply.header("Content-Length", chunkSize);
        reply.header("Content-Type", mimeType);
        return reply.send(stream);
      }

      const stream = getFileStream(orgId, filename);
      reply.header("Content-Type", mimeType);
      reply.header("Content-Length", totalSize);
      return reply.send(stream);
    } catch {
      return reply.status(404).send({ error: "File not found" });
    }
  });
}
