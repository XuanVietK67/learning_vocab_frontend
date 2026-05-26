import { cookies } from "next/headers";
import type { AuthResponse } from "@/lib/api/types";

export const ACCESS_COOKIE = "lexa_access";
export const REFRESH_COOKIE = "lexa_refresh";

const ACCESS_MAX_AGE = 60 * 15;           // 15m, matches backend JWT lifetime
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30d, matches backend refresh lifetime

export async function setAuthCookies(auth: AuthResponse) {
  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  jar.set(ACCESS_COOKIE, auth.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  jar.set(REFRESH_COOKIE, auth.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function readAccessToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(ACCESS_COOKIE)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(REFRESH_COOKIE)?.value ?? null;
}
