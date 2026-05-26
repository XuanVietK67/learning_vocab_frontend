"use server";

// STUB: replace body with api.forgotPassword(input) once backend ships POST /v1/auth/forgot-password.

import { ForgotSchema, type ForgotInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "../result";

export async function forgotPasswordAction(
  input: ForgotInput,
): Promise<ActionResult> {
  const parsed = ForgotSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  await new Promise((r) => setTimeout(r, 800));
  return { success: true };
}
