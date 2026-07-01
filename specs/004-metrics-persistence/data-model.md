# Data Model: Squad Metrics & Persistence

**Feature**: 004-metrics-persistence
**Date**: 2026-06-30

---

## TypeScript Types

### Metrics (`lib/metrics.ts`)

```typescript
import type { Developer, Seniority } from './types'

// Exported pure functions (tested by Jest)
export function calcTotalCost(members: Developer[]): number
export function calcAvgSeniority(members: Developer[]): Seniority | null
export function calcSkillCoverage(members: Developer[]): string[]

// Internal scoring map (not exported)
const SENIORITY_SCORE: Record<Seniority, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
}
```

### Computed metrics shape (used in MetricsPanel)

```typescript
interface SquadMetrics {
  totalCost: number         // $X/hr — sum of member.cost
  avgSeniority: Seniority | null  // 'junior' | 'mid' | 'senior' | null (empty squad)
  skillCoverage: string[]   // unique skills, sorted alphabetically
}
```

### Server Action payload (`app/(private)/dashboard/actions.ts`)

```typescript
'use server'

// Input — sent to POST /squads on JSON Server
interface SaveSquadPayload {
  savedAt: string     // ISO 8601 timestamp
  members: Developer[]  // full snapshot, not just IDs
}

// Response from JSON Server (auto-assigns id)
export interface SavedSquad {
  id: number
  savedAt: string
  members: Developer[]
}

export async function saveSquad(members: Developer[]): Promise<SavedSquad>
```

### Button save state (`app/(private)/dashboard/_components/SaveSquadButton.tsx`)

```typescript
type SaveState = 'idle' | 'loading' | 'success' | 'error'
```

### db.json addition

```json
{
  "developers": [ /* existing 22 profiles */ ],
  "squads": []
}
```

---

## Algorithm: calcAvgSeniority

```
Input: members: Developer[]
Output: Seniority | null

1. If members is empty → return null
2. Map each member.seniority to score: junior→1, mid→2, senior→3
3. Sum scores / members.length → avg (float)
4. Round avg to nearest integer
5. Clamp to [1, 3]
6. Map back: 1→'junior', 2→'mid', 3→'senior'
7. Return label
```

**Examples**:
- `[]` → `null`
- `['junior']` → `'junior'` (avg 1.0)
- `['junior', 'senior']` → `'mid'` (avg 2.0)
- `['junior', 'junior', 'senior']` → `'junior'` (avg 1.67 → round to 2... wait)

Let me recalculate: junior=1, junior=1, senior=3 → avg = 5/3 ≈ 1.67 → round to 2 → 'mid'

Actually:
- `['junior', 'junior', 'senior']` → avg (1+1+3)/3 = 5/3 ≈ 1.67 → round(1.67) = 2 → 'mid'
- `['senior', 'senior', 'senior', 'junior', 'junior']` → avg (3+3+3+1+1)/5 = 11/5 = 2.2 → round(2.2) = 2 → 'mid'
- `['senior', 'senior', 'senior', 'senior', 'junior']` → avg (3+3+3+3+1)/5 = 13/5 = 2.6 → round(2.6) = 3 → 'senior'

---

## Algorithm: calcSkillCoverage

```
Input: members: Developer[]
Output: string[] (sorted alphabetically)

1. Collect all skills: members.flatMap(m => m.skills)
2. Deduplicate: new Set(allSkills)
3. Sort alphabetically
4. Return as array
```

**Example**: members with skills `['React', 'TypeScript']` and `['React', 'Go']` → `['Go', 'React', 'TypeScript']`

---

## Save Button State Machine

```
        idle
         │
    [click Save, members.length > 0]
         │
      loading ──[error]──→ error ──[3s timeout]──→ idle
         │
      [success]
         │
       success ──[members change]──→ idle
         │
       [2s timeout]
         │
        idle
```

**Guards**:
- `idle` → `loading`: only if `members.length > 0` and current state is `idle`
- `loading` → `loading`: blocked (button disabled in loading state)
- `success` → `idle`: triggered by either 2s timer OR `members` change (whichever comes first)
- `error` → `idle`: triggered by 3s timer (user may retry after)

---

## Component Dependency Graph

```
SquadPanel.tsx (updated)
  ├── SquadMemberCard.tsx (feature 003, unchanged)
  ├── MetricsPanel.tsx (NEW)
  │     └── useSquad() → members
  │     └── useMemo → { totalCost, avgSeniority, skillCoverage }
  │         ├── calcTotalCost(members)  ← lib/metrics.ts
  │         ├── calcAvgSeniority(members) ← lib/metrics.ts
  │         └── calcSkillCoverage(members) ← lib/metrics.ts
  └── SaveSquadButton.tsx (NEW)
        └── useSquad() → members
        └── saveSquad(members) ← app/(private)/dashboard/actions.ts
              └── fetch POST http://localhost:3001/squads
```

---

## Entity Relationships

```
Developer (from lib/types.ts — unchanged)
  ↓ used by
SquadState.members (feature 003 — read-only in this feature)
  ↓ read by
MetricsPanel → computes SquadMetrics (transient, not stored)
SaveSquadButton → calls saveSquad() → creates SavedSquad in /squads
  ↓
SavedSquad (persisted in JSON Server db.json squads[])
  id: number        (auto-assigned by JSON Server)
  savedAt: string   (ISO 8601)
  members: Developer[] (snapshot at time of save)
```
