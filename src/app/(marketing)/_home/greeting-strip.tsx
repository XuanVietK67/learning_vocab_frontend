import { Flame, Clock3, Target, CheckCircle2 } from "lucide-react";
import type { MeStats } from "@/lib/api/stats";

type Props = {
  username: string;
  stats: MeStats;
};

export function GreetingStrip({ username, stats }: Props) {
  const goal = stats.dailyGoalMinutes ?? 0;
  const reviewed = stats.reviewedToday;

  return (
    <section
      aria-label="Today at a glance"
      className="animate-fade-up rounded-2xl border border-line bg-card p-6 shadow-[0_10px_24px_-16px_rgba(255,107,107,0.45)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Welcome back
          </p>
          <h1 className="mt-1 font-display text-2xl text-ink md:text-3xl">
            Hi, {username}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip
            icon={<Flame className="size-4" aria-hidden />}
            color="rainbow-1"
            label="Streak"
            value={`${stats.streakDays}d`}
          />
          <Chip
            icon={<Clock3 className="size-4" aria-hidden />}
            color="rainbow-4"
            label="Due now"
            value={`${stats.dueNow}`}
          />
          <Chip
            icon={<CheckCircle2 className="size-4" aria-hidden />}
            color="rainbow-3"
            label="Reviewed today"
            value={`${reviewed}`}
          />
          {goal > 0 ? (
            <Chip
              icon={<Target className="size-4" aria-hidden />}
              color="rainbow-2"
              label="Daily goal"
              value={`${goal}m`}
            />
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Mini label="New" value={stats.counts.new} tint="rainbow-4" />
        <Mini label="Learning" value={stats.counts.learning} tint="rainbow-2" />
        <Mini label="Review" value={stats.counts.review} tint="rainbow-3" />
        <Mini label="Mastered" value={stats.counts.mastered} tint="rainbow-5" />
      </div>
    </section>
  );
}

function Chip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "rainbow-1" | "rainbow-2" | "rainbow-3" | "rainbow-4" | "rainbow-5";
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-ink"
      style={{ color: `var(--${color})` }}
    >
      {icon}
      <span className="text-ink">
        <span className="text-muted-foreground">{label}: </span>
        <span className="font-semibold" style={{ color: `var(--${color})` }}>
          {value}
        </span>
      </span>
    </span>
  );
}

function Mini({
  label,
  value,
  tint,
}: {
  label: string;
  value: number;
  tint: "rainbow-1" | "rainbow-2" | "rainbow-3" | "rainbow-4" | "rainbow-5";
}) {
  return (
    <div
      className="rounded-xl border border-line px-3 py-2.5"
      style={{
        background: `color-mix(in oklab, var(--${tint}) 10%, var(--card))`,
      }}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-1 font-display text-xl"
        style={{ color: `var(--${tint})` }}
      >
        {value}
      </div>
    </div>
  );
}
