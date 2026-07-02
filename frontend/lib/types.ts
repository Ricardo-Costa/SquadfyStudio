export type Seniority = 'junior' | 'mid' | 'senior'

/** Display labels for each seniority level — the single source of truth so the
 * wording (e.g. "Pleno" for "mid") never drifts between the catalogue, squad
 * panel, squad cards, and filters. */
export const SENIORITY_LABELS: Record<Seniority, string> = {
  junior: 'Junior',
  mid: 'Pleno',
  senior: 'Senior',
}

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
