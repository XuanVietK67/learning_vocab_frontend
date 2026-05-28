"use server";

import { authApi } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/types";
import { postAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { getCurrentUser } from "@/lib/auth/session";
import { OtpSchema, type OtpInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "./result";

type VerifyEmailExtra = {
  attemptsRemaining?: number;
  needsResend?: boolean;
};

export type VerifyEmailResult = ActionResult & VerifyEmailExtra;

export async function verifyEmailAction(
  input: OtpInput,
): Promise<VerifyEmailResult> {
  const parsed = OtpSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }

  try {
    const user = await authApi.verifyEmail(parsed.data.code);
    return { success: true, redirect: postAuthRedirect(user) };
  } catch (e) {
    if (isApiError(e, 400)) {
      const body = e.body;
      const raw = Array.isArray(body?.message) ? body.message[0] : body?.message;
      const msg = (raw ?? "").toLowerCase();

      if (msg.includes("already verified")) {
        const user = await getCurrentUser();
        return {
          success: true,
          redirect: user ? postAuthRedirect(user) : "/",
        };
      }

      if (msg.includes("no active verification code")) {
        return {
          success: false,
          error: "Your code has expired. Tap Resend code to get a new one.",
          needsResend: true,
        };
      }

      if (msg.includes("too many attempts")) {
        return {
          success: false,
          error: "Too many wrong tries. Tap Resend code to get a new one.",
          needsResend: true,
        };
      }

      if (msg.includes("invalid code")) {
        const extra = body as unknown as { attemptsRemaining?: number } | null;
        const remaining =
          typeof extra?.attemptsRemaining === "number"
            ? extra.attemptsRemaining
            : undefined;
        return {
          success: false,
          error:
            remaining !== undefined
              ? `Wrong code — ${remaining} attempt${remaining === 1 ? "" : "s"} left.`
              : "Wrong code. Try again.",
          attemptsRemaining: remaining,
        };
      }

      return { success: false, error: raw ?? "Couldn't verify the code." };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
