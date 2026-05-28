"use server";

import { revalidatePath } from "next/cache";
import { isApiError } from "@/lib/api/types";
import { usersApi } from "@/lib/api/users";
import { getCurrentUser } from "@/lib/auth/session";
import { OnboardingSchema, type OnboardingInput } from "@/lib/validators/onboarding";
import { flattenZod, type ActionResult } from "./result";

export async function submitOnboardingAction(input: OnboardingInput): Promise<ActionResult> {
  const parsed = OnboardingSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You're signed out. Sign in again to finish setup." };
  }

  try {
    await usersApi.update(user.id, parsed.data);
    revalidatePath("/", "layout");
    return { success: true, redirect: "/" };
  } catch (e) {
    if (isApiError(e, 400)) {
      const msg = Array.isArray(e.body?.message) ? e.body.message[0] : e.body?.message;
      return { success: false, error: msg ?? "Please check your selections and try again." };
    }
    if (isApiError(e, 401)) {
      return { success: false, error: "Your session expired. Sign in again to finish setup." };
    }
    if (isApiError(e, 403)) {
      return { success: false, error: "You don't have permission to update this account." };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
