# Quickstart: Manual Verification — Grid Pagination

Prerequisites: `npm run mock` and `npm run dev` both running; logged in. `db.json`'s 22 seed
developers already exceed one page (12 per page) — no extra setup needed for the Catalogue. For
Squads, save at least 13 squads to see pagination there too (fewer than 13 will show no controls,
which is also worth confirming per FR-006).

## US1 — Paginated Developer Catalogue

1. Load `/dashboard` with no filters active. Confirm only the first 12 developer cards render, and
   "Previous"/"Page 1 of 2" (or however many pages 22 developers produce)/"Next" controls appear
   below the grid, with "Previous" disabled.
2. Click "Next". Confirm the remaining developers render, the page indicator updates, and "Next" is
   now disabled (last page) while "Previous" is enabled.
3. Click "Previous". Confirm it returns to the first page's 12 developers.
4. Type a search term that narrows results to fewer than 12. Confirm the view lands on page 1 of
   the narrowed results and the pagination controls disappear (single page).
5. Clear the search so results exceed 12 again. Confirm pagination controls reappear, starting at
   page 1.
6. Toggle a seniority filter while on page 2. Confirm the view returns to page 1 of the newly
   filtered results (never stays on page 2 of a different, smaller result set).

## US2 — Paginated Squads Listing

1. With 13+ saved squads, load `/dashboard/squads`. Confirm the same paging behavior as US1 steps
   1–3 applies to the squad cards.
2. Search/filter squads down to fewer than 12 results. Confirm the view resets to page 1 and
   controls disappear when everything fits on one page.
3. With a squad's detail panel open, change page. Confirm the detail panel's content is unaffected
   (still shows whichever squad was last clicked, independent of the current page).

## Cross-cutting checks

- `npm run build` completes with no TypeScript errors.
- `npm test` — confirm `lib/pagination.test.ts` passes alongside the existing `lib/metrics.test.ts`
  suite.
- Confirm paging the Catalogue does not affect the Squads screen's page (and vice versa) — visit
  one, page forward, navigate to the other screen, confirm it starts at page 1 independently.
