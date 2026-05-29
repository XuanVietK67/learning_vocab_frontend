import { Sparkles, RotateCw, Clock } from "lucide-react";
import type { MeStats } from "@/lib/api/stats";
import { formatTimeUntil } from "@/lib/utils";
import { StartSessionButton } from "./start-session-button";

type Props = {
  stats: MeStats;
};

export function ModeCards({ stats }: Props) {
  const dueCount = stats.dueNow;
  const reviewDisabled = dueCount === 0;
  const countdown = reviewDisabled ? formatTimeUntil(stats.nextDueAt) : null;

  return (
    <section
      aria-label="Start learning"
      className="grid animate-fade-up gap-4 md:grid-cols-2"
    >
      <ModeCard
        title="Daily"
        blurb="Mix of due cards and fresh words tuned to your level."
        accent="rainbow-1"
        icon={<Sparkles className="size-5" aria-hidden />}
        cta={
          <StartSessionButton input={{ mode: "daily", limit: 15 }}>
            Start daily session
          </StartSessionButton>
        }
      />
      <ModeCard
        title="Review"
        blurb={
          reviewDisabled
            ? countdown
              ? "All caught up — nothing due right now."
              : "Nothing enrolled yet. Start a Daily session to build your review queue."
            : `${dueCount} card${dueCount === 1 ? "" : "s"} ready for review.`
        }
        chip={
          countdown ? (
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
              <Clock className="size-3.5" aria-hidden />
              Next review in {countdown}
            </span>
          ) : null
        }
        accent="rainbow-4"
        icon={<RotateCw className="size-5" aria-hidden />}
        cta={
          <StartSessionButton
            input={{ mode: "review", limit: 15 }}
            variant="soft"
            disabled={reviewDisabled}
          >
            {reviewDisabled ? "Nothing due" : "Start review"}
          </StartSessionButton>
        }
      />
    </section>
  );
}

function ModeCard({
  title,
  blurb,
  icon,
  cta,
  accent,
  chip,
}: {
  title: string;
  blurb: string;
  icon: React.ReactNode;
  cta: React.ReactNode;
  accent: "rainbow-1" | "rainbow-2" | "rainbow-3" | "rainbow-4" | "rainbow-5";
  chip?: React.ReactNode;
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-[0_10px_24px_-16px_rgba(255,107,107,0.35)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full blur-2xl"
        style={{
          background: `color-mix(in oklab, var(--${accent}) 28%, transparent)`,
        }}
      />
      <div className="relative flex items-start gap-3">
        <span
          className="inline-flex size-10 items-center justify-center rounded-xl"
          style={{
            background: `color-mix(in oklab, var(--${accent}) 14%, var(--card))`,
            color: `var(--${accent})`,
          }}
        >
          {icon}
        </span>
        <div className="flex-1">
          <h2 className="font-display text-xl text-ink">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
          {chip}
        </div>
      </div>
      <div className="relative mt-5">{cta}</div>
    </article>
  );
}
