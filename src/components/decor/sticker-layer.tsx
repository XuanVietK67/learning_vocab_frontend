// Five floating kawaii SVG stickers in fixed-corner positions.
// Sits between the wavy background and page content (z-index 1).
// Hidden via the prefers-reduced-motion media query in globals.css.
export function StickerLayer() {
  return (
    <div className="deco-layer" aria-hidden>
      <svg
        className="deco deco-1"
        style={{ ["--rot" as never]: "-12deg" }}
        width="48"
        height="48"
        viewBox="0 0 48 48"
      >
        <path d="M24 4 L28 20 L44 24 L28 28 L24 44 L20 28 L4 24 L20 20 Z" fill="var(--rainbow-2)" />
      </svg>
      <svg
        className="deco deco-2"
        style={{ ["--rot" as never]: "8deg" }}
        width="40"
        height="40"
        viewBox="0 0 40 40"
      >
        <path
          d="M20 34 C 8 24, 4 16, 12 10 C 16 7, 20 11, 20 14 C 20 11, 24 7, 28 10 C 36 16, 32 24, 20 34 Z"
          fill="var(--rainbow-1)"
        />
      </svg>
      <svg
        className="deco deco-3"
        style={{ ["--rot" as never]: "-6deg" }}
        width="56"
        height="56"
        viewBox="0 0 56 56"
      >
        <circle cx="28" cy="28" r="10" fill="var(--rainbow-4)" />
        <circle cx="28" cy="28" r="20" fill="none" stroke="var(--rainbow-4)" strokeWidth="2" strokeDasharray="3 5" />
      </svg>
      <svg
        className="deco deco-4"
        style={{ ["--rot" as never]: "14deg" }}
        width="44"
        height="44"
        viewBox="0 0 44 44"
      >
        <path d="M22 6 L26 18 L38 22 L26 26 L22 38 L18 26 L6 22 L18 18 Z" fill="var(--rainbow-3)" />
      </svg>
      <svg
        className="deco deco-5"
        style={{ ["--rot" as never]: "-20deg" }}
        width="36"
        height="36"
        viewBox="0 0 36 36"
      >
        <circle cx="18" cy="18" r="4" fill="var(--rainbow-5)" />
        <circle cx="6" cy="6" r="2.5" fill="var(--rainbow-5)" />
        <circle cx="30" cy="6" r="2.5" fill="var(--rainbow-5)" />
        <circle cx="6" cy="30" r="2.5" fill="var(--rainbow-5)" />
        <circle cx="30" cy="30" r="2.5" fill="var(--rainbow-5)" />
      </svg>
    </div>
  );
}
