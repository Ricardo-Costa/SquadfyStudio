# Feature Specification: Input Length Limits Across Forms

**Feature Branch**: `011-input-length-limits`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Limit min/max length for form inputs (login, squad create/edit, search) via centralized config constants, for security/defensive input handling."

## Clarifications

### Session 2026-07-02

- Q: Should the length limits also be enforced server-side (in the `login` and `saveSquad` Server Actions), not just in the browser? → A: Yes — enforce server-side too (defense in depth), since client-only validation is bypassable and provides no real security guarantee, which contradicts the feature's stated security motivation.
- Q: When a bounded field contains dangerous/HTML-like content (e.g. `<`, `>`, `<script>`), should the system reject it with a message, or silently sanitize it? → A: Reject with a message, consistent with how length violations are already handled — never silently alter what the user typed.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Text entry is bounded on every form that submits or persists data (Priority: P1)

A Tech Lead (or anyone reaching the login screen) fills out a text field — logging in, or
naming a squad when saving/renaming it. The system stops them from submitting an input that is
implausibly short (where a minimum makes sense), excessively long, or contains dangerous
HTML-like content, with a clear message, before the value is ever sent to the backend. If the
browser-side check is bypassed entirely (e.g. a request sent directly to the backend), the same
rules are enforced again there, so out-of-bounds or dangerous input is never accepted regardless
of how it was submitted.

**Why this priority**: This is the entire feature — without enforced bounds, any of these
fields can accept arbitrarily long (or, where relevant, trivially short) or dangerous values,
which is both a poor user experience and a real security gap if only checked in the browser
(trivially bypassed) rather than also on the server, where the actual defensive value lives.

**Independent Test**: On the login form, attempt to submit an e-mail/password far longer than
the defined maximum and confirm it's rejected before submission. On the squad naming dialog,
attempt to save with a name shorter than the minimum and one longer than the maximum, and
confirm both are rejected with a message; confirm a name within bounds saves normally.

**Acceptance Scenarios**:

1. **Given** the login form, **When** the Tech Lead enters an e-mail or password exceeding the
   configured maximum length, **Then** the form does not submit and indicates the field is too
   long.
2. **Given** the squad naming dialog (used for both creating and renaming a saved squad),
   **When** the Tech Lead enters a name shorter than the configured minimum, **Then** the save
   action is blocked and a message indicates the minimum length.
3. **Given** the squad naming dialog, **When** the Tech Lead enters a name longer than the
   configured maximum, **Then** the save action is blocked and a message indicates the maximum
   length.
4. **Given** the squad naming dialog, **When** the Tech Lead enters a name within the configured
   bounds, **Then** the squad saves normally, unaffected by this feature.
5. **Given** any bounded field, **When** the Tech Lead pastes or types a value that exceeds the
   maximum, **Then** the system prevents the value from growing past the maximum (rather than
   only rejecting on submit), so the field never visibly holds more than the allowed length.
6. **Given** the login form or the squad naming dialog, **When** a request bypassing the browser
   entirely (e.g. sent directly to the backend) carries a value outside the configured length
   bounds, **Then** the backend rejects it the same way the UI would have — the length rule
   cannot be bypassed by skipping the browser.
7. **Given** the login form or the squad naming dialog, **When** the Tech Lead enters a value
   containing HTML-like content (e.g. `<`, `>`, or a `<script>` tag), **Then** the system rejects
   it with a message and does not save or use it, whether the check happens in the browser or —
   if that's bypassed — on the backend.

### Edge Cases

- What happens if a value is exactly at the minimum or exactly at the maximum? Both boundary
  values MUST be accepted (limits are inclusive).
- What happens to a squad name field pre-filled from an existing saved squad (rename/edit flow)
  whose current name is now shorter or longer than the newly configured bounds (e.g. bounds
  changed after the squad was originally saved)? The Tech Lead MUST still be able to open and
  view the field; the length rule is only enforced again at the point of save, so an
  out-of-bounds pre-filled value simply can't be re-saved unchanged until edited to fit.
- What happens on whitespace-only input for a field with a minimum length (e.g. a squad name of
  all spaces)? It MUST be treated as not meeting the minimum, consistent with the existing
  "name is required" rule already trimming whitespace before validating.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST enforce a maximum length on the login form's e-mail field, in the
  browser (preventing submission, with a clear indication) AND on the backend (rejecting the
  login attempt if that check is bypassed).
- **FR-002**: The system MUST enforce a maximum length on the login form's password field, in
  the browser (preventing submission, with a clear indication) AND on the backend (rejecting the
  login attempt if that check is bypassed).
- **FR-003**: The system MUST enforce both a minimum and a maximum length on the squad name
  field used when creating or renaming a saved squad, in the browser (preventing saving, with a
  clear indication of which bound was violated) AND on the backend (rejecting the save if that
  check is bypassed).
