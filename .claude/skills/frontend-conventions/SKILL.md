---
name: frontend-conventions
description: Apply this project's frontend rules (Next.js App Router, Server vs Client Components, TanStack Query, Zustand, React Hook Form + Zod, shadcn/ui + Tailwind, Framer Motion, accessibility, error handling). Use whenever writing, reviewing, or refactoring any code under app/, components/, hooks/, lib/, or services/ — or when the task mentions pages, routes, components, forms, queries, mutations, styling, or animations.
---

# Frontend Conventions

This project has a single source of truth for frontend rules: [frontend-conventions.md](../../../frontend-conventions.md).

## How to use this skill

1. **Read [frontend-conventions.md](../../../frontend-conventions.md) in full before writing or editing frontend code.** Do not work from memory — the file is the contract.
2. Map the task to the relevant sections and follow them exactly:
   - New page / route / data fetch → §1 Architecture, §2 TanStack Query
   - Global UI state (modal, sidebar, theme) → §3 Zustand
   - Form → §4 React Hook Form + Zod
   - Visual component / styling → §5 shadcn/ui + Tailwind
   - Failure paths → §6 Error Handling
   - Any interactive element → §7 Accessibility
   - Motion → §8 Framer Motion
3. Before reporting the task complete, walk the **§10 Pre-Commit Review Checklist** against your diff. Call out any item you skipped and why.

## Non-negotiables (quick reference)

- Default to **Server Components**; `"use client"` requires a justification from §1.
- **Never** fetch with `useEffect` + `useState` — use Server Components or TanStack Query (§2).
- **Never** store fetched API data in Zustand (§3).
- **Never** use arbitrary Tailwind values (`w-[137px]`) or hard-code hex/rgb (§5).
- **Never** swallow errors silently; every fetch/mutation has visible loading + error states (§6, §10).
- **Never** use `outline-none` without a replacement focus ring (§7).

## When the conventions file and a request conflict

Flag it to the user before deviating. Do not silently override the conventions.
