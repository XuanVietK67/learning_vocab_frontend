"use client";

import * as React from "react";
import type { Proficiency } from "@/lib/data/proficiency";

const MARKER_COLOR = [
  "text-rainbow-1",
  "text-rainbow-2",
  "text-rainbow-3",
  "text-rainbow-4",
  "text-rainbow-5",
  "text-rainbow-1",
];

export function ProfCard({
  item,
  index,
  selected,
  onPick,
}: {
  item: Proficiency;
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
        "flex w-full cursor-pointer items-center gap-5 rounded-[var(--radius-md)] border-2 bg-white px-5 py-5 text-left font-sans text-ink transition-all duration-[220ms] ease-out " +
        (selected
          ? "border-accent bg-[color-mix(in_oklab,var(--accent-color)_5%,white)] -rotate-1 shadow-[0_4px_0_0_color-mix(in_oklab,var(--accent-color)_60%,black)]"
          : "border-line shadow-[0_3px_0_0_var(--line)] hover:-translate-y-[3px] hover:-rotate-[0.6deg] hover:border-accent hover:shadow-[0_6px_0_0_color-mix(in_oklab,var(--accent-color)_40%,var(--line))]")
      }
    >
      <div className={`min-w-[64px] font-display text-[26px] italic ${MARKER_COLOR[index % MARKER_COLOR.length]}`}>
        {item.code}
      </div>
      <div className="flex-1">
        <div className="mb-0.5 font-display text-[22px] italic leading-[1.1]">{item.title}</div>
        <div className="text-[13px] text-muted-foreground">{item.blurb}</div>
      </div>
      <div
        className={
          "grid size-5 place-items-center rounded-full border-[1.5px] transition-colors " +
          (selected ? "border-accent" : "border-line group-hover:border-ink")
        }
      >
        <span
          className={"size-2.5 rounded-full transition-colors " + (selected ? "bg-accent" : "bg-transparent")}
        />
      </div>
    </button>
  );
}
