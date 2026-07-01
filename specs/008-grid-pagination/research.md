# Phase 0 Research: Grid Pagination for Catalogue and Squads

## 1. Resetting to page 1 on filter change

**Decision**: Use React's documented render-time "adjust state when a prop changes" pattern in
`usePagination`: store the previously-seen `items` array reference in state; if the incoming
`items` reference differs from the stored one, call `setPage(1)` and update the stored reference
*during render* (not inside a `useEffect`).

**Rationale**: `filteredDevelopers`/`filtered` are already `useMemo`'d on `[data, filterState]` in
both views, so their reference changes exactly when the filter actually changes (or the underlying
data changes) — never on unrelated re-renders. Reacting to that reference change during render
(React's officially supported pattern for exactly this case) avoids a `useEffect`-driven extra
render where the Tech Lead would briefly see the *old* page's items before the reset kicks in.

**Alternatives considered**:
- `useEffect(() => setPage(1), [items])` — rejected; works, but introduces a redundant render pass
  (render with stale page → effect fires → re-render with page 1) for no benefit over doing it
  synchronously in the same render.
- Deriving page directly from filter state changes passed down as a prop — rejected, more coupling
  between the hook and each screen's specific filter shape, when reacting to the filtered array's
  identity is already sufficient and screen-agnostic.

## 2. Pure function vs. inline hook logic

**Decision**: `lib/pagination.ts` exports a pure `paginate<T>(items, page, pageSize)` function
(slice + total-page-count + clamped current page); `hooks/usePagination.ts` is a thin wrapper that
owns the `useState` and calls into it.

**Rationale**: Mirrors the project's already-established and constitution-mandated pattern for
`lib/metrics.ts` (pure calculation, thin component consumer, Jest-tested in isolation). The
slicing/clamping math is simple but has real edge cases (page beyond range after data shrinks,
empty arrays, single-page results) worth covering with unit tests the same way metric calculations
are, even though the Constitution's Jest mandate doesn't technically require it here.

**Alternatives considered**:
- Inlining the math directly inside `usePagination` — rejected, harder to unit-test in isolation
  without rendering a component/hook, and breaks from the established pure-function convention.

## 3. Shared `PaginationControls` component

**Decision**: One `PaginationControls` component, taking `{ currentPage, totalPages, onPrevious,
onNext }`, rendering nothing when `totalPages <= 1` (per FR-006).

**Rationale**: Both screens need identical Previous/Next + "Page X of Y" behavior — a single shared
component avoids duplicating the same markup and disabled-state logic twice (Constitution
Principle V). This mirrors how `FilterBar` is already shared between the catalogue and squads
screens (006's research.md §1).

**Alternatives considered**:
- Two separate components (`CataloguePagination`, `SquadsPagination`) — rejected, no behavioral
  difference between them to justify separate implementations.
- A numbered page-link list — rejected in the spec's Assumptions already (Previous/Next + text
  indicator is simpler and sufficient at this project's data scale).

## 4. Passing the paginated slice into existing grid components unchanged

**Decision**: `CatalogueGrid` and the Squads grid (the inline `SquadsGrid` function in
`SquadsView.tsx`) receive the paginated slice in the same prop they already use for "the list to
render" — no prop or internal logic changes to either.

**Rationale**: Both components already handle `isLoading`/`isError`/`length === 0` branching on
whatever array they're given. Because pagination always resets to page 1 whenever the filtered
result set changes (research §1), "the current page is empty" and "there are truly no filtered
results" become the same condition — so the existing `.length === 0` empty-state check keeps
being correct without any modification. This confirms no changes are needed to either grid
component, keeping this feature's footprint to the two view files plus new pagination-specific
files.

**Alternatives considered**:
- Passing both the paginated slice and a separate "any results at all?" boolean into the grid
  components — rejected as unnecessary; the reasoning above shows the single paginated array is
  sufficient for the existing empty-check to remain correct.
