import { BookOpen, Plus } from "lucide-react";
import type { VocabularySummary } from "@/lib/api/my-vocab";

type Props = {
  words: VocabularySummary[];
};

export function MyVocabStrip({ words }: Props) {
  return (
    <section
      aria-label="Your vocabulary"
      className="animate-fade-up rounded-2xl border border-line bg-card p-6"
    >
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-ink">Your vocabulary</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Words you&apos;ve added yourself.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-line-2 px-3 py-1.5 text-xs text-muted-foreground">
          <Plus className="size-3.5" aria-hidden />
          Manage soon
        </span>
      </header>
      {words.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-line-2 px-4 py-8 text-center">
          <BookOpen className="size-5 text-muted-2" aria-hidden />
          <p className="text-sm text-muted-foreground">
            You haven&apos;t added any personal words yet.
          </p>
        </div>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {words.map((w) => (
            <li
              key={w.id}
              className="inline-flex items-baseline gap-2 rounded-full border border-line bg-bg-soft px-3 py-1.5 text-sm text-ink"
            >
              <span className="font-semibold">{w.lemma}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                {w.language}
                {w.cefrLevel ? ` · ${w.cefrLevel}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
