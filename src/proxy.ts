import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PUBLIC_ROUTES = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/2fa",
]);


const ACCESS_COOKIE = "lexa_access";
const REFRESH_COOKIE = "lexa_refresh";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    !!request.cookies.get(ACCESS_COOKIE)?.value ||
    !!request.cookies.get(REFRESH_COOKIE)?.value;

  // OAuth callback routes must always be reachable so the browser can complete the exchange.
  if (pathname.startsWith("/callback/")) {
    return NextResponse.next();
  }

  // Bounce signed-in users away from login/register.
  if (hasSession && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Anonymous users hitting a non-public route → /login (with ?next= so we can bounce back).
  if (!hasSession && !AUTH_PUBLIC_ROUTES.has(pathname) && pathname !== "/") {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // The isOnboarded gate (redirect to /onboarding when false) lives in the
  // (onboarding) layout via getCurrentUser, not here — middleware can't read
  // server-only cookies through the API without an extra round-trip per nav.

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
