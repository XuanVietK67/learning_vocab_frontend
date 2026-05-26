# Frontend Conventions — Next.js + shadcn/ui + Tailwind

## 1. Architecture & Rendering Strategy

**Default: Server Components.** Only add `"use client"` when a component genuinely needs it.

### When `"use client"` is justified

- User interactions (onClick, onChange, onSubmit)
- Browser APIs (localStorage, IntersectionObserver, window)
- React hooks that depend on client state (useState, useReducer, useRef for DOM)
- Third-party libraries that use hooks internally

### When it is NOT justified

- Fetching data (use Server Components or Server Actions)
- Reading cookies/headers (use `next/headers`)
- Conditional rendering based on server-known data

### File conventions

| File             | Purpose                                    |
| ---------------- | ------------------------------------------ |
| `page.tsx`       | Thin — data fetching + layout composition  |
| `loading.tsx`    | Route-level Suspense fallback              |
| `error.tsx`      | Route-level error boundary (must be client)|
| `layout.tsx`     | Shared shell, never re-renders on navigate |

Move domain logic into `/lib`, `/services`, or `/hooks`. Pages should read like a table of contents, not contain business rules.

### Data flow decision tree

```
Need data on first render?
├─ Yes → Server Component fetch (with caching)
│        └─ Need to revalidate client-side? → also hydrate TanStack Query
└─ No, triggered by user action?
   ├─ Reads → TanStack Query (useQuery)
   └─ Writes → Server Action or TanStack Mutation (useMutation)
```

---

## 2. Server State — TanStack Query

- All server/async state lives in TanStack Query. Never `useEffect` + `useState` for fetching.
- **Query keys** follow a consistent factory pattern:

```ts
export const userKeys = {
  all:    ["users"] as const,
  lists:  ()           => [...userKeys.all, "list"] as const,
  list:   (filters: F) => [...userKeys.lists(), filters] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
};
```

- Every query handles three states: loading (skeleton/spinner), error (retry + message), success.
- Use `placeholderData` for instant perceived navigation; use `initialData` when seeded from server.
- Use **optimistic updates** for mutations where latency matters (toggles, likes, reorder). Always roll back on error.

---

## 3. Client State — Zustand

Zustand is for **UI-only global state** — things with no server equivalent:

- Sidebar open/closed, modal stack, theme preference, toast queue
- Ephemeral filters/sort that don't persist

**Anti-patterns:**

- Storing fetched API data (belongs in TanStack Query)
- Giant monolith stores (split by domain: `useUIStore`, `useAuthStore`)
- Duplicating derived state — compute it with selectors instead

---

## 4. Forms — React Hook Form + Zod

```ts
const schema = z.object({
  email: z.string().email("Enter a valid email"),
  name:  z.string().min(2, "Name must be at least 2 characters"),
});

type FormValues = z.infer<typeof schema>;
```

- Always colocate the Zod schema with the form that uses it.
- Use `<FormField>` / `<FormItem>` from shadcn for consistent error display.
- Show per-field inline errors. Never rely solely on a toast for validation failures.
- For multi-step forms, use one schema per step and validate on step transition.
- Avoid uncontrolled inputs outside of RHF — don't mix paradigms.

---

## 5. UI Components — shadcn/ui + Tailwind

### Component selection order

1. **shadcn component** exists? Use it.
2. shadcn component exists but needs tweaks? **Extend it** — add variants via `cva`, don't fork.
3. No shadcn component? Build with **Radix primitives** + Tailwind first, custom last.

### Tailwind rules

- **Mobile-first**: write the base styles for small screens, layer up with `sm:`, `md:`, `lg:`.
- Use the `cn()` helper (clsx + twMerge) for conditional classes.
- Avoid arbitrary values (`w-[137px]`) — if you need one, that's a sign the spacing scale is missing a token.
- Keep class strings under ~10 utilities; extract to a component or `@apply` in rare cases.
- Consistent ordering: layout → sizing → spacing → typography → colors → effects.

### Design tokens

