"use server";

import { authApi } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/types";
import { setAuthCookies } from "@/lib/auth/cookies";
import { SignInSchema, type SignInInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "./result";

export async function signInAction(input: SignInInput): Promise<ActionResult> {
  const parsed = SignInSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  try {
    const auth = await authApi.login({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    await setAuthCookies(auth);
    return { success: true, redirect: auth.user.isEmailVerified ? "/" : `/verify-email?email=${encodeURIComponent(auth.user.email)}` };
  } catch (e) {
    if (isApiError(e, 401)) {
      return {
        success: false,
        error: "Incorrect email or password. Try again or reset your password.",
      };
    }
    if (isApiError(e, 429)) {
      return {
        success: false,
        error: "Too many attempts. Please try again in a few minutes.",
      };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
