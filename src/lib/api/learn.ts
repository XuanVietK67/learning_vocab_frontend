import "server-only";
import { request } from "./client";

export type LearnMode = "daily" | "topic" | "deck" | "review";

export type StartSessionInput = {
  mode: LearnMode;
  topicSlug?: string;
  deckId?: string;
  limit?: number;
  translationLang?: string;
};

export type EmptyReason =
  | "no_due_cards"
  | "no_enrollment"
  | "no_more_at_level"
  | "deck_exhausted";

export type LearnSession = {
  sessionId: string;
  mode: LearnMode;
  enrolledNewlyCount: number;
  emptyReason: EmptyReason | null;
  items: Array<{
    sessionItemId: string;
    vocabularyId: string;
    lemma: string;
    exampleId: string | null;
    type: string;
    nonce: string;
    issuedAtMs: number;
    signature: string;
    prompt: unknown;
  }>;
};

export const learnApi = {
  startSession: (body: StartSessionInput) =>
    request<LearnSession>("/v1/me/learn/session", { method: "POST", body }),
};
