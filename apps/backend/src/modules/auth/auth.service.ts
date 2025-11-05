// src/modules/auth/auth.service.ts
import { hash, compare } from "bcryptjs";
import * as R from "./user.repo";
import { AppError } from "../../shared/errors";

type SignupInput = { email: string; password: string; fullName: string };
type SigninInput = { email: string; password: string; };

export async function signup({ email, password, fullName }: SignupInput) {
  const exists = await R.findByEmail(email);
  if (exists) throw new AppError(409, "email_in_use", "Bu e-posta adresi zaten kayıtlı.");

  const passwordHash = await hash(password, 10);

  const user = await R.create({ email, password: passwordHash, fullName });
  return { id: user.id, email: user.email, fullName: user.fullName };
}

export async function signin({ email, password }: SigninInput) {
  const exists = await R.findByEmail(email);
  if (!exists) throw new AppError(401, "email_not_exist", "Bu email adresi ile kayıtlı kullanıcı bulunamadı.");

  const isPasswordValid = await compare(password, exists.password);

  if (!isPasswordValid) throw new AppError(401, "invalid_credentials", "Email veya şifre hatalı.");

  return { id: exists.id, email: exists.email, fullName: exists.fullName };
}
