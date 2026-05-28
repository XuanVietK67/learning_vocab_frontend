import type { UserResponse } from "@/lib/api/types";

// Single source of truth for "where does the user go after they authenticate?"
//   1. email not verified  → /verify-email
//   2. admin → /admin (skips onboarding; admins don't go through learner setup)
//   3. verified but not onboarded → /onboarding
//   4. fully set up → `fallback` (default /)
//
// Every auth entry point (sign-in, register, OAuth, refresh-completion) routes
// through here so the gating chain stays consistent.
export function postAuthRedirect(user: UserResponse, fallback = "/"): string {
  if (!user.isEmailVerified) {
    return `/verify-email?email=${encodeURIComponent(user.email)}`;
  }
  if (user.role === "admin") {
    return "/admin";
  }
  if (!user.isOnboarded) {
    return "/onboarding";
  }
  return fallback;
}

// Paths that gate access to the app. The login form uses this to decide whether
// an action redirect should win over a `?next=` URL — gates always win, since
// the user can't reach the requested page until they clear the gate.
const AUTH_GATES = new Set(["/verify-email", "/onboarding"]);

export function isAuthGate(path: string): boolean {
  const [base] = path.split("?");
  return AUTH_GATES.has(base);
}
