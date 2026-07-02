# Tasks: Delete Saved Squad with Confirmation

**Input**: Design documents from `specs/010-delete-squad-confirmation/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not included — per `plan.md`'s Technical Context → Testing, this feature adds no new `frontend/lib/` pure function to unit-test (unlike `lib/squad/metrics.ts`/`lib/squad/pagination.ts`); verification is manual against `quickstart.md`, consistent with how `009-logout-action`'s own Server Action was verified.

**Organization**: A single P1 user story. The `deleteSquad` Server Action is a shared prerequisite the UI depends on, so it lands in Foundational. Everything else — the delete button, the second confirmation dialog, the success/error wiring — is one cohesive change to `SquadDetailPanel.tsx` under User Story 1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = delete a saved squad after confirming

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: The `deleteSquad` Server Action is the shared piece the UI story depends on — the delete button has nothing to call without it.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Add `deleteSquad` to `frontend/app/(private)/dashboard/actions.ts` per `contracts/delete-squad.md`: `export async function deleteSquad(id: number): Promise<void>`, using `SERVER_API_BASE_URL` (already imported in this file as `saveSquad`'s import — extend the existing import, do not duplicate it), `fetch(`${SERVER_API_BASE_URL}/squads/${id}`, { method: 'DELETE' })`, throwing an `Error` with status/text on a non-OK response (mirror `saveSquad`'s existing error-throwing shape exactly), resolving with no value on success.

**Checkpoint**: `deleteSquad(id)` exists, compiles, and is importable — User Story 1 can now proceed.

---

## Phase 2: User Story 1 - Delete a Saved Squad After Confirming (Priority: P1) 🎯 MVP

**Goal**: A delete button next to "Editar" in the squad detail panel opens a confirmation dialog; only on confirming does the squad get permanently removed, disappear from the Squads grid, close the panel, and clear the builder's association if that squad was loaded for editing.

**Independent Test**: Save a squad, open its detail panel, click delete, confirm in the dialog, and verify the squad no longer appears in the Squads grid (see `quickstart.md` § Happy path).

### Implementation for User Story 1

- [X] T002 [US1] In `frontend/app/(private)/dashboard/_components/SquadDetailPanel.tsx`: add `useQueryClient` (from `@tanstack/react-query`) and `deleteSquad` (from `../actions`) imports; add local state `isDeleteConfirmOpen` (boolean, mirrors the existing `isConfirmOpen` pattern already in this file) and `deleteState: 'idle' | 'loading' | 'error'` (mirrors `SaveSquadButton.tsx`'s `SaveState` pattern) (depends on T001)
- [X] T003 [US1] In the same file, add a delete button immediately after the existing "Editar" button (inside the same `div` at the bottom of the panel, `px-5 pb-5` section): label `deleteState === 'loading' ? 'Excluindo…' : deleteState === 'error' ? 'Erro ao excluir' : 'Excluir'`, `disabled={deleteState === 'loading'}`, `onClick` opens the delete confirmation (`setIsDeleteConfirmOpen(true)`) when `deleteState !== 'loading'`; style as a secondary/destructive action distinct from the primary "Editar" button (e.g. an outline variant using the existing `ink`/`rust` tokens, not a second solid `bg-rust-500` button) (depends on T002)
- [X] T004 [US1] In the same file, add a second `<ConfirmDialog>` instance (the existing one, `isConfirmOpen`, stays untouched — it's for the unrelated "replace current squad" flow) bound to `isDeleteConfirmOpen`, with `title="Excluir squad?"`, a message warning the action is permanent (e.g. "Esta ação não pode ser desfeita. O squad será excluído permanentemente."), `confirmLabel="Excluir"`, `onCancel={() => setIsDeleteConfirmOpen(false)}` (depends on T003)
- [X] T005 [US1] In the same file, implement the delete confirm handler passed as `onConfirm` to the new dialog: set `deleteState` to `'loading'`, call `await deleteSquad(data.squad.id)` in a `try`; on success — call `queryClient.invalidateQueries({ queryKey: ['squads'] })`, close the confirmation dialog (`setIsDeleteConfirmOpen(false)`), call `onClose()` (the panel's existing prop), and if `editingSquadId === data.squad.id` call `resetSquad()` from `useSquad()` (already destructured in this file — add `resetSquad` to the existing `useSquad()` call) per `contracts/delete-squad.md`'s caller contract and `data-model.md`'s lifecycle note; on `catch` — set `deleteState` to `'error'` and close the confirmation dialog, leaving the detail panel open (per FR-009) (depends on T004)
- [X] T006 [US1] In the same file, add an error-reset timer for `deleteState === 'error'` mirroring `SaveSquadButton.tsx`'s `timerRef`/`SAVE_ERROR_RESET_MS` pattern exactly (import `SAVE_ERROR_RESET_MS` from `@/lib/config`, clear the timer on unmount), so a failed delete doesn't leave the button permanently stuck in the error label (depends on T005)
- [X] T007 [US1] Manual verification against `quickstart.md` § Happy path, § Cancel path, § Builder-association clearing, and § Builder unaffected when a different squad is deleted (depends on T006) — the underlying `DELETE /squads/:id` contract was verified live against the running mock API (create → 200 → delete → 200 → re-fetch → 404); the React/UI flow itself (button clicks, dialog, panel closing) was verified by code review only — no browser automation available in this environment

**Checkpoint**: User Story 1 is fully functional — a saved squad can be permanently deleted, with confirmation, from its detail panel, with correct builder-association handling.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Verify the change is clean and nothing regressed.

- [X] T008 [P] Run `npm test` from the repo root — confirm the existing `frontend/lib/squad/metrics.test.ts` / `pagination.test.ts` suite still passes unchanged (no new test files expected for this feature)
- [X] T009 [P] Run `npm run build` from the repo root — confirm TypeScript strict mode and ESLint pass with no new errors/warnings beyond the pre-existing `<img>` warnings
- [ ] T010 Manual verification against `quickstart.md` § Failure path (optional/best-effort — requires simulating a mock API failure) (depends on T007) — not run: no browser automation available in this environment; the error-handling branch (`catch` in `handleDeleteConfirm`) was verified by code review only

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS User Story 1.
- **User Story 1 (Phase 2)**: Depends on Foundational (T001) completion. Tasks T002–T007 are sequential (all edit the same file, each building on the last).
- **Polish (Phase 3)**: T008/T009 can run any time after Phase 2's code changes exist; T010 depends on T007 (manual verification of the happy/cancel paths first).

### Parallel Opportunities

- T001 (Server Action, `actions.ts`) has no dependency and could technically run alongside early Phase 2 scaffolding, but since T002 imports `deleteSquad`, in practice completing T001 first is simplest — it's marked `[P]` only to signal it touches a different file than the rest, not that it should run concurrently with T002–T007.
- T008 and T009 are independent of each other (different tooling, same unchanged file set) and can run in parallel.

---

## Implementation Strategy

### MVP = the whole feature

This feature *is* the MVP — a single P1 story with no smaller independently-shippable slice. Complete Phase 1 → Phase 2 → validate via `quickstart.md`'s happy/cancel/builder-association scenarios → Phase 3 polish → done.

---

## Notes

- All of Phase 2 (T002–T006) lands in one file (`SquadDetailPanel.tsx`) by design — per `research.md`, no new component is extracted since there's no second render location to justify one (Constitution Principle V).
- Commit after each checkpoint (Foundational complete, User Story 1 complete, Polish complete), not after every single task — these tasks are fine-grained edits to the same one or two files.
