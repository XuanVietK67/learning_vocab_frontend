"use server";

// STUB: replace body with api.magicLink(input) once backend ships POST /v1/auth/magic-link.

import { MagicLinkSchema, type MagicLinkInput } from "@/lib/validators/auth";
import { flattenZod, type ActionResult } from "../result";

export async function magicLinkAction(
  input: MagicLinkInput,
): Promise<ActionResult> {
  const parsed = MagicLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, fieldErrors: flattenZod(parsed.error) };
  }
  await new Promise((r) => setTimeout(r, 700));
  return { success: true };
}
