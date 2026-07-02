'use client'

import { useEffect, useRef, useState } from 'react'
import { SQUAD_NAME_MIN_LENGTH, SQUAD_NAME_MAX_LENGTH } from '@/lib/config'
import { containsDangerousContent, exceedsMaxLength, isBelowMinLength } from '@/lib/validation'

interface SaveSquadModalProps {
  isOpen: boolean
  onConfirm: (name: string) => void
  onCancel: () => void
  initialName?: string
}

export default function SaveSquadModal({
  isOpen,
  onConfirm,
  onCancel,
  initialName,
}: SaveSquadModalProps) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(initialName ?? '')
      inputRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  const isTooShort = isBelowMinLength(trimmed, SQUAD_NAME_MIN_LENGTH)
  const isTooLong = exceedsMaxLength(trimmed, SQUAD_NAME_MAX_LENGTH)
  const hasDangerousContent = containsDangerousContent(trimmed)
  const isInvalid = isTooShort || isTooLong || hasDangerousContent

  let errorMessage = ''
  if (isTooShort) {
    errorMessage = `O nome deve ter pelo menos ${SQUAD_NAME_MIN_LENGTH} caracteres.`
  } else if (isTooLong) {
    errorMessage = `O nome deve ter no máximo ${SQUAD_NAME_MAX_LENGTH} caracteres.`
  } else if (hasDangerousContent) {
    errorMessage = 'O nome contém caracteres não permitidos.'
  }

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
        className="relative w-full max-w-sm rounded-2xl bg-ink-25 p-6 shadow-xl"
      >
        <h2 className="font-display text-xl font-semibold text-ink-900">Nomear squad</h2>
        <p className="mt-1 text-sm text-ink-500">
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
          maxLength={SQUAD_NAME_MAX_LENGTH}
          placeholder="Ex: Squad Alpha"
          aria-label="Nome do squad"
          className="mt-4 w-full border-b border-ink-300 bg-transparent px-1 py-2 text-sm text-ink-900 placeholder-ink-400 focus:border-rust-500 focus:outline-none focus:ring-1 focus:ring-rust-400"
        />
        {isInvalid && (
          <p className="mt-1.5 text-xs text-red-600">{errorMessage}</p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-600 hover:bg-ink-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isInvalid}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              isInvalid
                ? 'bg-ink-100 text-ink-400 cursor-not-allowed'
                : 'bg-rust-500 text-white hover:bg-rust-400'
            }`}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
