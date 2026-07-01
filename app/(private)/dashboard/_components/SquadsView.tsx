'use client'

import { useMemo, useState } from 'react'
import { useSquads } from '@/hooks/useSquads'
import { calcTotalCost, calcAvgSeniority, calcSkillCoverage } from '@/lib/metrics'
import { formatSquadName } from '@/lib/squads'
import type { FilterState, Seniority, SquadCardData } from '@/lib/types'
import FilterBar from './FilterBar'
import SquadCard from './SquadCard'

function SkeletonCard() {
  return (
    <div
      className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      aria-hidden="true"
    >
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
      <div className="mt-3 flex -space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-white bg-gray-200" />
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-white bg-gray-200" />
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-white bg-gray-200" />
      </div>
      <div className="mt-3 h-12 animate-pulse rounded-lg bg-gray-200" />
    </div>
  )
}

function SquadsGrid({
  isLoading,
  isError,
  onRetry,
  squadsExist,
  filtered,
}: {
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  squadsExist: boolean
  filtered: SquadCardData[]
}) {
  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-busy="true"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 text-center">
        <p className="text-base font-medium text-red-700">
          Não foi possível carregar os squads.
        </p>
        <p className="mt-1 text-sm text-red-500">Verifique se o servidor está disponível.</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!squadsExist) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
        <p className="text-base font-medium text-gray-700">Nenhum squad salvo ainda.</p>
        <p className="mt-1 text-sm text-gray-500">
          Monte um squad no Catálogo e clique em &quot;Salvar Squad&quot;.
        </p>
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
        <p className="text-base font-medium text-gray-700">Nenhum squad encontrado.</p>
        <p className="mt-1 text-sm text-gray-500">
          Tente limpar a busca ou os filtros de senioridade.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((data) => (
        <SquadCard key={data.squad.id} data={data} />
      ))}
    </div>
  )
}

export default function SquadsView() {
  const { data: squads = [], isLoading, isError, refetch } = useSquads()

  const [filterState, setFilterState] = useState<FilterState>({
    name: '',
    seniorities: [],
  })

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

  return (
    <div className="space-y-6">
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
        filtered={filtered}
      />
    </div>
  )
}
