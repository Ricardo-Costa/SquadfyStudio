import type { Developer } from '@/lib/types'
import type { SquadAction } from './actions'

export const MAX_SQUAD_SIZE = 5

export interface SquadState {
  members: Developer[]
}

export const initialSquadState: SquadState = {
  members: [],
}

export function squadReducer(state: SquadState, action: SquadAction): SquadState {
  switch (action.type) {
    case 'ADD_MEMBER': {
      if (
        state.members.length >= MAX_SQUAD_SIZE ||
        state.members.some((m) => m.id === action.payload.id)
      ) {
        return state
      }
      return { members: [...state.members, action.payload] }
    }
    case 'REMOVE_MEMBER':
      return {
        members: state.members.filter((m) => m.id !== action.payload),
      }
    default:
      return state
  }
}
