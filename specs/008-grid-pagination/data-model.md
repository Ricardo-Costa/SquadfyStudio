# Phase 1 Data Model: Grid Pagination for Catalogue and Squads

This feature introduces no persisted entities and no backend/schema changes. Everything here is
derived, in-memory UI state.

## `PaginationResult<T>` (derived, non-persisted — return shape of `lib/pagination.ts`'s `paginate`)

| Field | Type | Notes |
|---|---|---|
| `pageItems` | `T[]` | The slice of `items` belonging to the (clamped) current page. |
| `currentPage` | `number` | The requested page, clamped to `[1, totalPages]` — protects against a stale page number after the underlying `items` array shrinks. |
| `totalPages` | `number` | `Math.max(1, Math.ceil(items.length / pageSize))` — always at least `1`, even for an empty `items` array, so callers never divide-by-zero or branch on a `0`. |

## `usePagination<T>` hook state (transient, per-screen)

| Field | Type | Notes |
|---|---|---|
| `page` | `number` | The Tech Lead's requested page (`useState`, starts at `1`). |
| (internal) previous `items` reference | `T[]` | Stored via `useState`, compared each render to detect a filter/data change and reset `page` back to `1` synchronously (see `research.md` §1) — not exposed to consumers. |

Each of `CatalogueView` and `SquadsView` holds its **own** independent `usePagination` instance —
there is no shared/global pagination state, consistent with spec FR-008.

## Relationships

- `usePagination(items, pageSize)` ← `filteredDevelopers` (Catalogue) / `filtered` (Squads) — the
  already-filtered arrays each view already computes via `useMemo`; pagination is a pure
  post-processing step over them, with no relationship to the filter logic itself beyond reacting
  to when that array's reference changes.
- `PaginationControls` ← `usePagination`'s returned `currentPage`/`totalPages` plus its
  `goToPrevious`/`goToNext` callbacks — purely presentational, no state of its own.
- No relationship to `SquadDetailPanel`'s `selectedSquadId` (007) — a squad's detail panel stays
  associated with whichever squad was clicked regardless of which page is currently shown,
  identical to how it already behaves when the search/seniority filter changes.
