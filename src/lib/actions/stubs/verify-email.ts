"use server";

// STUB: replace body with api.verifyEmail(input) once backend ships POST /v1/auth/verify-email.

import { VerifyEmailSchema, type VerifyEmailInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "../result";

export async function verifyEmailAction(
  input: VerifyEmailInput,
): Promise<ActionResult> {
  const parsed = VerifyEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  await new Promise((r) => setTimeout(r, 600));
  return { success: true, redirect: "/login" };
}
