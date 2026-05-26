"use server";

// STUB: replace body with api.resetPassword(input) once backend ships POST /v1/auth/reset-password.

import { ResetSchema, type ResetInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "../result";

export async function resetPasswordAction(
  input: ResetInput,
): Promise<ActionResult> {
  const parsed = ResetSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  await new Promise((r) => setTimeout(r, 900));
  return { success: true, redirect: "/login" };
}
