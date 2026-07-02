# Research: Input Length Limits Across Forms

No `NEEDS CLARIFICATION` markers remain in the Technical Context. This document records the
design decisions made while translating the spec's requirements into concrete implementation
choices, and the alternatives considered.

## Decision: Three small pure functions in a new `lib/validation.ts`, no validation library

**Rationale**: The full rule set is: "does this string exceed N characters", "is this string,
trimmed, shorter than N characters", and "does this string contain `<` or `>`". Three
one-line pure functions cover this completely. Pulling in `zod`, `yup`, or similar would add a
new dependency, a new mental model, and schema-definition boilerplate for a problem this small
— a direct violation of constitution Principle V (Simplicity Over Abstraction).

**Alternatives considered**:
- *`zod` schema per form*: Rejected — the project doesn't use a validation library anywhere
  else, and one isn't warranted for three primitives.
- *Inline checks duplicated in each component/action*: Rejected — this is exactly what FR-005
  ("single source of truth... no duplicated or drifting limit values") explicitly rules out;
  a shared module is the only way both the browser-side and backend-side checks stay in sync.

## Decision: Dangerous-content check is a simple `/[<>]/` test, not HTML sanitization

**Rationale**: `/speckit-clarify` established that no live XSS injection surface actually exists
today (no `dangerouslySetInnerHTML` anywhere in the codebase — React's default JSX
interpolation already escapes all rendered text). The check requested is a defense-in-depth
input-validation control, not a fix for a live vulnerability. Testing for the presence of `<` or
`>` is sufficient to reject anything that looks like a tag (`<script>`, `<img onerror=...>`,
etc.) without needing an HTML-parsing library.

**Alternatives considered**:
- *A sanitization library (`DOMPurify`, etc.)*: Rejected — sanitization was explicitly rejected
  in favor of rejection-with-message during `/speckit-clarify` (Q2), and a parsing library is
  unnecessary complexity for a presence check.
- *A broader denylist (quotes, ampersands, etc.)*: Rejected — the spec's own examples (`<`, `>`,
  `<script>`) scope the check to HTML-tag-like content specifically; a broader denylist risks
  rejecting legitimate names/searches (e.g. an e-mail-like squad name containing `&`) with no
  corresponding security benefit given React's existing escaping.

## Decision: Login validation runs inside the existing `login` Server Action, no separate client-side check beyond native `maxLength`

**Rationale**: Next.js Server Actions *are* the form's submission handler — there's no separate
client-side `fetch` call to duplicate validation into (constitution Principle I already
prohibits one). Because the same `login` function runs whether the browser submitted normally or
a request bypassed the UI, putting the length/content check at the top of that one function
naturally satisfies both "reject with a clear indication in the browser" (FR-001/002/010, since
the existing `useActionState` error-display wiring already surfaces whatever the action
returns) and "reject on the backend if bypassed" (SC-005) — with zero duplicated logic. The
native HTML `maxLength` attribute is added purely as a UX nicety (FR-008, capping the field
while typing), not as the enforcement mechanism.

**Alternatives considered**:
- *A separate client-side pre-validation step before calling the Server Action*: Rejected — the
  Server Action already runs on every real submission path; a second, separate check would be
  the exact kind of duplicated-logic FR-005 rules out, for no added defense (the "browser
  bypassed" case is precisely what the Server Action check already covers).

## Decision: Validation runs before rate-limiting and credential comparison in `login`

**Rationale**: Rejecting a malformed/oversized request as early as possible avoids spending a
rate-limit "attempt" on input that was never going to be a valid credential, and avoids running
any comparison logic against an oversized string. This ordering is a natural, low-risk choice —
FR-009 requires it not change the outcome for already-valid input, and validating
shape-before-content preserves that for every currently-working login.

**Alternatives considered**:
- *Validate after rate-limit check*: Rejected — no benefit, and would let a flood of
  oversized/malformed requests consume legitimate users' rate-limit budget.

## Decision: Squad name validation replaces (not adds to) the existing "must not be empty" check

**Rationale**: `SaveSquadModal`'s existing `isInvalid = trimmed === ''` check is a special case
of "shorter than the minimum" once `SQUAD_NAME_MIN_LENGTH >= 1`. Replacing it with
`isBelowMinLength(trimmed, SQUAD_NAME_MIN_LENGTH)` is strictly more general and removes a
redundant, now-overlapping rule rather than stacking a new one beside it (constitution
Principle V).

**Alternatives considered**:
- *Keep the empty check separate from the new min-length check*: Rejected — redundant; the new
  check already covers the empty-string case with `SQUAD_NAME_MIN_LENGTH = 2`.

## Decision: Search fields get `maxLength` only, no dedicated validation-error UI

**Rationale**: Per the spec's Assumptions, search fields never submit to a backend and are
already safely escaped on render — a native `maxLength` attribute is the entire defensive
surface needed (the browser simply won't let the field grow past it; there's nothing to
"reject with a message" since there's no submit action to block).

**Alternatives considered**:
- *Add the same error-message treatment as login/squad name*: Rejected — there is no submit
  event for a live filter field to block; a message here would have no action to prevent.
