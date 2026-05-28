"use client";

import { LangPicker } from "../_components/lang-picker";
import { ScreenHeader } from "../_components/screen-header";
import type { OnboardingState } from "../onboarding-flow";

export function NativeScreen({
  state,
  set,
}: {
  state: OnboardingState;
  set: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <ScreenHeader
        eyebrow="Field · nativeLanguage"
        title={
          <>
            What&apos;s your <em>native</em> tongue?
          </>
        }
        sub="We'll explain new words in this language."
      />
      <LangPicker
        selected={state.nativeLanguage}
        disabledCode={state.targetLanguage}
        onPick={(code) => set({ nativeLanguage: code })}
      />
    </div>
  );
}
