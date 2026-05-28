import { z } from "zod";

export const CreateTopicSchema = z.object({
  slug: z
    .string()
    .min(2, "At least 2 characters.")
    .max(64, "Max 64 characters.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, digits, and dashes only."),
  name: z.string().min(1, "Required.").max(120),
  description: z.string().max(500).nullish(),
  iconUrl: z.string().url("Must be a URL.").max(500).nullish().or(z.literal("").transform(() => null)),
});
export type CreateTopicInput = z.infer<typeof CreateTopicSchema>;

export const PatchTopicSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullish(),
  iconUrl: z.string().url().max(500).nullish().or(z.literal("").transform(() => null)),
});
export type PatchTopicInput = z.infer<typeof PatchTopicSchema>;
