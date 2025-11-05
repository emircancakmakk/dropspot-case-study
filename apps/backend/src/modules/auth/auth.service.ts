// src/modules/auth/auth.service.ts
import { hash, compare } from "bcryptjs"
import * as R from "./user.repo"
import { AppError } from "../../shared/errors"
import type { Role } from "../../types/fastify-jwt"

type SignupInput = { email: string; password: string; fullName: string; role?: Role }
type SigninInput = { email: string; password: string }

export async function signup({ email, password, fullName, role }: SignupInput) {
  const exists = await R.findByEmail(email)
  if (exists) throw new AppError(409, "email_in_use", "Bu e-posta adresi zaten kayıtlı.")

  const passwordHash = await hash(password, 10)

  const user = await R.create({
    email,
    password: passwordHash,
    fullName,
    role: role ?? "USER",
  })

  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role as Role }
}

export async function signin({ email, password }: SigninInput) {
  const exists = await R.findByEmail(email)
  if (!exists) throw new AppError(401, "email_not_exist", "Bu email adresi ile kayıtlı kullanıcı bulunamadı.")

  const ok = await compare(password, exists.password)
  if (!ok) throw new AppError(401, "invalid_credentials", "Email veya şifre hatalı.")

  return { id: exists.id, email: exists.email, fullName: exists.fullName, role: exists.role as Role }
}
