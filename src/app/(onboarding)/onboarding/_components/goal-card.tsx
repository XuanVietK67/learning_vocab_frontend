"use client";

import * as React from "react";
import type { Goal } from "@/lib/data/goals";

const TILT = ["-rotate-[1.5deg]", "rotate-[1.5deg]", "-rotate-[1deg]", "rotate-[2deg]"];
const MIN_COLOR = ["text-rainbow-1", "text-rainbow-3", "text-rainbow-4", "text-rainbow-5"];

export function GoalCard({
  item,
  index,
  selected,
  onPick,
}: {
  item: Goal;
  index: number;
  selected: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={selected}
      className={
        "flex aspect-[1/1.1] cursor-pointer flex-col justify-between gap-1.5 rounded-[var(--radius-md)] border-2 bg-white px-5 py-5.5 text-left font-sans text-ink transition-all duration-[220ms] ease-out " +
        (selected
          ? "border-accent bg-[color-mix(in_oklab,var(--accent-color)_6%,white)] rotate-0 scale-[1.02] shadow-[0_6px_0_0_color-mix(in_oklab,var(--accent-color)_60%,black)]"
          : `border-line shadow-[0_4px_0_0_var(--line)] ${TILT[index % TILT.length]} hover:-translate-y-1.5 hover:rotate-0 hover:scale-[1.03] hover:border-accent hover:shadow-[0_8px_0_0_color-mix(in_oklab,var(--accent-color)_40%,var(--line))]`)
      }
    >
      <div className={`flex items-baseline gap-1.5 font-display italic leading-none ${MIN_COLOR[index % MIN_COLOR.length]}`}>
        <span className="text-[56px]">{item.mins}</span>
        <span className="font-sans text-base not-italic text-muted-foreground">min</span>
      </div>
      <div>
        <div className="font-display text-xl italic leading-none">{item.title}</div>
        <div className="mt-1 text-[13px] text-muted-foreground">{item.blurb}</div>
      </div>
      <div className="border-t border-line pt-1.5 text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {item.words}
      </div>
    </button>
  );
}
