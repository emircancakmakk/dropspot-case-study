// src/modules/auth/auth.schema.ts
import { z } from 'zod'

export const SignupBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
})
export type SignupBody = z.infer<typeof SignupBody>

export const SigninBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})
export type SigninBody = z.infer<typeof SigninBody>