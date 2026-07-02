import type { Developer, Seniority } from '../types'

const SENIORITY_SCORE: Record<Seniority, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
}

const SCORE_TO_SENIORITY: Record<number, Seniority> = {
  1: 'junior',
  2: 'mid',
  3: 'senior',
}

export function calcTotalCost(members: Developer[]): number {
  return members.reduce((sum, m) => sum + m.cost, 0)
}

export function calcAvgSeniority(members: Developer[]): Seniority | null {
  if (members.length === 0) return null
  const avg = members.reduce((sum, m) => sum + SENIORITY_SCORE[m.seniority], 0) / members.length
  const rounded = Math.min(3, Math.max(1, Math.round(avg)))
  return SCORE_TO_SENIORITY[rounded]
}

export function calcSkillCoverage(members: Developer[]): string[] {
  return [...new Set(members.flatMap((m) => m.skills))].sort()
}
