import type { Developer } from '@/lib/types'
import type { SquadAction } from './actions'
import { MAX_SQUAD_SIZE } from '@/lib/config'

export interface SquadState {
  members: Developer[]
  editingSquadId: number | null
  editingSquadName: string | null
  // True only once ADD_MEMBER/REMOVE_MEMBER changes the builder after the last
  // LOAD_SQUAD/RESET_SQUAD — distinguishes "a saved squad was loaded as-is" (nothing
  // to lose) from "the builder actually diverges from what's saved" (real unsaved work).
  isDirty: boolean
}

export const initialSquadState: SquadState = {
  members: [],
  editingSquadId: null,
  editingSquadName: null,
  isDirty: false,
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
      return { ...state, members: [...state.members, action.payload], isDirty: true }
    }
    case 'REMOVE_MEMBER': {
      const members = state.members.filter((m) => m.id !== action.payload)
      return { ...state, members, isDirty: true }
    }
    case 'LOAD_SQUAD':
      return {
        members: action.payload.members,
        editingSquadId: action.payload.id,
        editingSquadName: action.payload.name,
        isDirty: false,
      }
    case 'RESET_SQUAD':
      return initialSquadState
    default:
      return state
  }
}
