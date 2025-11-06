// src/plugins/prisma.ts
import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'

export const prisma = new PrismaClient()

export default fp(async (app) => {
  await prisma.$connect()
  app.decorate('prisma', prisma)
  app.addHook('onClose', async (app) => prisma.$disconnect())
})

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
