import type { Developer } from '@/lib/types'

export type SquadAction =
  | { type: 'ADD_MEMBER'; payload: Developer }
  | { type: 'REMOVE_MEMBER'; payload: string }
  | { type: 'LOAD_SQUAD'; payload: { id: number; name: string; members: Developer[] } }
  | { type: 'RESET_SQUAD' }
  | { type: 'CLEAR_EDIT_ASSOCIATION' }
