"use client";

import { LangPicker } from "../_components/lang-picker";
import { ScreenHeader } from "../_components/screen-header";
import type { OnboardingState } from "../onboarding-flow";

export function TargetScreen({
  state,
  set,
}: {
  state: OnboardingState;
  set: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <ScreenHeader
        eyebrow="Field · targetLanguage"
        title={
          <>
            What would you <em>love</em> to learn?
          </>
        }
        sub="Pick the language you're working towards."
      />
      <LangPicker
        selected={state.targetLanguage}
        disabledCode={state.nativeLanguage}
        onPick={(code) => set({ targetLanguage: code })}
      />
    </div>
  );
}
