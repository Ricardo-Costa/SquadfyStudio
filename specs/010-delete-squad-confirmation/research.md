# Research: Delete Saved Squad with Confirmation

No `NEEDS CLARIFICATION` markers remain in the Technical Context — this feature reuses
established patterns from the existing codebase rather than introducing new technology
choices. This document records the design decisions and the alternatives considered.

## Decision: Deletion goes through a Server Action, not a client-side fetch

**Rationale**: The constitution's Principle II (Strict State Management Split) and the existing
`saveSquad` action both establish that mutations against the mock API go through Server Actions,
never direct client fetches — this keeps all write paths consistent and auditable, and matches
the user's own explicit request to mirror `saveSquad`'s pattern.

**Alternatives considered**:
- *Direct client-side `fetch` from `SquadDetailPanel`*: Rejected — breaks the established
  mutation convention for no benefit; the mock API has no auth requirement that would make a
  Server Action strictly necessary here, but consistency with `saveSquad` outweighs the minor
  boilerplate of a second Server Action.

## Decision: React Query cache invalidation via `queryClient.invalidateQueries`, not a passed-down refetch callback

**Rationale**: `SaveSquadButton` already calls `queryClient.invalidateQueries({ queryKey: ['squads'] })`
directly via `useQueryClient()` after a successful save, from a component that isn't the one
holding the `useSquads()` call. The same pattern applies cleanly to delete: `SquadDetailPanel`
doesn't own the `useSquads()` query (`SquadsView` does), but invalidating by query key from
anywhere in the tree is exactly what React Query's client is for — no prop-drilling of a
`refetch` callback needed.

**Alternatives considered**:
- *Pass `refetch` down from `SquadsView` through `SquadDetailPanel`'s props*: Rejected — adds a
  prop for something React Query already solves globally, and diverges from the
  `SaveSquadButton` precedent already in the codebase.

## Decision: Clearing the builder association calls `resetSquad()` directly, gated on an ID comparison

**Rationale**: `resetSquad()` already resets `SquadState` back to `initialSquadState` (empty
members, `editingSquadId: null`, `editingSquadName: null`, `isDirty: false`) — exactly the
state FR-007 requires. `ClearSquadAssociation` already establishes the precedent of calling
`resetSquad()` to drop a stale association. The only new logic needed is the guard: only reset
if `editingSquadId === data.squad.id` (the deleted squad), so FR-008 (unaffected builder when a
*different* squad is deleted) holds.

**Alternatives considered**:
- *Always reset the builder on any successful delete*: Rejected — would violate FR-008 by
  wiping in-progress, unrelated builder work whenever any squad is deleted.

## Decision: Delete button and confirmation state live inline in `SquadDetailPanel`, not a new component

**Rationale**: Constitution Principle V (Simplicity Over Abstraction). `SaveSquadButton` and
`NewSquadButton` are separate components because each renders in a location different from
where its state is otherwise relevant (`SquadPanel` and `DashboardCatalogue` respectively).
The delete action has only one call site — `SquadDetailPanel` — and that component already
owns one `ConfirmDialog` instance for the "replace current squad" flow, so a second local
`isDeleteConfirmOpen` state and a second `ConfirmDialog` instance follow the same file's
existing shape with no new abstraction.

**Alternatives considered**:
- *Extract a `DeleteSquadButton` component*: Rejected — no second render location exists to
  justify the extraction; would be a premature abstraction per Principle V.

## Decision: Failed deletions leave the panel open with an inline error, following `SaveSquadButton`'s `idle`/`loading`/`error` pattern

**Rationale**: `SaveSquadButton` already establishes the exact state machine needed
(`idle → loading → error`, auto-resetting after `SAVE_ERROR_RESET_MS`) for a mutating action
that can fail against the same mock API. Reusing it for delete keeps failure UX consistent
across the app's two mutating actions and satisfies FR-009 (indicate failure, leave squad data
unchanged) without inventing new error-handling UI.

**Alternatives considered**:
- *Toast/global notification for delete errors*: Rejected — no toast system exists in this
  codebase; introducing one for a single error case would violate Principle V.
