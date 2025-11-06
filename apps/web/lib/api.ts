import { getToken } from "./auth";

class ApiError extends Error {
  code?: string;
  statusCode: number;

  constructor(message: string, code?: string, statusCode: number = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

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

  console.log("API Request:", {
    url: `${process.env.NEXT_PUBLIC_API_URL}${path}`,
    method: init.method || "GET",
    headers: Object.fromEntries(headers.entries()),
    body: init.body,
  });

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    cache: "no-store",
    ...init,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new ApiError("UNAUTHORIZED", "unauthorized", 401);
    }
    
    try {
      const errorData = await res.json();
      throw new ApiError(
        errorData.message || `API error: ${res.status}`,
        errorData.error,
        res.status
      );
    } catch (parseError) {
      if (parseError instanceof ApiError) throw parseError;
      throw new ApiError(`API error: ${res.status}`, undefined, res.status);
    }
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}