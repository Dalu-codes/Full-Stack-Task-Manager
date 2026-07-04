import { apiRequest, setSession, clearSession, ApiError } from "./client";

export interface Credentials {
  username: string;
  password: string;
}

const AUTH_BASE = "/auth";

/**
 * Registers the account, then logs in with the same credentials.
 * signUp's response has no `data`/token field — it only confirms
 * registration ({ StatusCode, message }) — so a session has to come from
 * a follow-up login call.
 */
export async function signUp(credentials: Credentials): Promise<string> {
  await apiRequest<void>(`${AUTH_BASE}/signUp`, {
    method: "POST",
    body: credentials,
    auth: false,
  });
  return login(credentials);
}

/**
 * login's response does return the raw JWT (either as the `data` field of
 * the Response<T> envelope, or as a bare string body — apiRequest handles
 * either shape).
 */
export async function login(credentials: Credentials): Promise<string> {
  const token = await apiRequest<string>(`${AUTH_BASE}/login`, {
    method: "POST",
    body: credentials,
    auth: false,
  });
  if (typeof token !== "string" || token.length === 0) {
    throw new ApiError("Login succeeded but the server didn't return a token. Check the login response shape.", 0);
  }
  setSession(token, credentials.username);
  return token;
}

export function logout(): void {
  clearSession();
}
