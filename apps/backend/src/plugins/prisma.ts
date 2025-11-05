// src/plugins/prisma.ts
import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

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
