import "server-only";
import { authApi } from "@/lib/api/auth";
import type { UserResponse } from "@/lib/api/types";

// Fires POST /v1/auth/email/send-verification when the user just authenticated
// and still needs to verify. Best-effort: 429 (cooldown — previous code still
// valid) and 503 (SMTP outage) are swallowed so we never block the redirect
// to /verify-email. The user can always trigger a manual resend there.
export async function maybeSendVerification(user: UserResponse): Promise<void> {
  if (user.isEmailVerified) return;
  try {
    await authApi.sendEmailVerification();
  } catch {
    // swallow — verify-email page has a Resend button
  }
}
