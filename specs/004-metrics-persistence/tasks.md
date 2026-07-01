# Tasks: Squad Metrics & Persistence

**Input**: Design documents from `specs/004-metrics-persistence/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included — FR-012 explicitly mandates unit tests for all metric calculation functions.

**Organization**: Tasks grouped by user story. US1 (metrics) is MVP; US2 (save) extends it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1 = metrics panel, US2 = save squad)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Jest infrastructure + JSON Server schema — both are prerequisites for all subsequent work.

- [X] T001 [P] Create `jest.config.ts` at project root using `next/jest` (`createJestConfig`), `testEnvironment: 'node'`, `moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' }`
- [X] T002 [P] Add `"squads": []` collection to `db.json` alongside the existing `developers` array

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Pure metric functions that both US1 (MetricsPanel) and US2 tests depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: MetricsPanel and Jest tests both import from `lib/metrics.ts` — this file must exist before Phase 3.

- [X] T003 Create `lib/metrics.ts` with three exported pure functions:
  - `calcTotalCost(members: Developer[]): number` — sum of `member.cost`, returns 0 for empty
  - `calcAvgSeniority(members: Developer[]): Seniority | null` — junior=1/mid=2/senior=3 → avg → `Math.round()` → clamp [1,3] → label; null for empty squad
  - `calcSkillCoverage(members: Developer[]): string[]` — `flatMap` all skills → `new Set()` → spread → `.sort()`
  - Import `Developer` and `Seniority` types from `@/lib/types`; no React imports

**Checkpoint**: `lib/metrics.ts` ready — US1 can begin in parallel on two tasks.

---

## Phase 3: User Story 1 — View Real-Time Squad Metrics (Priority: P1) 🎯 MVP

**Goal**: Metrics panel in right sidebar shows live total cost, average seniority, and unique skill count. Updates instantly on every squad change via `useMemo`.

**Independent Test**: Add two developers with known rates, seniority, and skills. Verify all three metrics show correct computed values. Remove one; verify metrics recompute. Empty squad shows zero-state.

### Tests for User Story 1 (FR-012 — mandatory)

- [X] T004 [P] [US1] Write Jest unit tests in `lib/metrics.test.ts` covering all cases from `contracts/metrics.md`:
  - `describe('calcTotalCost')`: empty → 0; single member → exact cost; multiple → sum
  - `describe('calcAvgSeniority')`: empty → null; all junior → 'junior'; all senior → 'senior'; junior+senior → 'mid' (avg 2.0); junior+junior+senior → 'mid' (avg 1.67 → round 2); 4 senior + 1 junior → 'senior' (avg 2.6 → round 3)
  - `describe('calcSkillCoverage')`: empty → []; single member → sorted; overlapping skills → deduplicated; result is alphabetically sorted

### Implementation for User Story 1

- [X] T005 [P] [US1] Create `app/(private)/dashboard/_components/MetricsPanel.tsx`:
  - `'use client'` directive
  - Call `useSquad()` to get `members`
  - Single `useMemo(() => ({ totalCost: calcTotalCost(members), avgSeniority: calcAvgSeniority(members), skillCoverage: calcSkillCoverage(members) }), [members])`
  - Render three metric cards: total cost as `$X/hr`, seniority label (or `—` when null), skill count `N skills` (from `skillCoverage.length`)
  - Empty squad shows `$0/hr`, `—`, `0 skills` — no error state

- [X] T006 [US1] Update `app/(private)/dashboard/_components/SquadPanel.tsx` to render `<MetricsPanel />` below the member list, wrapped in `{count > 0 && (...)}` guard with a top border divider

**Checkpoint**: US1 fully functional — metrics update live, Jest tests pass (`npm test`).

---

## Phase 4: User Story 2 — Save Squad Composition (Priority: P2)

**Goal**: "Salvar Squad" button persists current squad to JSON Server via Server Action. 4-state UI: idle → loading → success/error → idle. Success auto-reverts after 2s (or immediately on squad change); error auto-reverts after 3s.

**Independent Test**: Build squad with ≥1 member, click "Salvar Squad", verify loading state appears, "Salvo ✓" appears briefly, then reverts. Check `curl http://localhost:3001/squads` shows new record.

### Implementation for User Story 2

- [X] T007 [US2] Create `app/(private)/dashboard/actions.ts`:
  - `'use server'` module-level directive
  - `export async function saveSquad(members: Developer[]): Promise<SavedSquad>`
  - Guard: `if (members.length === 0) throw new Error('Cannot save empty squad')`
  - `fetch('http://localhost:3001/squads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ savedAt: new Date().toISOString(), members }) })`
  - Throw `Error('Failed to save squad')` if `!res.ok`
  - Return `res.json()` on success
  - Import `Developer` from `@/lib/types`

