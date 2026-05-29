"use client";

import * as React from "react";
import { Clock, PartyPopper, Compass, Layers, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EmptyReason, LearnMode } from "@/lib/api/learn";
import { cn, formatTimeUntil } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: EmptyReason | null;
  nextDueAt: string | null;
  /** Mode that produced the empty result — tailors the copy. */
  mode: LearnMode;
  /** Start a fresh Daily session (the universal "find me something" fallback). */
  onStartDaily: () => void;
  pending: boolean;
};

type Content = {
  icon: React.ReactNode;
  tint: string;
  title: string;
  description: string;
  /** When set, render a primary CTA that kicks off a Daily session. */
  dailyCta?: string;
  /** Label for the closing/dismiss button. */
  dismiss: string;
};

function resolve(reason: EmptyReason | null, mode: LearnMode, countdown: string | null): Content {
  switch (reason) {
    case "no_due_cards":
      return {
        icon: <PartyPopper className="size-7" aria-hidden />,
        tint: "rainbow-4",
        title: "You're all caught up!",
        description: countdown
          ? `Your next cards unlock in ${countdown}. Want to get ahead in the meantime?`
          : "No cards are due right now. Want to learn something new in the meantime?",
        dailyCta: "Learn something new",
        dismiss: "I'll wait",
      };
    case "no_enrollment":
      return {
        icon: <Sparkles className="size-7" aria-hidden />,
        tint: "rainbow-1",
        title: "Nothing enrolled yet",
        description:
          "You haven't added any words to review. Start a Daily session to pick up your first batch.",
        dailyCta: "Start Daily",
        dismiss: "Not now",
      };
    case "no_more_at_level":
      return {
        icon: <Compass className="size-7" aria-hidden />,
        tint: "rainbow-3",
        title:
          mode === "topic" ? "You've cleared this topic" : "You've cleared this level",
        description:
          mode === "topic"
            ? "No new words left in this topic at your level right now. Try another topic, or mix it up with a Daily session."
            : "You've likely learned every word at your level for now. Pick a topic to stretch into new areas.",
        dailyCta: mode === "topic" ? "Try Daily instead" : undefined,
        dismiss: mode === "topic" ? "Pick another topic" : "Browse topics",
      };
    case "deck_exhausted":
      return {
        icon: <Layers className="size-7" aria-hidden />,
        tint: "rainbow-5",
        title: "Deck's on schedule",
        description:
          "Every card in this deck is enrolled and waiting its turn. Reviews will surface them as they come due.",
        dailyCta: "Learn something new",
        dismiss: "Got it",
      };
    default:
      return {
        icon: <Clock className="size-7" aria-hidden />,
        tint: "rainbow-2",
        title: "Nothing to learn right now",
        description: "There's nothing queued at the moment. Try a Daily session to keep going.",
        dailyCta: "Start Daily",
        dismiss: "Close",
      };
  }
}

export function SessionEmptyDialog({
  open,
  onOpenChange,
  reason,
  nextDueAt,
  mode,
  onStartDaily,
  pending,
}: Props) {
  // Recompute the countdown each time the dialog opens (static while shown).
  const countdown = React.useMemo(
    () => (open ? formatTimeUntil(nextDueAt) : null),
    [open, nextDueAt],
  );
  const c = resolve(reason, mode, countdown);
  // Don't offer "Learn something new" as the way out of an empty Daily result —
  // it would just loop back to the same empty state.
  const showDaily = Boolean(c.dailyCta) && mode !== "daily";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex flex-col items-center">
          <span
            className="inline-flex size-14 items-center justify-center rounded-2xl"
            style={{
              background: `color-mix(in oklab, var(--${c.tint}) 16%, var(--card))`,
              color: `var(--${c.tint})`,
            }}
          >
            {c.icon}
          </span>
          <DialogTitle className="mt-4">{c.title}</DialogTitle>
          <DialogDescription>{c.description}</DialogDescription>

          {countdown && reason === "no_due_cards" ? (
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent">
              <Clock className="size-4" aria-hidden />
              Next review in {countdown}
            </span>
          ) : null}

          <div className="mt-6 flex w-full flex-col gap-2">
            {showDaily ? (
              <button
                type="button"
                onClick={onStartDaily}
                disabled={pending}
                className={cn(
                  "inline-flex h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-medium text-accent-foreground transition",
                  "shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)] hover:brightness-95",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {c.dailyCta}
              </button>
            ) : null}
            <DialogClose asChild>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-line-2 px-5 text-sm font-medium text-ink transition hover:bg-[color:var(--hover)]"
              >
                {c.dismiss}
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
