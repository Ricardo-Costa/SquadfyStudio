'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useSquad } from '@/hooks/useSquad'
import { type SquadCardData, SENIORITY_LABELS } from '@/lib/types'
import { formatCurrency } from '@/lib/squad/squads'
import { SAVE_ERROR_RESET_MS } from '@/lib/config'
import { deleteSquad } from '../actions'
import ConfirmDialog from './ConfirmDialog'
import SquadMemberCard from './SquadMemberCard'

interface SquadDetailPanelProps {
  data: SquadCardData | null
  onClose: () => void
}

type DeleteState = 'idle' | 'loading' | 'error'

export default function SquadDetailPanel({ data, onClose }: SquadDetailPanelProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { editingSquadId, isDirty, resetSquad } = useSquad()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteState, setDeleteState] = useState<DeleteState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

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

  async function handleDeleteConfirm() {
    if (!data) return
    setDeleteState('loading')
    try {
      await deleteSquad(data.squad.id)
      queryClient.invalidateQueries({ queryKey: ['squads'] })
      setIsDeleteConfirmOpen(false)
      // Only the builder's association with THIS squad should clear — deleting
      // a different squad than the one currently loaded must leave the builder
      // untouched (FR-008).
      if (editingSquadId === data.squad.id) resetSquad()
      onClose()
    } catch {
      setIsDeleteConfirmOpen(false)
      setDeleteState('error')
      timerRef.current = setTimeout(() => setDeleteState('idle'), SAVE_ERROR_RESET_MS)
    }
  }

  if (!data) {
    return (
      <aside className="flex flex-col items-center justify-center border-t-2 border-ink-200 bg-ink-25 p-8 text-center lg:sticky lg:top-8 lg:self-start">
        <p className="text-sm text-ink-500">Selecione um squad para ver detalhes.</p>
      </aside>
    )
  }

  const { squad, displayName, totalCost, avgSeniority, skillCoverage } = data

  let deleteLabel = 'Excluir'
  let deleteColorClass = 'border border-red-400/60 text-red-400 hover:bg-red-500/10 hover:text-red-300'
  if (deleteState === 'loading') {
    deleteLabel = 'Excluindo…'
    deleteColorClass = 'border border-graphite-600 text-graphite-500 cursor-not-allowed'
  } else if (deleteState === 'error') {
    deleteLabel = 'Erro ao excluir'
    deleteColorClass = 'border border-red-500 bg-red-700/20 text-red-300'
  }

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
          <div className="min-w-0 flex-1 pr-3">
            <p className="font-display text-2xl font-semibold tabular-nums text-graphite-50">{formatCurrency(totalCost)}</p>
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-normal text-graphite-400">Custo/hr</p>
          </div>
          <div className="min-w-0 flex-1 px-3">
            <p className="font-display text-2xl font-semibold text-graphite-50">
              {avgSeniority ? SENIORITY_LABELS[avgSeniority] : '—'}
            </p>
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-normal text-graphite-400">Senioridade</p>
          </div>
          <div className="min-w-0 flex-1 pl-3">
            <p className="font-display text-2xl font-semibold tabular-nums text-graphite-50">{skillCoverage.length}</p>
            <p className="mt-0.5 truncate text-[11px] uppercase tracking-normal text-graphite-400">Habilidades</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-graphite-400">Habilidades</h3>
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

        <button
          type="button"
          onClick={() => {
            if (deleteState !== 'loading') setIsDeleteConfirmOpen(true)
          }}
          disabled={deleteState === 'loading'}
          className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-graphite-700 ${deleteColorClass}`}
        >
          {deleteLabel}
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

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        title="Excluir squad?"
        message="Esta ação não pode ser desfeita. O squad será excluído permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </aside>
  )
}
