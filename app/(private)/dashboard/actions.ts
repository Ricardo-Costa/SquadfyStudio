'use server'

import type { Developer, SavedSquad } from '@/lib/types'
import { API_BASE_URL } from '@/lib/config'

export async function saveSquad(
  name: string,
  members: Developer[],
  id?: number
): Promise<SavedSquad> {
  if (!name.trim()) throw new Error('Squad name is required')
  if (members.length === 0) throw new Error('Cannot save empty squad')

  const url = id ? `${API_BASE_URL}/squads/${id}` : `${API_BASE_URL}/squads`
  const method = id ? 'PUT' : 'POST'

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, savedAt: new Date().toISOString(), members }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to save squad: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`)
  }
  return res.json() as Promise<SavedSquad>
}
