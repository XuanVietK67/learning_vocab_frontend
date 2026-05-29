"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SegmentState = "pending" | "current" | "correct" | "wrong";

type Props = {
  total: number;
  current: number;
  segments: SegmentState[];
  onExit: () => void;
};

export function SessionTopBar({ total, current, segments, onExit }: Props) {
  return (
    <div className="flex w-full items-center gap-3">
      <button
        type="button"
        onClick={onExit}
        aria-label="Exit session"
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-[color:var(--hover)] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <X className="size-5" aria-hidden />
      </button>

      <div className="flex flex-1 items-center gap-1.5" aria-hidden>
        {segments.map((state, i) => (
          <span
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-colors",
              state === "pending" && "bg-line",
              state === "current" && "bg-accent",
              state === "correct" && "bg-[color:var(--success)]",
              state === "wrong" && "bg-danger",
            )}
          />
        ))}
      </div>

      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
        {Math.min(current + 1, total)}/{total}
      </span>
    </div>
  );
}
