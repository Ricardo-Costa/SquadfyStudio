# Implementation Plan: Grid Pagination for Catalogue and Squads

**Branch**: `008-grid-pagination` | **Date**: 2026-07-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/008-grid-pagination/spec.md`

---

## Summary

Slice each screen's already-filtered result set into fixed-size pages (12 items, matching both
grids' shared 1/2/3/4-column responsive layout) and add Previous/Next + "Page X of Y" controls
below each grid. A small pure function (`lib/pagination.ts`) computes the page slice and total
page count; a thin hook (`hooks/usePagination.ts`) wraps it with `useState` and resets to page 1
synchronously whenever the filtered array changes (via React's documented render-time state-reset
pattern, not an effect). Neither `CatalogueGrid` nor the Squads grid's rendering needs to change —
they simply receive the already-paginated slice instead of the full filtered array, and their
existing empty-state checks keep working unmodified.

---

## Technical Context

**Language/Version**: TypeScript 5.8, strict mode

**Primary Dependencies**:
- `react@^19.0.0` — `useState` for the current-page hook; no new hooks/APIs beyond what's already used elsewhere in this codebase

**No new npm packages.**

**Storage**: N/A — pagination is purely an in-memory, client-side concern over data both screens already fetch in full.

**Testing**: The pagination slicing/page-count math is extracted into a pure function
(`lib/pagination.ts`) specifically so it can be unit-tested the same way `lib/metrics.ts` already
is — this isn't mandated by the Constitution's Jest rule (scoped to `lib/metrics.ts`), but follows
the same established pure-function-plus-thin-consumer pattern already proven in this codebase.
`lib/pagination.test.ts` covers it.

**Target Platform**: Browser only — both affected screens (`CatalogueView`, `SquadsView`) are
already client components.

**Performance Goals**:
- SC-002 (page changes under 100ms): trivially met — an array `.slice()` over at most a few dozen
  items, no network involved.

**Constraints**:
- Page size is a fixed `12` for both screens (per spec Assumptions) — divides evenly into the
  shared `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` responsive pattern both
  `CatalogueGrid` and the Squads grid already use (confirmed identical in both files).
- Resetting to page 1 on filter change uses React's render-time "adjust state when a prop changes"
  pattern (comparing the incoming filtered array's reference against a stored previous value and
  calling `setState` mid-render if it differs) — not a `useEffect` — to avoid an extra
  render/flash-of-stale-page before correcting.
- `CatalogueGrid` and the Squads grid's internal loading/error/empty rendering are NOT modified —
  they continue to receive an array (now the paginated slice instead of the full filtered list)
  and their existing `.length === 0` empty check keeps working correctly, since pagination always
  resets to page 1 on any filter change (page-empty-while-results-exist cannot occur).
- No new npm dependency for the Previous/Next control — a plain component styled consistently with
  the rest of the app (Constitution Principle V).

**Scale/Scope**: 1 new pure lib function + test, 1 new hook, 1 new shared UI component
(`PaginationControls`), 2 existing view files updated (`CatalogueView.tsx`, `SquadsView.tsx`). No
route changes, no backend changes, no changes to either grid's card-rendering component.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Server-Side Auth | No auth changes; existing routes unaffected | ✅ PASS | Unaffected |
| II. State Management Split | Pagination's current-page state is local UI state (`useState`, same as the existing local `filterState` in both views) — not squad composition, not server state | ✅ PASS | Consistent with how filter state already lives locally in `CatalogueView`/`SquadsView` |
| III. Optimized Rendering | No new expensive computation; slicing is O(page size); pure function isolated in `lib/pagination.ts`, mirroring the `lib/metrics.ts` pattern the Constitution already requires for metrics | ✅ PASS | N/A directly (no metrics touched), but follows the same architectural discipline |
| IV. Feature-Driven Delivery | Builds on 002 (catalogue) and 006 (squads) screens; no Server Action needed — purely client-side | ✅ PASS | No backend/API surface added |
| V. Simplicity Over Abstraction | Single reusable hook + component shared by both screens instead of duplicating logic twice; no new npm dependency | ✅ PASS | The shared `usePagination`/`PaginationControls` pair is justified by having two real call sites with identical behavior, not spec |

**All gates pass. No Complexity Tracking entries required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/008-grid-pagination/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions (reset mechanism, pure-function split, shared control)
├── data-model.md         ← Phase 1 — PageState shape, pagination contract
├── quickstart.md        ← manual verification checklist (US1, US2)
├── contracts/
│   └── pagination.md    ← lib/pagination.ts + usePagination + PaginationControls contracts
├── checklists/
│   └── requirements.md  ← spec quality checklist (all pass)
└── tasks.md              ← generated by /speckit-tasks (not yet created)
```

### Source Code

```text
lib/
  pagination.ts                           # NEW — paginate<T>(items: T[], page: number, pageSize: number): { pageItems: T[]; totalPages: number; currentPage: number }
  pagination.test.ts                      # NEW — unit tests for paginate()

hooks/
  usePagination.ts                        # NEW — wraps lib/pagination.ts with useState + render-time reset-on-items-change

app/(private)/dashboard/_components/
  PaginationControls.tsx                  # NEW — Previous/Next + "Page X of Y", used by both screens; renders nothing when totalPages <= 1
  CatalogueView.tsx                       # UPDATED — applies usePagination to filteredDevelopers (page size 12), passes the page slice to CatalogueGrid, renders PaginationControls below it
  SquadsView.tsx                          # UPDATED — applies usePagination to filtered (page size 12), passes the page slice to the Squads grid, renders PaginationControls below it
```

No changes to `CatalogueGrid.tsx`, `DeveloperCard.tsx`, `SquadCard.tsx`, `SquadDetailPanel.tsx`,
`hooks/useDevelopers.ts`, `hooks/useSquads.ts`, or any backend/route file.

**Structure Decision**: Single Next.js App Router project (existing structure). Pagination logic is
factored the same way metrics logic already is in this codebase — a pure, testable function in
`lib/`, consumed by a thin hook, consumed by presentation components — rather than inlining the
math separately into each of the two view files.

## Complexity Tracking

*No violations — table intentionally omitted.*
