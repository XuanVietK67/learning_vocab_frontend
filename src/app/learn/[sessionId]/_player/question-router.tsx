"use client";

import type { LearnPrompt } from "@/lib/api/learn";
import { ClozeMcqQuestion } from "./questions/cloze-mcq";
import { ClozeTypingQuestion } from "./questions/cloze-typing";
import { MeaningInContextQuestion } from "./questions/meaning-in-context";
import { SentenceBuildQuestion } from "./questions/sentence-build";
import { SenseDisambiguationQuestion } from "./questions/sense-disambiguation";
import { ListeningClozeQuestion } from "./questions/listening-cloze";
import type { Phase } from "./types";

type Props = {
  prompt: LearnPrompt;
  value: string;
  onChange: (value: string) => void;
  phase: Phase;
  correctAnswer: string | null;
};

export function QuestionRouter({ prompt, value, onChange, phase, correctAnswer }: Props) {
  const shared = { value, onChange, phase, correctAnswer };

  switch (prompt.type) {
    case "cloze_mcq":
      return <ClozeMcqQuestion prompt={prompt} {...shared} />;
    case "cloze_typing":
      return <ClozeTypingQuestion prompt={prompt} {...shared} />;
    case "meaning_in_context":
      return <MeaningInContextQuestion prompt={prompt} {...shared} />;
    case "sentence_build":
      return <SentenceBuildQuestion prompt={prompt} {...shared} />;
    case "sense_disambiguation":
      return <SenseDisambiguationQuestion prompt={prompt} {...shared} />;
    case "listening_cloze":
      return <ListeningClozeQuestion prompt={prompt} {...shared} />;
    default: {
      // Exhaustiveness guard — a new prompt type should surface in review.
      const _never: never = prompt;
      void _never;
      return (
        <p className="text-center text-sm text-muted-foreground">
          This question type isn&apos;t supported yet.
        </p>
      );
    }
  }
}
