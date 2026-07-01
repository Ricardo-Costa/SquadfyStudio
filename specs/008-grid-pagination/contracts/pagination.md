# Contract: `lib/pagination.ts` + `usePagination` + `PaginationControls`

## `lib/pagination.ts`

```ts
export interface PaginationResult<T> {
  pageItems: T[]
  currentPage: number
  totalPages: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T>
```

| Input | Behavior |
|---|---|
| `items = []` | `totalPages = 1`, `currentPage = 1`, `pageItems = []` |
| `page` beyond the valid range (e.g. `items` shrank since it was set) | Clamped into `[1, totalPages]` before slicing — never returns an out-of-range slice |
| `page` below `1` | Clamped to `1` |
| Normal case | `pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize)` |

Pure function — no side effects, no React dependency. Covered by `lib/pagination.test.ts`
(mirrors the test-case style already used in `lib/metrics.test.ts`): empty input, single page,
multiple pages, page-out-of-range clamping, exact page-boundary counts.

## `hooks/usePagination.ts`

```ts
export function usePagination<T>(items: T[], pageSize: number): {
  pageItems: T[]
  currentPage: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  goToPrevious: () => void
  goToNext: () => void
}
```

| Behavior | Requirement |
|---|---|
| First render | `currentPage = 1` |
| `items` reference changes (filter or data change) | `currentPage` resets to `1` synchronously, same render (`research.md` §1) — never a stale page flash | FR-004 |
| `goToNext()` called on the last page | No-op (already clamped) | FR-005 |
| `goToPrevious()` called on the first page | No-op (already clamped) | FR-005 |
| `hasPrevious` / `hasNext` | `currentPage > 1` / `currentPage < totalPages` — drives `PaginationControls`' disabled state | FR-005 |

## `PaginationControls` component contract

`app/(private)/dashboard/_components/PaginationControls.tsx`

### Props

```ts
interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  onPrevious: () => void
  onNext: () => void
}
```

### Behavior

| Condition | Rendered output |
|---|---|
| `totalPages <= 1` | Renders `null` (FR-006 — nothing to page through) |
| `totalPages > 1` | "Previous" button (disabled when `!hasPrevious`), "Page {currentPage} of {totalPages}" text, "Next" button (disabled when `!hasNext`) |

### Explicit non-goals

- No numbered page-link list, no jump-to-page input, no "items per page" selector (per spec Assumptions).
