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

/* ── Question prompt shapes (discriminated by `type`) ───────────────── */

export type ClozeMcqPrompt = {
  type: "cloze_mcq";
  sentenceWithBlank: string;
  hintTranslation: string | null;
  audioUrl: string | null;
  options: string[];
};

export type ClozeTypingPrompt = {
  type: "cloze_typing";
  sentenceWithBlank: string;
  hintTranslation: string | null;
  audioUrl: string | null;
};

export type MeaningInContextPrompt = {
  type: "meaning_in_context";
  sentence: string;
  highlightedSpan: { start: number; end: number };
  options: string[];
};

export type SentenceBuildPrompt = {
  type: "sentence_build";
  translation: string;
  tokens: string[];
};

export type SenseDisambiguationPrompt = {
  type: "sense_disambiguation";
  sentences: Array<{ exampleId: string; sentence: string }>;
  options: string[];
};

export type ListeningClozePrompt = {
  type: "listening_cloze";
  audioUrl: string;
  sentenceWithBlank: string;
  hintTranslation: string | null;
  options: string[];
};

export type LearnPrompt =
  | ClozeMcqPrompt
  | ClozeTypingPrompt
  | MeaningInContextPrompt
  | SentenceBuildPrompt
  | SenseDisambiguationPrompt
  | ListeningClozePrompt;

export type LearnQuestionType = LearnPrompt["type"];

export type LearnItem = {
  sessionItemId: string;
  vocabularyId: string;
  lemma: string;
  exampleId: string | null;
  type: LearnQuestionType;
  nonce: string;
  issuedAtMs: number;
  signature: string;
  prompt: LearnPrompt;
};

export type LearnSession = {
  sessionId: string;
  mode: LearnMode;
  enrolledNewlyCount: number;
  emptyReason: EmptyReason | null;
  /**
   * ISO timestamp of the soonest future-scheduled card. Populated only for the
   * time-based empty reason (`no_due_cards`); null otherwise — the other
   * reasons need a different action, not a clock.
   */
  nextDueAt: string | null;
  items: LearnItem[];
};

/* ── Answer submission ──────────────────────────────────────────────── */

export type ProgressRow = {
  id: string;
  vocabularyId: string;
  status: "new" | "learning" | "review" | "mastered";
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: string;
  lastReviewedAt: string;
  correctCount: number;
  incorrectCount: number;
};

export type SubmitAnswerInput = {
  vocabularyId: string;
  type: LearnQuestionType;
  exampleId: string | null;
  userAnswer: string;
  latencyMs: number;
  nonce: string;
  issuedAtMs: number;
  signature: string;
  translationLang?: string;
  sessionId: string;
};

export type AnswerResult = {
  correct: boolean;
  correctAnswer: string;
  quality: number;
  progress: ProgressRow;
};

export const learnApi = {
  startSession: (body: StartSessionInput) =>
    request<LearnSession>("/v1/me/learn/session", { method: "POST", body }),
  submitAnswer: (body: SubmitAnswerInput) =>
    request<AnswerResult>("/v1/me/learn/answer", { method: "POST", body }),
};
