# Tasks: Grid Pagination for Catalogue and Squads

**Input**: Design documents from `specs/008-grid-pagination/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included for `lib/pagination.ts` — not mandated by the Constitution's Jest rule (scoped to `lib/metrics.ts`), but it follows the exact same pure-function pattern the project already tests, so coverage is added here too (see plan.md's Testing section).

**Organization**: Tasks are grouped by user story. The pagination primitives (function, hook, control) are genuinely shared by both screens, so they land in a real Foundational phase this time — both US1 and US2 are blocked on it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = paginated Developer Catalogue, US2 = paginated Squads listing

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: `lib/pagination.ts`, `hooks/usePagination.ts`, and `PaginationControls.tsx` are used
identically by both screens — neither user story can be implemented without them.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Create `lib/pagination.ts` — `export function paginate<T>(items: T[], page: number, pageSize: number): { pageItems: T[]; totalPages: number; currentPage: number }` per `contracts/pagination.md`: `totalPages = Math.max(1, Math.ceil(items.length / pageSize))`; clamp the incoming `page` into `[1, totalPages]` before slicing; `pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize)`; pure function, no React imports
- [X] T002 [US: shared] Create `hooks/usePagination.ts` — wraps `paginate` from `lib/pagination.ts` with a `useState<number>(1)` for the current page; stores the previously-seen `items` reference in a second `useState`; if the incoming `items` reference differs from the stored one, call both setters synchronously during render (React's "adjust state when a prop changes" pattern, not a `useEffect`) to reset the page back to `1`, per `research.md` §1; returns `{ pageItems, currentPage, totalPages, hasPrevious, hasNext, goToPrevious, goToNext }` where `goToPrevious`/`goToNext` are no-ops when already at the first/last page (depends on T001)
- [X] T003 [P] Create `app/(private)/dashboard/_components/PaginationControls.tsx` — `props: { currentPage: number; totalPages: number; hasPrevious: boolean; hasNext: boolean; onPrevious: () => void; onNext: () => void }` per `contracts/pagination.md`; returns `null` when `totalPages <= 1` (FR-006); otherwise renders a "Previous" button (disabled when `!hasPrevious`), a "Page {currentPage} of {totalPages}" indicator, and a "Next" button (disabled when `!hasNext`), styled consistently with the app's existing buttons
- [X] T004 [P] Create `lib/pagination.test.ts` — unit tests for `paginate()` mirroring `lib/metrics.test.ts`'s style: empty `items` → `totalPages: 1`, `pageItems: []`; single page (items ≤ pageSize) → one page, all items; multiple pages → correct slice per page; `page` beyond range (e.g. requesting page 5 of a 2-page result) → clamped to the last valid page; exact page-boundary counts (e.g. exactly `2 * pageSize` items → exactly 2 pages, no empty trailing page) (depends on T001)

**Checkpoint**: `lib/pagination.ts`, `hooks/usePagination.ts`, and `PaginationControls.tsx` are ready — both user stories can now proceed in parallel.

---

## Phase 2: User Story 1 - Paginated Developer Catalogue (Priority: P1) 🎯 MVP

**Goal**: The Catalogue grid shows at most 12 developers per page (after search/seniority
filtering), with Previous/Next controls and a page indicator, resetting to page 1 whenever the
filter changes.

**Independent Test**: Load the catalogue (22 seed developers, no filters — exceeds one page),
confirm only 12 render with working Previous/Next; narrow the filter to fewer than 12 results and
confirm it lands on page 1 with controls hidden.

### Implementation for User Story 1

- [X] T005 [US1] Update `app/(private)/dashboard/_components/CatalogueView.tsx`: call `usePagination(filteredDevelopers, 12)`; pass the returned `pageItems` to `CatalogueGrid`'s `developers` prop instead of the full `filteredDevelopers` array (no other `CatalogueGrid` prop changes); render `<PaginationControls currentPage={...} totalPages={...} hasPrevious={...} hasNext={...} onPrevious={goToPrevious} onNext={goToNext} />` immediately below `<CatalogueGrid />` (depends on T002, T003)
- [X] T006 [US1] Manual verification against `quickstart.md` § US1 (steps 1–6): first page shows 12 developers with correct Previous/Next disabled-state, paging works, filter changes reset to page 1 and hide controls when results fit on one page (depends on T005)

**Checkpoint**: User Story 1 is fully functional — the Catalogue no longer renders an unbounded list.

---

## Phase 3: User Story 2 - Paginated Squads Listing (Priority: P2)

**Goal**: The Squads grid gets the identical paging treatment as the Catalogue, over its own
filtered saved-squad list, independent of the Catalogue's pagination state.

**Independent Test**: With 13+ saved squads, confirm the same paging behavior as US1 on the Squads
screen; confirm the Catalogue's current page is unaffected by paging through Squads.

### Implementation for User Story 2

- [X] T007 [US2] Update `app/(private)/dashboard/_components/SquadsView.tsx`: call `usePagination(filtered, 12)`; pass the returned `pageItems` to the inline `SquadsGrid` function's `filtered` prop instead of the full filtered array (no other `SquadsGrid` prop changes); render `<PaginationControls .../>` immediately below `<SquadsGrid />`, inside the same left column as the grid (depends on T002, T003)
- [X] T008 [US2] Manual verification against `quickstart.md` § US2 (steps 1–3): paging works identically to US1, filter changes reset to page 1, the open detail panel (if any) is unaffected by page changes (depends on T007)

**Checkpoint**: Both user stories are independently functional — neither screen renders an unbounded list anymore.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across both stories together.

- [X] T009 [P] Run `npm run build` — confirm zero TypeScript/build errors after the new pagination files and the two updated views
- [X] T010 [P] Run `npm test` — confirm `lib/pagination.test.ts` passes alongside the existing `lib/metrics.test.ts` suite (14 existing tests unaffected)
- [X] T011 Full regression pass against `quickstart.md` "Cross-cutting checks": build clean, tests pass, and paging one screen does not affect the other screen's independent page state (depends on T006, T008, T009, T010)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: T001 and T003 have no dependencies and run in parallel; T002 depends on T001 (imports `paginate`); T004 depends on T001 (tests it) — all of Phase 1 blocks Phase 2 and Phase 3
- **US1 (Phase 2)**: T005 depends on T002, T003 (both from Foundational); T006 depends on T005
- **US2 (Phase 3)**: T007 depends on T002, T003 (both from Foundational) — has no dependency on US1's T005/T006, so US1 and US2 can be implemented in parallel once Foundational is done; T008 depends on T007
- **Polish (Phase 4)**: T009/T010 depend on all implementation tasks (T001–T003, T005, T007); T011 depends on T006, T008, T009, T010

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — no dependency on US2, MVP
- **US2 (P2)**: Depends only on Foundational — no dependency on US1; both stories touch entirely different files (`CatalogueView.tsx` vs `SquadsView.tsx`) so they can be built simultaneously

### Parallel Opportunities

- T001 and T003 (both Foundational) run in parallel — different files
- Once Foundational is done, T005 (US1) and T007 (US2) can be worked in parallel — zero file overlap
- T009 and T010 (Polish) run in parallel

---

## Parallel Example: Phase 1 (Foundational) then Phase 2 + Phase 3 together

```bash
# Foundational, in parallel:
Task T001: "Create lib/pagination.ts"
Task T003: "Create app/(private)/dashboard/_components/PaginationControls.tsx"
# T002 and T004 follow once T001 lands.

# After Foundational completes, US1 and US2 in parallel:
Task T005: "Update CatalogueView.tsx to use pagination"
Task T007: "Update SquadsView.tsx to use pagination"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T004)
2. Complete Phase 2: US1 (T005–T006)
3. **STOP and VALIDATE**: Catalogue pagination works correctly — this alone closes the primary
   usability gap (the catalogue is the most-visited, largest-growing screen)
4. Proceed to US2 once confirmed working

### Incremental Delivery

1. Foundational → shared pagination primitives exist and are tested
2. US1 → Catalogue paginated (MVP)
3. US2 → Squads paginated too
4. Polish → build + tests + full quickstart regression

### Parallel Team Strategy

With two developers: both complete Foundational together first (small, fast), then Developer A
takes US1 (T005–T006) while Developer B takes US2 (T007–T008) simultaneously — zero file conflicts
between them.

---

## Notes

- No new npm dependencies — `PaginationControls` is a plain styled component (Constitution Principle V)
- Neither `CatalogueGrid.tsx` nor the Squads grid's rendering logic changes — they receive the
  paginated slice through their existing "list to render" prop, per `research.md` §4
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
