import { cookies } from "next/headers"

export async function setAuth(token: string, role: string) {
  const cookieStore = await cookies()
  
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  })
  
  cookieStore.set("role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  })
}

export async function clearAuth() {
  const cookieStore = await cookies()
  
  cookieStore.delete("token")
  cookieStore.delete("role")
}

export async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get("token")?.value
}

export async function getRole(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get("role")?.value
}

export async function getAuth() {
  const cookieStore = await cookies()
  
  return {
    token: cookieStore.get("token")?.value,
    role: cookieStore.get("role")?.value,
    isAuthenticated: !!cookieStore.get("token")?.value
  }
}

export async function isAdmin(): Promise<boolean> {
  const role = await getRole()
  return role === "ADMIN"
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken()
  return !!token
}