"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  correct: boolean;
  correctAnswer: string;
  /** True for cloze_typing Levenshtein-1 / sentence_build one-swap (graded "close"). */
  almost?: boolean;
  /**
   * Anki learning step the card now sits on (`0`-based), or `null` once it has
   * graduated to the day-scale ladder. When present the card will resurface in
   * minutes, so we hint that it's still being learned.
   */
  stepIndex?: number | null;
};

export function FeedbackBar({ correct, correctAnswer, almost, stepIndex }: Props) {
  const inSteps = stepIndex != null;
  return (
    <div
      role="status"
      className={cn(
        "flex w-full animate-fade-up items-center gap-3 rounded-2xl border px-4 py-3",
        correct
          ? "border-success bg-[color:var(--success)]/10 text-success"
          : "border-danger bg-danger-soft text-danger",
      )}
    >
      <span
        className={cn(
          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          correct ? "bg-[color:var(--success)]/15" : "bg-danger/15",
        )}
      >
        {correct ? <Check className="size-5" aria-hidden /> : <X className="size-5" aria-hidden />}
      </span>
      <div className="text-sm">
        <p className="font-semibold">
          {correct ? "Nice!" : almost ? "So close!" : "Not quite"}
        </p>
        {!correct ? (
          <p className="text-ink-2">
            Answer: <span className="font-semibold">{correctAnswer}</span>
          </p>
        ) : null}
        {inSteps ? (
          <p className="mt-0.5 text-xs opacity-80">
            Still learning · step {stepIndex! + 1}
          </p>
        ) : null}
      </div>
    </div>
  );
}
