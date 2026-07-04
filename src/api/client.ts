import type { ApiResponse } from "../types";

// Point this at your Spring Boot backend. Override at build time with
// VITE_API_BASE_URL if it's not running on localhost:8080.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081/api";

const TOKEN_KEY = "todotask.token";
const USERNAME_KEY = "todotask.username";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setSession(token: string, username: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  auth?: boolean; // attach Authorization header, defaults true
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Calls the backend and unwraps the { statusCode, message, data } envelope.
 * Throws ApiError on network failure, non-2xx status, or a 401 (also clears
 * the stored session on 401 so the app can redirect to login).
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, auth = true } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the server. Is the backend running?", 0);
  }

  if (res.status === 401) {
    clearSession();
    throw new ApiError("Your session has expired. Please log in again.", 401);
  }

  // Some endpoints (e.g. a raw-JWT login) may not use the Response<T> envelope.
  const text = await res.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text; // plain-text body, e.g. a bare token string
    }
  }

  if (!res.ok) {
    const message =
      (parsed as Partial<ApiResponse<unknown>> | null)?.message ??
      (typeof parsed === "string" ? parsed : `Request failed with status ${res.status}`);
    throw new ApiError(message, res.status);
  }

  // Envelope response: { StatusCode, message, data? }. Only unwrap `data`
  // when the key is actually present — some endpoints (e.g. signUp) return
  // just { StatusCode, message } with no payload at all. Returning the raw
  // envelope in that case previously caused a real bug (see signUp/login in
  // src/api/auth.ts): a caller expecting a plain token string instead got
  // the whole { StatusCode, message } object, which silently stringified to
  // "[object Object]" when written to localStorage. Returning `undefined`
  // here instead makes that failure visible immediately.
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    if ("data" in obj) return obj.data as T;
    if ("StatusCode" in obj || "statusCode" in obj) return undefined as T;
  }

  // Plain body (string/number/etc.)
  return parsed as T;
}
