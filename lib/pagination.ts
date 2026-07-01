export interface PaginationResult<T> {
  pageItems: T[]
  currentPage: number
  totalPages: number
}

export function paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * pageSize
  const pageItems = items.slice(start, start + pageSize)

  return { pageItems, currentPage, totalPages }
}
