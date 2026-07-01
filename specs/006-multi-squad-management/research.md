# Phase 0 Research: Multi-Squad Browsing & Comparison

## 1. Reuse `FilterBar` vs. build a separate squads filter bar

**Decision**: Extend `FilterBar.tsx` with optional `placeholder` and `ariaLabel` props (defaulting
to the existing catalogue copy), and reuse it as-is for the Squads screen instead of duplicating
the seniority-toggle markup/styling.

**Rationale**: `FilterBar`'s props (`name`, `onNameChange`, `seniorities`, `onSeniorityToggle`) are
already generic — only the hardcoded placeholder/aria-label strings are catalogue-specific. Making
those two strings optional props is a two-line, backward-compatible change (defaults preserve
002/003's existing behavior exactly) versus duplicating ~90 lines of seniority-pill styling.
Constitution Principle V favors this: reuse over duplication when the reuse is this cheap.

**Alternatives considered**:
- Duplicate into a new `SquadFilterBar.tsx` — rejected, pure copy-paste of styling logic with no behavioral difference, violates "three similar lines is better than a premature abstraction" in the other direction (this isn't a premature abstraction, it's an already-proven one).
- Generic `<FilterBar entityLabel="squad" />` with internal copy-switching logic — rejected, over-engineered for two prop values.

## 2. Avoiding recomputation on every keystroke

**Decision**: In `SquadsView.tsx`, compute an enriched list once via
`useMemo(() => squads.map(s => ({ squad: s, metrics: {...} })), [squads])`, then filter that
enriched list via a second `useMemo(() => enriched.filter(...), [enriched, filterState])`. `SquadCard`
receives already-computed metrics as props — it does not call `lib/metrics.ts` itself.

**Rationale**: The squads array only changes when the network fetch resolves (rare); the filter
state changes on every keystroke (frequent). Splitting the memoization this way means typing in the
search box never re-runs `calcTotalCost`/`calcAvgSeniority`/`calcSkillCoverage` — it only re-filters
an already-computed array, satisfying SC-003's 100ms bar trivially and staying in the spirit of
Constitution Principle III (avoid unnecessary recomputation) even though that principle's letter is
about the single in-progress squad's `MetricsPanel`.

**Alternatives considered**:
- Compute metrics inline inside `SquadCard` on every render — rejected; would re-run the calc functions on every parent re-render (e.g., every keystroke), unlike `CatalogueView`'s existing single-`useMemo` filter (which doesn't need this two-tier split because catalogue cards don't derive expensive calculations client-side).
- `useMemo` with the filter state as part of the same computation as the metrics — rejected; would recompute metrics on every keystroke, defeating the purpose.

## 3. Save-name modal implementation

**Decision**: New `SaveSquadModal.tsx`, structurally identical in idiom to `DashboardNav`'s mobile
drawer (005): local `useState<boolean>` for open/closed, a full-viewport backdrop `<div>` whose
`onClick` closes without saving, and a `useEffect` (active only while open) attaching a `keydown`
listener that closes on `Escape` without saving. `SaveSquadButton` renders the modal and owns the
"is the modal open" state; the modal owns its own `name` field state (`useState('')`), always
initialized blank because the component only mounts/shows when opened (per clarification: no
pre-fill across saves).

**Rationale**: Reusing an already-established, dependency-free overlay pattern from this same
codebase (005) is simpler than introducing a dialog library, and keeps the "no persist on dismiss"
guarantee (FR-003a) trivial — the modal never calls `saveSquad` except from its own confirm handler.

**Alternatives considered**:
- Native `<dialog>` element — rejected for the same reason as 005's research: inconsistent
  backdrop/animation behavior across supported browsers, no clear benefit over a controlled div here.
- A headless dialog library — rejected, unnecessary dependency for a single-field confirmation modal (Constitution Principle V).

## 4. `saveSquad` Server Action signature change

**Decision**: Change `saveSquad(members: Developer[])` to `saveSquad(name: string, members: Developer[])`.
The action validates both: empty/whitespace-only `name` and empty `members` both throw before the
`fetch` call, mirroring the existing empty-squad guard already in place.

**Rationale**: `SaveSquadButton` is the only caller (confirmed via search), so this is a fully
contained signature change with no other call sites to update. Passing `name` as a POST body field
alongside `members` and `savedAt` is the minimal extension of the existing `/squads` POST — no new
endpoint, no versioning concern (json-server has no schema to migrate).

**Alternatives considered**:
- A single options object `saveSquad({ name, members })` — considered, marginally more
  extensible, but the two-positional-argument form is simpler and there are only two required
  inputs with no realistic third parameter on the horizon (Principle V: no speculative flexibility).

## 5. Saved-squads list ordering

**Decision**: `useSquads()` returns squads sorted newest-first (by `savedAt` descending), applied
client-side in the hook (json-server does not guarantee order).

**Rationale**: Not specified in the spec; the most useful default for "which squad did I just save"
recall, and costs nothing extra since the array is already being mapped for metrics enrichment.

**Alternatives considered**:
- Alphabetical by name — rejected, less useful for recency-based comparison and inconsistent for
  the many legacy/fallback-labeled records that share a generic prefix.
- No explicit ordering (rely on backend order) — rejected, json-server's insertion order is an
  implementation detail, not a guarantee worth depending on for UX.

## 6. `SavedSquad` type location

**Decision**: Move the `SavedSquad` interface from `app/(private)/dashboard/actions.ts` into
`lib/types.ts` (alongside `Developer`, `Seniority`, `FilterState`), adding `name?: string` (optional,
to represent legacy records that predate this feature).

**Rationale**: `SavedSquad` is now imported by `actions.ts`, `hooks/useSquads.ts`, `SquadsView.tsx`,
and `SquadCard.tsx` — four consumers. `lib/types.ts` is already the project's shared-type home for
exactly this reason (`Developer`, `FilterState` live there for the same multi-consumer reason).
Leaving it in `actions.ts` (a `'use server'` file) would be an awkward import source for
client components.

**Alternatives considered**:
- Keep `SavedSquad` in `actions.ts`, import it from there everywhere — rejected; imports from a
  `'use server'` file into client components work in Next.js but mixes concerns unnecessarily
  when a dedicated shared-types file already exists and is already used for this exact purpose.
