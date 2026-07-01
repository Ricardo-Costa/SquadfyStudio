# Tasks: Squad Detail Panel & Reuse

**Input**: Design documents from `specs/007-squad-detail-reuse/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not included — this feature introduces no new pure calculation functions (`SquadDetailPanel` consumes `SquadCardData` already computed in `SquadsView`, per 006's precompute pattern; Constitution's Jest mandate is scoped to `lib/metrics.ts`, untouched here). Verification is manual via `quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 (detail panel, view-only) is the smallest slice that closes the reported gap; US2 extends the same panel with the edit/reuse flow; US3 is a fully independent bug fix that happens to share one file with US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = view full squad details, US2 = edit and re-save a saved squad, US3 = reliable avatar display

---

## Phase 1: Setup & Foundational

**Purpose**: No new dependencies, no backend schema changes (per plan.md — `PUT` is already native to json-server). No single piece of work blocks all three stories: US1 needs only a new component + `SquadsView` layout change; US2's Context/Server Action extensions are only needed by US2; US3 is fully independent. There is nothing to place here beyond this note.

---

## Phase 2: User Story 1 - View Full Squad Details (Priority: P1)

**Goal**: Clicking a saved squad's card opens a detail panel beside the grid showing every member
individually, the complete skill list, and the same aggregate metrics as the card.

**Independent Test**: Save a squad with 2+ members, open the Squads screen, click its card, and
confirm a detail panel shows every member (name, seniority, cost), the full skill list, and the
aggregate metrics — closing it and clicking a different card must update/clear correctly.

### Implementation for User Story 1

- [X] T001 [P] [US1] Update `app/(private)/dashboard/_components/SquadCard.tsx`: add an optional `onClick?: () => void` prop; call it when the card is clicked (root element gets the handler + `role="button"`/`tabIndex`/keyboard activation for accessibility); no other behavior change
- [X] T002 [P] [US1] Create `app/(private)/dashboard/_components/SquadDetailPanel.tsx` — `'use client'`; `props: { data: SquadCardData | null; onClose: () => void }` per `contracts/save-squad-update.md`; when `data` is `null`, render a placeholder empty state ("Selecione um squad para ver detalhes") instead of nothing, matching the app's established empty-state visual pattern; when `data` is non-null, render: header (`data.displayName` + close button calling `onClose`), the same three-stat metrics mini-grid already used on `SquadCard` (`totalCost`, `avgSeniority`, `skillCoverage.length`), the full `skillCoverage` array as tags (reuse `DeveloperCard`'s skill-chip style), and one `SquadMemberCard` per `data.squad.members` entry with **no** `onRemove` prop (read-only) — omit the "Editar" button in this task, added in US2's T011
- [X] T003 [US1] Update `app/(private)/dashboard/_components/SquadsView.tsx`: add `selectedSquadId` `useState<number | null>(null)`; derive the selected `SquadCardData` by looking it up in the already-memoized `enriched` array; wire `SquadCard`'s new `onClick` (T001) to `setSelectedSquadId`; restructure the return into a two-column responsive grid mirroring `dashboard/page.tsx`'s pattern (`grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]` with `order-2 lg:order-1` on the filter+grid column and `order-1 lg:order-2` on the `SquadDetailPanel` column) per `research.md` §6; render `<SquadDetailPanel data={selected} onClose={() => setSelectedSquadId(null)} />` in the second column (depends on T001, T002)
- [X] T004 [US1] Manual verification against `quickstart.md` § US1 (steps 1–5): click opens the panel with correct member/skill/metric data, close works, switching selection updates the panel without needing to close first, a legacy no-name record shows its fallback label, mobile places the panel above the grid when open (depends on T003)

**Checkpoint**: User Story 1 is fully functional — saved squads are no longer a dead end.

---

## Phase 3: User Story 2 - Edit and Re-save a Saved Squad (Priority: P2)

**Goal**: An "Editar" action in the detail panel loads the squad into the active builder (confirming
first if unsaved work would be lost), and saving again updates the original record in place —
pre-filled with its current name, cache-invalidated so the Squads screen reflects the change.

**Independent Test**: Open a saved squad's detail panel, click "Editar", confirm the builder now
holds that squad's members, adjust the roster, save (name pre-filled), and confirm — via
`curl http://localhost:3001/squads/<id>` — that the same record was updated in place, not duplicated.

### Implementation for User Story 2

