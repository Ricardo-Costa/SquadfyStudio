'use client'

import { useState, useEffect, useRef } from 'react'
import { useSquad } from '@/hooks/useSquad'
import { saveSquad } from '@/app/(private)/dashboard/actions'

type SaveState = 'idle' | 'loading' | 'success' | 'error'

export default function SaveSquadButton() {
  const { members } = useSquad()
  const [saveState, setSaveState] = useState<SaveState>('idle')
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

  async function handleSave() {
    if (members.length === 0 || saveState === 'loading') return
    setSaveState('loading')
    try {
      await saveSquad(members)
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
    <button
      type="button"
      onClick={handleSave}
      disabled={isDisabled}
      className={`w-full rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${colorClass}`}
    >
      {label}
    </button>
  )
}
