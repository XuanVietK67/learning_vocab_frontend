import "server-only";
import { request } from "./client";

export type DeckSummary = {
  id: string;
  name: string;
  description: string | null;
  language: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | null;
  vocabCount: number;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

type ListQuery = {
  language?: string;
  cefrLevel?: CefrLevel;
  page?: number;
  limit?: number;
};

export const decksApi = {
  list: (query: ListQuery = {}) =>
    request<Paginated<DeckSummary>>("/v1/decks", { auth: false, query }),
  suggested: () => request<DeckSummary[]>("/v1/me/decks/suggested"),
  mine: (query: ListQuery = {}) =>
    request<Paginated<DeckSummary>>("/v1/me/decks", { query }),
};
