"use server";

import { redirect } from "next/navigation";
import { setAuth, clearAuth } from "@/lib/auth";
import { api } from "@/lib/api";

import type {
  ActionResponse,
  SignInResponse,
  SignUpResponse,
} from "@/lib/types";

// Yardımcı: NEXT_REDIRECT kontrolü
function isNextRedirect(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e).digest === "string" &&
    (e).digest.startsWith("NEXT_REDIRECT")
  );
}

// Sign In Action
export async function signInAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // 1) Senkron validasyonlar
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !email.includes("@")) {
    return { success: false, error: "Geçerli bir email adresi giriniz" };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Şifre en az 6 karakter olmalıdır" };
  }

  // 2) API + setAuth hatalarını yakala
  try {
    const response = await api<SignInResponse>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    await setAuth(response.accessToken, response.user.role);
  } catch (e) {
    if (isNextRedirect(e)) throw e; // yönlendirmeyi engelleme
    console.error("Sign in error:", e);
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Giriş yapılırken bir hata oluştu",
    };
  }

  // 3) Yönlendirme catch dışında
  redirect("/"); // role'e göre istiyorsan burada koşullandır
}

// Sign Up Action
export async function signUpAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  // 1) Senkron validasyonlar
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!fullName || fullName.length < 2) {
    return { success: false, error: "İsim en az 2 karakter olmalıdır" };
  }
  if (!email || !email.includes("@")) {
    return { success: false, error: "Geçerli bir email adresi giriniz" };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "Şifre en az 6 karakter olmalıdır" };
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Şifreler eşleşmiyor" };
  }

  // 2) API + setAuth hatalarını yakala
  try {
    const response = await api<SignUpResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName, email, password }),
    });

    await setAuth(response.accessToken, response.user.role);
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    console.error("Sign up error:", e);
    return {
      success: false,
      error:
        e instanceof Error ? e.message : "Kayıt olurken bir hata oluştu",
    };
  }

  // 3) Yönlendirme catch dışında
  redirect("/");
}

// Sign Out Action
export async function signOutAction() {
  // try/catch şart değil; ama yazacaksan NEXT_REDIRECT’i rethrow et
  try {
    await clearAuth();
  } catch (e) {
    if (isNextRedirect(e)) throw e;
    throw e;
  }
  redirect("/signin");
}