- [X] T005 [P] [US2] Update `context/squad/actions.ts`: add `{ type: 'LOAD_SQUAD'; payload: { id: number; name: string; members: Developer[] } }` to the `SquadAction` union, per `contracts/squad-context.md`
- [X] T006 [US2] Update `context/squad/reducer.ts`: extend `SquadState` with `editingSquadId: number | null` and `editingSquadName: string | null` (both default `null` in `initialSquadState`); add a `LOAD_SQUAD` case that fully replaces `members` with the payload and sets both editing fields; update the `REMOVE_MEMBER` case so that when the resulting `members` array is empty, it also resets `editingSquadId`/`editingSquadName` to `null` (per `research.md` §3, spec FR-010b) — `ADD_MEMBER` is otherwise unchanged (depends on T005)
- [X] T007 [US2] Update `hooks/useSquad.ts`: expose `editingSquadId`, `editingSquadName`, and `loadSquad: (id: number, name: string, members: Developer[]) => void` (dispatches `LOAD_SQUAD`), alongside the existing returned fields (depends on T006)
- [X] T008 [P] [US2] Update `app/(private)/dashboard/actions.ts`: extend `saveSquad(name: string, members: Developer[], id?: number)` — when `id` is provided, `PUT http://localhost:3001/squads/${id}` instead of `POST http://localhost:3001/squads`; keep both existing validation guards (`name`, `members`) unchanged and applied before either branch; body remains `{ name, savedAt: new Date().toISOString(), members }` in both cases (the refreshed `savedAt` on every call satisfies FR-010a) per `contracts/save-squad-update.md`
- [X] T009 [P] [US2] Update `app/(private)/dashboard/_components/SaveSquadModal.tsx`: add an optional `initialName?: string` prop; when `isOpen` becomes `true`, initialize the name field to `initialName ?? ''` instead of always `''`
- [X] T010 [US2] Update `app/(private)/dashboard/_components/SaveSquadButton.tsx`: read `editingSquadId`/`editingSquadName` from `useSquad()`; pass `initialName={editingSquadName ?? undefined}` to `SaveSquadModal`; in `handleConfirm`, call `saveSquad(name, members, editingSquadId ?? undefined)`; add `useQueryClient()` (from `@tanstack/react-query`) and call `queryClient.invalidateQueries({ queryKey: ['squads'] })` immediately after any successful save (both new and edited) per `research.md` §5 (depends on T007, T008, T009)
- [X] T011 [US2] Extend `app/(private)/dashboard/_components/SquadDetailPanel.tsx` (from T002) with an "Editar" button: on click, call `useSquad().count` — if `> 0`, call `window.confirm(...)` and abort if not confirmed (leaving the builder and current view untouched); otherwise (or once confirmed), call `loadSquad(data.squad.id, data.displayName, data.squad.members)` then `router.push('/dashboard')` via `useRouter()` from `next/navigation` per `contracts/save-squad-update.md` (depends on T002 from US1, T007)
- [X] T012 [US2] Manual verification against `quickstart.md` § US2 (steps 1–9): load-into-builder with and without unsaved work (confirm dialog gates correctly), pre-filled name modal, `PUT` updates the same `id` (verified via `curl`), Squads screen reflects the update without manual refresh, renaming works, a from-scratch save is still blank, emptying the builder then refilling and saving creates a new record (FR-010b) (depends on T010, T011)

**Checkpoint**: User Stories 1 and 2 both work — saved squads can be viewed in full and reused as edit starting points.

---

## Phase 4: User Story 3 - Reliable Avatar Display on Squad Cards (Priority: P3)

**Goal**: A member avatar that fails to load shows a fallback instead of a broken-image icon on `SquadCard`.

**Independent Test**: Force an avatar URL to fail and confirm the squad card shows a fallback avatar, matching `DeveloperCard`'s existing behavior.

### Implementation for User Story 3

- [X] T013 [US3] Update `app/(private)/dashboard/_components/SquadCard.tsx`: add the same `onError` avatar-fallback handler already used in `DeveloperCard.tsx`/`SquadMemberCard.tsx` (falls back to `https://api.dicebear.com/7.x/initials/svg?seed=<name>`) to each member avatar `<img>` — same file as T001, applied sequentially after it (not parallel, same-file coordination)
- [X] T014 [US3] Manual verification against `quickstart.md` § US3 (step 1): a broken avatar URL renders the fallback instead of a broken-image icon (depends on T013)

