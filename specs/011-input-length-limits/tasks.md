# Tasks: Input Length Limits Across Forms

**Input**: Design documents from `specs/011-input-length-limits/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: `frontend/lib/validation.test.ts` is included — not because this feature requested
TDD, but because it's a new `frontend/lib/` pure-function module, and the project's standing
convention (`lib/squad/metrics.test.ts`, `lib/squad/pagination.test.ts`) is that every pure
function there gets Jest coverage.

**Organization**: A single P1 user story. The constants and the `lib/validation.ts` module are
shared prerequisites every field's change depends on, so they land in Foundational. The five
fields are then wired up under User Story 1 — each a small, mostly-independent edit, but grouped
under one story since the spec defines only one.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = text entry is bounded on every form that submits or persists data

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: The five length-limit constants and the three validation functions are the shared
source of truth every field's browser-side and backend-side check depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Add 5 constants to `frontend/lib/config.ts` per `data-model.md`'s Validation Rules
  table: `EMAIL_MAX_LENGTH = 254`, `PASSWORD_MAX_LENGTH = 128`, `SQUAD_NAME_MIN_LENGTH = 2`,
  `SQUAD_NAME_MAX_LENGTH = 60`, `SEARCH_MAX_LENGTH = 100` — each with a one-line doc comment
  matching the existing style in this file (e.g. `/** ... */` above `MAX_SQUAD_SIZE`)
- [X] T002 [P] Create `frontend/lib/validation.ts` per `contracts/validation-lib.md`: export
  `containsDangerousContent(value: string): boolean` (`return /[<>]/.test(value)`),
  `exceedsMaxLength(value: string, max: number): boolean` (`return value.length > max`, no
  trimming), `isBelowMinLength(trimmedValue: string, min: number): boolean`
  (`return trimmedValue.length < min`) — pure functions only, no imports needed
- [X] T003 Create `frontend/lib/validation.test.ts` mirroring the style of
  `frontend/lib/squad/metrics.test.ts`: cover `containsDangerousContent` (contains `<`, contains
  `>`, contains neither, empty string), `exceedsMaxLength` (under/at/over the max — boundary
  inclusive per FR-007), `isBelowMinLength` (under/at/over the min — boundary inclusive) (depends
  on T002)

**Checkpoint**: Constants and validation functions exist, compile, and are tested — every field's
change in User Story 1 can now proceed.

---

## Phase 2: User Story 1 - Text Entry Is Bounded on Every Form (Priority: P1) 🎯 MVP

**Goal**: Login e-mail/password, squad name, and both search fields all reject out-of-bounds or
(where applicable) dangerous input — in the browser for immediate feedback, and on the backend
(for login and squad name) so bypassing the browser doesn't bypass the rule.

**Independent Test**: Follow `quickstart.md` end to end — browser-side capping/rejection on each
field, backend rejection for login and squad name when the browser check is bypassed, and no
regression for already-valid input.

### Implementation for User Story 1

- [X] T004 [US1] Modify `frontend/app/(auth)/login/actions.ts` per
  `contracts/validation-lib.md`'s `login` contract: add `'validation_error'` to the
  `LoginErrorCode` union; import `EMAIL_MAX_LENGTH`, `PASSWORD_MAX_LENGTH` from `@/lib/config`
  and `containsDangerousContent`, `exceedsMaxLength` from `@/lib/validation`; immediately after
  reading `email`/`password` from `formData` and before the `checkRateLimit` call, add the
  validation branch returning
  `{ status: 'error', code: 'validation_error', message: 'E-mail ou senha inválidos ou fora dos limites permitidos.' }`
  if either field exceeds its max length or contains dangerous content (depends on T001, T002)
- [X] T005 [P] [US1] Modify `frontend/app/(auth)/login/_components/LoginInput.tsx`: add an
  optional `maxLength?: number` prop to `LoginInputProps`, pass it through to the `<input
  maxLength={maxLength} .../>` element (depends on T001)
- [X] T006 [US1] Modify `frontend/app/(auth)/login/_components/LoginForm.tsx`: import
  `EMAIL_MAX_LENGTH`, `PASSWORD_MAX_LENGTH` from `@/lib/config`; pass
  `maxLength={EMAIL_MAX_LENGTH}` to the e-mail `LoginInput` and `maxLength={PASSWORD_MAX_LENGTH}`
  to the password `LoginInput`; extend the existing `state.status === 'error'` block to add a
  new branch for `state.code === 'validation_error'` rendering `state.message` (alongside the
  existing `rate_limited` branch and the generic invalid-credentials fallback) (depends on T004,
  T005)
- [X] T007 [US1] Modify `frontend/app/(private)/dashboard/actions.ts` per
  `contracts/validation-lib.md`'s `saveSquad` contract: import `SQUAD_NAME_MIN_LENGTH`,
  `SQUAD_NAME_MAX_LENGTH` from `@/lib/config` and `containsDangerousContent`,
  `exceedsMaxLength`, `isBelowMinLength` from `@/lib/validation`; replace the existing
  `if (!name.trim()) throw new Error('Squad name is required')` with: trim `name` once into
  `trimmedName`, then throw a distinct `Error` for each of — below `SQUAD_NAME_MIN_LENGTH`, above
  `SQUAD_NAME_MAX_LENGTH`, or containing dangerous content — per the contract's exact error
  messages, checked in that order, before the existing `members.length === 0` check (depends on
  T001, T002)
- [X] T008 [US1] Modify `frontend/app/(private)/dashboard/_components/SaveSquadModal.tsx` per
  `contracts/validation-lib.md` and `data-model.md`: import `SQUAD_NAME_MIN_LENGTH`,
  `SQUAD_NAME_MAX_LENGTH` from `@/lib/config` and `containsDangerousContent`,
  `exceedsMaxLength`, `isBelowMinLength` from `@/lib/validation`; replace the existing
  `const isInvalid = trimmed === ''` with three flags (`isTooShort`, `isTooLong`,
  `hasDangerousContent`) computed the same way as T007's checks, combined into `isInvalid`;
  replace the existing "O nome do squad é obrigatório." message with a conditional message
  matching whichever flag is true (short → mentions the minimum; long → mentions the maximum;
  dangerous content → mentions invalid characters); add `maxLength={SQUAD_NAME_MAX_LENGTH}` to
  the `<input>` element (depends on T001, T002)
- [X] T009 [P] [US1] Modify `frontend/app/(private)/dashboard/_components/FilterBar.tsx`: import
  `SEARCH_MAX_LENGTH` from `@/lib/config`; add `maxLength={SEARCH_MAX_LENGTH}` to the search
  `<input>` element — this single change covers both the Catalogue and Squads search fields,
  since both render through this shared component (depends on T001)
- [X] T010 [US1] Manual verification against `quickstart.md` § Login (max length, dangerous
  content, still works normally) and § Squad name (min/max, dangerous content, bypassing the
  browser) and § Search fields (max length only) (depends on T004, T006, T007, T008, T009) —
  verified live: the login page's rendered HTML has `maxLength="254"`/`maxLength="128"` on the
  e-mail/password inputs (confirmed via `curl` against a running dev server). The "bypassing the
  browser" backend-rejection scenario was attempted via a raw HTTP replay of Next.js's Server
  Action call protocol but could not be reliably reproduced manually (the RSC action-call wire
  format resisted hand-crafting); confidence there instead comes from the unit-tested validation
  primitives (13/13 passing, `lib/validation.test.ts`) plus a strict-TypeScript build that
  type-checked every call site in `login/actions.ts` and `dashboard/actions.ts` — no literal
  browser click-through or exploit request was completed, no browser automation available in
  this environment

**Checkpoint**: User Story 1 is fully functional — every field in scope rejects out-of-bounds or
dangerous input, in the browser and (where applicable) on the backend, with zero regression for
already-valid input.

---

## Phase 3: Polish & Cross-Cutting Concerns

**Purpose**: Verify the change is clean and nothing regressed.

- [X] T011 [P] Run `npm test` from the repo root — confirm `frontend/lib/validation.test.ts`
  passes and the existing suite (`metrics.test.ts`, `pagination.test.ts`) is unaffected —
  33/33 tests pass (13 new + 20 existing, unchanged)
- [X] T012 [P] Run `npm run build` from the repo root — confirm TypeScript strict mode and
  ESLint pass with no new errors/warnings beyond the pre-existing `<img>` warnings — confirmed
- [ ] T013 Manual verification against `quickstart.md` § No regressions — full core-flow
  regression pass (login, build squad, save, edit, delete, search, filter, paginate) with normal,
  in-bounds input (depends on T010) — not run: requires an actual browser click-through of every
  existing flow, which isn't available in this environment; the automated test suite (T011) and
  build (T012) cover the code paths that changed, but this full-flow pass is left for manual
  verification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS User Story 1.
- **User Story 1 (Phase 2)**: Depends on Foundational (T001, T002) completion. Within the phase:
  login work (T004→T006, with T005 parallel to T004) and squad-name work (T007, T008) and
  search work (T009) touch disjoint files and can proceed in any order relative to each other,
  but each internally respects its own dependency chain.
- **Polish (Phase 3)**: T011/T012 can run any time after Phase 2's code changes exist; T013
  depends on T010 (manual verification of the individual field behaviors first).

### Parallel Opportunities

- T001 and T002 (different files, no dependency on each other) can run in parallel.
- T005 (LoginInput.tsx) can run in parallel with T004 (login/actions.ts) — different files,
  both only depend on Foundational.
- T009 (FilterBar.tsx) has no dependency on the login or squad-name work and can run in
  parallel with any of T004–T008.
- T011 and T012 are independent of each other and can run in parallel.

---

## Implementation Strategy

### MVP = the whole feature

This feature *is* the MVP — a single P1 story with no smaller independently-shippable slice
(the spec explicitly bundles all five fields as one cohesive behavior). Complete Phase 1 →
Phase 2 → validate via `quickstart.md` → Phase 3 polish → done.

---

## Notes

- Every code task cites the exact constant/function names from `data-model.md` and
  `contracts/validation-lib.md` — no new names should be invented mid-implementation.
- T007's replacement of the old empty-name check (not an addition beside it) is deliberate — see
  `research.md`'s "Squad name validation replaces... the existing check" decision.
- Commit after each checkpoint (Foundational complete, User Story 1 complete, Polish complete).
