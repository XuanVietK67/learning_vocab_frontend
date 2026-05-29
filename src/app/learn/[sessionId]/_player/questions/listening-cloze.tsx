"use client";

import type { ListeningClozePrompt } from "@/lib/api/learn";
import { BlankSentence } from "../blank-sentence";
import { AudioButton } from "../audio-button";
import { OptionGrid } from "../option-grid";
import type { QuestionProps } from "../types";

export function ListeningClozeQuestion({
  prompt,
  value,
  onChange,
  phase,
  correctAnswer,
}: QuestionProps<ListeningClozePrompt>) {
  const filled = phase === "feedback" ? value || correctAnswer : null;
  const tone = phase === "feedback" && value && value !== correctAnswer ? "wrong" : "correct";

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <AudioButton src={prompt.audioUrl} autoPlay label="Replay audio" />
        <span className="text-xs text-muted-2">Tap to replay</span>
      </div>
      {/* Sentence stays hidden until feedback so listening is the actual task. */}
      {phase === "feedback" ? (
        <BlankSentence
          sentence={prompt.sentenceWithBlank}
          filled={filled}
          tone={tone}
          className="text-center font-display text-xl leading-relaxed text-ink"
        />
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          Listen, then choose the missing word.
        </p>
      )}
      {phase === "feedback" && prompt.hintTranslation ? (
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
