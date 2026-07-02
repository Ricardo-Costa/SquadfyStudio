# Contract: `frontend/lib/validation.ts`

New pure-function module, no side effects, no dependencies.

```ts
export function containsDangerousContent(value: string): boolean
```
Returns `true` if `value` contains `<` or `>` (anywhere in the string, not just as a
well-formed tag). Case-sensitive is irrelevant (the characters themselves are the signal, not
a keyword). Empty string returns `false`.

```ts
export function exceedsMaxLength(value: string, max: number): boolean
```
Returns `true` if `value.length > max`. Does **not** trim — callers decide whether to trim
before calling, per field semantics (login fields: don't trim; squad name: trim first).

```ts
export function isBelowMinLength(trimmedValue: string, min: number): boolean
```
Returns `true` if `trimmedValue.length < min`. Contract: the caller MUST pass an already-trimmed
value — this function does not trim itself, to make the trim-then-check order explicit at each
call site (per FR-006, minimum-length evaluation happens after trimming).

## Contract: `login` Server Action (`frontend/app/(auth)/login/actions.ts`)

**Before this feature**: validates only that `email`/`password` exist and match
`process.env.AUTH_EMAIL`/`AUTH_PASSWORD` (after a rate-limit check).

**After this feature**: adds a validation step immediately after reading `email`/`password` from
`FormData`, before the rate-limit check:

```ts
if (
  exceedsMaxLength(email, EMAIL_MAX_LENGTH) ||
  exceedsMaxLength(password, PASSWORD_MAX_LENGTH) ||
  containsDangerousContent(email) ||
  containsDangerousContent(password)
) {
  return { status: 'error', code: 'validation_error', message: '<clear, field-agnostic message>' }
}
```

`LoginErrorCode` gains a new member: `'validation_error'`. This is a new, distinct branch from
the existing `'invalid_credentials'` — per FR-001/002, the indication must be clear that the
input itself was rejected (too long / contains invalid characters), not that the credentials
were wrong, since those are different failure classes a Tech Lead debugging their own typing
would want to distinguish.

**Ordering guarantee**: validation happens **before** `checkRateLimit`, so a malformed/oversized
request never consumes a legitimate rate-limit attempt (see `research.md`).

**Non-regression guarantee**: any `email`/`password` pair that was previously accepted
(within `EMAIL_MAX_LENGTH`/`PASSWORD_MAX_LENGTH` and containing no `<`/`>`) is validated
identically to before — this step only adds new rejection cases.

## Contract: `saveSquad` Server Action (`frontend/app/(private)/dashboard/actions.ts`)

**Before this feature**: validates only `!name.trim()` (empty) and `members.length === 0`.

**After this feature**: the empty-name check is replaced by the more general minimum-length
check (which subsumes it):

```ts
const trimmedName = name.trim()
if (isBelowMinLength(trimmedName, SQUAD_NAME_MIN_LENGTH)) {
  throw new Error(`Squad name must be at least ${SQUAD_NAME_MIN_LENGTH} characters`)
}
if (exceedsMaxLength(trimmedName, SQUAD_NAME_MAX_LENGTH)) {
  throw new Error(`Squad name must be at most ${SQUAD_NAME_MAX_LENGTH} characters`)
}
if (containsDangerousContent(trimmedName)) {
  throw new Error('Squad name contains invalid characters')
}
if (members.length === 0) throw new Error('Cannot save empty squad')
```

Thrown errors propagate to `SaveSquadButton`'s existing `catch` block exactly like the current
`'Squad name is required'`/`'Cannot save empty squad'` errors do today — no new error-handling
path needed there, since it's already generic (sets `saveState` to `'error'`).

**Non-regression guarantee**: any name previously accepted (non-empty, and — under the new
bounds — between 2 and 60 trimmed characters with no `<`/`>`) behaves identically to before.
