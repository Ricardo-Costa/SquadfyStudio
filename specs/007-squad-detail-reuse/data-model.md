# Phase 1 Data Model: Squad Detail Panel & Reuse

## SquadState (extended, `context/squad/reducer.ts`)

| Field | Type | Notes |
|---|---|---|
| `members` | `Developer[]` | Unchanged from 003/004. |
| `editingSquadId` | `number \| null` | **NEW.** The `id` of the saved squad this builder session originated from, if any. `null` for a from-scratch squad. |
| `editingSquadName` | `string \| null` | **NEW.** The display name of that saved squad at load time — carried separately from `members` so `SaveSquadButton` can pre-fill the save modal without re-deriving it. `null` when `editingSquadId` is `null`. |

**Invariant**: `editingSquadId` and `editingSquadName` are both `null` or both non-`null` together —
never one without the other.

**Transitions**:
- `LOAD_SQUAD { id, name, members }` → replaces `members` entirely, sets `editingSquadId = id`, `editingSquadName = name`.
- `ADD_MEMBER` → unchanged behavior; does not affect `editingSquadId`/`editingSquadName` (adding a member while editing a loaded squad keeps the same association — FR-007/US2 scenario 2).
- `REMOVE_MEMBER` → unchanged member-removal behavior; additionally, if the resulting `members.length === 0`, also resets `editingSquadId = null` and `editingSquadName = null` (per `research.md` §3 / spec FR-010b).

## `saveSquad` Server Action (extended, `app/(private)/dashboard/actions.ts`)

| Param | Type | Notes |
|---|---|---|
| `name` | `string` | Unchanged validation (required, non-blank). |
| `members` | `Developer[]` | Unchanged validation (non-empty). |
| `id` | `number \| undefined` | **NEW, optional.** Absent → `POST /squads` (new record, unchanged 004/006 behavior). Present → `PUT /squads/:id` (updates the existing record's `name`, `savedAt`, and `members` in place; `id` itself is preserved by the URL, not the body). |

Return type (`SavedSquad`) is unchanged either way.

## `SquadCardData` (unchanged shape, new consumer)

No new fields — `SquadDetailPanel` consumes the exact same `SquadCardData` object `SquadsView`
already computes per squad (from 006's `data-model.md`): `squad`, `displayName`, `totalCost`,
`avgSeniority`, `skillCoverage`. The panel is purely a different *presentation* of this existing
data (expanded/detailed vs. the card's summary view) — no new derived type is introduced.

## Relationships

- `SquadDetailPanel` ← `SquadCardData` (read-only, same object already in `SquadsView`'s `enriched`
  array — looked up by `squad.id` matching the clicked card, not recomputed).
- `SquadState.editingSquadId` → `SavedSquad.id` (loose reference by value, not a persisted
  relationship — it only exists in transient client state for the duration of an edit session).
- `saveSquad`'s `id` parameter, when present, comes directly from `SquadState.editingSquadId` at
  the moment "Save Squad" is confirmed.
