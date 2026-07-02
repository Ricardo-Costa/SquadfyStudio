// Shared, pure input-validation primitives — single source of truth for both browser-side
// (component) and backend-side (Server Action) checks, so limits can never drift between them.

/** True if `value` contains HTML-tag-like content (e.g. `<script>`). */
export function containsDangerousContent(value: string): boolean {
  return /[<>]/.test(value)
}

/** True if `value` (untrimmed) is longer than `max`. Callers decide whether to trim first. */
export function exceedsMaxLength(value: string, max: number): boolean {
  return value.length > max
}

/** True if `trimmedValue` is shorter than `min`. Caller MUST pass an already-trimmed value. */
export function isBelowMinLength(trimmedValue: string, min: number): boolean {
  return trimmedValue.length < min
}
