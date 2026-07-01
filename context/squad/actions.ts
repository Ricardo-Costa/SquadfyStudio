import type { Developer } from '@/lib/types'

export type SquadAction =
  | { type: 'ADD_MEMBER'; payload: Developer }
  | { type: 'REMOVE_MEMBER'; payload: string }
