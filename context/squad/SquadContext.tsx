'use client'

import { createContext, useReducer } from 'react'
import { squadReducer, initialSquadState } from './reducer'
import type { SquadState } from './reducer'
import type { SquadAction } from './actions'

export interface SquadContextValue {
  state: SquadState
  dispatch: React.Dispatch<SquadAction>
}

export const SquadContext = createContext<SquadContextValue | null>(null)

export function SquadProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(squadReducer, initialSquadState)
  return (
    <SquadContext.Provider value={{ state, dispatch }}>
      {children}
    </SquadContext.Provider>
  )
}
