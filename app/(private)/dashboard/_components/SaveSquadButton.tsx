'use client'

import { useState, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSquad } from '@/hooks/useSquad'
import { saveSquad } from '@/app/(private)/dashboard/actions'
import SaveSquadModal from './SaveSquadModal'

type SaveState = 'idle' | 'loading' | 'success' | 'error'

export default function SaveSquadButton() {
  const { members, editingSquadId, editingSquadName } = useSquad()
  const queryClient = useQueryClient()
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (saveState === 'success') {
      if (timerRef.current) clearTimeout(timerRef.current)
      setSaveState('idle')
    }
  }, [members]) // eslint-disable-line react-hooks/exhaustive-deps

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
      await saveSquad(name, members, editingSquadId ?? undefined)
      queryClient.invalidateQueries({ queryKey: ['squads'] })
      setSaveState('success')
      timerRef.current = setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
      timerRef.current = setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  const isEmpty = members.length === 0
  const isDisabled = isEmpty || saveState === 'loading' || saveState === 'success'

  let label = 'Salvar Squad'
  let colorClass = isEmpty
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : 'bg-blue-600 text-white hover:bg-blue-700'

  if (saveState === 'loading') {
    label = 'Salvando...'
    colorClass = 'bg-blue-400 text-white cursor-not-allowed'
  } else if (saveState === 'success') {
    label = 'Salvo ✓'
    colorClass = 'bg-green-600 text-white cursor-not-allowed'
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
