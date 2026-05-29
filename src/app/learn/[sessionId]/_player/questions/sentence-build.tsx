"use client";

import * as React from "react";
import type { SentenceBuildPrompt } from "@/lib/api/learn";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "../types";

export function SentenceBuildQuestion({
  prompt,
  onChange,
  phase,
  correctAnswer,
}: QuestionProps<SentenceBuildPrompt>) {
  const locked = phase === "feedback";
  // Track arrangement by token index so duplicate words stay unambiguous.
  const [placed, setPlaced] = React.useState<number[]>([]);

  const placedSet = React.useMemo(() => new Set(placed), [placed]);

  const sync = React.useCallback(
    (next: number[]) => {
      setPlaced(next);
      onChange(next.map((i) => prompt.tokens[i]).join(" "));
    },
    [onChange, prompt.tokens],
  );

  const add = (i: number) => {
    if (locked || placedSet.has(i)) return;
    sync([...placed, i]);
  };
  const removeAt = (pos: number) => {
    if (locked) return;
    sync(placed.filter((_, idx) => idx !== pos));
  };

  const built = placed.map((i) => prompt.tokens[i]).join(" ");
  const isRight = locked && built === correctAnswer;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="text-center text-sm text-muted-foreground">Build the sentence:</p>
      <p className="text-center font-display text-lg leading-relaxed text-ink-2">
        {prompt.translation}
      </p>

      {/* Answer line */}
      <div
        className={cn(
          "flex min-h-14 w-full flex-wrap content-start items-center gap-2 rounded-2xl border border-dashed p-3",
          locked && isRight && "border-success bg-[color:var(--success)]/8",
          locked && !isRight && "border-danger bg-danger-soft",
          !locked && "border-line-2 bg-bg-soft/50",
        )}
      >
        {placed.length === 0 ? (
          <span className="px-1 text-sm text-muted-2">Tap words below to add them here</span>
        ) : (
          placed.map((i, pos) => (
            <button
              key={`${i}-${pos}`}
              type="button"
              disabled={locked}
              onClick={() => removeAt(pos)}
              className="rounded-xl border border-line bg-card px-3 py-2 text-sm font-medium text-ink transition hover:bg-[color:var(--hover)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-default"
            >
              {prompt.tokens[i]}
            </button>
          ))
        )}
      </div>

      {/* Token tray */}
      <div className="flex w-full flex-wrap justify-center gap-2">
        {prompt.tokens.map((token, i) => (
          <button
            key={`${token}-${i}`}
            type="button"
            disabled={locked || placedSet.has(i)}
            onClick={() => add(i)}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              placedSet.has(i)
                ? "cursor-default border-transparent bg-bg-soft text-transparent"
                : "border-line bg-card text-ink hover:bg-[color:var(--hover)]",
            )}
          >
            {token}
          </button>
        ))}
      </div>

      {locked && !isRight ? (
        <p className="text-center text-sm text-muted-foreground">
          Answer: <span className="font-semibold text-success">{correctAnswer}</span>
        </p>
      ) : null}
    </div>
  );
}
