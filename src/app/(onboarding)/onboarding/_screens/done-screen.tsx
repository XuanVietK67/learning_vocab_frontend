"use client";

import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { getGoal } from "@/lib/data/goals";
import { getLanguage } from "@/lib/data/languages";
import { getProficiency } from "@/lib/data/proficiency";
import type { OnboardingState } from "../onboarding-flow";

export function DoneScreen({ state }: { state: OnboardingState }) {
  const router = useRouter();
  const native = getLanguage(state.nativeLanguage);
  const target = getLanguage(state.targetLanguage);
  const prof = getProficiency(state.proficiencyLevel);
  const goal = getGoal(state.dailyGoalMinutes);

  return (
    <div className="flex max-w-[640px] flex-col items-start gap-4 pt-8">
      <div className="animate-pop text-accent">
        <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden>
          <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth={2} />
          <path
            d="M18 33 L28 43 L46 23"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="m-0 font-display text-[clamp(2.75rem,6vw,5rem)] font-semibold italic leading-[1.05] tracking-[-0.015em] text-ink">
        You&apos;re all set.
      </h1>

      <p className="m-0 max-w-[48ch] text-base leading-[1.55] text-muted-foreground">
        We&apos;ve saved your profile. Your first {goal?.mins}-minute {target?.name} session is
        ready when you are.
      </p>

      <div className="my-3 w-full rounded-[10px] border border-line bg-white px-5 py-1">
        <SummaryRow label="Speaking" value={native?.native ?? "—"} suffix={native?.name} />
        <SummaryRow label="Learning" value={target?.native ?? "—"} suffix={target?.name} />
        <SummaryRow label="Level" value={prof?.title ?? "—"} suffix={prof?.code} />
        <SummaryRow label="Daily goal" value={`${goal?.mins ?? "—"} min`} suffix={goal?.title} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border-0 bg-accent px-7 py-4 font-sans text-base font-bold text-white shadow-[0_4px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)] active:translate-y-0.5 active:shadow-[0_1px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)]"
        >
          <Check className="size-4" strokeWidth={2.5} aria-hidden /> Open my home
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-line py-3.5 last:border-b-0">
      <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="font-display text-[22px] italic" dir="auto">
        {value} {suffix && <span className="font-sans text-[13px] not-italic text-muted-foreground">· {suffix}</span>}
      </div>
    </div>
  );
}
