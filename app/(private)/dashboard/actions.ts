'use server'

import type { Developer, SavedSquad } from '@/lib/types'

export async function saveSquad(name: string, members: Developer[]): Promise<SavedSquad> {
  if (!name.trim()) throw new Error('Squad name is required')
  if (members.length === 0) throw new Error('Cannot save empty squad')
  const res = await fetch('http://localhost:3001/squads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, savedAt: new Date().toISOString(), members }),
  })
  if (!res.ok) throw new Error('Failed to save squad')
  return res.json() as Promise<SavedSquad>
}
