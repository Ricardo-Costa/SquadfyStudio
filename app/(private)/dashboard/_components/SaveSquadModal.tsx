'use client'

import { useEffect, useRef, useState } from 'react'

interface SaveSquadModalProps {
  isOpen: boolean
  onConfirm: (name: string) => void
  onCancel: () => void
}

export default function SaveSquadModal({ isOpen, onConfirm, onCancel }: SaveSquadModalProps) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName('')
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const trimmed = name.trim()
  const isInvalid = trimmed === ''

  function handleConfirm() {
    if (isInvalid) return
    onConfirm(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Nomear squad"
        className="relative w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
      >
        <h2 className="text-base font-semibold text-gray-900">Nomear squad</h2>
        <p className="mt-1 text-sm text-gray-500">
          Dê um nome para encontrar este squad depois.
        </p>

        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm()
          }}
          placeholder="Ex: Squad Alpha"
          aria-label="Nome do squad"
          className="mt-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {isInvalid && (
          <p className="mt-1.5 text-xs text-red-600">O nome do squad é obrigatório.</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isInvalid}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isInvalid
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
