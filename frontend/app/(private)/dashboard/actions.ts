'use server'

import type { Developer, SavedSquad } from '@/lib/types'
import { SERVER_API_BASE_URL, SQUAD_NAME_MIN_LENGTH, SQUAD_NAME_MAX_LENGTH } from '@/lib/config'
import { containsDangerousContent, exceedsMaxLength, isBelowMinLength } from '@/lib/validation'

export async function saveSquad(
  name: string,
  members: Developer[],
  id?: number
): Promise<SavedSquad> {
  const trimmedName = name.trim()
  if (isBelowMinLength(trimmedName, SQUAD_NAME_MIN_LENGTH)) {
    throw new Error(`Squad name must be at least ${SQUAD_NAME_MIN_LENGTH} characters`)
  }
  if (exceedsMaxLength(trimmedName, SQUAD_NAME_MAX_LENGTH)) {
    throw new Error(`Squad name must be at most ${SQUAD_NAME_MAX_LENGTH} characters`)
  }
  if (containsDangerousContent(trimmedName)) {
    throw new Error('Squad name contains invalid characters')
  }
  if (members.length === 0) throw new Error('Cannot save empty squad')

  const url = id ? `${SERVER_API_BASE_URL}/squads/${id}` : `${SERVER_API_BASE_URL}/squads`
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

export async function deleteSquad(id: number): Promise<void> {
  const res = await fetch(`${SERVER_API_BASE_URL}/squads/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Failed to delete squad: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`)
  }
}
