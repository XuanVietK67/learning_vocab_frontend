import "server-only";
import { request } from "./client";
import type { UserResponse } from "./types";

export type UserUpdateInput = {
  nativeLanguage?: string;
  targetLanguage?: string;
  proficiencyLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  dailyGoalMinutes?: number;
};

export const usersApi = {
  update: (id: string, body: UserUpdateInput) =>
    request<UserResponse>(`/v1/users/${id}`, { method: "PATCH", body }),
};
