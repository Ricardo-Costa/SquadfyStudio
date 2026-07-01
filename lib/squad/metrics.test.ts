import { calcTotalCost, calcAvgSeniority, calcSkillCoverage } from './metrics'
import type { Developer } from '../types'

const dev = (overrides: Partial<Developer>): Developer => ({
  id: '1',
  name: 'Test',
  avatar: '',
  seniority: 'mid',
  cost: 50,
  skills: [],
  ...overrides,
})

describe('calcTotalCost', () => {
  it('returns 0 for empty squad', () => {
    expect(calcTotalCost([])).toBe(0)
  })

  it('returns cost for single member', () => {
    expect(calcTotalCost([dev({ cost: 95 })])).toBe(95)
  })

  it('sums costs for multiple members', () => {
    expect(calcTotalCost([dev({ cost: 95 }), dev({ cost: 62 })])).toBe(157)
    expect(calcTotalCost([dev({ cost: 30 }), dev({ cost: 62 }), dev({ cost: 112 })])).toBe(204)
  })
})

describe('calcAvgSeniority', () => {
  it('returns null for empty squad', () => {
    expect(calcAvgSeniority([])).toBeNull()
  })

  it('returns junior for all-junior squad', () => {
    expect(calcAvgSeniority([dev({ seniority: 'junior' }), dev({ seniority: 'junior' })])).toBe('junior')
  })

  it('returns senior for all-senior squad', () => {
    expect(calcAvgSeniority([dev({ seniority: 'senior' }), dev({ seniority: 'senior' })])).toBe('senior')
  })

  it('returns mid for junior + senior mix (avg 2.0)', () => {
    expect(calcAvgSeniority([dev({ seniority: 'junior' }), dev({ seniority: 'senior' })])).toBe('mid')
  })

  it('returns mid for junior+junior+senior (avg 1.67 → round 2)', () => {
    expect(
      calcAvgSeniority([dev({ seniority: 'junior' }), dev({ seniority: 'junior' }), dev({ seniority: 'senior' })])
    ).toBe('mid')
  })

  it('returns mid for all-mid squad', () => {
    expect(
      calcAvgSeniority([dev({ seniority: 'mid' }), dev({ seniority: 'mid' }), dev({ seniority: 'mid' })])
    ).toBe('mid')
  })

  it('returns senior for 4 senior + 1 junior (avg 2.6 → round 3)', () => {
    expect(
      calcAvgSeniority([
        dev({ seniority: 'senior' }),
        dev({ seniority: 'senior' }),
        dev({ seniority: 'senior' }),
        dev({ seniority: 'senior' }),
        dev({ seniority: 'junior' }),
      ])
    ).toBe('senior')
  })
})

describe('calcSkillCoverage', () => {
  it('returns [] for empty squad', () => {
    expect(calcSkillCoverage([])).toEqual([])
  })

  it('returns sorted skills for single member', () => {
    expect(calcSkillCoverage([dev({ skills: ['React', 'TypeScript'] })])).toEqual(['React', 'TypeScript'])
  })

  it('deduplicates overlapping skills', () => {
    expect(
      calcSkillCoverage([dev({ skills: ['React'] }), dev({ skills: ['React', 'Go'] })])
    ).toEqual(['Go', 'React'])
  })

  it('returns alphabetically sorted result', () => {
    expect(
      calcSkillCoverage([dev({ skills: ['B', 'A'] }), dev({ skills: ['C', 'A'] })])
    ).toEqual(['A', 'B', 'C'])
  })
})
