'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSquad } from '@/hooks/useSquad'
import { type SquadCardData, SENIORITY_LABELS } from '@/lib/types'
import { formatCurrency } from '@/lib/squad/squads'
import ConfirmDialog from './ConfirmDialog'
import SquadMemberCard from './SquadMemberCard'

interface SquadDetailPanelProps {
  data: SquadCardData | null
  onClose: () => void
}

export default function SquadDetailPanel({ data, onClose }: SquadDetailPanelProps) {
  const router = useRouter()
  const { editingSquadId, isDirty } = useSquad()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  function proceedToEdit() {
    if (!data) return
    router.push(`/dashboard/${data.squad.id}`)
  }

  function handleEdit() {
    if (!data) return
    const isSameSquad = editingSquadId === data.squad.id
    if (isDirty && !isSameSquad) {
      setIsConfirmOpen(true)
      return
    }
    proceedToEdit()
  }

  if (!data) {
    return (
      <aside className="flex flex-col items-center justify-center border-t-2 border-ink-200 bg-ink-25 p-8 text-center lg:sticky lg:top-8 lg:self-start">
        <p className="text-sm text-ink-500">Selecione um squad para ver detalhes.</p>
      </aside>
    )
  }

  const { squad, displayName, totalCost, avgSeniority, skillCoverage } = data

  return (
    <aside className="flex flex-col bg-graphite-700 text-graphite-50 lg:sticky lg:top-8 lg:self-start">
      <div className="flex items-start justify-between px-5 pb-4 pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust-400">
            Squad
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-graphite-50">
            {displayName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="rounded-full p-1 text-graphite-400 hover:bg-graphite-800 hover:text-graphite-50 focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2 focus:ring-offset-graphite-700"
        >
          ×
        </button>
      </div>

      <div className="space-y-5 px-5 pb-5">
        <div className="flex items-baseline divide-x divide-graphite-600 border-y border-graphite-600 py-4">
          <div className="flex-1 pr-3">
            <p className="font-display text-2xl font-semibold tabular-nums text-graphite-50">{formatCurrency(totalCost)}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-graphite-400">Custo/hr</p>
          </div>
          <div className="flex-1 px-3">
            <p className="font-display text-2xl font-semibold text-graphite-50">
              {avgSeniority ? SENIORITY_LABELS[avgSeniority] : '—'}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-graphite-400">Seniority</p>
          </div>
          <div className="flex-1 pl-3">
            <p className="font-display text-2xl font-semibold tabular-nums text-graphite-50">{skillCoverage.length}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-graphite-400">Skills</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Skills</h3>
          <p className="mt-2 text-xs leading-relaxed text-graphite-200">
            {skillCoverage.join(' · ')}
          </p>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-graphite-400">
            Membros ({squad.members.length})
          </h3>
          <ul role="list" className="mt-1 divide-y divide-graphite-600">
            {squad.members.map((member) => (
              <li key={member.id} role="listitem">
                <SquadMemberCard member={member} />
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={handleEdit}
          className="w-full rounded-full bg-rust-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rust-400 focus:outline-none focus:ring-2 focus:ring-rust-400 focus:ring-offset-2 focus:ring-offset-graphite-700"
        >
          Editar
        </button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Substituir squad atual?"
        message="Você tem membros não salvos no squad atual. Deseja substituí-los pelos membros deste squad?"
        confirmLabel="Substituir"
        onConfirm={() => {
          setIsConfirmOpen(false)
          proceedToEdit()
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </aside>
  )
}
