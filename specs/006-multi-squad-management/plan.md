# Implementation Plan: Multi-Squad Browsing & Comparison

**Branch**: `006-multi-squad-management` | **Date**: 2026-07-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/006-multi-squad-management/spec.md`

---

## Summary

Give every saved squad a name (captured via a confirmation modal on "Save Squad", always blank on
open) and replace the `/dashboard/squads` placeholder (from `005-dashboard-navigation`) with a real
screen: fetch all saved squads via React Query, render each as a card showing name/fallback label,
members, total cost, average seniority, and skill count (reusing `lib/metrics.ts`), with a search +
seniority filter that mirrors the catalogue's `FilterBar`. No editing/deleting of saved squads; the
squad-builder Context/reducer flow is untouched — this feature only adds a name step to saving and a
new read-only browsing screen on top of already-saved data.

---

## Technical Context

**Language/Version**: TypeScript 5.8, strict mode

**Primary Dependencies**:
- `next@^15.3.4` — Server Action update (`saveSquad`), existing `/dashboard/squads` route (from 005)
- `react@^19.0.0` — `useState`, `useMemo`, `useEffect` (modal Escape handling, same idiom as 005's nav drawer)
- `@tanstack/react-query@^5` — extended to also own the saved-squads list fetch (`useSquads`), alongside its existing catalogue usage — see Constitution Check note below
- `tailwindcss@^3.4.0` — card grid + modal styling, reusing existing visual patterns

**No new npm packages.**

**Storage**: JSON Server `/squads` collection (existing, from 004) — records gain a `name: string`
field going forward. No migration: existing records without `name` are handled purely in the
display layer via a fallback label (per spec FR-006, Edge Cases). `db.json`'s `"squads": []` schema
requires no structural change since json-server is schemaless.

**Testing**: Constitution's Jest mandate is scoped to `lib/metrics.ts` (reused as-is, untouched
here). No new mandatory unit tests — the new `lib/squads.ts` fallback-label function is a small
pure function but isn't a "metrics calculation" under Principle III, so coverage isn't required;
verification is manual via `quickstart.md`.

**Target Platform**: Browser (SquadsView, SquadCard, SaveSquadModal, updated SaveSquadButton) +
Next.js Server Action (`saveSquad`, signature extended with `name`)

**Performance Goals**:
- SC-003: search/filter narrows results within 100ms — achieved by precomputing each squad's
  metrics once (on squads-array change) and filtering that precomputed list on keystrokes, so
  typing never re-triggers `lib/metrics.ts` calculations (see `research.md` §2)

**Constraints**:
- `saveSquad` Server Action signature changes from `(members)` to `(name, members)` — the only
  caller is `SaveSquadButton`, so this is a contained, non-breaking-in-practice change
- Modal dismiss (backdrop/Escape/cancel) MUST NOT persist anything (FR-003a) — same no-new-dependency
  idiom already used for 005's mobile nav drawer (`useState` + a scoped `keydown` listener)
- `FilterBar` is reused (not duplicated) for the Squads screen — extended with a `placeholder`/`ariaLabel`
  prop, defaulting to the catalogue's existing copy so 003/002 behavior is unchanged
- Type `any` prohibited — strict TypeScript throughout

**Scale/Scope**: 1 modal, 1 new screen (replacing a placeholder), 1 new hook, 2 new components, 1
extended component, 1 extended Server Action, 1 new small lib file. No pagination (per spec
Assumptions — expected squad count is small).

**Dependency note**: This feature's UI plugs into the navigation shell and `/dashboard/squads` route
created by `005-dashboard-navigation` (currently an open, unmerged PR). This branch was created from
`main`, which does not yet include those files. **`005-dashboard-navigation` must be merged into
`main` (or merged/rebased into this branch) before implementation, and before tasks.md's
"replace the placeholder" tasks can run against real files.**

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Server-Side Auth | No auth changes; `/dashboard/squads` already protected by existing middleware (005) | ✅ PASS | Unaffected |
| II. State Management Split | React Query extended to own the saved-squads list fetch (server state); squad-builder Context/reducer stays exclusive to in-progress composition, unmodified | ✅ PASS | Principle II names "developer catalogue" as the example server state at the time it was written; this feature's saved-squads list is server state by the same definition (fetched from JSON Server, cached, has loading/error states) — extending React Query to it is the intended split, not a deviation. Modal's `name` field and open/closed state are local `useState`, not squad composition — same reasoning already applied to 005's nav drawer state |
| III. Optimized Rendering | Per-squad metrics computed once via `useMemo` keyed on the raw squads array; search/filter is a second `useMemo` over the precomputed list — typing never re-triggers `lib/metrics.ts` calculations | ✅ PASS | Same "wrap in useMemo, avoid unnecessary recompute" spirit as Principle III's MetricsPanel requirement, applied here to a list instead of a single squad |
| IV. Feature-Driven Delivery | Builds on 004 (save/persist) and 005 (nav shell/route) in order; Server Action used for the extended save operation | ✅ PASS | See Dependency note above — 005 must land first |
| V. Simplicity Over Abstraction | Reuses `FilterBar` (parameterized, not duplicated) and `lib/metrics.ts` (unchanged); modal reuses the exact no-dependency overlay idiom from 005; no new npm packages | ✅ PASS | No premature abstraction — `SquadCard`/`SquadsView` mirror `DeveloperCard`/`CatalogueView` 1:1 rather than inventing a generic "card list" abstraction |

**All gates pass. No Complexity Tracking entries required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/006-multi-squad-management/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions (FilterBar reuse, metrics precompute, modal idiom, sort order)
├── data-model.md        ← Phase 1 — extended SavedSquad, derived SquadCardData
├── quickstart.md        ← manual verification checklist (US1, US2, US3)
├── contracts/
│   ├── save-squad-action.md   ← extended saveSquad Server Action + SaveSquadModal contract
│   └── squads-fetch.md        ← useSquads() hook + SquadsView/SquadCard contract
├── checklists/
│   └── requirements.md  ← spec quality checklist (all pass)
└── tasks.md              ← generated by /speckit-tasks (not yet created)
```