**Checkpoint**: All three user stories are independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all three stories together.

- [X] T015 [P] Run `npm run build` — confirm zero TypeScript/build errors after the Context extension, the `saveSquad` signature change, the new `SquadDetailPanel`, and the `SquadsView` layout change
- [X] T016 [P] Run `npm test` — confirm the existing `lib/metrics.test.ts` suite (14 tests) still passes unmodified
- [X] T017 Full regression pass against `quickstart.md` "Cross-cutting checks": build clean, tests pass, and the from-scratch squad-builder flow (`/dashboard`, no "Editar") still behaves exactly as before — `editingSquadId`/`editingSquadName` stay `null` throughout (depends on T004, T012, T014, T015, T016)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup/Foundational (Phase 1)**: No tasks — nothing blocks all three stories
- **US1 (Phase 2)**: T001 and T002 run in parallel; T003 depends on both; T004 depends on T003
- **US2 (Phase 3)**: T005 → T006 (reducer needs the action type) → T007 (hook needs the reducer); T008 and T009 run in parallel with T005–T007 (different files); T010 depends on T007, T008, T009; T011 depends on T002 (US1) and T007; T012 depends on T010, T011
- **US3 (Phase 4)**: T013 depends on T001 (same file, `SquadCard.tsx`) — sequential, not parallel; T014 depends on T013
- **Polish (Phase 5)**: T015/T016 depend on all implementation tasks (T001–T003, T005–T011, T013); T017 depends on T004, T012, T014, T015, T016

### User Story Dependencies

- **US1 (P1)**: Depends only on existing 006 code — no dependency on US2/US3
- **US2 (P2)**: Hard dependency on US1's `SquadDetailPanel.tsx` (T002) existing, since it extends the same file with the "Editar" button — cannot start meaningfully before US1's checkpoint
- **US3 (P3)**: No logical dependency on US1/US2, but shares `SquadCard.tsx` with US1's T001 — sequenced after it to avoid conflicting edits to the same file, not because of a behavioral dependency

### Parallel Opportunities

- T001 and T002 (both US1) run in parallel — different files
- T008 and T009 (both US2) run in parallel with the T005→T006→T007 chain — no file overlap
- T013 (US3) cannot run in parallel with T001 (US1) — same file (`SquadCard.tsx`); everything else in US3 is otherwise independent in outcome

---

## Parallel Example: Phase 2 (US1) + Phase 3 (US2, non-conflicting files)

```bash
# After nothing (Phase 1 has no tasks), these can start immediately in parallel:
Task T001: "Add onClick prop to app/(private)/dashboard/_components/SquadCard.tsx"
Task T002: "Create app/(private)/dashboard/_components/SquadDetailPanel.tsx"
Task T005: "Add LOAD_SQUAD to context/squad/actions.ts"
Task T008: "Extend saveSquad in app/(private)/dashboard/actions.ts"
Task T009: "Add initialName prop to SaveSquadModal.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: US1 (T001–T004)
2. **STOP and VALIDATE**: clicking a saved squad shows its full details — this alone closes the
   originally-reported gap ("não é possível visualizar mais os detalhes")
3. Proceed to US2 once confirmed working

### Incremental Delivery

1. US1 → saved squads are fully viewable (closes the core reported gap)
2. US2 → saved squads become reusable edit starting points (closes the "choose and adapt" gap from the project refinement)
3. US3 → avatar reliability fix (independent, can land any time, even before US1/US2)
4. Polish → build + tests + full quickstart regression

### Parallel Team Strategy

With two developers: Developer A takes US1 first (T001–T004), Developer B starts US2's
non-`SquadDetailPanel` pieces in parallel (T005–T010, all independent of `SquadDetailPanel.tsx`)
and only needs to wait on Developer A for T011 (which extends the panel). Either developer can pick
up US3's T013–T014 once T001 lands.

---

## Notes

- No new npm dependencies — `window.confirm()` for FR-008, `SquadMemberCard` reused as-is for the read-only roster (Constitution Principle V)
- `SquadDetailPanel.tsx` is built incrementally: US1 delivers the view-only panel, US2 extends the same file with the "Editar" button — do not split it into separate view/edit components
- This feature deliberately revises 006's "no editing of a saved squad" rule (FR-012) — scoped exclusively to the "Editar" flow here, per the spec's Clarifications
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
