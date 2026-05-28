import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
} from "@/lib/auth/cookie-config";
import type { AuthResponse } from "@/lib/api/types";

const AUTH_PUBLIC_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/2fa",
]);

const BASE_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

type RefreshResult =
  | { ok: true; access: string; refresh: string }
  | { ok: false };

async function refreshTokens(refreshToken: string): Promise<RefreshResult> {
  try {
    const res = await fetch(`${BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false };
    const auth = (await res.json()) as AuthResponse;
    return { ok: true, access: auth.accessToken, refresh: auth.refreshToken };
  } catch {
    return { ok: false };
  }
}

function applyAuthCookies(
  response: NextResponse,
  access: string,
  refresh: string,
) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: REFRESH_MAX_AGE,
  });
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OAuth callback routes must always be reachable so the browser can complete the exchange.
  if (pathname.startsWith("/callback/")) {
    return NextResponse.next();
  }

  let access = request.cookies.get(ACCESS_COOKIE)?.value ?? null;
  const refresh = request.cookies.get(REFRESH_COOKIE)?.value ?? null;

  // Access cookie expired (15m TTL) but refresh cookie still alive → rotate
  // here so the rendered page sees a fresh token and the browser keeps the
  // session. Doing this in proxy is the only place we can mutate cookies
  // before RSC reads them (cookies() is read-only inside Server Components).
  let refreshFailed = false;
  let rotated: { access: string; refresh: string } | null = null;
  if (!access && refresh) {
    const result = await refreshTokens(refresh);
    if (result.ok) {
      rotated = { access: result.access, refresh: result.refresh };
      access = result.access;
      // Propagate the new access token to the current request so downstream
      // RSC/Route Handlers see it via cookies().get().
      request.cookies.set(ACCESS_COOKIE, result.access);
      request.cookies.set(REFRESH_COOKIE, result.refresh);
    } else {
      refreshFailed = true;
    }
  }

  const hasSession = !!access || (!!refresh && !refreshFailed);

  // Bounce signed-in users away from login/register.
  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    const response = NextResponse.redirect(new URL("/", request.url));
    if (rotated) applyAuthCookies(response, rotated.access, rotated.refresh);
    return response;
  }

  // Anonymous users hitting a non-public route → /login (with ?next= so we can bounce back).
  if (!hasSession && !AUTH_PUBLIC_ROUTES.has(pathname) && pathname !== "/") {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    const response = NextResponse.redirect(url);
    if (refreshFailed) clearAuthCookies(response);
    return response;
  }

  // The isOnboarded gate (redirect to /onboarding when false) lives in the
  // (onboarding) layout via getCurrentUser, not here — middleware can't read
  // server-only cookies through the API without an extra round-trip per nav.

  const response = NextResponse.next({
    request: { headers: request.headers },
  });
  if (rotated) applyAuthCookies(response, rotated.access, rotated.refresh);
  else if (refreshFailed) clearAuthCookies(response);
  return response;
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
