# Phase 1 Data Model: Multi-Squad Browsing & Comparison

## SavedSquad (extended, persisted)

Lives in `lib/types.ts` (moved from `app/(private)/dashboard/actions.ts` — see `research.md` §6).
Backend: JSON Server `/squads` collection (unchanged endpoint, extended payload shape).

| Field | Type | Notes |
|---|---|---|
| `id` | `number` | Assigned by JSON Server on POST. Unchanged from 004. |
| `name` | `string \| undefined` | **NEW.** Required for every squad saved through this feature (FR-001–FR-003b); `undefined`/absent on records saved before this feature shipped (legacy). Never persisted as an empty string — the save modal blocks that case (FR-002). |
| `savedAt` | `string` (ISO 8601) | Unchanged from 004. Used both for display and as the source for the fallback label when `name` is absent. |
| `members` | `Developer[]` | Unchanged from 004 — full member snapshot at save time. |

**Validation rules** (enforced in the `saveSquad` Server Action, mirroring the existing empty-squad guard):
- `name.trim().length > 0` — else throw before persisting (FR-002).
- `members.length > 0` — existing 004 rule, unchanged.

**Identity & uniqueness**: `id` is the only unique identifier (backend-assigned). `name` has no
uniqueness constraint — duplicates are explicitly allowed (FR-004).

**Lifecycle**: Append-only, same as 004 — created once via save, never updated or deleted by this
feature (FR-012). No state transitions.

## SquadCardData (derived, non-persisted)

Computed once per `SavedSquad` when the squads list is fetched/changes (see `research.md` §2) —
never recomputed on search/filter keystrokes.

| Field | Type | Notes |
|---|---|---|
| `squad` | `SavedSquad` | The source record. |
| `displayName` | `string` | `squad.name` if present and non-blank; otherwise the fallback label from `lib/squads.ts`'s `formatSquadName`, derived from `savedAt` (e.g., "Squad salvo em 30/06/2026"). |
| `totalCost` | `number` | `calcTotalCost(squad.members)` — reused from `lib/metrics.ts`, unchanged. |
| `avgSeniority` | `Seniority \| null` | `calcAvgSeniority(squad.members)` — reused, unchanged. `null` is only theoretically possible for a malformed record with zero members (see Edge Cases); real saved squads always have ≥1 member per the existing save guard. |
| `skillCoverage` | `string[]` | `calcSkillCoverage(squad.members)` — reused, unchanged; card displays `skillCoverage.length`. |

## SquadFilterState (derived, non-persisted, local UI state)

Mirrors the catalogue's existing `FilterState` shape/behavior exactly (see `research.md` §1),
scoped to the Squads screen only — not shared state, lives in `SquadsView.tsx`'s local `useState`.

| Field | Type | Notes |
|---|---|---|
| `name` | `string` | Free-text search, matched case-insensitively against `displayName` (substring match, same as the catalogue's name filter). |
| `seniorities` | `Seniority[]` | Multi-select; a card is included when `avgSeniority` is in this list, or when the list is empty (no filter applied) — identical semantics to the catalogue's seniority filter. |

## Relationships

- `SquadCardData.squad` → `SavedSquad`: 1:1, purely derived, never persisted back.
- `lib/metrics.ts` calculation functions are shared, unmodified dependencies of `SquadCardData` —
  the same functions already used by the live squad-builder `MetricsPanel` (004), now also used
  read-only against historical snapshots.
- `SquadFilterState` has no relationship to `SavedSquad` persistence — it only filters the
  in-memory `SquadCardData[]` list produced by `useSquads()`.
- No relationship to `context/squad/reducer.ts`'s `SquadState` — the in-progress squad builder is
  fully decoupled from browsing saved squads (per spec Assumptions and FR-013).
