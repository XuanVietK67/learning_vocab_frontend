"use server";

import { redirect } from "next/navigation";
import { learnApi, type StartSessionInput } from "@/lib/api/learn";
import { isApiError } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";

export type StartSessionResult =
  | { success: true; redirect: string }
  | { success: false; error: string };

export async function startSessionAction(
  input: StartSessionInput,
): Promise<StartSessionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "You're signed out. Sign in to start a session." };
  }
  if (!user.isOnboarded) {
    return { success: false, error: "Finish setup before starting a session." };
  }

  const body: StartSessionInput = {
    mode: input.mode,
    limit: input.limit,
    translationLang: input.translationLang ?? user.nativeLanguage ?? undefined,
  };
  if (input.mode === "topic") body.topicSlug = input.topicSlug;
  if (input.mode === "deck") body.deckId = input.deckId;

  if (body.mode === "topic" && !body.topicSlug) {
    return { success: false, error: "Pick a topic to start." };
  }
  if (body.mode === "deck" && !body.deckId) {
    return { success: false, error: "Pick a deck to start." };
  }

  try {
    const session = await learnApi.startSession(body);
    if (session.items.length === 0) {
      return { success: false, error: emptyMessage(session.emptyReason) };
    }
    redirect(`/learn/${session.sessionId}`);
  } catch (e) {
    // Next's redirect throws — let it propagate
    if (e && typeof e === "object" && "digest" in e) throw e;

    if (isApiError(e, 400)) {
      const msg = Array.isArray(e.body?.message) ? e.body.message[0] : e.body?.message;
      return { success: false, error: msg ?? "Couldn't start the session." };
    }
    if (isApiError(e, 401)) {
      return { success: false, error: "Your session expired. Sign in again." };
    }
    return { success: false, error: "Something went wrong. Please try again." };
  }

  // unreachable — redirect() throws
  return { success: false, error: "Couldn't start the session." };
}

function emptyMessage(reason: string | null): string {
  switch (reason) {
    case "no_due_cards":
      return "All caught up — come back later for review.";
    case "no_enrollment":
      return "No enrolled words yet. Try Daily or pick a topic to begin.";
    case "no_more_at_level":
      return "No more words at your level here. Try a different topic.";
    case "deck_exhausted":
      return "Deck mastered for now — review later.";
    default:
      return "Nothing to learn right now.";
  }
}
