# Tasks: Multi-Squad Browsing & Comparison

**Input**: Design documents from `specs/006-multi-squad-management/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not included — this feature reuses `lib/metrics.ts` unmodified (Constitution's Jest mandate is already satisfied by its existing suite) and introduces no new calculation logic requiring mandatory coverage. Verification is manual via `quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 (name-on-save) is the smallest unblocking slice; US2 (browse/compare) is the core value and the MVP; US3 (search/filter) layers on top of US2's screen.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = name a squad when saving, US2 = browse and compare saved squads, US3 = search and filter saved squads

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: `SavedSquad` currently lives inside `actions.ts` (a `'use server'` file) and lacks a
`name` field. Every story's code (the Server Action, the fetch hook, the view, the card) needs the
extended, relocated type to compile against — this is the one piece all three stories share.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 Move the `SavedSquad` interface from `app/(private)/dashboard/actions.ts` into `lib/types.ts` (alongside `Developer`, `Seniority`, `FilterState`), adding `name?: string` (optional, to represent legacy pre-feature records per `data-model.md`); update `actions.ts` to `import type { SavedSquad } from '@/lib/types'` instead of declaring it locally

**Checkpoint**: `lib/types.ts` has the extended `SavedSquad` — all three user stories can now proceed (US1 and US2 can run in parallel from here; US3 depends on US2's screen existing).

---

## Phase 2: User Story 1 - Name a Squad When Saving (Priority: P1)

**Goal**: Clicking "Save Squad" opens a modal (always blank) prompting for a name; the name is
required and persisted with the squad; dismissing the modal never persists anything.

**Independent Test**: Build a squad, click "Save Squad", confirm a blank modal opens; try confirming
empty (blocked); enter a name and confirm; verify via `curl http://localhost:3001/squads` that the
new record includes the name. Verify cancel/backdrop/Escape all close the modal without creating a record.

### Implementation for User Story 1

- [X] T002 [P] [US1] Update `saveSquad` in `app/(private)/dashboard/actions.ts`: change signature to `saveSquad(name: string, members: Developer[]): Promise<SavedSquad>`; add a guard `if (!name.trim()) throw new Error('Squad name is required')` before the existing empty-members guard; include `name` in the POST body (`{ name, savedAt: new Date().toISOString(), members }`) per `contracts/save-squad-action.md`
- [X] T003 [P] [US1] Create `app/(private)/dashboard/_components/SaveSquadModal.tsx` — `'use client'`; props `{ isOpen: boolean; onConfirm: (name: string) => void; onCancel: () => void }`; local `useState('')` for the name field (component only renders its content while `isOpen`, so it is always blank on open — no cross-save pre-fill per FR-003b); a full-viewport backdrop `<div>` whose `onClick` calls `onCancel`; a `useEffect` (active only while `isOpen`) attaching a `keydown` listener that calls `onCancel` on `Escape`; confirm button disabled when `name.trim() === ''` with a visible validation message; `role="dialog"` `aria-modal="true"` `aria-label="Nomear squad"`; auto-focus the input on open — mirror the no-dependency overlay idiom already used by `DashboardNav.tsx`'s mobile drawer (005)
- [X] T004 [US1] Update `app/(private)/dashboard/_components/SaveSquadButton.tsx`: add `isModalOpen` `useState(false)`; clicking the button (when not empty/loading/success) sets `isModalOpen(true)` instead of calling `saveSquad` directly; render `<SaveSquadModal isOpen={isModalOpen} onConfirm={handleConfirm} onCancel={() => setIsModalOpen(false)} />`; `handleConfirm(name)` closes the modal immediately (`setIsModalOpen(false)`) then runs the existing loading→success/error state machine, calling `saveSquad(name, members)` in place of the old `saveSquad(members)` call — no other changes to the existing timer/reset logic (depends on T002, T003)
- [X] T005 [US1] Manual verification against `quickstart.md` § US1 (steps 1–5): modal blank/focused on open, validation blocks empty/whitespace name, successful save persists the name and shows "Salvo ✓", duplicate names produce separate records, cancel/backdrop/Escape all dismiss without persisting (depends on T004)

**Checkpoint**: User Story 1 is fully functional — every newly saved squad has a name.

---

## Phase 3: User Story 2 - Browse and Compare Saved Squads (Priority: P2) 🎯 MVP

**Goal**: The `/dashboard/squads` placeholder (from 005) is replaced with a real screen: fetch all
saved squads, render each as a card with name/fallback, members, cost, seniority, and skill count;
proper loading/error/empty states. No search/filter yet (added in US3).

**Independent Test**: Save 2–3 named squads (via US1's flow), open the Squads section, confirm one
card renders per squad with correct data; stop the mock server and confirm an error state (no
broken partial cards); confirm an empty state with zero squads saved.

### Implementation for User Story 2

- [X] T006 [P] [US2] Create `hooks/useSquads.ts` — mirrors `hooks/useDevelopers.ts`: `fetchSquads()` does `GET http://localhost:3001/squads`, throws on `!res.ok`, then returns the array sorted newest-first by `savedAt` (descending) per `research.md` §5; `useSquads()` wraps it in `useQuery<SavedSquad[]>({ queryKey: ['squads'], queryFn: fetchSquads })`
- [X] T007 [P] [US2] Create `lib/squads.ts` with `formatSquadName(squad: SavedSquad): string` — returns `squad.name` when present and non-blank (after `trim()`), otherwise a fallback label derived from `squad.savedAt` (e.g. `` `Squad salvo em ${date}` `` using a `pt-BR`-formatted date) per `data-model.md`'s `SquadCardData.displayName` rule
- [X] T008 [P] [US2] Create `app/(private)/dashboard/_components/SquadCard.tsx` — pure presentational component, `props: { data: SquadCardData }` per `contracts/squads-fetch.md`; renders `data.displayName`, member avatars/count from `data.squad.members`, `data.totalCost`, `data.avgSeniority` (reuse the same seniority label map pattern already defined in `MetricsPanel.tsx`), and `data.skillCoverage.length`; no click/edit/delete affordance (FR-012)
- [X] T009 [US2] Create `app/(private)/dashboard/_components/SquadsView.tsx` — `'use client'`; call `useSquads()` for `{ data: squads = [], isLoading, isError, refetch }`; `useMemo` to build `SquadCardData[]` from `squads` using `formatSquadName` (T007) plus `calcTotalCost`/`calcAvgSeniority`/`calcSkillCoverage` from `lib/metrics.ts` (per `research.md` §2 — computed once per fetch, not per render); render, in order: loading indicator (`isLoading`), error state with retry (`isError`), empty state (`squads.length === 0`), or a grid of `<SquadCard data={...} />` (one per enriched entry) — per `contracts/squads-fetch.md` (depends on T006, T007, T008)
- [X] T010 [US2] Update `app/(private)/dashboard/squads/page.tsx`: replace the static placeholder JSX (from 005) with `<SquadsView />` (depends on T009)
- [X] T011 [US2] Manual verification against `quickstart.md` § US2 (steps 1–5): cards render with correct name/cost/seniority/skills, error state when mock server is stopped, loading state, empty state with zero squads, legacy no-name record renders with fallback label (depends on T010)

**Checkpoint**: User Stories 1 and 2 both work — squads can be named, saved, and browsed as comparable cards. This is the MVP.

---

## Phase 4: User Story 3 - Search and Filter Saved Squads (Priority: P3)

**Goal**: Add a search-by-name field and a seniority filter above the squads grid, reusing the
catalogue's existing `FilterBar`, narrowing the visible cards with AND-combined criteria.

**Independent Test**: With several distinctly-named, differently-seniority'd squads saved, type a
name fragment (only matches shown); toggle a seniority pill (only matches shown); combine both;
enter a term matching nothing (distinct "no results" state); clear everything (full list returns).

### Implementation for User Story 3

- [X] T012 [P] [US3] Update `app/(private)/dashboard/_components/FilterBar.tsx`: add optional `placeholder?: string` and `ariaLabel?: string` props, defaulting to the existing hardcoded copy (`"Buscar desenvolvedor..."` / `"Search developers"`) so `CatalogueView.tsx`'s existing usage is unchanged, per `research.md` §1
- [X] T013 [US3] Update `app/(private)/dashboard/_components/SquadsView.tsx`: add local `filterState` `useState<FilterState>({ name: '', seniorities: [] })`; render `<FilterBar>` above the grid with `placeholder="Buscar squad..."` `ariaLabel="Search squads"`, wired to `filterState`; add a second `useMemo` (keyed on `[enrichedSquads, filterState]`) that filters by case-insensitive substring match on `displayName` AND seniority membership (empty `seniorities` = no filter) per FR-011; when the filtered list is empty but the unfiltered list is not, render a "no results" message distinct from US2's "no squads saved yet" empty state (depends on T009 from US2, T012)
- [X] T014 [US3] Manual verification against `quickstart.md` § US3 (steps 1–5): name search narrows correctly, seniority filter narrows correctly, combined AND logic, distinct no-results state, clearing restores the full list (depends on T013)

**Checkpoint**: All three user stories are independently functional — squads can be named, browsed, and searched/filtered.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all three stories together.

- [X] T015 [P] Run `npm run build` — confirm zero TypeScript/build errors after the `SavedSquad` relocation, the `saveSquad` signature change, and all new files
- [X] T016 [P] Run `npm test` — confirm the existing `lib/metrics.test.ts` suite (14 tests) still passes unmodified
- [X] T017 Full regression pass against `quickstart.md` "Cross-cutting checks": build clean, tests pass, and `SaveSquadButton`'s existing empty-squad-disable behavior (from 004) is still intact — the modal must not be reachable when the squad builder has zero members (depends on T005, T011, T014, T015, T016)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — T001 first, blocks everything else
- **US1 (Phase 2)**: Depends on T001 — T002 and T003 run in parallel, T004 depends on both, T005 depends on T004
- **US2 (Phase 3)**: Depends on T001 (not on US1) — T006/T007/T008 run in parallel, T009 depends on all three, T010 depends on T009, T011 depends on T010
- **US3 (Phase 4)**: Depends on US2's T009 (extends the same `SquadsView.tsx`) and on T012 — T013 depends on both, T014 depends on T013
- **Polish (Phase 5)**: T015/T016 depend on all implementation tasks; T017 depends on T005, T011, T014, T015, T016

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — independently testable as soon as T005 completes, does not require US2/US3
- **US2 (P2)**: Depends only on Foundational — **can be built in parallel with US1** (different files: `useSquads.ts`, `lib/squads.ts`, `SquadCard.tsx`, `SquadsView.tsx`, `squads/page.tsx` vs. US1's `actions.ts`, `SaveSquadModal.tsx`, `SaveSquadButton.tsx`); however, saving a *named* squad (US1) is needed to meaningfully see named cards in US2's testing, so sequential US1→US2 is the practical order even though not a hard code dependency
- **US3 (P3)**: Hard dependency on US2's `SquadsView.tsx` existing (T009) — cannot start before US2's checkpoint

### Parallel Opportunities

- T002 and T003 (both US1) run in parallel — different files
- T006, T007, T008 (all US2) run in parallel — different files
- US1's file set (`actions.ts`, `SaveSquadModal.tsx`, `SaveSquadButton.tsx`) and US2's file set (`useSquads.ts`, `lib/squads.ts`, `SquadCard.tsx`) have zero overlap — the two stories can be implemented by different people simultaneously after T001

---

## Parallel Example: Phase 2 (US1) + Phase 3 (US2)

```bash
# After T001 completes, these can all be worked simultaneously — no file overlap:
Task T002: "Update saveSquad in app/(private)/dashboard/actions.ts"
Task T003: "Create app/(private)/dashboard/_components/SaveSquadModal.tsx"
Task T006: "Create hooks/useSquads.ts"
Task T007: "Create lib/squads.ts"
Task T008: "Create app/(private)/dashboard/_components/SquadCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Foundational (T001)
2. Complete Phase 2: US1 (T002–T005) — squads can now be named
3. Complete Phase 3: US2 (T006–T011) — squads can now be browsed/compared
4. **STOP and VALIDATE**: save a couple of named squads, confirm they render correctly as cards
5. This is the MVP the project refinement asked for: "visualizar várias squads, ver os custos e habilidades e escolher a que melhor se encaixa"

### Incremental Delivery

1. Foundational → `lib/types.ts` has the extended `SavedSquad`
2. US1 → every new save has a name (MVP building block)
3. US2 → saved squads are browsable and comparable (MVP complete)
4. US3 → search/filter layered on top, for when the list grows
5. Polish → build + tests + full quickstart regression

### Parallel Team Strategy

With two developers: Developer A takes US1 (T002–T005); Developer B takes US2 (T006–T011) at the
same time (zero file overlap once T001 lands) — either order can complete first, but a
save-then-browse smoke test needs both done. Developer A or B then picks up US3 once US2's T009 is
in place.

---

## Notes

- No new npm dependencies — the modal reuses the exact overlay idiom already introduced by `DashboardNav.tsx` in 005 (Constitution Principle V)
- `SquadCard.tsx` is purely presentational — it must not call `lib/metrics.ts` itself; all metrics are precomputed once in `SquadsView.tsx` (per `research.md` §2, avoids recompute on every filter keystroke)
- `FilterBar.tsx`'s prop extension (T012) must default to the exact existing catalogue strings so `CatalogueView.tsx` needs zero changes
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
