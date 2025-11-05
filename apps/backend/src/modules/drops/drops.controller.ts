import { FastifyReply, FastifyRequest } from "fastify";
import {
  ClaimDropBody,
  CreateDropInput,
  DropIdParam,
  DropListResponse,
  JoinDropBody,
  LeaveDropBody,
  UpdateDropInput,
} from "./drops.schema";
import * as S from "./drops.service";

export async function getActiveDrops(req: FastifyRequest, reply: FastifyReply) {
  const result = await S.listActiveDrops();

  return reply.code(200).send(result);
}

export async function createDrop(
  req: FastifyRequest<{ Body: CreateDropInput }>,
  reply: FastifyReply
) {
  const input = req.body;

  const drop = await S.createDrop(input);

  return reply
    .code(201)
    .header("Location", `/api/admin/drops/${drop.id}`)
    .send({ message: "Drop başarıyla oluşturuldu", drop });
}

export async function updateDrop(
  req: FastifyRequest<{ Params: DropIdParam; Body: UpdateDropInput }>,
  reply: FastifyReply
) {
  const { id } = req.params;
  const input = req.body;

  const result = await S.updateDrop(id, input);

  return reply.code(200).send({
    message: "Drop başarıyla güncellendi",
    drop: result,
  });
}

export async function deleteDrop(
  req: FastifyRequest<{ Params: DropIdParam }>,
  reply: FastifyReply
) {
  const { id } = req.params;

  const result = await S.deleteDrop(id);

  return reply.code(200).send({
    message: "Drop başarıyla silindi",
  });
}

export async function joinDrop(
  req: FastifyRequest<{ Params: DropIdParam; Body: JoinDropBody }>,
  reply: FastifyReply
) {
  const { id } = req.params;
  const userId = req.body.userId;

  const w = await S.joinWaitlist(userId, id);

  return reply.code(200).send({
    wait: { ...w, joinedAt: w.joinedAt.toISOString() },
  });
}

export async function leaveDrop(
  req: FastifyRequest<{ Params: DropIdParam; Body: LeaveDropBody }>,
  reply: FastifyReply
) {
  const { id } = req.params;
  const userId = req.body.userId;

  await S.leaveWaitlist(userId, id);

  return reply.code(204).send();
}

export async function claimDrop(
  req: FastifyRequest<{ Params: DropIdParam; Body: ClaimDropBody}>,
  reply: FastifyReply
) {
  const { id } = req.params;
  const userId = req.body.userId;

  const res = await S.claimDrop(userId, id);

  return reply.code(200).send(res);
}

