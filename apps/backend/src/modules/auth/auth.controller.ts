// src/modules/auth/auth.controller.ts
import { FastifyReply, FastifyRequest } from 'fastify'
import * as S from './auth.service'
import { SigninBody, SignupBody } from './auth.schema'

export async function signup(
  req: FastifyRequest<{ Body: SignupBody }>,
  reply: FastifyReply
) {
  const { email, password, fullName } = req.body
  const user = await S.signup({ email, password, fullName })
  const accessToken = await reply.jwtSign({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
  return reply.code(201).send({
    status: 'success',
    message: 'Kullanıcı kaydı tamamlandı.',
    user,
    accessToken,
  })
}

export async function signin(
  req: FastifyRequest<{ Body: SigninBody }>,
  reply: FastifyReply
) {
  const { email, password } = req.body
  const user = await S.signin({ email, password })
  const accessToken = await reply.jwtSign({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
  return reply.code(200).send({
    status: 'success',
    message: 'Giriş başarılı.',
    user,
    accessToken,
  })
}
