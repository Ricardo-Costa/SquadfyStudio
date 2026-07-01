'use client'

import { useMemo, useState } from 'react'
import { useSquads } from '@/hooks/useSquads'
import { usePagination } from '@/hooks/usePagination'
import { calcTotalCost, calcAvgSeniority, calcSkillCoverage } from '@/lib/metrics'
import { formatSquadName } from '@/lib/squads'
import { PAGE_SIZE } from '@/lib/config'
import type { FilterState, Seniority, SquadCardData, SavedSquad } from '@/lib/types'
import FilterBar from './FilterBar'
import SquadCard from './SquadCard'
import SquadDetailPanel from './SquadDetailPanel'
import PaginationControls from './PaginationControls'

// Stable reference: `data: squads = []` would create a brand-new empty array
// on every render while `data` is undefined (loading), which cascades through
// the useMemo chain into usePagination's reset-on-reference-change logic and
// triggers an infinite render loop.
const EMPTY_SQUADS: SavedSquad[] = []

function SkeletonCard() {
  return (
    <div className="flex flex-col border-t-2 border-ink-200 bg-ink-25 p-4" aria-hidden="true">
      <div className="h-4 w-2/3 animate-pulse rounded bg-ink-200" />
      <div className="mt-3 flex -space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-ink-25 bg-ink-200" />
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-ink-25 bg-ink-200" />
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-ink-25 bg-ink-200" />
      </div>
      <div className="mt-4 h-10 animate-pulse rounded bg-ink-200" />
    </div>
  )
}

function SquadsGrid({
  isLoading,
  isError,
  onRetry,
  squadsExist,
  filtered,
  onSelect,
}: {
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  squadsExist: boolean
  filtered: SquadCardData[]
  onSelect: (id: number) => void
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center border-t border-ink-200 py-16 text-center">
        <p className="text-base font-medium text-rust-700">
          Não foi possível carregar os squads.
        </p>
        <p className="mt-1 text-sm text-ink-500">Verifique se o servidor está disponível.</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-full bg-rust-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rust-700 focus:outline-none focus:ring-2 focus:ring-rust-500 focus:ring-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!squadsExist) {
    return (
      <div className="flex flex-col items-center justify-center border-t border-ink-200 py-16 text-center">
        <p className="text-base font-medium text-ink-700">Nenhum squad salvo ainda.</p>
        <p className="mt-1 text-sm text-ink-500">
          Monte um squad no Catálogo e clique em &quot;Salvar Squad&quot;.
        </p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border-t border-ink-200 py-16 text-center">
        <p className="text-base font-medium text-ink-700">Nenhum squad encontrado.</p>
        <p className="mt-1 text-sm text-ink-500">
          Tente limpar a busca ou os filtros de senioridade.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((data) => (
        <SquadCard key={data.squad.id} data={data} onClick={() => onSelect(data.squad.id)} />
      ))}
    </div>
  )
}

export default function SquadsView() {
  const { data: squads = EMPTY_SQUADS, isLoading, isError, refetch } = useSquads()

  const [filterState, setFilterState] = useState<FilterState>({
    name: '',
    seniorities: [],
  })

  const [selectedSquadId, setSelectedSquadId] = useState<number | null>(null)

  const enriched = useMemo<SquadCardData[]>(
    () =>
      squads.map((squad) => ({
        squad,
        displayName: formatSquadName(squad),
        totalCost: calcTotalCost(squad.members),
        avgSeniority: calcAvgSeniority(squad.members),
        skillCoverage: calcSkillCoverage(squad.members),
      })),
    [squads]
  )

  const filtered = useMemo(
    () =>
      enriched.filter((data) => {
        const nameMatch = data.displayName
          .toLowerCase()
          .includes(filterState.name.toLowerCase())

        const seniorityMatch =
          filterState.seniorities.length === 0 ||
          (data.avgSeniority !== null && filterState.seniorities.includes(data.avgSeniority))

        return nameMatch && seniorityMatch
      }),
    [enriched, filterState]
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

  const selected = selectedSquadId
    ? (enriched.find((data) => data.squad.id === selectedSquadId) ?? null)
    : null

  const {
    pageItems,
    currentPage,
    totalPages,
    hasPrevious,
    hasNext,
    goToPrevious,
    goToNext,
  } = usePagination(filtered, PAGE_SIZE)

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
      <div className="order-2 space-y-6 lg:order-1">
        <FilterBar
          name={filterState.name}
          onNameChange={handleNameChange}
          seniorities={filterState.seniorities}
          onSeniorityToggle={handleSeniorityToggle}
          placeholder="Buscar squad..."
          ariaLabel="Search squads"
        />
        <SquadsGrid
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          squadsExist={enriched.length > 0}
          filtered={pageItems}
          onSelect={setSelectedSquadId}
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
      <div className="order-1 lg:order-2">
        <SquadDetailPanel data={selected} onClose={() => setSelectedSquadId(null)} />
      </div>
    </div>
  )
}
