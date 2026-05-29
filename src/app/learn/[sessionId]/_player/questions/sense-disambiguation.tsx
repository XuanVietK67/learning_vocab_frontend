"use client";

import type { SenseDisambiguationPrompt } from "@/lib/api/learn";
import { OptionGrid } from "../option-grid";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "../types";

export function SenseDisambiguationQuestion({
  prompt,
  value,
  onChange,
  phase,
  correctAnswer,
}: QuestionProps<SenseDisambiguationPrompt>) {
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="text-center text-sm text-muted-foreground">
        Which meaning fits the <span className="font-semibold text-ink-2">highlighted</span> sentence?
      </p>

      <div className="flex w-full flex-col gap-3">
        {prompt.sentences.map((s, idx) => (
          <div
            key={s.exampleId}
            className={cn(
              "rounded-2xl border p-4 text-sm leading-relaxed",
              idx === 0
                ? "border-accent bg-accent-soft text-ink"
                : "border-line bg-card text-muted-foreground",
            )}
          >
            {idx === 0 ? (
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-accent">
                Match this one
              </span>
            ) : null}
            {s.sentence}
          </div>
        ))}
      </div>

      <OptionGrid
        options={prompt.options}
        value={value}
        onChange={onChange}
        phase={phase}
        correctAnswer={correctAnswer}
        columns={1}
      />
    </div>
  );
}
