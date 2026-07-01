# Research: Squad Builder

**Feature**: 003-squad-builder
**Date**: 2026-06-30
**Status**: Complete — all decisions resolved

---

## Decision 1: SquadProvider placement

**Decision**: Wrap `app/(private)/layout.tsx` with `<SquadProvider>` alongside the existing `<Providers>` (React Query)

**Rationale**: Squad state is needed by sibling components on the dashboard (catalogue cards + squad panel). Scoping to `(private)/layout.tsx` keeps it out of the public login page and is consistent with the React Query provider placement from feature 002. Adding a `dashboard/layout.tsx` would introduce an extra file with no benefit — all private routes are dashboard routes in this project.

**Alternatives considered**:
- `app/layout.tsx` root: Unnecessary; auth page doesn't need squad state
- `app/(private)/dashboard/layout.tsx`: More specific but adds a file with no real benefit given the current route structure

---

## Decision 2: SquadState shape

**Decision**: `{ members: Developer[] }` — flat array, maximum 5 elements

**Rationale**: Simplest shape that satisfies all requirements. Derived values (`isFull`, `isMember`, `count`) are computed in the `useSquad` hook rather than stored, keeping the reducer pure and state minimal. No need for a Map or Set — O(5) array operations are trivially fast for max 5 members.

**Alternatives considered**:
- `{ members: Record<string, Developer> }` (object keyed by id): Faster lookup but complicates ordering, iteration, and JSON serialization; overkill for ≤5 items
- Storing `isFull` in state: Redundant derived state that must be kept in sync

---

## Decision 3: Action types — two actions only

**Decision**: Two action types: `ADD_MEMBER` (payload: `Developer`) and `REMOVE_MEMBER` (payload: `string` — developer id)

**Rationale**: The spec requires only add and remove operations. Two actions keep the reducer minimal and the action file scannable. No `CLEAR_SQUAD` or `REORDER_MEMBER` actions — YAGNI applies per Constitution Principle V.

**Alternatives considered**:
- `SET_SQUAD` (replace entire state): Useful for hydration but out of scope here; feature 004 may add it if needed
- `TOGGLE_MEMBER`: Combines add/remove into one action — more complex to read and test

---

## Decision 4: Guard logic placement — reducer enforces invariants

**Decision**: All business rules (max 5, no duplicates) are enforced inside the reducer, not in the hook or component

**Rationale**: The reducer is the single source of truth for state transitions. Guards in the reducer make the invariants provable — regardless of how `dispatch` is called, the state never violates the rules. This also makes the reducer unit-testable without mocking context.

**Alternatives considered**:
- Guards in `addMember` hook function: Possible but duplicates logic that should live in the reducer; any direct dispatch call bypasses the guard
- Guards in the component (disable button): Already done as UX affordance (FR-008), but not sufficient as the sole enforcement layer

---

## Decision 5: Dashboard layout — page.tsx two-column grid

**Decision**: `app/(private)/dashboard/page.tsx` renders a two-column CSS grid: catalogue (~70% left) and squad panel (~30% right). On mobile, single-column flex stack (catalogue first, squad panel below).

**Rationale**: `page.tsx` is a Server Component shell — it orchestrates layout without state. `CatalogueView` and `SquadPanel` are Client Component siblings that each consume `useSquad` from the shared provider. This keeps concerns separate: the page owns layout, components own behavior.

**Tailwind layout**:
```
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
  <CatalogueView />
  <SquadPanel />
</div>
```

**Alternatives considered**:
- Sidebar via CSS `position: fixed/sticky`: Complex scroll behavior; unnecessary for this scope
- Squad panel rendered inside CatalogueView: Violates separation of concerns; makes CatalogueView responsible for squad display

---

## Decision 6: DeveloperCard add button integration — props, no context coupling

**Decision**: `DeveloperCard` receives three new props: `isInSquad: boolean`, `isFull: boolean`, `onAdd: (dev: Developer) => void`. The card renders a button conditionally. `CatalogueView` calls `useSquad()` and passes props down.

**Rationale**: `DeveloperCard` stays decoupled from the SquadContext — it only knows about its own display state via props. This keeps the component testable in isolation. `CatalogueView` is already `'use client'` and the natural place to bridge catalogue data and squad state.

**Button rendering logic**:
- `isInSquad === true` → "No Squad" badge (no button, FR-007)
- `isFull === true && !isInSquad` → disabled "+" button
- otherwise → active "+" / "Adicionar" button calling `onAdd(developer)`

**Note**: `DeveloperCard` does not need an explicit `'use client'` directive — it is always rendered inside `CatalogueView` (which is `'use client'`), so it inherits the client bundle boundary.

**Alternatives considered**:
- `DeveloperCard` calls `useSquad()` directly: Couples the leaf card to global state; harder to test; violates single-responsibility
- Passing `addMember` from page.tsx: page.tsx is a Server Component and cannot pass functions as props to client children
