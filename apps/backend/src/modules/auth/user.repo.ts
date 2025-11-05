// src/modules/auth/user.repo.ts
import { prisma } from '../../plugins/prisma'

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export function create(data: { email: string; password: string, fullName: string }) {
  return prisma.user.create({ data })
}

export async function comparePassword(plainText: string, hash: string) {
  const { compare } = await import('bcryptjs')
  return compare(plainText, hash)
}