import "server-only";
import { request } from "./client";

export type MeStats = {
  streakDays: number;
  dueNow: number;
  reviewedToday: number;
  dailyGoalMinutes: number | null;
  counts: {
    new: number;
    learning: number;
    review: number;
    mastered: number;
  };
  /** ISO timestamp of the soonest future-scheduled card; null when nothing is queued ahead. */
  nextDueAt: string | null;
};

export const statsApi = {
  me: () => request<MeStats>("/v1/me/stats"),
};
