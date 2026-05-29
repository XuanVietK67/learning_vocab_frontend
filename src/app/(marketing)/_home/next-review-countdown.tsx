"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import { cn, formatTimeUntil } from "@/lib/utils";

type Props = {
  /** ISO timestamp of the soonest future-scheduled card. */
  nextDueAt: string;
  className?: string;
  /** Fired once when the countdown hits zero, alongside the stats refresh. */
  onExpire?: () => void;
};

/**
 * Live "Next review in {countdown}" chip. Now that learning steps schedule
 * cards minutes out, the label can't be computed once server-side — it ticks
 * down on the client and, when it reaches zero, calls `router.refresh()` so the
 * dashboard re-fetches stats and the Start buttons re-enable on their own.
 */
export function NextReviewCountdown({ nextDueAt, className, onExpire }: Props) {
  const router = useRouter();
  // Re-render on a cadence; `formatTimeUntil` reads the live clock each time.
  const [, tick] = React.useState(0);
  const refreshed = React.useRef(false);

  const label = formatTimeUntil(nextDueAt);

  React.useEffect(() => {
    // Already due (or just expired): pull fresh stats once, then stop.
    if (!label) {
      if (!refreshed.current) {
        refreshed.current = true;
        onExpire?.();
        router.refresh();
      }
      return;
    }
    refreshed.current = false;
    const id = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, [label, nextDueAt, router, onExpire]);

  if (!label) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent",
        className,
      )}
    >
      <Clock className="size-3.5" aria-hidden />
      Next review in {label}
    </span>
  );
}
