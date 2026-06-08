import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db";
import { users, organizationMembers, organizations } from "../../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(6).max(255),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post("/api/auth/register", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = registerSchema.parse(request.body);
    const exists = await db.select().from(users).where(eq(users.email, body.email));
    if (exists.length > 0) {
      return reply.status(409).send({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    let org = await db.select().from(organizations).limit(1);
    let orgId: string;
    if (org.length === 0) {
      const [newOrg] = await db.insert(organizations).values({
        name: process.env.DEFAULT_ORG_NAME ?? "Mi Empresa",
        slug: "default",
      }).returning();
      orgId = newOrg.id;
    } else {
      orgId = org[0].id;
    }

    const [user] = await db.insert(users).values({
      email: body.email,
      name: body.name,
      passwordHash,
      role: "admin",
    }).returning();

    await db.insert(organizationMembers).values({
      organizationId: orgId,
      userId: user.id,
      role: "admin",
    });

    const token = fastify.jwt.sign({ userId: user.id, orgId, role: "admin" });
    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  });

  fastify.post("/api/auth/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);
    const [user] = await db.select().from(users).where(eq(users.email, body.email));
    if (!user || !user.passwordHash) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    const [membership] = await db.select()
      .from(organizationMembers)
      .where(eq(organizationMembers.userId, user.id));

    const orgId = membership?.organizationId;

    const token = fastify.jwt.sign({
      userId: user.id,
      orgId: orgId ?? "",
      role: user.role,
    });

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  });

  fastify.get("/api/auth/me", {
    preHandler: [fastify.authenticate],
  }, async (request: FastifyRequest) => {
    const { userId } = request.user;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");
    return { id: user.id, email: user.email, name: user.name, role: user.role, avatarUrl: user.avatarUrl };
  });
}
