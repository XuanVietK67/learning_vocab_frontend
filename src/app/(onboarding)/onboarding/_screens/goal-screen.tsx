"use client";

import { GOALS, VOCAB_GOALS } from "@/lib/data/goals";
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
        eyebrow="Fields · dailyGoalMinutes & weeklyVocabGoal"
        title={
          <>
            Set your <em>pace</em>.
          </>
        }
        sub="Start small. You can always raise the bar later."
      />

      <section className="flex flex-col gap-3">
        <SectionLabel>Daily time</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
          {GOALS.map((g, i) => (
            <GoalCard
              key={g.mins}
              value={g.mins}
              unit="min"
              title={g.title}
              blurb={g.blurb}
              footnote={g.words}
              index={i}
              selected={state.dailyGoalMinutes === g.mins}
              onPick={() => set({ dailyGoalMinutes: g.mins })}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <SectionLabel>Weekly vocab goal</SectionLabel>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
          {VOCAB_GOALS.map((g, i) => (
            <GoalCard
              key={g.count}
              value={g.count}
              title={g.title}
              blurb={g.blurb}
              footnote={g.cadence}
              index={i}
              selected={state.weeklyVocabGoal === g.count}
              onPick={() => set({ weeklyVocabGoal: g.count })}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {children}
      </span>
      <span className="h-px flex-1 border-t border-dashed border-line" />
    </div>
  );
}
