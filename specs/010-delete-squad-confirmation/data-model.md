# Data Model: Delete Saved Squad with Confirmation

## Entities

### SavedSquad (existing — no schema change)

```ts
interface SavedSquad {
  id: number
  name?: string
  savedAt: string
  members: Developer[]
}
```

Source: `frontend/lib/types.ts` (unchanged by this feature).

**Lifecycle change introduced by this feature**: adds a terminal state — `deleted`. A
`SavedSquad` record is permanently removed from the mock API's `squads` collection on
confirmed deletion; there is no soft-delete flag or archive state. Once deleted, the record no
longer exists (no `id` lookup will resolve it).

```text
        create (saveSquad)              update (saveSquad, same id)
[none] ─────────────────────▶ [saved] ◀───────────────────────────┐
                                  │                                 │
                                  │ delete (deleteSquad, confirmed) │
                                  ▼                                 │
                              [deleted]  (terminal — id no longer resolvable)
```

No new fields, validation rules, or relationships are introduced. `SquadState` (the squad
builder's Context/useReducer client state) is unaffected in shape — this feature only adds a
new *caller* of the existing `resetSquad()` transition when the deleted `SavedSquad.id` matches
`SquadState.editingSquadId`.

## No new entities

This feature does not introduce any new domain entity, junction table, or field. It operates
entirely on the existing `SavedSquad` resource.
