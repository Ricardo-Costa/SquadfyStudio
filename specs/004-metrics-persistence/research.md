# Research: Squad Metrics & Persistence

**Feature**: 004-metrics-persistence
**Date**: 2026-06-30
**Status**: Complete — all decisions resolved

---

## Decision 1: lib/metrics.ts placement and test strategy

**Decision**: Pure calculation functions live in `lib/metrics.ts`. Jest tests in `lib/metrics.test.ts`. Jest is configured via `jest.config.ts` using `next/jest` (createJestConfig) with `testEnvironment: 'node'`.

**Rationale**: Constitution Principle III mandates pure functions in `lib/metrics.ts` free of side effects. The `next/jest` helper handles TypeScript compilation and the `@/` path alias without requiring `ts-jest` as a separate dependency — it ships with Next.js 15. `testEnvironment: 'node'` is faster than `jsdom` since lib/metrics.ts has zero DOM dependencies.

**Alternatives considered**:
- `ts-jest`: Adds a new devDependency; `next/jest` already does the same job.
- Inline metrics in MetricsPanel via `useMemo` only (no separate lib): Untestable with Jest — constitution explicitly requires unit test coverage on `lib/metrics.ts`.

---

## Decision 2: useMemo scope in MetricsPanel

**Decision**: A single `useMemo` call returns an object `{ totalCost, avgSeniority, skillCoverage }` keyed on `[members]`. Three separate `useMemo` calls are not used.

**Rationale**: One `useMemo` with one dependency array (`members`) is simpler and equally correct — all three metrics share the same dependency. Splitting into three `useMemo` calls would add noise without benefit since all three recompute on every squad change anyway.

**Alternatives considered**:
- Three separate `useMemo` calls: More granular but all have the same `[members]` dependency, giving no advantage.
- Compute inline without `useMemo`: Violates Constitution Principle III explicitly; also fails the evaluation criterion.

---

## Decision 3: SaveSquadButton state machine

**Decision**: `type SaveState = 'idle' | 'loading' | 'success' | 'error'`. `useState<SaveState>('idle')`. Success auto-reverts after 2 seconds via `setTimeout`. Error auto-reverts after 3 seconds. Members change (useEffect on `members`) resets `'success'` → `'idle'` immediately.

**Rationale**: Directly implements spec clarification Q3 (Option B). `useRef` stores the timer ID to prevent stale closures and avoid memory leaks on unmount. No external library (e.g., `react-hot-toast`) needed — Principle V (simplicity). Four states is the minimum to satisfy all UX requirements from the spec (FR-008, FR-009, FR-010, FR-011).

**Alternatives considered**:
- External toast library: Overkill — adds a dependency for a single button feedback; Principle V rejects this.
- `useReducer` for button state: Appropriate for complex state, but 4 string values with simple transitions don't justify the ceremony.
- Optimistic update (mutate UI before server responds): Risky — if the server fails, the user sees a false success. Pessimistic is safer.

---

## Decision 4: Server Action placement

**Decision**: `app/(private)/dashboard/actions.ts` with `'use server'` directive at the top of the file. Function exported: `saveSquad(members: Developer[]): Promise<SavedSquad>`.

**Rationale**: Collocated with the dashboard route where it is consumed. Next.js App Router scopes Server Actions to the file — a module-level `'use server'` makes all exports in the file server-only. Login Server Action follows the same pattern in `app/(auth)/login/`.

**Alternatives considered**:
- `lib/actions.ts`: More generic location; appropriate for actions shared across routes. But `saveSquad` is dashboard-specific.
- Inline Server Action in SaveSquadButton: Valid in Next.js 15 but mixes server and client code in one file; harder to test and trace in git history.

---

## Decision 5: POST payload structure to JSON Server

**Decision**: `{ savedAt: string (ISO 8601), members: Developer[] }`. JSON Server auto-assigns `id`. No deduplication or upsert logic.

**Rationale**: Each save is a new append-only POST (spec clarification Q1). JSON Server's `/squads` collection auto-assigns `id` as an integer. Storing `savedAt` enables chronological ordering if a list-of-saves UI is added in a future feature. Full `Developer[]` snapshot stored per spec ("snapshot semantics" in Assumptions).

**Alternatives considered**:
- Store only member IDs: Loses the snapshot guarantee — if a developer's profile changes in the catalogue, the saved record would be inconsistent.
- Include squad metrics in payload: Redundant — metrics are always derivable from members; storing them creates a consistency risk.

---

## Decision 6: Seniority average algorithm

**Decision**: Map seniority to a numeric score (junior=1, mid=2, senior=3), compute the arithmetic mean across all members, round to the nearest integer, clamp to [1, 3], and map back to the Seniority label. Empty squad returns `null`.

**Rationale**: Spec clarification (Assumptions section) specifies exactly this approach. Arithmetic mean + round + clamp is simple, pure, and testable. Alternative display formats (distribution, dominant level) were considered during clarify and rejected in favor of a single readable indicator.

**Alternatives considered**:
- Distribution display ("2 Senior, 1 Mid"): Richer but violates spec clarification decision for a single indicator.
- Median instead of mean: More robust to outliers in larger groups, but for max 5 members the difference is negligible and mean is simpler to implement and explain.

---

## Decision 7: SquadPanel extension strategy

**Decision**: `SquadPanel.tsx` is updated to render `<MetricsPanel />` and `<SaveSquadButton />` below the member list, separated by a divider. Both components call `useSquad()` independently.

**Rationale**: Each component is self-contained and reads only what it needs from `useSquad()`. MetricsPanel reads `members`, SaveSquadButton reads `members` and calls `addMember`/`removeMember` (not needed — reads only). Passing members as props from SquadPanel would add unnecessary prop drilling for components that can access context directly.

**Alternatives considered**:
- Pass `members` as props from SquadPanel: Adds prop drilling without benefit — MetricsPanel and SaveSquadButton are already inside the SquadProvider tree.
- Single combined MetricsSave component: Violates single-responsibility; metrics display and save action are distinct concerns.
