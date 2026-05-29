"use client";

import Link from "next/link";
import { Sparkles, Target, Sprout, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  total: number;
  correctCount: number;
  enrolledNewlyCount: number;
  onRestart: () => void;
  restarting?: boolean;
};

export function SessionSummary({
  total,
  correctCount,
  enrolledNewlyCount,
  onRestart,
  restarting,
}: Props) {
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const stats: Array<{ icon: typeof Target; label: string; value: string; color: string }> = [
    { icon: Target, label: "Accuracy", value: `${accuracy}%`, color: "var(--rainbow-4)" },
    { icon: Sparkles, label: "Correct", value: `${correctCount}/${total}`, color: "var(--rainbow-1)" },
    { icon: Sprout, label: "New words", value: `${enrolledNewlyCount}`, color: "var(--rainbow-3)" },
  ];

  return (
    <div className="w-full animate-pop rounded-2xl border border-line bg-card p-8 text-center shadow-[0_10px_24px_-12px_rgba(255,107,107,0.35)]">
      <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Sparkles className="size-7" aria-hidden />
      </div>
      <h1 className="font-display text-2xl text-ink">Session complete!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {accuracy >= 80
          ? "Brilliant work — your future self thanks you."
          : "Every review makes the next one easier."}
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="rounded-2xl border border-line bg-bg-soft/40 p-4">
            <Icon className="mx-auto size-5" style={{ color }} aria-hidden />
            <p className="mt-2 font-display text-xl text-ink">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-col gap-3">
        <button
          type="button"
          onClick={onRestart}
          disabled={restarting}
          className={cn(
            "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] transition hover:brightness-95",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <RotateCcw className={cn("size-4", restarting && "animate-spin-slow")} aria-hidden />
          Another round
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-line-2 bg-transparent px-5 text-sm font-medium text-ink transition hover:bg-[color:var(--hover)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
