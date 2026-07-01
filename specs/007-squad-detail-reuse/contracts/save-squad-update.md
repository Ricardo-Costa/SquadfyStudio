# Contract: `saveSquad` update path + `SaveSquadModal` pre-fill + `SquadDetailPanel`

## `saveSquad` (extended again)

`app/(private)/dashboard/actions.ts` — `'use server'`

```ts
export async function saveSquad(
  name: string,
  members: Developer[],
  id?: number
): Promise<SavedSquad>
```

| Condition | Behavior |
|---|---|
| `id` is `undefined` | `POST http://localhost:3001/squads` with `{ name, savedAt: new Date().toISOString(), members }` — unchanged from 006 |
| `id` is a `number` | `PUT http://localhost:3001/squads/${id}` with the same body shape; json-server preserves `id` from the URL, `savedAt` is refreshed to the current time (FR-010a) |

Validation (`name` required non-blank, `members` non-empty) applies identically in both cases,
before any network call, per FR-011.

## `SaveSquadModal` (extended)

`app/(private)/dashboard/_components/SaveSquadModal.tsx`

### New prop

```ts
interface SaveSquadModalProps {
  isOpen: boolean
  onConfirm: (name: string) => void
  onCancel: () => void
  initialName?: string   // NEW
}
```

| `initialName` | Behavior on open (`isOpen` becomes `true`) |
|---|---|
| `undefined` | Name field starts blank — unchanged 006 behavior for a from-scratch save |
| a string (including a fallback label, per spec FR-009) | Name field starts pre-filled with that value, editable, confirm button enabled immediately (value is already non-blank) |

## `SquadDetailPanel` component contract

`app/(private)/dashboard/_components/SquadDetailPanel.tsx` — `'use client'`

### Props

```ts
interface SquadDetailPanelProps {
  data: SquadCardData | null   // null = no squad selected, panel renders nothing
  onClose: () => void
}
```

### Rendered content (when `data` is non-null)

- Header: `data.displayName`, a close control (calls `onClose`)
- Aggregate metrics: `data.totalCost`, `data.avgSeniority`, `data.skillCoverage.length` (same
  three-stat layout already used on `SquadCard`, per FR-004)
- Full skill list: every entry of `data.skillCoverage`, rendered as tags (FR-003)
- Member roster: one `SquadMemberCard` per `data.squad.members` entry, **no** `onRemove` prop passed
  (read-only, per `research.md` §4) (FR-002)
- "Editar" button (FR-007): on click —
  1. If `useSquad().count > 0`, call `window.confirm(...)`; abort on cancel (FR-008)
  2. Otherwise (or on confirm), call `loadSquad(data.squad.id, data.displayName, data.squad.members)`
  3. `router.push('/dashboard')`

### Explicit non-goals

- No inline editing within the panel itself — the only way to change a squad's composition is via "Editar" → the full builder (FR-007, spec Assumptions).
- No delete action (spec explicitly excludes squad deletion).
