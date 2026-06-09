import Fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import staticFiles from "@fastify/static";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { sql } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config";
import { db } from "./db";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import authPlugin from "./plugins/auth";
import authorizationPlugin from "./plugins/authorization";
import { cacheDel, redis } from "./lib/cache";
import { ensureUploadDir } from "./storage";
import { authRoutes } from "./modules/auth/routes";
import { contentRoutes } from "./modules/content/routes";
import { mediaRoutes, publicMediaRoutes } from "./modules/media/routes";
import { playlistRoutes } from "./modules/playlists/routes";
import { scheduleRoutes } from "./modules/schedules/routes";
import { screenRoutes } from "./modules/screens/routes";
import { screenGroupRoutes } from "./modules/screenGroups/routes";
import { playerRoutes } from "./modules/player/routes";
import { layoutRoutes } from "./modules/layouts/routes";
import { widgetRoutes } from "./modules/widgets/routes";
import { proofOfPlayRoutes } from "./modules/proofOfPlay/routes";
import { auditRoutes } from "./modules/audit/routes";
import { notificationRoutes } from "./modules/notifications/routes";
import { tagRoutes } from "./modules/tags/routes";
import { orgRoutes } from "./modules/org/routes";
import { setupWebSocket } from "./ws";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fastify = Fastify({
  logger: true,
});

async function main() {
  await fastify.register(cors, { origin: true });
  await fastify.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await fastify.register(swagger, {
    openapi: { info: { title: "Signage API", version: "1.0.0", description: "Screen Cloud Local API" } },
  });
  await fastify.register(swaggerUI, { routePrefix: "/docs" });
  await fastify.register(websocket);
  await fastify.register(multipart, { limits: { fileSize: 500 * 1024 * 1024 } });
  await fastify.register(authPlugin);
  await fastify.register(authorizationPlugin);

  await fastify.register(publicMediaRoutes);
  await fastify.register(authRoutes);
  await fastify.register(contentRoutes);
  await fastify.register(mediaRoutes);
  await fastify.register(playlistRoutes);
  await fastify.register(scheduleRoutes);
  await fastify.register(screenRoutes);
  await fastify.register(screenGroupRoutes);
  await fastify.register(playerRoutes);
  await fastify.register(layoutRoutes);
  await fastify.register(widgetRoutes);
  await fastify.register(proofOfPlayRoutes);
  await fastify.register(auditRoutes);
  await fastify.register(notificationRoutes);
  await fastify.register(tagRoutes);
  await fastify.register(orgRoutes);

  const wsNotifier = setupWebSocket(fastify);
  fastify.decorate("wsNotifier", wsNotifier);

  const playerPath = path.resolve(__dirname, "../../player");
  await fastify.register(staticFiles, {
    root: playerPath,
    prefix: "/player/",
    index: ["index.html"],
  });

  fastify.get("/player", async (request, reply) => {
    reply.header("Cache-Control", "no-cache, must-revalidate");
    return reply.sendFile("index.html", playerPath);
  });

  fastify.get("/health", async (request, reply) => {
    const checks = {
      api: true,
      database: false,
      redis: false,
      uploads: false,
    };

    try {
      await db.execute(sql`select 1`);
      checks.database = true;
    } catch (err) {
      fastify.log.warn({ err }, "database health check failed");
    }

    try {
      checks.redis = (await redis.ping()) === "PONG";
    } catch (err) {
      fastify.log.warn({ err }, "redis health check failed");
    }

    try {
      await ensureUploadDir();
      await fs.access(config.upload.dir);
      checks.uploads = true;
    } catch (err) {
      fastify.log.warn({ err }, "uploads health check failed");
    }

    const healthy = checks.database && checks.redis && checks.uploads;
    if (!healthy) reply.status(503);

    return {
      status: healthy ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage().rss,
    };
  });

  const webPath = path.resolve(__dirname, "../../web/dist");
  try {
    await fastify.register(staticFiles, {
      root: webPath,
      prefix: "/",
      index: ["index.html"],
      decorateReply: false,
    });
  } catch {}

  try { await cacheDel("player:*"); } catch {}
  ensureUploadDir();

  try {
    const migSql = postgres(config.database.url, { max: 1 });
    const migDb = drizzle(migSql);
    await migrate(migDb, { migrationsFolder: path.join(__dirname, "./db/migrations") });
    await migSql.end();
    console.log("Migrations complete");
  } catch (err) {
    console.warn("Migration error:", (err as Error).message);
  }

  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`Server running on http://${config.host}:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

main();

declare module "fastify" {
  interface FastifyInstance {
    wsNotifier: ReturnType<typeof setupWebSocket>;
  }
}
