import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fjwt from "@fastify/jwt";
import { config } from "../config";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authenticateScreen: (request: FastifyRequest, reply: FastifyReply) => Promise<{ screenId: string; orgId: string } | null>;
    signScreenToken: (screenId: string, orgId: string) => string;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      userId: string;
      orgId: string;
      role: string;
    };
    user: {
      userId: string;
      orgId: string;
      role: string;
    };
  }
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  await fastify.register(fjwt, {
    secret: config.jwt.secret,
    sign: {
      expiresIn: config.jwt.expiresIn,
    },
  });

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });

  fastify.decorate("signScreenToken", function (screenId: string, orgId: string): string {
    return (fastify.jwt as any).sign({ screenId, orgId, type: "screen" }, { expiresIn: "365d" });
  });

  fastify.decorate("authenticateScreen", async function (request: FastifyRequest, reply: FastifyReply) {
    const header = request.headers["x-screen-token"];
    if (!header || typeof header !== "string") {
      reply.status(401).send({ error: "Missing screen token" });
      return null;
    }
    try {
      const decoded = (fastify.jwt as any).verify(header) as { screenId: string; orgId: string; type: string };
      if (decoded.type !== "screen" || !decoded.screenId || !decoded.orgId) {
        reply.status(401).send({ error: "Invalid screen token" });
        return null;
      }
      return { screenId: decoded.screenId, orgId: decoded.orgId };
    } catch {
      reply.status(401).send({ error: "Invalid screen token" });
      return null;
    }
  });
});
