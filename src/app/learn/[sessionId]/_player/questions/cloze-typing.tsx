"use client";

import type { ClozeTypingPrompt } from "@/lib/api/learn";
import { BlankSentence } from "../blank-sentence";
import { AudioButton } from "../audio-button";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "../types";

export function ClozeTypingQuestion({
  prompt,
  value,
  onChange,
  phase,
  correctAnswer,
}: QuestionProps<ClozeTypingPrompt>) {
  const locked = phase === "feedback";
  const isRight = locked && value.trim().toLowerCase() === (correctAnswer ?? "").toLowerCase();

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {prompt.audioUrl ? <AudioButton src={prompt.audioUrl} /> : null}
      <BlankSentence
        sentence={prompt.sentenceWithBlank}
        className="text-center font-display text-xl leading-relaxed text-ink"
      />
      {prompt.hintTranslation ? (
        <p className="text-center text-sm text-muted-foreground">{prompt.hintTranslation}</p>
      ) : null}

      <div className="w-full max-w-sm">
        <label htmlFor="cloze-answer" className="sr-only">
          Type the missing word
        </label>
        <input
          id="cloze-answer"
          type="text"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={locked}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type the missing word…"
          className={cn(
            "h-12 w-full rounded-2xl border bg-card px-4 text-center text-base font-medium text-ink transition",
            "placeholder:text-muted-2 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            !locked && "border-line focus-visible:border-accent",
            locked && isRight && "border-success bg-[color:var(--success)]/10 text-success",
            locked && !isRight && "border-danger bg-danger-soft text-danger",
          )}
        />
        {locked && !isRight ? (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Answer: <span className="font-semibold text-success">{correctAnswer}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
