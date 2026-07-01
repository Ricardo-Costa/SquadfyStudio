import { useState } from 'react'
import { paginate } from '@/lib/squad/pagination'

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)
  const [prevItems, setPrevItems] = useState(items)

  if (items !== prevItems) {
    setPrevItems(items)
    setPage(1)
  }

  const { pageItems, currentPage, totalPages } = paginate(
    items,
    items !== prevItems ? 1 : page,
    pageSize
  )

  return {
    pageItems,
    currentPage,
    totalPages,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages,
    goToPrevious: () => setPage((p) => Math.max(1, p - 1)),
    goToNext: () => setPage((p) => Math.min(totalPages, p + 1)),
  }
}
