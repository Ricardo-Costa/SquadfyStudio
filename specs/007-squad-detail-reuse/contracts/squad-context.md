# Contract: Squad Context extension (`context/squad/*`, `hooks/useSquad.ts`)

## `context/squad/actions.ts`

```ts
export type SquadAction =
  | { type: 'ADD_MEMBER'; payload: Developer }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'LOAD_SQUAD'; payload: { id: number; name: string; members: Developer[] } }
```

## `context/squad/reducer.ts`

| Action | Effect |
|---|---|
| `LOAD_SQUAD` | `{ members: payload.members, editingSquadId: payload.id, editingSquadName: payload.name }` — full replace, no merge with prior state |
| `ADD_MEMBER` | Unchanged from 003 (respects `MAX_SQUAD_SIZE`, dedupes by id); does not touch `editingSquadId`/`editingSquadName` |
| `REMOVE_MEMBER` | Unchanged member filtering; **additionally**, if the resulting `members` array is empty, also sets `editingSquadId: null, editingSquadName: null` |

`initialSquadState` gains `editingSquadId: null, editingSquadName: null`.

## `hooks/useSquad.ts`

New return fields, alongside the existing `members`, `count`, `isFull`, `isMember`, `addMember`,
`removeMember`:

```ts
{
  editingSquadId: number | null
  editingSquadName: string | null
  loadSquad: (id: number, name: string, members: Developer[]) => void  // dispatches LOAD_SQUAD
}
```

## Behavioral contract

| Trigger | Effect | Requirement |
|---|---|---|
| `SquadDetailPanel` "Editar" clicked, builder empty | `loadSquad(...)` dispatches immediately, no confirmation | FR-007 |
| `SquadDetailPanel` "Editar" clicked, builder has members | `window.confirm(...)` first; only on confirm does `loadSquad(...)` dispatch | FR-008 |
| Tech Lead adds a member while `editingSquadId` is set | `editingSquadId`/`editingSquadName` unchanged | Assumption (research.md §2/spec US2 scenario 2) |
| Tech Lead removes members down to zero while `editingSquadId` is set | `editingSquadId`/`editingSquadName` reset to `null` | FR-010b |
| `SaveSquadButton` confirms a save | Reads current `editingSquadId`/`editingSquadName` at that moment to decide `saveSquad(name, members, editingSquadId ?? undefined)` and the modal's `initialName` | FR-009, FR-010 |
