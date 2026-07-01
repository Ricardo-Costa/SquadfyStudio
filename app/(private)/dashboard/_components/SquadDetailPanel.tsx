'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSquad } from '@/hooks/useSquad'
import type { SquadCardData } from '@/lib/types'
import ConfirmDialog from './ConfirmDialog'
import SquadMemberCard from './SquadMemberCard'

const SENIORITY_LABELS = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
}

interface SquadDetailPanelProps {
  data: SquadCardData | null
  onClose: () => void
}

export default function SquadDetailPanel({ data, onClose }: SquadDetailPanelProps) {
  const router = useRouter()
  const { count, editingSquadId, loadSquad } = useSquad()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  function proceedToEdit() {
    if (!data) return
    loadSquad(data.squad.id, data.displayName, data.squad.members)
    router.push('/dashboard')
  }

  function handleEdit() {
    if (!data) return
    const isSameSquad = editingSquadId === data.squad.id
    if (count > 0 && !isSameSquad) {
      setIsConfirmOpen(true)
      return
    }
    proceedToEdit()
  }

  if (!data) {
    return (
      <aside className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm lg:sticky lg:top-8 lg:self-start">
        <p className="text-sm text-gray-500">Selecione um squad para ver detalhes.</p>
      </aside>
    )
  }

  const { squad, displayName, totalCost, avgSeniority, skillCoverage } = data

  return (
    <aside className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-8 lg:self-start">
      <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="font-semibold text-gray-900">{displayName}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="text-xs text-gray-500">Custo/hr</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">${totalCost}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="text-xs text-gray-500">Seniority</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {avgSeniority ? SENIORITY_LABELS[avgSeniority] : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-2 text-center">
            <p className="text-xs text-gray-500">Skills</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">{skillCoverage.length}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Skills</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {skillCoverage.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Membros ({squad.members.length})
          </h3>
          <ul role="list" className="mt-2 space-y-2">
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
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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
