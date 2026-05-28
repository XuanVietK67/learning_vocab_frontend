"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { submitOnboardingAction } from "@/lib/actions/onboarding";
import type { ProficiencyCode } from "@/lib/data/proficiency";
import { Stepper, type StepDef } from "./_components/stepper";
import { NativeScreen } from "./_screens/native-screen";
import { TargetScreen } from "./_screens/target-screen";
import { ProficiencyScreen } from "./_screens/proficiency-screen";
import { GoalScreen } from "./_screens/goal-screen";
import { DoneScreen } from "./_screens/done-screen";

export type OnboardingState = {
  nativeLanguage: string | null;
  targetLanguage: string | null;
  proficiencyLevel: ProficiencyCode | null;
  dailyGoalMinutes: number | null;
};

const STEPS: StepDef[] = [
  { key: "nativeLanguage", label: "Native" },
  { key: "targetLanguage", label: "Target" },
  { key: "proficiencyLevel", label: "Level" },
  { key: "dailyGoalMinutes", label: "Daily goal" },
];

type Phase = "form" | "sending" | "done" | "error";

export function OnboardingFlow() {
  const router = useRouter();

  const [step, setStep] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [phase, setPhase] = React.useState<Phase>("form");
  const [error, setError] = React.useState<string | null>(null);

  const [state, setState] = React.useState<OnboardingState>({
    nativeLanguage: null,
    targetLanguage: null,
    proficiencyLevel: null,
    dailyGoalMinutes: null,
  });

  const set = React.useCallback(
    (patch: Partial<OnboardingState>) => setState((s) => ({ ...s, ...patch })),
    [],
  );

  const completedMap: Record<string, boolean> = {
    nativeLanguage: !!state.nativeLanguage,
    targetLanguage: !!state.targetLanguage,
    proficiencyLevel: !!state.proficiencyLevel,
    dailyGoalMinutes: !!state.dailyGoalMinutes,
  };
  const allComplete = Object.values(completedMap).every(Boolean);
  const currentField = STEPS[step].key;
  const canContinue = completedMap[currentField];

  const go = (to: number) => {
    if (to === step) return;
    setDirection(to > step ? 1 : -1);
    setStep(to);
  };
  const next = () => go(Math.min(step + 1, STEPS.length - 1));
  const back = () => go(Math.max(step - 1, 0));

  async function submit() {
    if (!allComplete) return;
    setPhase("sending");
    setError(null);
    const res = await submitOnboardingAction({
      nativeLanguage: state.nativeLanguage as string,
      targetLanguage: state.targetLanguage as string,
      proficiencyLevel: state.proficiencyLevel as ProficiencyCode,
      dailyGoalMinutes: state.dailyGoalMinutes as number,
    });
    if (!res.success) {
      setPhase("error");
      setError(res.error ?? "Couldn't save your setup. Please try again.");
      return;
    }
    setPhase("done");
    if (res.redirect) {
      // Done-screen CTA is the primary path; the redirect is a fallback after a short pause.
      setTimeout(() => router.push(res.redirect!), 6000);
    }
  }

  const isLastStep = step === STEPS.length - 1;
  const isSending = phase === "sending";

  if (phase === "done") {
    return <DoneScreen state={state} />;
  }

  const screens = [
    <NativeScreen key="native" state={state} set={set} />,
    <TargetScreen key="target" state={state} set={set} />,
    <ProficiencyScreen key="prof" state={state} set={set} />,
    <GoalScreen key="goal" state={state} set={set} />,
  ];

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col">
      {/* Stepper bar */}
      <div className="flex justify-center bg-bg px-10 pt-8 pb-6 max-md:px-6">
        <Stepper steps={STEPS} current={step} completedMap={completedMap} onJump={go} />
      </div>

      {/* Stage */}
      <main className="flex flex-1 justify-center overflow-y-auto px-10 pt-2 pb-10 max-md:px-6">
        <div
          key={step}
          className={
            "w-full max-w-[760px] " +
            (direction > 0 ? "animate-enter-fwd" : "animate-enter-bwd")
          }
        >
          {screens[step]}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-[2] border-t-2 border-dashed border-line bg-bg px-10 py-4 max-md:px-6">
        <div className="mx-auto flex max-w-[760px] items-center justify-between gap-4">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || isSending}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border-0 bg-transparent px-4 py-3 font-sans text-[15px] font-semibold text-muted-foreground transition-colors hover:bg-accent-soft hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back
          </button>

          <div className="hidden flex-1 text-center font-mono text-[11px] tracking-[0.02em] text-muted-foreground md:block">
            Step {step + 1} of {STEPS.length}
            {error && phase === "error" && <span className="ml-3 text-danger">· {error}</span>}
          </div>

          {isLastStep ? (
            <button
              type="button"
              onClick={submit}
              disabled={!allComplete || isSending}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border-0 bg-accent px-7 py-4 font-sans text-base font-bold text-white shadow-[0_4px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] active:translate-y-0.5 active:shadow-[0_1px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)]"
            >
              {isSending ? (
                <>
                  <Loader2 className="size-4 animate-spin-slow" aria-hidden />
                  Saving…
                </>
              ) : (
                <>
                  Finish setup
                  <ArrowRight className="size-4" aria-hidden />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border-0 bg-accent px-7 py-4 font-sans text-base font-bold text-white shadow-[0_4px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] active:translate-y-0.5 active:shadow-[0_1px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)]"
            >
              Continue
              <ArrowRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
