"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Phase } from "./types";

type Props = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  phase: Phase;
  correctAnswer: string | null;
  /** Layout: 2-col grid (default) or single column for longer option text. */
  columns?: 1 | 2;
};

/** Shared MCQ option buttons with question/feedback states. */
export function OptionGrid({
  options,
  value,
  onChange,
  phase,
  correctAnswer,
  columns = 2,
}: Props) {
  const locked = phase === "feedback";

  return (
    <div
      role="radiogroup"
      className={cn("grid w-full gap-3", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}
    >
      {options.map((option) => {
        const selected = value === option;
        const isCorrect = locked && option === correctAnswer;
        const isWrongPick = locked && selected && option !== correctAnswer;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={locked}
            onClick={() => onChange(option)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition",
              "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              "disabled:cursor-default",
              !locked && selected && "border-accent bg-accent-soft text-accent",
              !locked && !selected && "border-line bg-card text-ink hover:bg-[color:var(--hover)]",
              isCorrect && "border-success bg-[color:var(--success)]/10 text-success",
              isWrongPick && "border-danger bg-danger-soft text-danger",
              locked && !isCorrect && !isWrongPick && "border-line bg-card text-muted-foreground opacity-70",
            )}
          >
            <span>{option}</span>
            {isCorrect ? <Check className="size-4 shrink-0" aria-hidden /> : null}
            {isWrongPick ? <X className="size-4 shrink-0" aria-hidden /> : null}
          </button>
        );
      })}
    </div>
  );
}
