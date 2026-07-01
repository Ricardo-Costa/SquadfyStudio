'use server'

import type { Developer } from '@/lib/types'

export interface SavedSquad {
  id: number
  savedAt: string
  members: Developer[]
}

export async function saveSquad(members: Developer[]): Promise<SavedSquad> {
  if (members.length === 0) throw new Error('Cannot save empty squad')
  const res = await fetch('http://localhost:3001/squads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ savedAt: new Date().toISOString(), members }),
  })
  if (!res.ok) throw new Error('Failed to save squad')
  return res.json() as Promise<SavedSquad>
}
