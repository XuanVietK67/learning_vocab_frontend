"use server";

import { revalidatePath } from "next/cache";
import { adminTopicsApi } from "@/lib/api/admin-topics";
import { isApiError } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";
import {
  CreateTopicSchema,
  PatchTopicSchema,
  type CreateTopicInput,
  type PatchTopicInput,
} from "@/lib/validators/admin-topics";
import { flattenZod, type ActionResult } from "./result";

async function requireAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "You're signed out." };
  if (user.role !== "admin") return { success: false, error: "Admins only." };
  return null;
}

function apiErrorMessage(e: unknown, fallback: string): string {
  if (isApiError(e)) {
    if (e.status === 409) return "A topic with that slug already exists.";
    if (e.status === 404) return "Topic not found.";
    const msg = Array.isArray(e.body?.message) ? e.body.message[0] : e.body?.message;
    return msg ?? fallback;
  }
  return fallback;
}

export async function createTopicAction(input: CreateTopicInput): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = CreateTopicSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminTopicsApi.create(parsed.data);
    revalidatePath("/admin/topics");
    revalidatePath("/admin/vocabularies");
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not create topic.") };
  }
}

export async function patchTopicAction(
  slug: string,
  input: PatchTopicInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = PatchTopicSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminTopicsApi.patch(slug, parsed.data);
    revalidatePath("/admin/topics");
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not save topic.") };
  }
}

export async function deleteTopicAction(slug: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    await adminTopicsApi.remove(slug);
    revalidatePath("/admin/topics");
    revalidatePath("/admin/vocabularies");
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not delete topic.") };
  }
}
