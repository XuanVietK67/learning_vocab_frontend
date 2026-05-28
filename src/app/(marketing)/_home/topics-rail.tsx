import { Hash } from "lucide-react";
import type { Topic } from "@/lib/api/topics";
import { StartSessionButton } from "./start-session-button";

type Props = {
  topics: Topic[];
};

const RAINBOW = ["rainbow-1", "rainbow-2", "rainbow-3", "rainbow-4", "rainbow-5"] as const;

export function TopicsRail({ topics }: Props) {
  return (
    <section
      aria-label="Topics"
      className="animate-fade-up rounded-2xl border border-line bg-card p-6"
    >
      <header className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Pick a topic</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start a session focused on words from one area.
          </p>
        </div>
      </header>
      {topics.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line-2 px-4 py-6 text-center text-sm text-muted-foreground">
          No topics yet — check back soon.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {topics.map((t, i) => (
            <TopicTile key={t.id} topic={t} tint={RAINBOW[i % RAINBOW.length]} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TopicTile({
  topic,
  tint,
}: {
  topic: Topic;
  tint: (typeof RAINBOW)[number];
}) {
  return (
    <li
      className="group relative overflow-hidden rounded-2xl border border-line p-4 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(255,107,107,0.45)]"
      style={{
        background: `color-mix(in oklab, var(--${tint}) 10%, var(--card))`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-20 rounded-full blur-2xl"
        style={{
          background: `color-mix(in oklab, var(--${tint}) 30%, transparent)`,
        }}
      />
      <div className="relative flex items-center gap-2">
        <span
          className="inline-flex size-7 items-center justify-center rounded-lg"
          style={{
            background: `color-mix(in oklab, var(--${tint}) 22%, var(--card))`,
            color: `var(--${tint})`,
          }}
        >
          <Hash className="size-3.5" aria-hidden />
        </span>
        <h3 className="truncate text-sm font-semibold text-ink">{topic.name}</h3>
      </div>
      {topic.description ? (
        <p className="relative mt-2 line-clamp-2 text-xs text-muted-foreground">
          {topic.description}
        </p>
      ) : (
        <p className="relative mt-2 text-xs text-muted-2">/{topic.slug}</p>
      )}
      <div className="relative mt-4">
        <StartSessionButton
          input={{ mode: "topic", topicSlug: topic.slug, limit: 10 }}
          variant="soft"
          size="sm"
          className="w-full"
        >
          Start
        </StartSessionButton>
      </div>
    </li>
  );
}
