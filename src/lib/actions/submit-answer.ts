"use server";

import { learnApi, type AnswerResult, type SubmitAnswerInput } from "@/lib/api/learn";
import { isApiError } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";

export type SubmitAnswerResult =
  | { success: true; result: AnswerResult }
  | { success: false; error: string; expired?: boolean };

export async function submitAnswerAction(
  input: SubmitAnswerInput,
): Promise<SubmitAnswerResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You're signed out. Sign in again." };
  }

  try {
    const result = await learnApi.submitAnswer(input);
    return { success: true, result };
  } catch (e) {
    if (isApiError(e, 401)) {
      return {
        success: false,
        expired: true,
        error: "This session expired. Start a new one to keep learning.",
      };
    }
    if (isApiError(e, 404)) {
      return { success: false, error: "We couldn't find that word. Skip to the next one." };
    }
    if (isApiError(e, 400)) {
      const msg = Array.isArray(e.body?.message) ? e.body.message[0] : e.body?.message;
      return { success: false, error: msg ?? "Couldn't grade that answer." };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
