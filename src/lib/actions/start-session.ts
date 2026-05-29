"use server";

import {
  learnApi,
  type EmptyReason,
  type LearnSession,
  type StartSessionInput,
} from "@/lib/api/learn";
import { isApiError } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";

export type StartSessionResult =
  | { success: true; session: LearnSession; translationLang: string | null }
  /** Picker found nothing — surface a reason-aware empty state, not a toast. */
  | { success: false; kind: "empty"; reason: EmptyReason | null; nextDueAt: string | null }
  /** Real failure (validation, auth, network) — surface a transient toast. */
  | { success: false; kind: "error"; error: string };

export async function startSessionAction(
  input: StartSessionInput,
): Promise<StartSessionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      success: false,
      kind: "error",
      error: "You're signed out. Sign in to start a session.",
    };
  }
  if (!user.isOnboarded) {
    return { success: false, kind: "error", error: "Finish setup before starting a session." };
  }

  const translationLang = input.translationLang ?? user.nativeLanguage ?? undefined;
  const body: StartSessionInput = {
    mode: input.mode,
    limit: input.limit,
    translationLang,
  };
  if (input.mode === "topic") body.topicSlug = input.topicSlug;
  if (input.mode === "deck") body.deckId = input.deckId;

  if (body.mode === "topic" && !body.topicSlug) {
    return { success: false, kind: "error", error: "Pick a topic to start." };
  }
  if (body.mode === "deck" && !body.deckId) {
    return { success: false, kind: "error", error: "Pick a deck to start." };
  }

  try {
    const session = await learnApi.startSession(body);
    if (session.items.length === 0) {
      return {
        success: false,
        kind: "empty",
        reason: session.emptyReason,
        nextDueAt: session.nextDueAt,
      };
    }
    return { success: true, session, translationLang: translationLang ?? null };
  } catch (e) {
    if (isApiError(e, 400)) {
      const msg = Array.isArray(e.body?.message) ? e.body.message[0] : e.body?.message;
      return { success: false, kind: "error", error: msg ?? "Couldn't start the session." };
    }
    if (isApiError(e, 401)) {
      return { success: false, kind: "error", error: "Your session expired. Sign in again." };
    }
    return { success: false, kind: "error", error: "Something went wrong. Please try again." };
  }
}
