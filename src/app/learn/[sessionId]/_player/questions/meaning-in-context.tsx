"use client";

import type { MeaningInContextPrompt } from "@/lib/api/learn";
import { OptionGrid } from "../option-grid";
import type { QuestionProps } from "../types";

export function MeaningInContextQuestion({
  prompt,
  value,
  onChange,
  phase,
  correctAnswer,
}: QuestionProps<MeaningInContextPrompt>) {
  const { sentence, highlightedSpan } = prompt;
  const start = Math.max(0, Math.min(highlightedSpan.start, sentence.length));
  const end = Math.max(start, Math.min(highlightedSpan.end, sentence.length));

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="text-center font-display text-xl leading-relaxed text-ink">
        {sentence.slice(0, start)}
        <mark className="rounded-md bg-accent-soft px-1 font-semibold text-accent">
          {sentence.slice(start, end)}
        </mark>
        {sentence.slice(end)}
      </p>
      <p className="text-center text-sm text-muted-foreground">
        What does the highlighted word mean here?
      </p>
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