- [X] T008 [US2] Create `app/(private)/dashboard/_components/SaveSquadButton.tsx`:
  - `'use client'` directive
  - `type SaveState = 'idle' | 'loading' | 'success' | 'error'`
  - `useState<SaveState>('idle')` for current state
  - `useRef<ReturnType<typeof setTimeout> | null>(null)` for timer
  - `useEffect([members])`: if `saveState === 'success'`, cancel pending timer and reset to `'idle'` (squad changed while success showing)
  - `useEffect` cleanup (unmount): cancel pending timer
  - `handleSave`: async, `try { setSaveState('loading'); await saveSquad(members); setSaveState('success'); timerRef.current = setTimeout(() => setSaveState('idle'), 2000) } catch { setSaveState('error'); timerRef.current = setTimeout(() => setSaveState('idle'), 3000) }`
  - Button label/style per state table from `contracts/server-action.md`: idle(members=0)=disabled gray, idle(members>0)=blue, loading=disabled dimmed "Salvando...", success=green "Salvo ✓" disabled, error=red "Erro ao salvar"
  - Import `saveSquad` from `@/app/(private)/dashboard/actions`
  - Import `useSquad` from `@/hooks/useSquad`

- [X] T009 [US2] Update `app/(private)/dashboard/_components/SquadPanel.tsx` to render `<SaveSquadButton />` alongside `<MetricsPanel />` in the `count > 0` guard section (below MetricsPanel)

**Checkpoint**: US2 fully functional — save persists to backend, button cycles through all four states correctly.

---

## Phase 5: Polish & Validation

**Purpose**: Verify correctness across both user stories.

- [X] T010 [P] Run `npm test` — verify all tests in `lib/metrics.test.ts` pass with no failures or skips. Fix any failing assertions.

- [X] T011 Manual validation against `specs/004-metrics-persistence/quickstart.md`:
  - Start mock server (`npm run mock`) and dev server (`npm run dev`)
  - Complete US1 checklist: add/remove developers, verify metrics update instantly with correct values
  - Complete US2 checklist: save squad, verify all 4 button states, verify backend record, verify error handling when mock is stopped
  - Complete metric accuracy checks: mixed seniority squads, duplicate skill deduplication

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — T001 and T002 run in parallel immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — T003 runs after T001/T002 (needs jest.config.ts for test runner)
- **US1 (Phase 3)**: Depends on T003 — T004 and T005 run in parallel; T006 depends on T005
- **US2 (Phase 4)**: Depends on T006 (SquadPanel base update in place) — T007 → T008 → T009 sequential
- **Polish (Phase 5)**: T010 depends on T004; T011 depends on T009

### User Story Dependencies

- **US1 (P1)**: Can start after T003 — no dependency on US2
- **US2 (P2)**: Can start after T006 — integrates into SquadPanel after US1 update is complete

### Within Each User Story

- Tests (T004) written before any manual validation but after lib/metrics.ts exists (T003)
- MetricsPanel (T005) is independent from tests (T004) — both run after T003
- SquadPanel update for MetricsPanel (T006) before SaveSquadButton integration (T009)

---

## Parallel Example: Phase 3 (US1)

```bash
# After T003 completes, launch in parallel:
Task T004: "Write unit tests in lib/metrics.test.ts"
Task T005: "Create MetricsPanel.tsx with useMemo"
# Then T006 after T005 completes.
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: US1 (T004, T005, T006)
4. **STOP and VALIDATE**: `npm test` passes; metrics update live on dashboard
5. Proceed to US2 when US1 is confirmed working

### Incremental Delivery

1. Setup + Foundational → `lib/metrics.ts` exists
2. US1 → Metrics panel visible in sidebar, Jest tests pass (MVP!)
3. US2 → Save action persists squad, all 4 button states work
4. Polish → All validations pass

---

## Notes

- `lib/metrics.ts` MUST have zero React imports — pure functions only (Constitution Principle III)
- `useMemo` MUST wrap all three metric computations in MetricsPanel (Constitution Principle III — explicitly evaluated)
- `saveSquad` MUST be a Server Action (`'use server'`) — not a client-side fetch (Constitution Principle IV)
- No new npm packages — `next/jest` ships with Next.js 15
- `db.json` must have `"squads": []` before running the save action (T002 prerequisite)
- Timer cleanup in SaveSquadButton is critical to prevent state updates on unmounted components
