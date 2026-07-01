'use client'

import { useEffect } from 'react'
import { useSquad } from '@/hooks/useSquad'

/**
 * Mounted only on the plain /dashboard route (never on /dashboard/<squad-id>).
 * No intentional flow ever redirects here while meaning to keep a squad
 * association alive — that always goes to /dashboard/<id> (editing) or
 * /dashboard/squads (after a save). If editingSquadId is still set when this
 * route mounts, it's stale (e.g. left over from browsing away from an edit
 * session via a plain nav click) and gets cleared — members are left as-is,
 * so an in-progress from-scratch build is never discarded.
 */
export default function ClearSquadAssociation() {
  const { editingSquadId, clearEditAssociation } = useSquad()

  useEffect(() => {
    if (editingSquadId !== null) {
      clearEditAssociation()
    }
    // Runs once on mount only — must not react to editingSquadId changing
    // afterward (e.g. a save's own loadSquad() call), or it would fight that
    // exact same class of bug already fixed in SquadEditLoader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
