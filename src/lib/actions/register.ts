"use server";

import { authApi } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/types";
import { setAuthCookies } from "@/lib/auth/cookies";
import { maybeSendVerification } from "@/lib/auth/maybe-send-verification";
import { postAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { RegisterSchema, type RegisterInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "./result";

export async function registerAction(
  input: RegisterInput,
): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  try {
    const auth = await authApi.register({
      email: parsed.data.email,
      password: parsed.data.password,
      username: parsed.data.username,
    });
    await setAuthCookies(auth);
    await maybeSendVerification(auth.user);
    return { success: true, redirect: postAuthRedirect(auth.user) };
  } catch (e) {
    if (isApiError(e, 409)) {
      return {
        success: false,
        error:
          "An account with this email or username already exists. Try signing in instead.",
      };
    }
    if (isApiError(e, 400)) {
      const body = e.body;
      const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
      return {
        success: false,
        error: msg ?? "Please check your details and try again.",
      };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
