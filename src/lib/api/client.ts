import "server-only";
import { ApiError, type ApiErrorBody, type AuthResponse } from "./types";
import {
  readAccessToken,
  readRefreshToken,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | undefined>;
};

let refreshInFlight: Promise<string | null> | null = null;

async function rawFetch<T>(
  path: string,
  opts: RequestOptions,
  token: string | null,
): Promise<T> {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, BASE_URL);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url.toString(), {
    method: opts.method ?? "GET",
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: "no-store",
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const json = text ? safeParseJson(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, json as ApiErrorBody | null);
  }
  return (json ?? undefined) as T;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function refreshOnce(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const refreshToken = await readRefreshToken();
      if (!refreshToken) return null;
      const auth = await rawFetch<AuthResponse>(
        "/v1/auth/refresh",
        { method: "POST", body: { refreshToken } },
        null,
      );
      await setAuthCookies(auth);
      return auth.accessToken;
    } catch {
      await clearAuthCookies();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const needsAuth = opts.auth ?? true;
  let token = needsAuth ? await readAccessToken() : null;

  try {
    return await rawFetch<T>(path, opts, token);
  } catch (e) {
    if (!(e instanceof ApiError) || e.status !== 401 || !needsAuth) throw e;
    token = await refreshOnce();
    if (!token) throw e;
    return await rawFetch<T>(path, opts, token);
  }
}
