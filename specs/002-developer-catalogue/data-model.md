# Data Model: Developer Catalogue

**Feature**: 002-developer-catalogue
**Date**: 2026-06-30

---

## TypeScript Types

```typescript
// lib/types.ts

export type Seniority = 'junior' | 'mid' | 'senior'

export interface Developer {
  id: string
  name: string
  avatar: string       // URL — falls back to DiceBear initials on error
  seniority: Seniority
  cost: number         // hourly rate in USD
  skills: string[]
}

export interface FilterState {
  name: string           // partial, case-insensitive search against Developer.name
  seniorities: Seniority[] // empty array = show all; one or more = show matching
}
```

**Notes**:
- `seniority` values in `db.json` are lowercase (`junior`, `mid`, `senior`) per CLAUDE.md convention. Display labels are capitalized in UI (`Junior`, `Mid`, `Senior`).
- `cost` is a plain number (hourly USD). Display format: `$XX/hr`.
- `id` is a string UUID in `db.json`; JSON Server uses the `id` field for the primary key.
- `FilterState` is local UI state — lives in the dashboard component, NOT in React Query or Context API.

---

## Derived State (computed via `useMemo`)

```typescript
// Computed inside the dashboard Client Component — not stored in state
const filteredDevelopers: Developer[] = useMemo(() => {
  return developers.filter(dev => {
    const nameMatch = dev.name
      .toLowerCase()
      .includes(filterState.name.toLowerCase())

    const seniorityMatch =
      filterState.seniorities.length === 0 ||
      filterState.seniorities.includes(dev.seniority)

    return nameMatch && seniorityMatch
  })
}, [developers, filterState])
```

---

## JSON Server Schema (`db.json`)

JSON Server exposes `db.json` collections as REST endpoints automatically.
The `developers` array becomes `GET http://localhost:3001/developers`.

```json
{
  "developers": [
    {
      "id": "string (UUID)",
      "name": "string (full name)",
      "avatar": "string (URL)",
      "seniority": "junior" | "mid" | "senior",
      "cost": number,
      "skills": ["string"]
    }
  ]
}
```

**Validation rules** (enforced at data entry, not at runtime):
- `id`: unique across all developers
- `seniority`: exactly one of `"junior"`, `"mid"`, `"senior"`
- `cost`: positive integer; typical ranges: Junior $25–45, Mid $50–75, Senior $80–120
- `skills`: non-empty array of strings, each a recognizable technology name
- Minimum 20 developer profiles to satisfy FR-011

---

## Entity Relationships

```
┌─────────────────────────────────────┐
│              Developer              │
├─────────────────────────────────────┤
│ id: string                          │
│ name: string                        │
│ avatar: string                      │
│ seniority: 'junior'|'mid'|'senior'  │
│ cost: number                        │
│ skills: string[]                    │
└─────────────────────────────────────┘
         ↑ fetched via React Query
         │ cached for 5 minutes
         │
┌─────────────────────────────────────┐
│            FilterState              │
├─────────────────────────────────────┤
│ name: string                        │
│ seniorities: Seniority[]            │
└─────────────────────────────────────┘
         ↑ local UI state (useState)
         │ drives useMemo filter
         │
┌─────────────────────────────────────┐
│       filteredDevelopers            │
│       (Developer[])                 │
│       derived via useMemo           │
└─────────────────────────────────────┘
```

Feature 003-squad-builder will extend `Developer` usage by introducing a
`SquadMember` derived type (a subset of `Developer`) managed by Context API + useReducer.
The `Developer` type itself is not changed by 003.
