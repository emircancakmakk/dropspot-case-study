// src/types/fastify-jwt.d.ts
import "@fastify/jwt";

export type Role = "USER" | "ADMIN";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; email: string; role: Role }; 
    user: { id: string; email: string; role: Role };     
  }
}
