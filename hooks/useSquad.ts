'use client'

import { use } from 'react'
import { SquadContext } from '@/context/squad/SquadContext'
import type { Developer } from '@/lib/types'

export function useSquad() {
  const ctx = use(SquadContext)
  if (!ctx) throw new Error('useSquad must be used within SquadProvider')
  const { state, dispatch } = ctx
  return {
    members: state.members,
    count: state.members.length,
    isFull: state.members.length >= 5,
    isMember: (id: string) => state.members.some((m) => m.id === id),
    addMember: (dev: Developer) => dispatch({ type: 'ADD_MEMBER', payload: dev }),
    removeMember: (id: string) => dispatch({ type: 'REMOVE_MEMBER', payload: id }),
    editingSquadId: state.editingSquadId,
    editingSquadName: state.editingSquadName,
    loadSquad: (id: number, name: string, members: Developer[]) =>
      dispatch({ type: 'LOAD_SQUAD', payload: { id, name, members } }),
  }
}
