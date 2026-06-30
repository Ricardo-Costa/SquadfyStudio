'use client'

import { useMemo, useState } from 'react'
import { useDevelopers } from '@/hooks/useDevelopers'
import type { FilterState, Seniority } from '@/lib/types'
import CatalogueGrid from './CatalogueGrid'
import FilterBar from './FilterBar'

export default function CatalogueView() {
  const { data: developers = [], isLoading, isError, refetch } = useDevelopers()

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
        developers={filteredDevelopers}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
      />
    </div>
  )
}
