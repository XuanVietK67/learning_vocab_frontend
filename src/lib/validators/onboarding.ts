import { z } from "zod";

const LANG_CODE = /^[a-z]{2,3}(-[A-Z]{2})?$/;
const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const OnboardingSchema = z
  .object({
    nativeLanguage: z.string().regex(LANG_CODE, "Pick a valid language."),
    targetLanguage: z.string().regex(LANG_CODE, "Pick a valid language."),
    proficiencyLevel: z.enum(CEFR),
    dailyGoalMinutes: z
      .number()
      .int("Minutes must be a whole number.")
      .min(5, "Pick at least 5 minutes a day.")
      .max(240, "Cap is 240 minutes a day."),
    weeklyVocabGoal: z
      .number()
      .int("Words must be a whole number.")
      .min(5, "Pick at least 5 words a week.")
      .max(250, "Cap is 250 words a week."),
  })
  .refine((d) => d.nativeLanguage !== d.targetLanguage, {
    message: "Native and target language must be different.",
    path: ["targetLanguage"],
  });

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
