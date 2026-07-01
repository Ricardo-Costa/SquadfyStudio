'use client'

import { useState } from 'react'
import { useSquad } from '@/hooks/useSquad'
import ConfirmDialog from './ConfirmDialog'

export default function NewSquadButton() {
  const { count, resetSquad } = useSquad()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  if (count === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Novo Squad
      </button>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Começar um novo squad?"
        message="Isso vai limpar o squad atual do builder. Squads já salvos não são afetados."
        confirmLabel="Começar novo"
        onConfirm={() => {
          setIsConfirmOpen(false)
          resetSquad()
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  )
}
