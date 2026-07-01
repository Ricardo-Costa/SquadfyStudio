export type Seniority = 'junior' | 'mid' | 'senior'

export interface Developer {
  id: string
  name: string
  avatar: string
  seniority: Seniority
  cost: number
  skills: string[]
}

export interface FilterState {
  name: string
  seniorities: Seniority[]
}

export interface SavedSquad {
  id: number
  name?: string
  savedAt: string
  members: Developer[]
}

export interface SquadCardData {
  squad: SavedSquad
  displayName: string
  totalCost: number
  avgSeniority: Seniority | null
  skillCoverage: string[]
}
