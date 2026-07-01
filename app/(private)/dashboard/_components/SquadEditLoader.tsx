'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSquads } from '@/hooks/useSquads'
import { useSquad } from '@/hooks/useSquad'
import { formatSquadName } from '@/lib/squads'
import ConfirmDialog from './ConfirmDialog'

interface SquadEditLoaderProps {
  squadId: number
}

export default function SquadEditLoader({ squadId }: SquadEditLoaderProps) {
  const { data: squads } = useSquads()
  const { editingSquadId, loadSquad } = useSquad()
  const router = useRouter()
  const [notFound, setNotFound] = useState(false)

  // Read via a ref (not a dependency) so this effect only fires once per
  // squads-arriving/squadId-changing event — it must NOT re-fire just
  // because editingSquadId itself changed afterward (e.g. a deliberate
  // "Novo Squad" reset, or emptying the builder). Otherwise this loader
  // would "fight" those actions by immediately reloading the same squad.
  const editingSquadIdRef = useRef(editingSquadId)
  useEffect(() => {
    editingSquadIdRef.current = editingSquadId
  }, [editingSquadId])

  useEffect(() => {
    if (!squads || editingSquadIdRef.current === squadId) return
    const squad = squads.find((s) => s.id === squadId)
    if (!squad) {
      setNotFound(true)
      return
    }
    loadSquad(squad.id, formatSquadName(squad), squad.members)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squads, squadId])

  return (
    <ConfirmDialog
      isOpen={notFound}
      title="Squad não encontrado"
      message="Este squad não existe mais ou não foi encontrado."
      confirmLabel="Ver squads"
      cancelLabel="Ir para o Catálogo"
      onConfirm={() => {
        setNotFound(false)
        router.push('/dashboard/squads')
      }}
      onCancel={() => {
        setNotFound(false)
        router.push('/dashboard')
      }}
    />
  )
}
