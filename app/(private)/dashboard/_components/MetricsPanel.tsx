'use client'

import { useMemo } from 'react'
import { useSquad } from '@/hooks/useSquad'
import { calcTotalCost, calcAvgSeniority, calcSkillCoverage } from '@/lib/metrics'

const SENIORITY_LABEL = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
}

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
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Métricas do Squad</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-xs text-gray-500">Custo/hr</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">${metrics.totalCost}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-xs text-gray-500">Seniority</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">
            {metrics.avgSeniority ? SENIORITY_LABEL[metrics.avgSeniority] : '—'}
          </p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-xs text-gray-500">Skills</p>
          <p className="mt-0.5 text-sm font-bold text-gray-900">{metrics.skillCoverage.length}</p>
        </div>
      </div>
    </div>
  )
}
