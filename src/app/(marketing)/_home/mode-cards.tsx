"use client";

import * as React from "react";
import { Sparkles, RotateCw, Inbox } from "lucide-react";
import type { MeStats } from "@/lib/api/stats";
import { StartSessionButton } from "./start-session-button";
import { NextReviewCountdown } from "./next-review-countdown";

type Props = {
  stats: MeStats;
};

export function ModeCards({ stats }: Props) {
  const dueCount = stats.dueNow;
  const statsCaughtUp = dueCount === 0;

  // The picker can disagree with `stats.dueNow`: review excludes new cards, and
  // daily tops up with fresh vocab — so a mode can be empty while dueNow > 0.
  // When a start attempt comes back time-based-empty we capture its nextDueAt
  // and let that card show the countdown, regardless of what stats reports.
  const [reviewDueAt, setReviewDueAt] = React.useState<string | null>(null);
  const [dailyDueAt, setDailyDueAt] = React.useState<string | null>(null);
  // Daily came back empty: no due cards AND no fresh vocab at the user's level.
  // Stats can't predict this up front, so it's set from the picker result.
  const [dailyExhausted, setDailyExhausted] = React.useState(false);

  // A confirmed empty result wins; otherwise fall back to stats when nothing is
  // due at all (dueNow === 0).
  const reviewNextDue = reviewDueAt ?? (statsCaughtUp ? stats.nextDueAt : null);
  const dailyNextDue = dailyDueAt ?? (statsCaughtUp ? stats.nextDueAt : null);
  const reviewDisabled = statsCaughtUp || reviewDueAt != null;

  // Clear the daily empty state once its countdown elapses — by then a card has
  // likely come due, so Daily has something to serve again.
  const clearDaily = React.useCallback(() => {
    setDailyDueAt(null);
    setDailyExhausted(false);
  }, []);

  const dailyChips =
    dailyExhausted || dailyNextDue ? (
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {dailyExhausted ? <NoNewWordsChip /> : null}
        {dailyNextDue ? (
          <NextReviewCountdown nextDueAt={dailyNextDue} onExpire={clearDaily} />
        ) : null}
      </div>
    ) : null;

  return (
    <section
      aria-label="Start learning"
      className="grid animate-fade-up gap-4 md:grid-cols-2"
    >
      <ModeCard
        title="Daily"
        blurb={
          dailyExhausted
            ? "All caught up — no new words at your level right now."
            : dailyNextDue
              ? "All caught up on reviews — get ahead with fresh words."
              : "Mix of due cards and fresh words tuned to your level."
        }
        chip={dailyChips}
        accent="rainbow-1"
        icon={<Sparkles className="size-5" aria-hidden />}
        cta={
          <StartSessionButton
            input={{ mode: "daily", limit: 15 }}
            disabled={dailyExhausted}
            onTimeBasedEmpty={(due) => {
              setDailyDueAt(due);
              setDailyExhausted(true);
            }}
            onNoNewWords={() => setDailyExhausted(true)}
          >
            {dailyExhausted
              ? "Nothing new right now"
              : dailyNextDue
                ? "Get ahead with new words"
                : "Start daily session"}
          </StartSessionButton>
        }
      />
      <ModeCard
        title="Review"
        blurb={
          reviewNextDue
            ? "All caught up — nothing due right now."
            : statsCaughtUp
              ? "Nothing enrolled yet. Start a Daily session to build your review queue."
              : `${dueCount} card${dueCount === 1 ? "" : "s"} ready for review.`
        }
        chip={
          reviewNextDue ? (
            <NextReviewCountdown
              nextDueAt={reviewNextDue}
              className="mt-2"
              onExpire={() => setReviewDueAt(null)}
            />
          ) : null
        }
        accent="rainbow-4"
        icon={<RotateCw className="size-5" aria-hidden />}
        cta={
          <StartSessionButton
            input={{ mode: "review", limit: 15 }}
            variant="soft"
            disabled={reviewDisabled}
            onTimeBasedEmpty={setReviewDueAt}
          >
            {reviewDisabled ? "Nothing due" : "Start review"}
          </StartSessionButton>
        }
      />
    </section>
  );
}

function NoNewWordsChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Inbox className="size-3.5" aria-hidden />
      No new words right now
    </span>
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
