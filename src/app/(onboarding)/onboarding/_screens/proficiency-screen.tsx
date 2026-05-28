"use client";

import { getLanguage } from "@/lib/data/languages";
import { PROFICIENCY } from "@/lib/data/proficiency";
import { ProfCard } from "../_components/prof-card";
import { ScreenHeader } from "../_components/screen-header";
import type { OnboardingState } from "../onboarding-flow";

export function ProficiencyScreen({
  state,
  set,
}: {
  state: OnboardingState;
  set: (patch: Partial<OnboardingState>) => void;
}) {
  const target = getLanguage(state.targetLanguage);
  return (
    <div className="flex flex-col gap-7">
      <ScreenHeader
        eyebrow="Field · proficiencyLevel"
        title={
          <>
            How much <em dir="auto">{target?.native ?? "of it"}</em> do you already know?
          </>
        }
        sub="There are no wrong answers. We calibrate from here."
      />
      <div className="flex flex-col gap-2">
        {PROFICIENCY.map((p, i) => (
          <ProfCard
            key={p.code}
            item={p}
            index={i}
            selected={state.proficiencyLevel === p.code}
            onPick={() => set({ proficiencyLevel: p.code })}
          />
        ))}
      </div>
    </div>
  );
}
