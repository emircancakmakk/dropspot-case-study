import { FastifyReply, FastifyRequest } from "fastify";
import * as S from "./claim.service";

export async function listMyClaims(req: FastifyRequest, reply: FastifyReply) {
    const userId = req.user.sub;
    const rows = await S.listUserClaims(userId);
    return reply.code(200).send(rows);
  }
  