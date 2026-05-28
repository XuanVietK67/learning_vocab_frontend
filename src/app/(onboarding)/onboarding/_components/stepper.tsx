"use client";

import * as React from "react";
import { Check } from "lucide-react";

export type StepDef = { key: string; label: string };

const RAINBOW = ["bg-rainbow-1 border-rainbow-1", "bg-rainbow-2 border-rainbow-2", "bg-rainbow-3 border-rainbow-3", "bg-rainbow-4 border-rainbow-4", "bg-rainbow-5 border-rainbow-5"];

export function Stepper({
  steps,
  current,
  completedMap,
  onJump,
}: {
  steps: StepDef[];
  current: number;
  completedMap: Record<string, boolean>;
  onJump: (i: number) => void;
}) {
  return (
    <nav aria-label="Onboarding steps" className="mx-auto flex w-full max-w-[760px] items-center">
      {steps.map((s, i) => {
        const isCurrent = i === current;
        const isComplete = !!completedMap[s.key];
        const isReachable = isComplete || i <= current;
        const rainbow = RAINBOW[i % RAINBOW.length];

        let circleClass =
          "grid size-9 shrink-0 place-items-center rounded-full border-2 font-sans text-sm font-bold transition-all duration-[240ms] ease-out";
        if (isCurrent) {
          circleClass += ` ${rainbow} text-white scale-110 -rotate-3 shadow-[0_0_0_6px_color-mix(in_oklab,var(--accent-color)_22%,transparent),0_3px_0_0_color-mix(in_oklab,var(--accent-color)_60%,black)]`;
        } else if (isComplete) {
          circleClass += ` ${rainbow} text-white`;
        } else {
          circleClass += " border-line bg-white text-muted-foreground";
        }

        const connectorClass =
          "mx-2 h-[3px] min-w-6 flex-1 rounded-[2px] transition-colors duration-300 " +
          (isComplete ? "bg-accent" : "bg-line");

        return (
          <React.Fragment key={s.key}>
            <button
              type="button"
              onClick={() => isReachable && onJump(i)}
              disabled={!isReachable}
              aria-current={isCurrent ? "step" : undefined}
              className={
                "flex shrink-0 items-center gap-3 border-0 bg-transparent p-[4px_6px] text-ink transition-opacity duration-200 " +
                (isReachable ? "cursor-pointer" : "cursor-not-allowed") +
                (!isCurrent && !isComplete ? " opacity-55" : "")
              }
            >
              <span className={circleClass}>
                {isComplete && !isCurrent ? <Check className="size-3.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <span className="hidden flex-col items-start text-left leading-[1.2] sm:flex">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Step {i + 1}
                </span>
                <span
                  className={
                    "text-sm " +
                    (isCurrent
                      ? "font-extrabold text-ink"
                      : isComplete
                        ? "font-medium text-ink"
                        : "font-medium text-muted-foreground")
                  }
                >
                  {s.label}
                </span>
              </span>
            </button>
            {i < steps.length - 1 && <span aria-hidden className={connectorClass} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
