import * as React from "react";
import type { Language } from "@/lib/data/languages";

type Props = { lang: Language | undefined; size?: number; className?: string };

// Renders a circular country flag SVG from /public/flags/ (copied from the
// circle-flags package by scripts/copy-flags.mjs). If the language has no
// canonical country (Esperanto, Latin, etc.), falls back to a two-tone letter
// glyph in the language's brand colors.
export function CountryFlag({ lang, size = 28, className }: Props) {
  if (!lang) return null;

  if (lang.country) {
    // Static SVG asset served from /public/flags/ — next/image's optimizer
    // doesn't help for SVGs, and the file is < 2KB, so a plain <img> is fine.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/flags/${lang.country}.svg`}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`shrink-0 rounded-full ring-1 ring-black/10 ${className ?? ""}`}
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    );
  }

  // No-country fallback — two-tone circle with the language's letter glyph.
  const textColor = lang.fallbackA.toUpperCase() === "#FFFFFF" ? lang.fallbackB : "#FFFFFF";
  return (
    <span
      aria-hidden
      className={`relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <span className="absolute inset-x-0 top-0 bottom-1/2" style={{ background: lang.fallbackA }} />
      <span className="absolute inset-x-0 top-1/2 bottom-0" style={{ background: lang.fallbackB }} />
      <span
        className="absolute inset-0 grid place-items-center font-display italic"
        style={{ fontSize: size * 0.45, color: textColor, textShadow: "0 1px 2px rgba(0,0,0,0.18)" }}
      >
        {lang.letter}
      </span>
    </span>
  );
}
