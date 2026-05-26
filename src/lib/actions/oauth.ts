"use server";

import { authApi } from "@/lib/api/auth";
import { setAuthCookies } from "@/lib/auth/cookies";
import type { ActionResult } from "./result";

export async function signInWithGoogleAction(
  idToken: string,
): Promise<ActionResult> {
  if (!idToken) return { success: false, error: "Missing Google credential." };
  try {
    const auth = await authApi.google(idToken);
    await setAuthCookies(auth);
    return { success: true, redirect: "/" };
  } catch {
    return { success: false, error: "Google sign-in failed. Please try again." };
  }
}

export async function signInWithAppleAction(
  idToken: string,
  fullName?: string,
): Promise<ActionResult> {
  if (!idToken) return { success: false, error: "Missing Apple credential." };
  try {
    const auth = await authApi.apple(idToken, fullName);
    await setAuthCookies(auth);
    return { success: true, redirect: "/" };
  } catch {
    return { success: false, error: "Apple sign-in failed. Please try again." };
  }
}

export async function signInWithGithubAction(
  code: string,
): Promise<ActionResult> {
  if (!code) return { success: false, error: "Missing GitHub authorization code." };
  try {
    const auth = await authApi.github(code);
    await setAuthCookies(auth);
    return { success: true, redirect: "/" };
  } catch {
    return { success: false, error: "GitHub sign-in failed. Please try again." };
  }
}
