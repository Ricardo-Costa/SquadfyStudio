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
