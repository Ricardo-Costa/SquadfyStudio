# Contract: useSquad Hook

**Feature**: 003-squad-builder
**Date**: 2026-06-30

This feature has no external HTTP API — squad state is client-only.
The primary contract is the `useSquad` hook interface consumed by all squad-aware components.

---

## `useSquad()` — Public Interface

```typescript
// hooks/useSquad.ts
export function useSquad(): {
  members: Developer[]          // Current squad members (0–5)
  count: number                 // members.length
  isFull: boolean               // count >= MAX_SQUAD_SIZE (5)
  isMember: (id: string) => boolean
  addMember: (dev: Developer) => void
  removeMember: (id: string) => void
}
```

### Invariants (enforced by reducer — never violated regardless of call order)

| Invariant | Guarantee |
|---|---|
| `members.length <= 5` | Enforced by `ADD_MEMBER` guard in reducer |
| No duplicate ids | Enforced by `ADD_MEMBER` guard in reducer |
| `isFull === (count >= 5)` | Always derived, never stored |
| `isMember(id) === members.some(m => m.id === id)` | Always derived |

### Consumers

| Component | Reads | Writes |
|---|---|---|
| `CatalogueView` | `isFull`, `isMember(id)` | `addMember(dev)` |
| `SquadPanel` | `members`, `count`, `isFull` | `removeMember(id)` |
| Feature 004 metrics | `members` | — (read-only) |

### Error Behaviour

- `useSquad()` called outside `<SquadProvider>` → throws `Error('useSquad must be used within SquadProvider')`
- `addMember` on a full squad → no-op (reducer guard, no error thrown)
- `addMember` duplicate id → no-op (reducer guard, no error thrown)
- `removeMember` with unknown id → no-op (filter returns unchanged array)

---

## `squadReducer` — Reducer Contract

```typescript
// Pure function — no side effects
function squadReducer(state: SquadState, action: SquadAction): SquadState
```

- **Deterministic**: same `(state, action)` always produces same result
- **Immutable**: never mutates `state`; always returns new object on change
- **No-op on invalid inputs**: returns `state` unchanged rather than throwing

---

## Layout Contract

| Breakpoint | Layout |
|---|---|
| `< lg` (mobile/tablet) | Single column: `[CatalogueView]` then `[SquadPanel]` stacked vertically |
| `>= lg` (desktop) | Two columns: `[CatalogueView ~70%] [SquadPanel ~30%]` side by side |

Implemented via Tailwind: `grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]`