### Source Code

```text
lib/
  types.ts                                # UPDATED — SavedSquad moves here (from actions.ts) and gains `name?: string`
  squads.ts                               # NEW — formatSquadName(squad): string (fallback label from savedAt when name is absent/blank)

app/(private)/dashboard/
  actions.ts                              # UPDATED — saveSquad(name: string, members: Developer[]): Promise<SavedSquad>
  squads/
    page.tsx                              # UPDATED — replaces 005's static placeholder with <SquadsView />
  _components/
    FilterBar.tsx                         # UPDATED — add optional `placeholder`/`ariaLabel` props (defaults preserve existing catalogue copy)
    SaveSquadButton.tsx                   # UPDATED — clicking opens SaveSquadModal instead of calling saveSquad directly
    SaveSquadModal.tsx                    # NEW — name prompt modal (blank on every open, Escape/backdrop/cancel dismiss, no persist on dismiss)
    SquadsView.tsx                        # NEW — orchestrator: useSquads() + search/seniority filter state + grid (mirrors CatalogueView.tsx)
    SquadCard.tsx                         # NEW — per-squad card: name/fallback, members, cost, seniority, skill count (mirrors DeveloperCard.tsx)

hooks/
  useSquads.ts                            # NEW — React Query hook, GET /squads (mirrors useDevelopers.ts)
```

No changes to `context/squad/*`, `middleware.ts`, `lib/metrics.ts`, `lib/auth.ts`, or `db.json`'s schema.

**Structure Decision**: Single Next.js App Router project (existing structure), continuing the
established mirror pattern: every new squads-browsing piece has a direct 1:1 counterpart already
proven in the catalogue feature (`SquadsView`↔`CatalogueView`, `SquadCard`↔`DeveloperCard`,
`useSquads`↔`useDevelopers`), which is the simplest way to add a second browsable collection
without introducing a new abstraction layer.

## Complexity Tracking

*No violations — table intentionally omitted.*
