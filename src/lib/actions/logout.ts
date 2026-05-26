"use server";

import { redirect } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { clearAuthCookies, readRefreshToken } from "@/lib/auth/cookies";

export async function logoutAction() {
  const refreshToken = await readRefreshToken();
  if (refreshToken) {
    try {
      await authApi.logout(refreshToken);
    } catch {
      // ignore — we're clearing local cookies regardless
    }
  }
  await clearAuthCookies();
  redirect("/login");
}
