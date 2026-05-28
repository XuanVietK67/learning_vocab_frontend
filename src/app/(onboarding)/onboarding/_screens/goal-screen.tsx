"use client";

import { GOALS } from "@/lib/data/goals";
import { GoalCard } from "../_components/goal-card";
import { ScreenHeader } from "../_components/screen-header";
import type { OnboardingState } from "../onboarding-flow";

export function GoalScreen({
  state,
  set,
}: {
  state: OnboardingState;
  set: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <ScreenHeader
        eyebrow="Field · dailyGoalMinutes"
        title={
          <>
            How much time can you <em>give it</em> daily?
          </>
        }
        sub="Start small. You can always raise the bar later."
      />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
        {GOALS.map((g, i) => (
          <GoalCard
            key={g.mins}
            item={g}
            index={i}
            selected={state.dailyGoalMinutes === g.mins}
            onPick={() => set({ dailyGoalMinutes: g.mins })}
          />
        ))}
      </div>
    </div>
  );
}
