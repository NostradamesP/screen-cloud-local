import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    requireRole: (...roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async function authorizationPlugin(fastify: FastifyInstance) {
  fastify.decorate("requireRole", (...roles: string[]) => {
    return async function (request: FastifyRequest, reply: FastifyReply) {
      if (!request.user?.role) {
        return reply.status(401).send({ error: "Unauthorized" });
      }
      if (!roles.includes(request.user.role)) {
        return reply.status(403).send({ error: "Forbidden: insufficient permissions" });
      }
    };
  });
});