- Use CSS variables from the shadcn theme (`--primary`, `--muted`, `--radius`, etc.).
- Extend via `tailwind.config.ts` — never hard-code hex/rgb in class strings.
- Typography: limit to 3-4 sizes per page. Use semantic names (`text-heading`, `text-body`, `text-caption`) where possible.
- Spacing: stick to the Tailwind scale (4px increments). Consistency > pixel-perfection.

---

## 6. Error Handling Strategy

### Layers

| Layer               | Mechanism                        | Shows                          |
| ------------------- | -------------------------------- | ------------------------------ |
| Route segment       | `error.tsx`                      | Full-page fallback with retry  |
| Component           | React Error Boundary             | Isolated fallback              |
| Data fetch (client) | TanStack Query `onError` / `isError` | Inline error + retry button |
| Mutations           | `onError` callback               | Toast with action description  |
| Forms               | Zod + RHF                        | Inline field errors            |

- Never swallow errors silently. Log to your monitoring tool in every `error.tsx`.
- Distinguish **expected errors** (4xx — show user message) from **unexpected errors** (5xx — show generic message + log).
- Server Actions should return `{ success: boolean; error?: string }` — not throw.

---

## 7. Accessibility

- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<button>`, `<a>`) before `<div>`.
- Every interactive element must be keyboard-reachable and operable.
- Inputs always have a visible `<label>` (or `aria-label` only for icon-only buttons).
- Visible focus rings — never `outline-none` without a replacement.
- Icons used alone need `aria-label` or `sr-only` text.
- Use shadcn's built-in Radix accessibility — don't override `role` or `aria-*` unless you're certain.

---

## 8. Animation — Framer Motion

### Defaults

```ts
const transition = { duration: 0.2, ease: "easeOut" }; // ≤300ms
```

### Where to animate

- Page/route transitions (layout animations)
- Modal/sheet/popover enter/exit
- List reordering (`AnimatePresence` + `layoutId`)
- Skeleton → content swap
- Hover/tap micro-feedback on interactive elements

### Where NOT to animate

- Data table row rendering (too many elements, causes jank)
- Form validation error appearance (instant is better)
- Scroll position changes

### Reduced motion

```ts
const prefersReduced = useReducedMotion();
// Disable or simplify animations when true
```

Always wrap animated components in an `AnimatePresence` when they conditionally mount/unmount.

---

## 9. Performance Checklist

- [ ] Default to Server Components; `"use client"` is opt-in with a reason
- [ ] Heavy client components use `next/dynamic` with `{ ssr: false }` when appropriate
- [ ] Images use `next/image` with explicit `width`/`height` or `fill`
- [ ] No `useEffect` for data fetching — use TanStack Query or Server Components
- [ ] `React.memo` / `useMemo` / `useCallback` only when profiler shows a problem — not preemptively
- [ ] `<Suspense>` boundaries wrap slow async components to avoid full-page blocking
- [ ] Bundle size checked — no large libraries imported just for one utility

---

## 10. Pre-Commit Review Checklist

Before merging, verify:

- [ ] **Hydration safety**: no mismatch between server and client render (no `Date.now()`, `Math.random()`, or `window` in shared render paths)
- [ ] **Server/Client boundary**: every `"use client"` is justified; data doesn't flow the wrong direction
- [ ] **Responsive**: tested at 320px, 768px, 1280px minimum
- [ ] **Accessible**: keyboard navigable, screen reader tested on key flows
- [ ] **Type-safe**: no `any`, no `@ts-ignore` without a comment explaining why
- [ ] **Tailwind consistent**: no arbitrary values without justification, cn() for conditionals
- [ ] **shadcn consistent**: no custom component duplicating an existing shadcn primitive
- [ ] **Error handling**: every fetch/mutation has loading + error states visible to the user
- [ ] **No console.log**: clean up before merge

---

## 11. Testing (Recommended)

- **Component tests**: React Testing Library — test behavior, not implementation
- **API mocking**: MSW (Mock Service Worker) for consistent request interception
- **E2E**: Playwright for critical user flows (auth, checkout, onboarding)
- **Accessibility**: `jest-axe` or Playwright `@axe-core/playwright` in CI
- Write tests for logic, not for Tailwind classes.
