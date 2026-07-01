'use server'

import type { Developer, SavedSquad } from '@/lib/types'

export async function saveSquad(
  name: string,
  members: Developer[],
  id?: number
): Promise<SavedSquad> {
  if (!name.trim()) throw new Error('Squad name is required')
  if (members.length === 0) throw new Error('Cannot save empty squad')

  const url = id ? `http://localhost:3001/squads/${id}` : 'http://localhost:3001/squads'
  const method = id ? 'PUT' : 'POST'

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, savedAt: new Date().toISOString(), members }),
  })
  if (!res.ok) throw new Error('Failed to save squad')
  return res.json() as Promise<SavedSquad>
}
