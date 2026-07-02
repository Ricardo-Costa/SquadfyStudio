# Contract: Delete Squad

## Server Action: `deleteSquad`

**Location**: `frontend/app/(private)/dashboard/actions.ts` (new export, alongside existing
`saveSquad`)

**Signature**:

```ts
'use server'

export async function deleteSquad(id: number): Promise<void>
```

**Behavior**:

1. Sends `DELETE ${SERVER_API_BASE_URL}/squads/${id}` to the mock API.
2. On a non-OK response, throws an `Error` with the status/text (same shape as `saveSquad`'s
   existing error handling), which the caller (`SquadDetailPanel`) catches to drive its
   `error` state.
3. On success, resolves with no value — the caller is responsible for React Query cache
   invalidation and any Context state changes (this action has no knowledge of client state,
   consistent with the state-split principle).

**Preconditions**: `id` refers to an existing `SavedSquad.id`. If the squad was already
deleted (e.g., a race with another tab), the mock API returns a 404, which this action
surfaces as a thrown error — the caller treats it the same as any other failure (FR-009).

**Postconditions on success**: The `SavedSquad` record with the given `id` no longer exists in
the mock API's `squads` collection.

## Underlying REST call (mock API, unchanged)

`DELETE /squads/:id` — already provided by `json-server`'s default router (see
`mock-api/README.md`, "standard `json-server` REST conventions"). No mock API code changes are
required for this feature.

| | |
|---|---|
| Method | `DELETE` |
| Path | `/squads/:id` |
| Success | `200 OK` (json-server default), body is the deleted resource |
| Not found | `404 Not Found` |

## Caller contract: `SquadDetailPanel`

On `deleteSquad(id)` resolving successfully, the caller MUST, in this order:

1. Invalidate the `['squads']` React Query cache key (`queryClient.invalidateQueries`).
2. Close the detail panel (`onClose()`).
3. If `editingSquadId === id` (the deleted squad was loaded in the builder), call
   `resetSquad()`.

On `deleteSquad(id)` throwing, the caller MUST:

1. Leave the detail panel open.
2. Surface a visible error state to the user (no silent failure).
3. Leave the squads list and builder state unchanged.
