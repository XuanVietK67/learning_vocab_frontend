import "server-only";
import { request } from "./client";

export type Topic = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
};

export const topicsApi = {
  list: () => request<Topic[]>("/v1/topics", { auth: false }),
  get: (slug: string) => request<Topic>(`/v1/topics/${slug}`, { auth: false }),
};
