'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSquad } from '@/hooks/useSquad'
import ConfirmDialog from './ConfirmDialog'

export default function NewSquadButton() {
  const { count, resetSquad } = useSquad()
  const router = useRouter()
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  if (count === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirmOpen(true)}
        className="rounded-full border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:border-rust-400 hover:text-rust-600"
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
          // Leaving any /dashboard/<squad-id> edit route is required here:
          // staying on it would let that route's SquadEditLoader see
          // editingSquadId reset to null (≠ the URL's squadId) and reload
          // the same squad right back into the builder, undoing the reset.
          router.push('/dashboard')
        }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  )
}
