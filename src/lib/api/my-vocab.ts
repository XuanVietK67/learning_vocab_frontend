import "server-only";
import { request } from "./client";
import type { Paginated } from "./decks";

export type VocabularySummary = {
  id: string;
  language: string;
  lemma: string;
  partOfSpeech: string | null;
  ipa: string | null;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  frequencyRank: number | null;
  audioUrl: string | null;
  source: "system" | "user";
};

type ListQuery = {
  language?: string;
  q?: string;
  translationLang?: string;
  page?: number;
  limit?: number;
};

export const myVocabApi = {
  list: (query: ListQuery = {}) =>
    request<Paginated<VocabularySummary>>("/v1/me/vocabularies", { query }),
};
