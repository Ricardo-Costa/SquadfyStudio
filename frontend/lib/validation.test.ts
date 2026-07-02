import { containsDangerousContent, exceedsMaxLength, isBelowMinLength } from './validation'

describe('containsDangerousContent', () => {
  it('returns false for plain text', () => {
    expect(containsDangerousContent('Squad Alpha')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(containsDangerousContent('')).toBe(false)
  })

  it('returns true when the value contains "<"', () => {
    expect(containsDangerousContent('Alpha < Beta')).toBe(true)
  })

  it('returns true when the value contains ">"', () => {
    expect(containsDangerousContent('Alpha > Beta')).toBe(true)
  })

  it('returns true for a script tag', () => {
    expect(containsDangerousContent('<script>alert(1)</script>')).toBe(true)
  })
})

describe('exceedsMaxLength', () => {
  it('returns false when under the max', () => {
    expect(exceedsMaxLength('abc', 5)).toBe(false)
  })

  it('returns false when exactly at the max (inclusive boundary)', () => {
    expect(exceedsMaxLength('abcde', 5)).toBe(false)
  })

  it('returns true when over the max', () => {
    expect(exceedsMaxLength('abcdef', 5)).toBe(true)
  })

  it('does not trim the value before checking', () => {
    expect(exceedsMaxLength('abcde  ', 5)).toBe(true)
  })
})

describe('isBelowMinLength', () => {
  it('returns true when under the min', () => {
    expect(isBelowMinLength('a', 2)).toBe(true)
  })

  it('returns false when exactly at the min (inclusive boundary)', () => {
    expect(isBelowMinLength('ab', 2)).toBe(false)
  })

  it('returns false when over the min', () => {
    expect(isBelowMinLength('abc', 2)).toBe(false)
  })

  it('treats an empty string as below any positive min', () => {
    expect(isBelowMinLength('', 2)).toBe(true)
  })
})
