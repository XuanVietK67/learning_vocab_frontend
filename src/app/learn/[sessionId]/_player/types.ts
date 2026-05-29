import type { LearnPrompt } from "@/lib/api/learn";

export type Phase = "question" | "feedback";

/** Props every question component receives from the player shell. */
export type QuestionProps<P extends LearnPrompt = LearnPrompt> = {
  prompt: P;
  /** Current user answer, encoded as the API expects (see frontend_handoff). */
  value: string;
  onChange: (value: string) => void;
  phase: Phase;
  /** The graded correct answer — only present once `phase === "feedback"`. */
  correctAnswer: string | null;
};
