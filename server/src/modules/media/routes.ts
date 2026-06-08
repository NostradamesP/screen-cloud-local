import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db";
import { mediaAssets } from "../../db/schema";
import { eq } from "drizzle-orm";
import { getMinio } from "../../minio";
import { config } from "../../config";
import { v4 as uuid } from "uuid";
import path from "path";

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

    const ext = path.extname(data.filename) || ".bin";
    const filename = `${uuid()}${ext}`;
    const objectName = `${orgId}/${filename}`;

    const buffer = await data.toBuffer();
    const size = buffer.length;

    const minio = getMinio();
    await minio.putObject(config.minio.bucket, objectName, buffer, size, {
      "Content-Type": mimeType,
    });

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
      eq(mediaAssets.id, id)
    );
    if (!asset || asset.organizationId !== orgId) {
      return reply.status(404).send({ error: "Media not found" });
    }
    const minio = getMinio();
    try {
      await minio.removeObject(config.minio.bucket, `${orgId}/${asset.filename}`);
    } catch {}
    await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
    return reply.status(204).send();
  });

  fastify.get("/api/media/file/:orgId/:filename", async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId, filename } = request.params as { orgId: string; filename: string };
    const minio = getMinio();
    try {
      const stream = await minio.getObject(config.minio.bucket, `${orgId}/${filename}`);
      const stat = await minio.statObject(config.minio.bucket, `${orgId}/${filename}`);
      reply.header("Content-Type", stat.metaData?.["content-type"] || "application/octet-stream");
      reply.header("Cache-Control", "public, max-age=31536000");
      return reply.send(stream);
    } catch {
      return reply.status(404).send({ error: "File not found" });
    }
  });
}

export async function publicMediaRoutes(fastify: FastifyInstance) {
  fastify.get("/api/public/file/:orgId/:filename", async (request: FastifyRequest, reply: FastifyReply) => {
    const { orgId, filename } = request.params as { orgId: string; filename: string };
    const minio = getMinio();
    try {
      const stream = await minio.getObject(config.minio.bucket, `${orgId}/${filename}`);
      const stat = await minio.statObject(config.minio.bucket, `${orgId}/${filename}`);
      reply.header("Content-Type", stat.metaData?.["content-type"] || "application/octet-stream");
      reply.header("Cache-Control", "public, max-age=31536000");
      return reply.send(stream);
    } catch {
      return reply.status(404).send({ error: "File not found" });
    }
  });
}
