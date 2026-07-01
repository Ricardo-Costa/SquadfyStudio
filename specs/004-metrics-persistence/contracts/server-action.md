# Contract: saveSquad Server Action

**Feature**: 004-metrics-persistence
**Date**: 2026-06-30

---

## `saveSquad(members: Developer[]): Promise<SavedSquad>`

**File**: `app/(private)/dashboard/actions.ts`
**Directive**: `'use server'` (module-level)

### Request

```typescript
// Called from SaveSquadButton (client component)
const result = await saveSquad(members)
```

**Input validation**:
- `members.length === 0` → throws `Error('Cannot save empty squad')` (FR-008 enforcement on server)

### HTTP call (internal — to JSON Server)

```
POST http://localhost:3001/squads
Content-Type: application/json

{
  "savedAt": "2026-06-30T12:34:56.789Z",  // new Date().toISOString()
  "members": [ /* Developer[] snapshot */ ]
}
```

### Response

```typescript
interface SavedSquad {
  id: number        // auto-assigned by JSON Server
  savedAt: string
  members: Developer[]
}
```

### Error behavior

| Condition | Behavior |
|-----------|----------|
| `members.length === 0` | Throws `Error('Cannot save empty squad')` before fetch |
| HTTP response not ok (non-2xx) | Throws `Error('Failed to save squad')` |
| Network unavailable | `fetch` rejects → error propagates to SaveSquadButton |

All thrown errors are caught by `SaveSquadButton`'s try/catch and translate to `saveState → 'error'`.

### Invariants

- Function never mutates `members` array
- Each call creates a new record in JSON Server (append-only POST)
- `savedAt` is always set server-side (not passed from client)
- Returns the full persisted `SavedSquad` (including `id`) on success

---

## SaveSquadButton — UI contract

| State | Button label | Button style | Disabled |
|-------|-------------|-------------|---------|
| `idle`, members > 0 | "Salvar Squad" | Blue/primary | No |
| `idle`, members = 0 | "Salvar Squad" | Gray/disabled | Yes |
| `loading` | "Salvando..." | Blue/dimmed | Yes |
| `success` | "Salvo ✓" | Green | Yes (auto-reverts 2s) |
| `error` | "Erro ao salvar" | Red | No (auto-reverts 3s, allows retry) |

### State transitions

```
idle (members=0)  →  [user adds member]  →  idle (members>0)
idle (members>0)  →  [click]            →  loading
loading           →  [success]          →  success
loading           →  [error/catch]      →  error
success           →  [2s timer]         →  idle
success           →  [members change]   →  idle (timer cancelled)
error             →  [3s timer]         →  idle
```
