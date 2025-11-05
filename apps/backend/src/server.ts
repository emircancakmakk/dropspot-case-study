// src/server.ts
import Fastify from 'fastify'
import prismaPlugin from './plugins/prisma'
import authRoutes from './modules/auth'

const app = Fastify({ logger: true })
await app.register(prismaPlugin)

app.setErrorHandler((err, req, reply) => {
  const status = (err as any).status ?? 500
  const code = (err as any).code ?? 'internal_error'
  req.log.error(err)
  reply.code(status).send({ error: code })
})

await app.register(authRoutes, { prefix: '/api' })
app.listen({ port: 3000 })
