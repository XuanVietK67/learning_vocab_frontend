<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:kawaii-theme-rules -->
# Kawaii theme — applies to every page

Lexa is a kawaii product. Every page, modal, and surface must visually belong to the same playful "Rainbow Cream" palette. The global shell already provides the look — your job is to use the tokens, not reinvent them.

## Global shell (do not duplicate)

[src/app/layout.tsx](src/app/layout.tsx) mounts two layers behind every page:

- `.kawaii-bg` — fixed full-viewport rainbow gradient (cream + coral/gold/mint/periwinkle/lavender blobs).
- `<StickerLayer />` from [src/components/decor/sticker-layer.tsx](src/components/decor/sticker-layer.tsx) — five floating sticker SVGs in fixed corners.

Page-level layouts wrap content in `relative z-[2]` so it sits above both layers. **Never** re-add `kawaii-bg`, the sticker layer, or a competing solid background on a child layout/page — it breaks the look.

## Tokens, not hex values

All colors come from CSS variables defined in [src/app/globals.css](src/app/globals.css). Use the Tailwind classes that map to them; do not hardcode hex/rgb values in components.

| Purpose | Token / class |
|---|---|
| Page background | `bg-bg` / `bg-bg-soft` (cream) — usually inherited; don't set per-page |
| Card / surface | `bg-card` with `border-line` |
| Primary text | `text-ink` (titles), `text-ink-2` (body emphasis) |
| Secondary text | `text-muted-foreground`, `text-muted-2` |
| Hairlines | `border-line`, `border-line-2` |
| Primary CTA | `bg-accent text-accent-foreground` (coral) — **not** flat `bg-ink` |
| Accent tint / soft fill | `bg-accent-soft`, `text-accent` |
| Rainbow accents | `var(--rainbow-1..5)` — coral, gold, mint, periwinkle, lavender |
| Status | `text-success`, `text-warn`, `bg-danger-soft text-danger` |

Rainbow tokens are for decorative variety (steppers, list rows, soft halos behind cards, profile markers, goal tiles). Don't pick rainbow values for primary CTAs — use `accent`.

## Shape, depth, motion

- **Radii**: cards = `rounded-2xl`, buttons/inputs = `rounded-xl` or `rounded-2xl`, pills = `rounded-full`. Anything `rounded-sm` should be a deliberate exception.
- **Shadows**: soft, coral-tinted lifts (e.g. `shadow-[0_10px_24px_-12px_rgba(255,107,107,0.6)]`). Avoid hard grey drop shadows.
- **Motion**: prefer the project-provided animations — `animate-fade-up` (entrances), `animate-pop` (success/fill), `animate-float` (decor), `animate-shake` (errors). The global `prefers-reduced-motion` rule neutralizes them — don't bypass it with inline timings.

## Decorative accents

Reach for [src/components/decor/](src/components/decor/) before drawing new SVGs. For sparkle/heart inline accents, use `lucide-react` icons (`Sparkles`, `Heart`, `Star`) tinted with `text-accent` or a `var(--rainbow-N)` color. Inline blurred blobs (`absolute … blur-2xl` over a rainbow token) are an acceptable kawaii flourish on card corners.

## Quick checklist before shipping a new page

- [ ] No hardcoded hex / rgb values.
- [ ] No re-added `kawaii-bg` / sticker layer / solid page background.
- [ ] Primary CTA uses `bg-accent`, not `bg-ink`.
- [ ] Inputs and cards use rounded-xl/2xl with `border-line`.
- [ ] Any decorative SVG comes from `components/decor/` or a lucide icon.
- [ ] Motion uses the existing animation classes (so reduced-motion still works).
<!-- END:kawaii-theme-rules -->
