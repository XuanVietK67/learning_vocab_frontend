"use server";

// STUB: replace body with api.verifyOtp(input) once backend ships POST /v1/auth/2fa/verify.

import { OtpSchema, type OtpInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "../result";

export async function verifyOtpAction(input: OtpInput): Promise<ActionResult> {
  const parsed = OtpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  await new Promise((r) => setTimeout(r, 600));
  if (parsed.data.code === "111111") {
    return {
      success: false,
      error: "That code didn't match. Try the latest one we sent.",
    };
  }
  return { success: true, redirect: "/" };
}
