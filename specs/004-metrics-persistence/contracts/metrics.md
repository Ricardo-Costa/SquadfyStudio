# Contract: lib/metrics.ts

**Feature**: 004-metrics-persistence
**Date**: 2026-06-30

Pure functions — no side effects, no async, no React dependencies. Fully testable with Jest.

---

## `calcTotalCost(members: Developer[]): number`

```typescript
calcTotalCost([])                                    // → 0
calcTotalCost([{ cost: 95 }])                        // → 95
calcTotalCost([{ cost: 95 }, { cost: 62 }])         // → 157
calcTotalCost([{ cost: 30 }, { cost: 62 }, { cost: 112 }]) // → 204
```

**Invariants**:
- Always returns a number ≥ 0
- Empty array returns exactly 0
- Result equals arithmetic sum of all `member.cost` values

---

## `calcAvgSeniority(members: Developer[]): Seniority | null`

```typescript
calcAvgSeniority([])                                              // → null
calcAvgSeniority([{ seniority: 'junior' }])                      // → 'junior'
calcAvgSeniority([{ seniority: 'senior' }])                      // → 'senior'
calcAvgSeniority([{ seniority: 'junior' }, { seniority: 'senior' }])  // → 'mid'
calcAvgSeniority([{ seniority: 'junior' }, { seniority: 'junior' }, { seniority: 'senior' }]) // → 'mid' (avg 1.67 → 2)
calcAvgSeniority([{ seniority: 'mid' }, { seniority: 'mid' }, { seniority: 'mid' }])  // → 'mid'
calcAvgSeniority([{ seniority: 'senior' }, { seniority: 'senior' }, { seniority: 'senior' }, { seniority: 'senior' }, { seniority: 'junior' }]) // → 'senior' (avg 2.6 → 3)
```

**Scoring**: `junior=1, mid=2, senior=3` → average → `Math.round()` → clamp [1,3] → label

**Invariants**:
- Empty array returns `null`
- Non-empty array always returns one of `'junior' | 'mid' | 'senior'`
- Result is `null` only when `members.length === 0`

---

## `calcSkillCoverage(members: Developer[]): string[]`

```typescript
calcSkillCoverage([])                                            // → []
calcSkillCoverage([{ skills: ['React', 'TypeScript'] }])        // → ['React', 'TypeScript']
calcSkillCoverage([{ skills: ['React'] }, { skills: ['React', 'Go'] }])  // → ['Go', 'React']
calcSkillCoverage([{ skills: ['B', 'A'] }, { skills: ['C', 'A'] }])      // → ['A', 'B', 'C']
```

**Invariants**:
- Empty array returns `[]`
- All skill strings from all members are included exactly once (Set deduplication)
- Result is sorted alphabetically (case-sensitive, JS default sort)
- Order is deterministic for the same input

---

## Jest Test Requirements (FR-012)

All test cases above MUST be covered. Test file: `lib/metrics.test.ts`.

```typescript
describe('calcTotalCost', () => {
  it('returns 0 for empty squad')
  it('returns cost for single member')
  it('sums costs for multiple members')
})

describe('calcAvgSeniority', () => {
  it('returns null for empty squad')
  it('returns junior for all-junior squad')
  it('returns senior for all-senior squad')
  it('returns mid for junior + senior mix')
  it('rounds correctly for fractional average')
  it('handles full squad of 5')
})

describe('calcSkillCoverage', () => {
  it('returns [] for empty squad')
  it('returns sorted skills for single member')
  it('deduplicates overlapping skills')
  it('returns alphabetically sorted result')
})
```
