// src/modules/auth/guards.ts
import type { FastifyRequest, FastifyReply } from "fastify";
import type { Role } from "../types/fastify-jwt";

export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  try {
    await req.jwtVerify();
  } catch {
    return reply.code(401).send({ error: "unauthorized" });
  }
}

export function requireRoles(...roles: Role[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const u = req.user;
    if (!u || !roles.includes(u.role)) {
      return reply.code(403).send({ error: "forbidden" });
    }
  };
}
