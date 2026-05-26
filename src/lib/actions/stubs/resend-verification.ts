"use server";

// STUB: replace body with api.resendVerification(input) once backend ships POST /v1/auth/resend-verification.

import {
  ResendVerificationSchema,
  type ResendVerificationInput,
} from "@/lib/validators/auth";
import { flattenZod, type ActionFailure } from "../result";

const lastSent = new Map<string, number>();
const COOLDOWN_MS = 30_000;

type ResendResult = ActionFailure | { success: true; cooldownSeconds: number };

export async function resendVerificationAction(
  input: ResendVerificationInput,
): Promise<ResendResult> {
  const parsed = ResendVerificationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  const key = parsed.data.email.toLowerCase();
  const now = Date.now();
  const last = lastSent.get(key) ?? 0;
  const elapsed = now - last;
  if (elapsed < COOLDOWN_MS) {
    return {
      success: false,
      error: `Please wait ${Math.ceil((COOLDOWN_MS - elapsed) / 1000)}s before resending.`,
    };
  }
  lastSent.set(key, now);
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, cooldownSeconds: COOLDOWN_MS / 1000 };
}
