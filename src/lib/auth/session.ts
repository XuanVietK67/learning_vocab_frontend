import "server-only";
import { cache } from "react";
import { authApi } from "@/lib/api/auth";
import type { UserResponse } from "@/lib/api/types";
import { isApiError } from "@/lib/api/types";
import { readAccessToken } from "./cookies";

export const getCurrentUser = cache(async (): Promise<UserResponse | null> => {
  const token = await readAccessToken();
  if (!token) return null;
  try {
    return await authApi.me();
  } catch (e) {
    if (isApiError(e, 401)) return null;
    throw e;
  }
});
