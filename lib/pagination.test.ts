import { paginate } from './pagination'

describe('paginate', () => {
  it('returns totalPages 1 and empty pageItems for empty input', () => {
    const result = paginate([], 1, 12)
    expect(result).toEqual({ pageItems: [], currentPage: 1, totalPages: 1 })
  })

  it('returns a single page when items fit within pageSize', () => {
    const items = [1, 2, 3]
    const result = paginate(items, 1, 12)
    expect(result.totalPages).toBe(1)
    expect(result.currentPage).toBe(1)
    expect(result.pageItems).toEqual([1, 2, 3])
  })

  it('slices the correct items for a middle page', () => {
    const items = Array.from({ length: 30 }, (_, i) => i + 1)
    const result = paginate(items, 2, 12)
    expect(result.totalPages).toBe(3)
    expect(result.currentPage).toBe(2)
    expect(result.pageItems).toEqual(Array.from({ length: 12 }, (_, i) => i + 13))
  })

  it('clamps a page number beyond the valid range to the last page', () => {
    const items = Array.from({ length: 20 }, (_, i) => i + 1)
    const result = paginate(items, 5, 12)
    expect(result.totalPages).toBe(2)
    expect(result.currentPage).toBe(2)
    expect(result.pageItems).toEqual(Array.from({ length: 8 }, (_, i) => i + 13))
  })

  it('clamps a page number below 1 up to 1', () => {
    const items = Array.from({ length: 20 }, (_, i) => i + 1)
    const result = paginate(items, 0, 12)
    expect(result.currentPage).toBe(1)
    expect(result.pageItems).toEqual(Array.from({ length: 12 }, (_, i) => i + 1))
  })

  it('produces no empty trailing page on an exact page-boundary count', () => {
    const items = Array.from({ length: 24 }, (_, i) => i + 1)
    const result = paginate(items, 1, 12)
    expect(result.totalPages).toBe(2)

    const lastPage = paginate(items, 2, 12)
    expect(lastPage.pageItems).toHaveLength(12)
  })
})
