"use client";

import * as React from "react";
import { Check, Search, X } from "lucide-react";
import { LANGUAGES, type Language } from "@/lib/data/languages";
import { CountryFlag } from "./country-flag";

type Props = {
  selected: string | null;
  disabledCode: string | null;
  onPick: (code: string) => void;
};

// Rainbow left-edge accents — cycles through 5 colors via row index.
const RAINBOW_EDGE = [
  "before:bg-rainbow-1",
  "before:bg-rainbow-2",
  "before:bg-rainbow-3",
  "before:bg-rainbow-4",
  "before:bg-rainbow-5",
];

export function LangPicker({ selected, disabledCode, onPick }: Props) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo<Language[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q) ||
        l.code.toLowerCase().startsWith(q),
    );
  }, [query]);

  const popular = React.useMemo(() => LANGUAGES.filter((l) => l.popular), []);
  const showPopular = query.trim() === "";
  const selectedLang = LANGUAGES.find((l) => l.code === selected);

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="group relative flex items-center rounded-full border-2 border-line bg-white px-4.5 transition-colors focus-within:border-accent focus-within:shadow-[0_0_0_5px_color-mix(in_oklab,var(--accent-color)_18%,transparent)]">
        <Search className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${LANGUAGES.length} languages…`}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 border-0 bg-transparent px-3 py-3.5 font-sans text-base text-ink outline-none placeholder:text-muted-foreground"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="grid size-6 cursor-pointer place-items-center rounded-full text-muted-foreground hover:bg-black/5 hover:text-ink"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
        {selectedLang && !query && (
          <div
            className="ml-2 flex items-center gap-2 rounded-full bg-accent-soft px-2.5 py-1.5 font-display text-[13px] italic text-ink"
            title={`Selected: ${selectedLang.name}`}
          >
            <CountryFlag lang={selectedLang} size={20} />
            <span dir="auto">{selectedLang.native}</span>
          </div>
        )}
      </div>

      {/* Popular chips */}
      {showPopular && (
        <div className="flex flex-col gap-2.5">
          <div className="font-mono text-[11px] tracking-[0.04em] text-muted-foreground">Popular</div>
          <div className="flex flex-wrap gap-2">
            {popular.map((l) => {
              const sel = selected === l.code;
              const dis = disabledCode === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => !dis && onPick(l.code)}
                  disabled={dis}
                  title={l.name}
                  className={
                    "inline-flex items-center gap-2 rounded-full border-2 bg-white py-1.5 pl-1.5 pr-3.5 font-sans text-sm font-semibold text-ink transition-all duration-200 " +
                    (dis
                      ? "cursor-not-allowed opacity-35 border-line"
                      : sel
                        ? "border-accent bg-[color-mix(in_oklab,var(--accent-color)_14%,white)] shadow-[0_3px_0_0_color-mix(in_oklab,var(--accent-color)_55%,black)]"
                        : "border-line hover:-translate-y-0.5 hover:-rotate-1 hover:border-accent hover:shadow-[0_3px_0_0_color-mix(in_oklab,var(--accent-color)_40%,black)] cursor-pointer")
                  }
                >
                  <CountryFlag lang={l} size={22} />
                  <span dir="auto">{l.native}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results list */}
      <div className="overflow-hidden rounded-[var(--radius-md)] border-2 border-line bg-white shadow-[0_6px_0_0_var(--line)]" role="listbox">
        <div className="flex items-center justify-between border-b-2 border-dashed border-line bg-[color-mix(in_oklab,var(--accent-color)_6%,white)] px-4.5 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          <span>
            {showPopular
              ? "All languages"
              : `${filtered.length} match${filtered.length === 1 ? "" : "es"}`}
          </span>
          <span className="opacity-70">{LANGUAGES.length} total</span>
        </div>

        <div
          className="max-h-[360px] overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "var(--line) transparent" }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4.5 py-12 text-center text-muted-foreground">
              <div className="font-display text-4xl italic text-line">∅</div>
              <div>No language matches &ldquo;{query}&rdquo;</div>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="cursor-pointer rounded-full bg-transparent px-3 py-1.5 text-[13px] font-semibold text-muted-foreground hover:bg-accent-soft hover:text-ink"
              >
                Clear search
              </button>
            </div>
          ) : (
            filtered.map((l, idx) => {
              const sel = selected === l.code;
              const dis = disabledCode === l.code;
              const edge = RAINBOW_EDGE[idx % RAINBOW_EDGE.length];
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onClick={() => !dis && onPick(l.code)}
                  disabled={dis}
                  className={
                    "relative flex w-full items-center gap-3.5 border-0 border-b-[1.5px] border-dashed border-line bg-transparent px-5 py-3.5 text-left font-sans text-ink transition-[background,transform] duration-200 last:border-b-0 " +
                    "before:absolute before:left-0 before:top-[14%] before:bottom-[14%] before:w-1 before:rounded-r before:opacity-0 before:transition-opacity before:duration-200 " +
                    edge +
                    " " +
                    (dis
                      ? "cursor-not-allowed opacity-35"
                      : sel
                        ? "cursor-pointer bg-[color-mix(in_oklab,var(--accent-color)_12%,transparent)] before:w-[5px] before:opacity-100"
                        : "cursor-pointer hover:translate-x-1 hover:bg-[color-mix(in_oklab,var(--accent-color)_8%,transparent)] hover:before:opacity-100")
                  }
                >
                  <CountryFlag lang={l} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-xl italic leading-[1.15]" dir="auto">
                      {l.native}
                    </div>
                    <div className="text-xs tracking-[0.02em] text-muted-foreground">
                      {l.name}
                    </div>
                  </div>
                  <div className="rounded bg-black/5 px-2 py-0.5 font-mono text-[11px] lowercase text-muted-foreground">
                    {l.code}
                  </div>
                  <div className="flex w-9 items-center justify-end text-accent">
                    {sel && <Check className="size-3.5" strokeWidth={2.5} />}
                    {dis && (
                      <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                        in use
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
