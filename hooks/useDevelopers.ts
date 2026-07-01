import { useQuery } from '@tanstack/react-query'
import type { Developer } from '@/lib/types'
import { API_BASE_URL } from '@/lib/config'

async function fetchDevelopers(): Promise<Developer[]> {
  const res = await fetch(`${API_BASE_URL}/developers`)
  if (!res.ok) throw new Error('Failed to fetch developers')
  return res.json()
}

export function useDevelopers() {
  return useQuery<Developer[]>({
    queryKey: ['developers'],
    queryFn: fetchDevelopers,
  })
}
