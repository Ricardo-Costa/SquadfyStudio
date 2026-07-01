'use client'

import { useMemo, useState } from 'react'
import { useDevelopers } from '@/hooks/useDevelopers'
import { useSquad } from '@/hooks/useSquad'
import { usePagination } from '@/hooks/usePagination'
import { PAGE_SIZE } from '@/lib/config'
import type { Developer, FilterState, Seniority } from '@/lib/types'
import CatalogueGrid from './CatalogueGrid'
import FilterBar from './FilterBar'
import PaginationControls from './PaginationControls'

// Stable reference: `data: developers = []` would create a brand-new empty
// array on every render while `data` is undefined (loading), which cascades
// through the useMemo chain into usePagination's reset-on-reference-change
// logic and triggers an infinite render loop.
const EMPTY_DEVELOPERS: Developer[] = []

export default function CatalogueView() {
  const { data: developers = EMPTY_DEVELOPERS, isLoading, isError, refetch } = useDevelopers()
  const { isFull, isMember, addMember } = useSquad()

  const [filterState, setFilterState] = useState<FilterState>({
    name: '',
    seniorities: [],
  })

  const filteredDevelopers = useMemo(
    () =>
      developers.filter((dev) => {
        const nameMatch = dev.name
          .toLowerCase()
          .includes(filterState.name.toLowerCase())

        const seniorityMatch =
          filterState.seniorities.length === 0 ||
          filterState.seniorities.includes(dev.seniority)

        return nameMatch && seniorityMatch
      }),
    [developers, filterState]
  )

  const {
    pageItems,
    currentPage,
    totalPages,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  } = usePagination(filteredDevelopers, PAGE_SIZE)

  function handleNameChange(name: string) {
    setFilterState((s) => ({ ...s, name }))
  }

  function handleSeniorityToggle(level: Seniority) {
    setFilterState((s) => ({
      ...s,
      seniorities: s.seniorities.includes(level)
        ? s.seniorities.filter((x) => x !== level)
        : [...s.seniorities, level],
    }))
  }

  return (
    <div className="space-y-6">
      <FilterBar
        name={filterState.name}
        onNameChange={handleNameChange}
        seniorities={filterState.seniorities}
        onSeniorityToggle={handleSeniorityToggle}
      />
      <CatalogueGrid
        developers={pageItems}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        isMember={isMember}
        isFull={isFull}
        onAdd={addMember}
      />
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        onPrevious={goToPrevious}
        onNext={goToNext}
      />
    </div>
  )
}
