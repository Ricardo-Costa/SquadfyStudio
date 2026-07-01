# API Contract: Developer Catalogue

**Feature**: 002-developer-catalogue
**Server**: JSON Server (`npm run mock`) — `http://localhost:3001`
**Date**: 2026-06-30

---

## GET /developers

Returns the full list of developer profiles. No server-side filtering is used — filtering happens client-side via `useMemo` on cached React Query data.

### Request

```
GET http://localhost:3001/developers
```

No authentication headers required (JSON Server is a mock with no auth).

### Response

**200 OK**

```json
[
  {
    "id": "string",
    "name": "string",
    "avatar": "string (URL)",
    "seniority": "junior" | "mid" | "senior",
    "cost": number,
    "skills": ["string"]
  }
]
```

**Error (JSON Server unavailable)**

Network error / ECONNREFUSED → React Query sets `isError: true` → FR-004 error state with retry.

No HTTP error codes expected from the mock server for this endpoint.

---

## React Query Configuration

```typescript
// hooks/useDevelopers.ts

export function useDevelopers() {
  return useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: () =>
      fetch('http://localhost:3001/developers').then(res => {
        if (!res.ok) throw new Error('Failed to fetch developers')
        return res.json()
      }),
    staleTime: 5 * 60 * 1000,  // 5 minutes — see research.md Decision 7
    retry: 2,                   // retry twice before entering error state
  })
}
```

**Cache behaviour**:
- First render: fetch fires, `isLoading: true` → skeleton cards shown
- Subsequent navigations (within 5min): data served from cache, `isLoading: false` immediately
- After error: `isError: true`, `refetch` function exposed for retry button

---

## Future contracts (out of scope for 002)

- `POST /squads` — feature 004-metrics-and-persistence (Save Squad Server Action)
