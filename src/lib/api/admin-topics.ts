import "server-only";
import { request } from "./client";
import type { Topic } from "./topics";

export type CreateTopicInput = {
  slug: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
};

export type PatchTopicInput = Partial<Pick<Topic, "name" | "description" | "iconUrl">>;

export const adminTopicsApi = {
  create: (body: CreateTopicInput) =>
    request<Topic>("/v1/admin/topics", { method: "POST", body }),
  patch: (slug: string, body: PatchTopicInput) =>
    request<Topic>(`/v1/admin/topics/${slug}`, { method: "PATCH", body }),
  remove: (slug: string) =>
    request<void>(`/v1/admin/topics/${slug}`, { method: "DELETE" }),
};
