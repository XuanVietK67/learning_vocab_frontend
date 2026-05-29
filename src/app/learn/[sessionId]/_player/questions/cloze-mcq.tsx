"use client";

import type { ClozeMcqPrompt } from "@/lib/api/learn";
import { BlankSentence } from "../blank-sentence";
import { AudioButton } from "../audio-button";
import { OptionGrid } from "../option-grid";
import type { QuestionProps } from "../types";

export function ClozeMcqQuestion({
  prompt,
  value,
  onChange,
  phase,
  correctAnswer,
}: QuestionProps<ClozeMcqPrompt>) {
  const filled = phase === "feedback" ? value || correctAnswer : null;
  const tone = phase === "feedback" && value && value !== correctAnswer ? "wrong" : "correct";

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {prompt.audioUrl ? <AudioButton src={prompt.audioUrl} /> : null}
      <BlankSentence
        sentence={prompt.sentenceWithBlank}
        filled={filled}
        tone={tone}
        className="text-center font-display text-xl leading-relaxed text-ink"
      />
      {prompt.hintTranslation ? (
        <p className="text-center text-sm text-muted-foreground">{prompt.hintTranslation}</p>
      ) : null}
      <OptionGrid
        options={prompt.options}
        value={value}
        onChange={onChange}
        phase={phase}
        correctAnswer={correctAnswer}
      />
    </div>
  );
}
