import { getToken } from "./auth";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const headers = new Headers(init.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const hasBody = init.body != null;
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    throw new Error(`API error: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
