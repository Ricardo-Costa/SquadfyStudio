import type { Developer } from '@/lib/types'
import type { SquadAction } from './actions'
import { MAX_SQUAD_SIZE } from '@/lib/config'

export interface SquadState {
  members: Developer[]
  editingSquadId: number | null
  editingSquadName: string | null
}

export const initialSquadState: SquadState = {
  members: [],
  editingSquadId: null,
  editingSquadName: null,
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
      return { ...state, members: [...state.members, action.payload] }
    }
    case 'REMOVE_MEMBER': {
      const members = state.members.filter((m) => m.id !== action.payload)
      if (members.length === 0) {
        return { members, editingSquadId: null, editingSquadName: null }
      }
      return { ...state, members }
    }
    case 'LOAD_SQUAD':
      return {
        members: action.payload.members,
        editingSquadId: action.payload.id,
        editingSquadName: action.payload.name,
      }
    case 'RESET_SQUAD':
      return initialSquadState
    case 'CLEAR_EDIT_ASSOCIATION':
      if (state.editingSquadId === null) return state
      return { ...state, editingSquadId: null, editingSquadName: null }
    default:
      return state
  }
}
