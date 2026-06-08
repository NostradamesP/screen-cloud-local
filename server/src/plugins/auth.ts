import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fjwt from "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
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
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
    },
  });

  fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: "Unauthorized" });
    }
  });
});
