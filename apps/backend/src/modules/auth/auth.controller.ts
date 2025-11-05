// src/modules/auth/auth.controller.ts
import { FastifyReply, FastifyRequest } from 'fastify'
import * as S from './auth.service'
import { SigninBody, SignupBody } from './auth.schema'

export async function signup(
  req: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) {
  const { email, password, fullName } = req.body
  const result = await S.signup({ email, password, fullName})
  return reply.code(200).send({
    status: "success",
    message: "Kullanıcı kaydı tamamlandı.",
    user: result,
  });
  
}

export async function signin(
  req: FastifyRequest<{ Body: SigninBody }>,
  reply: FastifyReply
) {
  const { email, password } = req.body
  const result = await S.signin({ email, password })
  return reply.code(200).send(
    {
      status: "success",
      message: "Giriş başarılı.",
      user: result,
    }
  )
}
