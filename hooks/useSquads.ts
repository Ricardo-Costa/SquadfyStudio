import { useQuery } from '@tanstack/react-query'
import type { SavedSquad } from '@/lib/types'

async function fetchSquads(): Promise<SavedSquad[]> {
  const res = await fetch('http://localhost:3001/squads')
  if (!res.ok) throw new Error('Failed to fetch squads')
  const squads: SavedSquad[] = await res.json()
  return [...squads].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  )
}

export function useSquads() {
  return useQuery<SavedSquad[]>({
    queryKey: ['squads'],
    queryFn: fetchSquads,
  })
}
