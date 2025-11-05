import { FastifyRequest, FastifyReply } from "fastify";
import { DropIdParam, CreateDropInput } from "./drops.schema";

export async function createDrop(
  req: FastifyRequest<{ Body: CreateDropInput }>,
  reply: FastifyReply
) {
  const data = req.body;
  // prisma.drop.create({ data }) ...
}
