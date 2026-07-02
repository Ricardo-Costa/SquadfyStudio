'use client'

import { useMemo } from 'react'
import { useSquad } from '@/hooks/useSquad'
import { calcTotalCost, calcAvgSeniority, calcSkillCoverage } from '@/lib/squad/metrics'
import { formatCurrency } from '@/lib/squad/squads'
import { SENIORITY_LABELS } from '@/lib/types'

export default function MetricsPanel() {
  const { members } = useSquad()

  const metrics = useMemo(
    () => ({
      totalCost: calcTotalCost(members),
      avgSeniority: calcAvgSeniority(members),
      skillCoverage: calcSkillCoverage(members),
    }),
    [members]
  )

  return (
    <div className="flex items-baseline divide-x divide-graphite-600 border-t border-graphite-600 pt-4">
      <div className="flex-1 pr-3">
        <p className="font-display text-2xl font-semibold tabular-nums text-graphite-50">{formatCurrency(metrics.totalCost)}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-graphite-400">Custo/hr</p>
      </div>
      <div className="flex-1 px-3">
        <p className="font-display text-2xl font-semibold text-graphite-50">
          {metrics.avgSeniority ? SENIORITY_LABELS[metrics.avgSeniority] : '—'}
        </p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-graphite-400">Senioridade</p>
      </div>
      <div className="flex-1 pl-3">
        <p className="font-display text-2xl font-semibold tabular-nums text-graphite-50">{metrics.skillCoverage.length}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-wide text-graphite-400">Habilidades</p>
      </div>
    </div>
  )
}
