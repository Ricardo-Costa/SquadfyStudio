# Quickstart & Manual Validation: Developer Catalogue

**Feature**: 002-developer-catalogue
**Date**: 2026-06-30

---

## Setup

```bash
# Terminal 1 — JSON Server mock API
npm run mock

# Terminal 2 — Next.js dev server
npm run dev
```

Navigate to `http://localhost:3000`. Log in with credentials from `.env.local`.

---

## US1 Checklist — Browse Developer Catalogue (P1)

**Goal**: Grid of developer cards loads automatically on `/dashboard`.

- [ ] Navigate to `/dashboard` (login first if needed)
- [ ] A loading state (skeleton cards) is visible briefly while data fetches
- [ ] After loading: a grid of developer cards is displayed
- [ ] Each card shows: full name, avatar image, seniority level, cost, and skills
- [ ] At least 20 cards appear when no filters are active
- [ ] Stop `npm run mock` and reload: error state with retry button appears in place of grid
- [ ] Restart `npm run mock`, click retry: catalogue loads successfully

---

## US2 Checklist — Filter by Name (P2)

**Goal**: Real-time case-insensitive partial name search.

- [ ] Type a partial name into the search field (e.g., "ana")
- [ ] Catalogue updates immediately — only developers whose names contain "ana" (case-insensitive) are shown
- [ ] Type an uppercase version (e.g., "ANA") — same results
- [ ] Clear the search field — full catalogue restores immediately
- [ ] Type a name that matches no developer (e.g., "zzzzz") — empty state message appears (not a blank grid or error)

---

## US3 Checklist — Filter by Seniority (P3)

**Goal**: Multi-select seniority toggle; works simultaneously with name search.

- [ ] Click "Junior" toggle button — only junior developers are shown
- [ ] Click "Senior" toggle button (while Junior is active) — both Junior and Senior developers are shown; Mid developers are hidden
- [ ] Click "Junior" again to deselect — only Senior developers remain
- [ ] Click "Senior" to deselect all — full catalogue restores
- [ ] Activate name search AND seniority filter simultaneously — only developers matching BOTH criteria are shown
- [ ] Combined filters producing zero results — empty state with hint to clear filters

---

## US4 Checklist — Handle Catalogue Errors (P4)

**Goal**: Error state with retry when JSON Server is unreachable.

- [ ] Stop `npm run mock` (`Ctrl+C` in mock terminal)
- [ ] Navigate to `/dashboard` (or reload while on it)
- [ ] Error message is displayed with a visible retry button
- [ ] The rest of the page (header, layout) remains functional
- [ ] Restart `npm run mock`
- [ ] Click retry button — catalogue loads successfully

---

## Visual Quality Checks

- [ ] Cards have consistent height and alignment in the grid
- [ ] Seniority toggle buttons have clear active/inactive visual states
- [ ] Search field has a visible focus ring
- [ ] Skeleton cards match the dimensions of real cards (no layout shift on load)
- [ ] A developer card with a broken avatar URL shows a placeholder (initials or fallback image)
- [ ] Grid is responsive: multiple columns on desktop, fewer on mobile
- [ ] Cost is formatted as `$XX/hr`
- [ ] Seniority label is displayed with correct capitalisation (Junior / Mid / Senior)

---

## Performance Checks

- [ ] Navigate away from `/dashboard` and back within 5 minutes: data loads instantly (no re-fetch, cache hit)
- [ ] Typing in the search field: results update within 100ms (no visible delay)
- [ ] Toggling seniority buttons: catalogue updates within 100ms
