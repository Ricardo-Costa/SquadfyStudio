'use client'

import { useEffect } from 'react'
import { useSquad } from '@/hooks/useSquad'

/**
 * Mounted only on the plain /dashboard route (never on /dashboard/<squad-id>).
 * No intentional flow ever redirects here while meaning to keep a squad
 * association alive — that always goes to /dashboard/<id> (editing) or
 * /dashboard/squads (after a save). A non-null editingSquadId here means the
 * builder is showing a saved squad's members (loaded via edit, or just saved
 * via SaveSquadButton's post-save loadSquad() call), not an in-progress
 * from-scratch draft — those always have editingSquadId === null. So a full
 * reset (members included) is safe: it only ever discards a squad that's
 * already persisted, never unsaved work.
 */
export default function ClearSquadAssociation() {
  const { editingSquadId, resetSquad } = useSquad()

  useEffect(() => {
    if (editingSquadId !== null) {
      resetSquad()
    }
    // Runs once on mount only — must not react to editingSquadId changing
    // afterward (e.g. a save's own loadSquad() call), or it would fight that
    // exact same class of bug already fixed in SquadEditLoader.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
