# Data Model: Squad Builder

**Feature**: 003-squad-builder
**Date**: 2026-06-30

---

## TypeScript Types

### Actions (`context/squad/actions.ts`)

```typescript
import type { Developer } from '@/lib/types'

export type SquadAction =
  | { type: 'ADD_MEMBER'; payload: Developer }
  | { type: 'REMOVE_MEMBER'; payload: string } // payload = developer id
```

### State & Reducer (`context/squad/reducer.ts`)

```typescript
import type { Developer } from '@/lib/types'
import type { SquadAction } from './actions'

export const MAX_SQUAD_SIZE = 5

export interface SquadState {
  members: Developer[]
}

export const initialSquadState: SquadState = {
  members: [],
}

export function squadReducer(state: SquadState, action: SquadAction): SquadState {
  switch (action.type) {
    case 'ADD_MEMBER': {
      // Guard: no duplicates, no overflow
      if (
        state.members.length >= MAX_SQUAD_SIZE ||
        state.members.some((m) => m.id === action.payload.id)
      ) {
        return state
      }
      return { members: [...state.members, action.payload] }
    }
    case 'REMOVE_MEMBER':
      return {
        members: state.members.filter((m) => m.id !== action.payload),
      }
    default:
      return state
  }
}
```

### Context (`context/squad/SquadContext.tsx`)

```typescript
'use client'

import { createContext, useReducer } from 'react'
import { squadReducer, initialSquadState } from './reducer'
import type { SquadState } from './reducer'
import type { SquadAction } from './actions'

export interface SquadContextValue {
  state: SquadState
  dispatch: React.Dispatch<SquadAction>
}

export const SquadContext = createContext<SquadContextValue | null>(null)

export function SquadProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(squadReducer, initialSquadState)
  return (
    <SquadContext.Provider value={{ state, dispatch }}>
      {children}
    </SquadContext.Provider>
  )
}
```

### Custom Hook (`hooks/useSquad.ts`)

```typescript
'use client'

import { use } from 'react'
import { SquadContext } from '@/context/squad/SquadContext'
import type { Developer } from '@/lib/types'

export function useSquad() {
  const ctx = use(SquadContext)
  if (!ctx) throw new Error('useSquad must be used within SquadProvider')
  const { state, dispatch } = ctx
  return {
    members: state.members,
    count: state.members.length,
    isFull: state.members.length >= 5,
    isMember: (id: string) => state.members.some((m) => m.id === id),
    addMember: (dev: Developer) => dispatch({ type: 'ADD_MEMBER', payload: dev }),
    removeMember: (id: string) => dispatch({ type: 'REMOVE_MEMBER', payload: id }),
  }
}
```

---

## State Transitions

```
Squad State Machine (per member slot):

NOT_IN_SQUAD ──[addMember(dev)]──→ IN_SQUAD
               (if !isFull && !isMember)

IN_SQUAD ──[removeMember(id)]──→ NOT_IN_SQUAD

FULL (5 members) ──[addMember]──→ FULL (no-op, guard in reducer)
```

---

## Entity Relationships

```
┌──────────────────────────────────────────┐
│               SquadState                 │
├──────────────────────────────────────────┤
│ members: Developer[]  (0–5 items)        │
└──────────────────────────────────────────┘
         ↑ managed by squadReducer
         │ dispatched via useSquad()
         │ provided by SquadProvider
         │
┌──────────────────────────────────────────┐
│   useSquad() — derived reads             │
├──────────────────────────────────────────┤
│ members: Developer[]                     │
│ count: number         (0–5)              │
│ isFull: boolean       (count >= 5)       │
│ isMember(id): boolean                    │
│ addMember(dev): void  → ADD_MEMBER       │
│ removeMember(id): void → REMOVE_MEMBER   │
└──────────────────────────────────────────┘
         │ consumed by:
         ├─ CatalogueView (passes isInSquad/isFull/onAdd to DeveloperCard)
         └─ SquadPanel (renders members, remove buttons)
```

---

## DeveloperCard Updated Props

```typescript
// Additions to DeveloperCard props (feature 003)
interface DeveloperCardProps {
  developer: Developer
  isInSquad: boolean        // NEW — shows badge instead of add button
  isFull: boolean           // NEW — disables add button when squad full
  onAdd: (dev: Developer) => void  // NEW — called on add button click
}
```

**Button rendering logic** (see research.md Decision 6):
| State | UI |
|---|---|
| `isInSquad === true` | "No Squad" badge (no button) |
| `isFull && !isInSquad` | Disabled "+" button |
| `!isFull && !isInSquad` | Active "Adicionar" button |

---

## Notes

- `Developer` type is unchanged from `lib/types.ts` (feature 002). Squad members carry the full `Developer` shape.
- Feature 004 will consume `useSquad().members` as read-only input for metrics calculations. No changes to `SquadState` are expected for that feature.
- The `use(SquadContext)` call in `useSquad.ts` uses the React 19 `use()` API instead of `useContext()` — both work; `use()` is idiomatic for React 19.
