import type { DeckSummary } from "@/lib/api/decks";
import { DeckCard } from "./deck-card";

type Props = {
  title: string;
  blurb?: string;
  decks: DeckSummary[];
  emptyState: React.ReactNode;
  action?: React.ReactNode;
};

export function DecksGrid({ title, blurb, decks, emptyState, action }: Props) {
  return (
    <section
      aria-label={title}
      className="animate-fade-up rounded-2xl border border-line bg-card p-6"
    >
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">{title}</h2>
          {blurb ? (
            <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
          ) : null}
        </div>
        {action}
      </header>
      {decks.length === 0 ? (
        emptyState
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {decks.map((d) => (
            <li key={d.id}>
              <DeckCard deck={d} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
