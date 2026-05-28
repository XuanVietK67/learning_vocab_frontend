import "server-only";
import { request } from "./client";
import type { Paginated } from "./decks";
import type { Topic } from "./topics";

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type AdminTranslation = {
  id: string;
  language: string;
  translation: string;
  note: string | null;
};

export type AdminExample = {
  id: string;
  sentence: string;
  translation: string | null;
  source: string | null;
};

export type AdminSense = {
  id: string;
  senseOrder: number;
  gloss: string | null;
  definition: string | null;
  imageUrl: string | null;
  translations: AdminTranslation[];
  examples: AdminExample[];
};

export type AdminVocabulary = {
  id: string;
  language: string;
  lemma: string;
  partOfSpeech: string | null;
  ipa: string | null;
  cefrLevel: CefrLevel | null;
  frequencyRank: number | null;
  audioUrl: string | null;
  source: "system" | "user";
  visibility: "system" | "private" | "public";
  isApproved: boolean;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
  senses: AdminSense[];
};

export type AdminVocabListQuery = {
  language?: string;
  cefrLevel?: CefrLevel;
  topic?: string;
  q?: string;
  source?: "system" | "user";
  isApproved?: boolean;
  visibility?: "system" | "private" | "public";
  createdByUserId?: string;
  translationLang?: string;
  sortBy?: "createdAt" | "frequencyRank";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
};

type TranslationInput = { language: string; translation: string; note?: string | null };
type ExampleInput = { sentence: string; translation?: string | null; source?: string | null };
type SenseInput = {
  gloss?: string | null;
  definition?: string | null;
  imageUrl?: string | null;
  translations?: TranslationInput[];
  examples?: ExampleInput[];
};

export type CreateVocabInput = {
  language: string;
  lemma: string;
  partOfSpeech?: string | null;
  ipa?: string | null;
  cefrLevel?: CefrLevel | null;
  frequencyRank?: number | null;
  audioUrl?: string | null;
  topics?: string[];
  senses: SenseInput[];
};

export type PatchVocabInput = Partial<{
  language: string;
  lemma: string;
  partOfSpeech: string | null;
  ipa: string | null;
  cefrLevel: CefrLevel | null;
  frequencyRank: number | null;
  audioUrl: string | null;
}>;

export type BulkImportResult = {
  upserted: number;
  inserted: number;
  updated: number;
  sensesAdded: number;
  translationsAdded: number;
  examplesAdded: number;
  topicLinksAdded: number;
};

function flattenQuery(q: AdminVocabListQuery): Record<string, string | number | undefined> {
  return {
    language: q.language,
    cefrLevel: q.cefrLevel,
    topic: q.topic,
    q: q.q,
    source: q.source,
    isApproved: q.isApproved === undefined ? undefined : q.isApproved ? "true" : "false",
    visibility: q.visibility,
    createdByUserId: q.createdByUserId,
    translationLang: q.translationLang,
    sortBy: q.sortBy,
    sortDir: q.sortDir,
    page: q.page,
    limit: q.limit,
  };
}

export const adminVocabApi = {
  list: (query: AdminVocabListQuery = {}) =>
    request<Paginated<AdminVocabulary>>("/v1/admin/vocabularies", {
      query: flattenQuery(query),
    }),

  get: (id: string, translationLang?: string) =>
    request<AdminVocabulary>(`/v1/admin/vocabularies/${id}`, {
      query: { translationLang },
    }),

  create: (body: CreateVocabInput) =>
    request<AdminVocabulary>("/v1/admin/vocabularies", { method: "POST", body }),

  patch: (id: string, body: PatchVocabInput) =>
    request<AdminVocabulary>(`/v1/admin/vocabularies/${id}`, {
      method: "PATCH",
      body,
    }),

  remove: (id: string) =>
    request<void>(`/v1/admin/vocabularies/${id}`, { method: "DELETE" }),

  bulkImport: (items: CreateVocabInput[]) =>
    request<BulkImportResult>("/v1/admin/vocabularies/bulk-import", {
      method: "POST",
      body: { items },
    }),

  addSense: (vocabularyId: string, body: SenseInput) =>
    request<AdminSense>(`/v1/admin/vocabularies/${vocabularyId}/senses`, {
      method: "POST",
      body,
    }),

  patchSense: (
    vocabularyId: string,
    senseId: string,
    body: Partial<Pick<SenseInput, "gloss" | "definition" | "imageUrl">>,
  ) =>
    request<AdminSense>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}`,
      { method: "PATCH", body },
    ),

  deleteSense: (vocabularyId: string, senseId: string) =>
    request<void>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}`,
      { method: "DELETE" },
    ),

  reorderSenses: (vocabularyId: string, senseIds: string[]) =>
    request<AdminSense[]>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/reorder`,
      { method: "PUT", body: { senseIds } },
    ),

  addTranslation: (vocabularyId: string, senseId: string, body: TranslationInput) =>
    request<AdminTranslation>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/translations`,
      { method: "POST", body },
    ),

  patchTranslation: (
    vocabularyId: string,
    senseId: string,
    translationId: string,
    body: Partial<TranslationInput>,
  ) =>
    request<AdminTranslation>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/translations/${translationId}`,
      { method: "PATCH", body },
    ),

  deleteTranslation: (vocabularyId: string, senseId: string, translationId: string) =>
    request<void>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/translations/${translationId}`,
      { method: "DELETE" },
    ),

  addExample: (vocabularyId: string, senseId: string, body: ExampleInput) =>
    request<AdminExample>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/examples`,
      { method: "POST", body },
    ),

  patchExample: (
    vocabularyId: string,
    senseId: string,
    exampleId: string,
    body: Partial<ExampleInput>,
  ) =>
    request<AdminExample>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/examples/${exampleId}`,
      { method: "PATCH", body },
    ),

  deleteExample: (vocabularyId: string, senseId: string, exampleId: string) =>
    request<void>(
      `/v1/admin/vocabularies/${vocabularyId}/senses/${senseId}/examples/${exampleId}`,
      { method: "DELETE" },
    ),

  replaceTopics: (vocabularyId: string, slugs: string[]) =>
    request<Topic[]>(`/v1/admin/vocabularies/${vocabularyId}/topics`, {
      method: "PUT",
      body: { slugs },
    }),
};
