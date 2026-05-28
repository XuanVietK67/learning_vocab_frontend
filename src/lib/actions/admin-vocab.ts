"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminVocabApi } from "@/lib/api/admin-vocab";
import { isApiError } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/auth/session";
import {
  AddExampleSchema,
  AddSenseSchema,
  AddTranslationSchema,
  BulkImportSchema,
  CreateVocabSchema,
  PatchExampleSchema,
  PatchSenseSchema,
  PatchTranslationSchema,
  PatchVocabSchema,
  ReplaceTopicsSchema,
  type AddExampleInput,
  type AddSenseInput,
  type AddTranslationInput,
  type BulkImportInput,
  type CreateVocabInput,
  type PatchExampleInput,
  type PatchSenseInput,
  type PatchTranslationInput,
  type PatchVocabInput,
} from "@/lib/validators/admin-vocab";
import { flattenZod, type ActionResult } from "./result";

async function requireAdmin(): Promise<ActionResult | null> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "You're signed out." };
  if (user.role !== "admin") return { success: false, error: "Admins only." };
  return null;
}

function apiErrorMessage(e: unknown, fallback: string): string {
  if (isApiError(e)) {
    if (e.status === 409) return "Duplicate — that (language, lemma, part of speech) already exists.";
    if (e.status === 403) return "You don't have permission.";
    if (e.status === 404) return "Not found.";
    const msg = Array.isArray(e.body?.message) ? e.body.message[0] : e.body?.message;
    return msg ?? fallback;
  }
  return fallback;
}

export async function createVocabAction(input: CreateVocabInput): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = CreateVocabSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    const created = await adminVocabApi.create(parsed.data);
    revalidatePath("/admin/vocabularies");
    return { success: true, redirect: `/admin/vocabularies/${created.id}` };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not create vocabulary.") };
  }
}

export async function patchVocabAction(
  id: string,
  input: PatchVocabInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = PatchVocabSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.patch(id, parsed.data);
    revalidatePath(`/admin/vocabularies/${id}`);
    revalidatePath("/admin/vocabularies");
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not save changes.") };
  }
}

export async function deleteVocabAction(id: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    await adminVocabApi.remove(id);
    revalidatePath("/admin/vocabularies");
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not delete vocabulary.") };
  }
}

export async function bulkImportVocabAction(
  input: BulkImportInput,
): Promise<ActionResult & { result?: Awaited<ReturnType<typeof adminVocabApi.bulkImport>> }> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = BulkImportSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    const result = await adminVocabApi.bulkImport(parsed.data.items);
    revalidatePath("/admin/vocabularies");
    return { success: true, result };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Bulk import failed.") };
  }
}

export async function addSenseAction(
  vocabularyId: string,
  input: AddSenseInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = AddSenseSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.addSense(vocabularyId, parsed.data);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not add sense.") };
  }
}

export async function patchSenseAction(
  vocabularyId: string,
  senseId: string,
  input: PatchSenseInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = PatchSenseSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.patchSense(vocabularyId, senseId, parsed.data);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not save sense.") };
  }
}

export async function deleteSenseAction(
  vocabularyId: string,
  senseId: string,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    await adminVocabApi.deleteSense(vocabularyId, senseId);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not delete sense.") };
  }
}

export async function reorderSensesAction(
  vocabularyId: string,
  senseIds: string[],
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    await adminVocabApi.reorderSenses(vocabularyId, senseIds);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not reorder senses.") };
  }
}

export async function addTranslationAction(
  vocabularyId: string,
  senseId: string,
  input: AddTranslationInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = AddTranslationSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.addTranslation(vocabularyId, senseId, parsed.data);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not add translation.") };
  }
}

export async function patchTranslationAction(
  vocabularyId: string,
  senseId: string,
  translationId: string,
  input: PatchTranslationInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = PatchTranslationSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.patchTranslation(vocabularyId, senseId, translationId, parsed.data);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not save translation.") };
  }
}

export async function deleteTranslationAction(
  vocabularyId: string,
  senseId: string,
  translationId: string,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    await adminVocabApi.deleteTranslation(vocabularyId, senseId, translationId);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not delete translation.") };
  }
}

export async function addExampleAction(
  vocabularyId: string,
  senseId: string,
  input: AddExampleInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = AddExampleSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.addExample(vocabularyId, senseId, parsed.data);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not add example.") };
  }
}

export async function patchExampleAction(
  vocabularyId: string,
  senseId: string,
  exampleId: string,
  input: PatchExampleInput,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = PatchExampleSchema.safeParse(input);
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.patchExample(vocabularyId, senseId, exampleId, parsed.data);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not save example.") };
  }
}

export async function deleteExampleAction(
  vocabularyId: string,
  senseId: string,
  exampleId: string,
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  try {
    await adminVocabApi.deleteExample(vocabularyId, senseId, exampleId);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not delete example.") };
  }
}

export async function replaceTopicsAction(
  vocabularyId: string,
  slugs: string[],
): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (gate) return gate;

  const parsed = ReplaceTopicsSchema.safeParse({ slugs });
  if (!parsed.success) return { success: false, fieldErrors: flattenZod(parsed.error) };

  try {
    await adminVocabApi.replaceTopics(vocabularyId, parsed.data.slugs);
    revalidatePath(`/admin/vocabularies/${vocabularyId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: apiErrorMessage(e, "Could not save topics.") };
  }
}

export async function deleteVocabAndRedirectAction(id: string): Promise<void> {
  const gate = await requireAdmin();
  if (gate) return;
  try {
    await adminVocabApi.remove(id);
  } catch {
    // fall through — the list page will re-fetch
  }
  revalidatePath("/admin/vocabularies");
  redirect("/admin/vocabularies");
}