- **FR-004**: The system MUST enforce a maximum length (no minimum) on the Catalogue search
  field and on the Squads search field. Since these fields never submit a value to the backend
  (they only filter data already loaded in the browser), enforcement is browser-side only.
- **FR-005**: All length limits defined by this feature MUST be defined as named constants in
  the project's central configuration module, not hardcoded inline in any component, and MUST be
  the single source of truth used by both the browser-side and backend-side checks (no duplicated
  or drifting limit values between the two).
- **FR-006**: For fields with a minimum length, leading/trailing whitespace MUST be trimmed
  before the minimum is evaluated (a value that is only whitespace does not meet the minimum).
- **FR-007**: Boundary values (a value exactly at the minimum, or exactly at the maximum) MUST
  be accepted as valid.
- **FR-008**: The system MUST prevent a bounded field's displayed value from growing past its
  configured maximum length during typing or pasting, not only reject it at submit time.
- **FR-009**: Enforcing these limits MUST NOT change the outcome of an otherwise-valid login
  attempt or squad save that was already within the configured bounds — this feature only adds
  new rejection cases for out-of-bounds or dangerous input, it does not alter any other
  validation or business logic.
- **FR-010**: The system MUST reject — in the browser (preventing submission, with a clear
  indication) AND on the backend (rejecting if that check is bypassed) — any value in the login
  e-mail, login password, or squad name fields that contains HTML-like content (e.g. `<`, `>`,
  or a complete tag such as `<script>`), rather than saving or using it as-is. This check does
  not apply to the Catalogue/Squads search fields (see Assumptions).

### Key Entities

- No new data entities. This feature adds validation constraints to existing form fields
  (login e-mail/password, squad name, Catalogue search, Squads search) — no schema or
  persisted-data shape changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the five identified fields (login e-mail, login password, squad name,
  Catalogue search, Squads search) have an enforced maximum length; the squad name field
  additionally has an enforced minimum length.
- **SC-002**: No previously-valid login credential or previously-saved squad name (within the
  chosen bounds) is rejected by this feature — zero regressions in already-working submissions.
- **SC-003**: 100% of the project's length-limit values live in one central, named location —
  no magic length numbers duplicated or hardcoded across components.
- **SC-004**: A Tech Lead attempting to submit an out-of-bounds value receives a rejection
  message before any network request is made, in under 100ms (perceived as instant).
- **SC-005**: 100% of the fields that submit to the backend (login e-mail, login password, squad
  name) reject an out-of-bounds or HTML-like value even when the browser-side check is bypassed
  entirely — the backend is never the weaker link.
- **SC-006**: A previously-valid login credential or squad name that also contains no HTML-like
  characters continues to work exactly as before — zero regressions from the new content check.

## Assumptions

- **Search/filter fields are in scope, with a maximum only**: the Catalogue "Buscar
  desenvolvedor…" and Squads "Buscar squad…" fields get the same length-limit treatment as the
  login and squad-naming forms, but with only a maximum (no minimum — a single-character search
  is a normal, valid action). They never submit to a backend; the bound is purely defensive
  against pasting/typing unreasonably long text into a live client-side filter.
- **Login field bounds are defensive-only, not a strength/format policy**: since the valid
  login credential is a fixed, pre-configured value (not user-chosen at signup), the minimum
  length for e-mail/password stays at the existing "must not be empty" behavior already enforced
  by the form — this feature does not add a stricter minimum for login fields, only a generous
  maximum (industry-standard bounds: e-mail up to 254 characters per RFC 5321 practical limits,
  password up to 128 characters), so a legitimate, already-working login can never be newly
  rejected by this feature.
- **Squad name bounds**: a minimum of 2 and a maximum of 60 characters is assumed as a
  reasonable, generous range for a short display name — long enough for realistic squad names,
  short enough to keep card/detail layouts readable (existing UI already truncates long names).
- **Search field bounds**: a maximum of 100 characters is assumed as a generous defensive bound
  for what is ultimately a live, in-memory client-side filter — no minimum, since even a
  single-character search is a normal, valid interaction.
- This feature is purely additive validation on existing fields — no new form fields, no new
  screens, no mock API changes (the mock API itself is never sent an out-of-bounds or
  dangerous value in the first place, since the Server Actions in front of it reject those
  before making the request).
- **HTML-like content rejection scope**: applies only to fields that submit to the backend
  (login e-mail, login password, squad name) — not to the Catalogue/Squads search fields. Search
  input is never persisted or sent anywhere; it's filtered in memory and rendered back through
  React's default JSX interpolation, which already escapes it, so there is no injection surface
  to defend there. Applying the same check would only risk blocking a legitimate search for
  something containing `<`/`>` with no corresponding security benefit.
