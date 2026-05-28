"use server";

import { authApi } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/types";

export type ResendVerificationResult =
  | { success: true; expiresAt: string }
  | { success: false; error: string; retryAfterSeconds?: number };

export async function resendVerificationAction(): Promise<ResendVerificationResult> {
  try {
    const { expiresAt } = await authApi.sendEmailVerification();
    return { success: true, expiresAt };
  } catch (e) {
    if (isApiError(e, 429)) {
      const body = e.body as { retryAfter?: number } | null;
      const retry = typeof body?.retryAfter === "number" ? body.retryAfter : 60;
      return {
        success: false,
        error: `Please wait ${retry}s before requesting another code.`,
        retryAfterSeconds: retry,
      };
    }
    if (isApiError(e, 400)) {
      const raw = Array.isArray(e.body?.message) ? e.body?.message[0] : e.body?.message;
      return { success: false, error: raw ?? "Couldn't send the code." };
    }
    if (isApiError(e, 503)) {
      return {
        success: false,
        error: "Email service is unavailable. Try again in a minute.",
      };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
