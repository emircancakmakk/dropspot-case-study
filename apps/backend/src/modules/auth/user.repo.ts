// src/modules/auth/user.repo.ts
import { prisma } from '../../plugins/prisma'
import type { Role } from '../../types/fastify-jwt'

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export function create(data: { email: string; password: string; fullName: string; role?: Role }) {
  return prisma.user.create({
    data: {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: data.role ?? 'USER',
    },
  })
}
