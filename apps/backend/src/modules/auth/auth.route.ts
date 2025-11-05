// src/modules/auth/auth.route.ts
import { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import * as C from './auth.controller'
import { SigninBody, SignupBody } from './auth.schema'

export default async function routes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();

  r.post('/auth/signup', {
    schema: { body: SignupBody }
  }, C.signup)

  r.post('/auth/signin', {
    schema: { body: SigninBody }
  }, C.signin)


  // örnek health
  r.get('/health', {}, async () => ({ ok: true }))
}
