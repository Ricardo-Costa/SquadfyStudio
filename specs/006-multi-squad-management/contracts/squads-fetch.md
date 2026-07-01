# Contract: `useSquads` hook + `SquadsView` / `SquadCard`

## `useSquads()` hook

`hooks/useSquads.ts`

```ts
export function useSquads(): UseQueryResult<SavedSquad[]>
```

Mirrors `useDevelopers()` exactly:

```ts
async function fetchSquads(): Promise<SavedSquad[]> {
  const res = await fetch('http://localhost:3001/squads')
  if (!res.ok) throw new Error('Failed to fetch squads')
  const squads: SavedSquad[] = await res.json()
  return [...squads].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )
}

export function useSquads() {
  return useQuery<SavedSquad[]>({ queryKey: ['squads'], queryFn: fetchSquads })
}
```

`queryKey: ['squads']` is distinct from `['developers']` — no cache collision. React Query owns
`isLoading`/`isError`/`refetch`, consistent with `useDevelopers()`'s existing contract.

## `SquadsView` component contract

`app/(private)/dashboard/_components/SquadsView.tsx` — `'use client'`, replaces the placeholder
content of `app/(private)/dashboard/squads/page.tsx`.

No props — self-contained, mirrors `CatalogueView.tsx`'s structure:

| State | Source | Notes |
|---|---|---|
| `squads`, `isLoading`, `isError`, `refetch` | `useSquads()` | Same shape as `CatalogueView`'s `useDevelopers()` usage |
| `enriched` (`SquadCardData[]`) | `useMemo` on `squads` | Per `research.md` §2 — computed once per fetch, not per keystroke |
| `filterState` (`SquadFilterState`) | local `useState` | Not shared/global — scoped to this screen |
| `filtered` (`SquadCardData[]`) | `useMemo` on `[enriched, filterState]` | Applies name search (substring, case-insensitive) + seniority filter (AND logic, per FR-011) |

### Rendered states (behavioral contract)

| Condition | Rendered output | Requirement |
|---|---|---|
| `isLoading` | Loading indicator | FR-008 |
| `isError` | Error state, no partial card rendering | FR-008 |
| `squads.length === 0` (loaded, no error) | Empty state ("no squads saved yet") | FR-007 |
| `squads.length > 0`, `filtered.length === 0` | "No results" state, distinct copy from the empty state above | US3 Acceptance Scenario 4 |
| `filtered.length > 0` | Grid of `SquadCard`, one per entry | FR-005 |

## `SquadCard` component contract

`app/(private)/dashboard/_components/SquadCard.tsx`

### Props

```ts
interface SquadCardProps {
  data: SquadCardData
}
```

Pure presentational component — receives fully precomputed data, performs no calculation itself
(per `research.md` §2). Renders: `data.displayName`, member avatars/count (`data.squad.members`),
`data.totalCost`, `data.avgSeniority` (localized label, reusing the same label map already defined
for `MetricsPanel`), and `data.skillCoverage.length`.

### Explicit non-goals

- No click-to-expand, no edit/delete affordance (FR-012) — a card is a static, read-only summary.
