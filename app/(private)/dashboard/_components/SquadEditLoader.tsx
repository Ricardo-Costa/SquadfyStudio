'use client'

import { useEffect } from 'react'
import { useSquads } from '@/hooks/useSquads'
import { useSquad } from '@/hooks/useSquad'
import { formatSquadName } from '@/lib/squads'

interface SquadEditLoaderProps {
  squadId: number
}

export default function SquadEditLoader({ squadId }: SquadEditLoaderProps) {
  const { data: squads } = useSquads()
  const { editingSquadId, loadSquad } = useSquad()

  useEffect(() => {
    if (!squads || editingSquadId === squadId) return
    const squad = squads.find((s) => s.id === squadId)
    if (!squad) return
    loadSquad(squad.id, formatSquadName(squad), squad.members)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [squads, squadId, editingSquadId])

  return null
}
