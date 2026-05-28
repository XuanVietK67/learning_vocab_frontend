"use server";

import { postAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { getCurrentUser } from "@/lib/auth/session";

// Re-checks the current user against /v1/auth/me and reports where they should
// go next. Used by the "I've verified — continue" button on /verify-email so
// the user doesn't have to re-enter their password just to refresh the
// isEmailVerified flag.
export type CheckVerificationResult =
  | { state: "ok"; redirect: string }
  | { state: "still-unverified" }
  | { state: "unauthenticated" };

export async function checkVerificationAction(): Promise<CheckVerificationResult> {
  const user = await getCurrentUser();
  if (!user) return { state: "unauthenticated" };
  if (!user.isEmailVerified) return { state: "still-unverified" };
  return { state: "ok", redirect: postAuthRedirect(user) };
}
