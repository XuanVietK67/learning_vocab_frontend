import { z } from "zod";

const LANG_CODE = /^[a-z]{2,3}(-[A-Z]{2})?$/;
export const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const TranslationSchema = z.object({
  language: z.string().regex(LANG_CODE, "Use a code like en, vi, pt-BR."),
  translation: z.string().min(1, "Required.").max(500),
  note: z.string().max(500).nullish(),
});

const ExampleSchema = z.object({
  sentence: z.string().min(1, "Required.").max(500),
  translation: z.string().max(500).nullish(),
  source: z.string().max(64).nullish(),
});

const SenseSchema = z.object({
  gloss: z.string().max(200).nullish(),
  definition: z.string().max(1000).nullish(),
  imageUrl: z.string().url("Must be a URL.").max(500).nullish().or(z.literal("").transform(() => null)),
  translations: z.array(TranslationSchema).max(32).optional(),
  examples: z.array(ExampleSchema).max(32).optional(),
});

export const CreateVocabSchema = z.object({
  language: z.string().regex(LANG_CODE, "Use a code like en, vi, pt-BR."),
  lemma: z.string().min(1, "Required.").max(200),
  partOfSpeech: z.string().max(32).nullish(),
  ipa: z.string().max(120).nullish(),
  cefrLevel: z.enum(CEFR).nullish(),
  frequencyRank: z.number().int().min(1).nullish(),
  audioUrl: z.string().url("Must be a URL.").max(500).nullish().or(z.literal("").transform(() => null)),
  topics: z.array(z.string()).max(32).optional(),
  senses: z.array(SenseSchema).min(1, "At least one sense is required.").max(16),
});
export type CreateVocabInput = z.infer<typeof CreateVocabSchema>;

export const PatchVocabSchema = z.object({
  language: z.string().regex(LANG_CODE).optional(),
  lemma: z.string().min(1).max(200).optional(),
  partOfSpeech: z.string().max(32).nullish(),
  ipa: z.string().max(120).nullish(),
  cefrLevel: z.enum(CEFR).nullish(),
  frequencyRank: z.number().int().min(1).nullish(),
  audioUrl: z.string().url().max(500).nullish().or(z.literal("").transform(() => null)),
});
export type PatchVocabInput = z.infer<typeof PatchVocabSchema>;

export const AddSenseSchema = SenseSchema;
export type AddSenseInput = z.infer<typeof AddSenseSchema>;

export const PatchSenseSchema = z.object({
  gloss: z.string().max(200).nullish(),
  definition: z.string().max(1000).nullish(),
  imageUrl: z.string().url().max(500).nullish().or(z.literal("").transform(() => null)),
});
export type PatchSenseInput = z.infer<typeof PatchSenseSchema>;

export const AddTranslationSchema = TranslationSchema;
export type AddTranslationInput = z.infer<typeof AddTranslationSchema>;

export const PatchTranslationSchema = z.object({
  language: z.string().regex(LANG_CODE).optional(),
  translation: z.string().min(1).max(500).optional(),
  note: z.string().max(500).nullish(),
});
export type PatchTranslationInput = z.infer<typeof PatchTranslationSchema>;

export const AddExampleSchema = ExampleSchema;
export type AddExampleInput = z.infer<typeof AddExampleSchema>;

export const PatchExampleSchema = z.object({
  sentence: z.string().min(1).max(500).optional(),
  translation: z.string().max(500).nullish(),
  source: z.string().max(64).nullish(),
});
export type PatchExampleInput = z.infer<typeof PatchExampleSchema>;

export const ReplaceTopicsSchema = z.object({
  slugs: z.array(z.string().regex(/^[a-z0-9-]+$/i)).max(32),
});

export const BulkImportSchema = z.object({
  items: z.array(CreateVocabSchema).min(1, "Need at least one item.").max(500),
});
export type BulkImportInput = z.infer<typeof BulkImportSchema>;
