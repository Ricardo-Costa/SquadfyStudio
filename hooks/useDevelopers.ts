import { useQuery } from '@tanstack/react-query'
import type { Developer } from '@/lib/types'

async function fetchDevelopers(): Promise<Developer[]> {
  const res = await fetch('http://localhost:3001/developers')
  if (!res.ok) throw new Error('Failed to fetch developers')
  return res.json()
}

export function useDevelopers() {
  return useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: fetchDevelopers,
  })
}
