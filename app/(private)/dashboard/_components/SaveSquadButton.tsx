'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useSquad } from '@/hooks/useSquad'
import { saveSquad } from '@/app/(private)/dashboard/actions'
import SaveSquadModal from './SaveSquadModal'

type SaveState = 'idle' | 'loading' | 'error'

export default function SaveSquadButton() {
  const { members, editingSquadId, editingSquadName, loadSquad } = useSquad()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleOpenModal() {
    if (members.length === 0 || saveState === 'loading') return
    setIsModalOpen(true)
  }

  async function handleConfirm(name: string) {
    setIsModalOpen(false)
    setSaveState('loading')
    try {
      const saved = await saveSquad(name, members, editingSquadId ?? undefined)
      queryClient.invalidateQueries({ queryKey: ['squads'] })
      // Associate the builder with the squad it just became (create or edit),
      // so re-opening "Editar" on this exact squad later doesn't falsely warn
      // about "unsaved" members (editingSquadId would otherwise never reflect
      // a freshly created squad).
      loadSquad(saved.id, saved.name ?? name, members)
      router.push('/dashboard/squads')
    } catch {
      setSaveState('error')
      timerRef.current = setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const isEmpty = members.length === 0
  const isDisabled = isEmpty || saveState === 'loading'

  let label = 'Salvar Squad'
  let colorClass = isEmpty
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : 'bg-blue-600 text-white hover:bg-blue-700'

  if (saveState === 'loading') {
    label = 'Salvando...'
    colorClass = 'bg-blue-400 text-white cursor-not-allowed'
  } else if (saveState === 'error') {
    label = 'Erro ao salvar'
    colorClass = 'bg-red-600 text-white hover:bg-red-700'
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        disabled={isDisabled}
        className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${colorClass}`}
      >
        {label}
      </button>
      <SaveSquadModal
        isOpen={isModalOpen}
        onConfirm={handleConfirm}
        onCancel={() => setIsModalOpen(false)}
        initialName={editingSquadName ?? undefined}
      />
    </>
  )
}
