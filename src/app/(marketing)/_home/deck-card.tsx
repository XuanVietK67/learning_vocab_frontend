import { Layers } from "lucide-react";
import type { DeckSummary } from "@/lib/api/decks";
import { StartSessionButton } from "./start-session-button";

type Props = {
  deck: DeckSummary;
};

export function DeckCard({ deck }: Props) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-16px_rgba(255,107,107,0.45)]">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Layers className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base text-ink">{deck.name}</h3>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {deck.language}
            {deck.cefrLevel ? ` · ${deck.cefrLevel}` : ""} · {deck.vocabCount} words
          </p>
        </div>
      </div>
      {deck.description ? (
        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
          {deck.description}
        </p>
      ) : null}
      <div className="mt-auto pt-4">
        <StartSessionButton
          input={{ mode: "deck", deckId: deck.id, limit: 15 }}
          variant="soft"
          size="sm"
          className="w-full"
        >
          Start deck
        </StartSessionButton>
      </div>
    </article>
  );
}
