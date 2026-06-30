# Feature Specification: Server-Side Authentication

**Feature Branch**: `001-server-action-auth`

**Created**: 2026-06-29

**Status**: Draft

**Input**: User description: "login com email e senha via Server Action, geração de token em cookie HttpOnly e proteção de rotas privadas via middleware Next.js — sem acesso ao dashboard para usuários não autenticados"

## Clarifications

### Session 2026-06-29

- Q: Should repeated failed login attempts be rate-limited or blocked? → A: In scope — block IP after 5 consecutive failed attempts for 15 minutes; in-memory tracking, no persistence.
- Q: Should the login form show a loading state during Server Action processing? → A: Yes — button disabled + visual loading indicator (spinner or "Entrando…" text). Frontend visual polish and component structure are first-class requirements across the entire project.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Successful Login (Priority: P1)

A Tech Lead opens the application for the first time and is directed to the login page.
They enter their registered email and password. Upon submitting, they are authenticated
and immediately redirected to the dashboard without any page flickering or intermediate
loading screens visible to JavaScript.

**Why this priority**: Login is the entry gate to the entire application. Without a working
login flow nothing else can be accessed or tested.

**Independent Test**: Can be fully tested by navigating to `/login`, submitting valid
credentials, and confirming the redirect to `/dashboard` occurs with an auth cookie set in
the browser (visible in DevTools under Cookies, marked HttpOnly).

**Acceptance Scenarios**:

1. **Given** an unauthenticated user on `/login`, **When** they submit the correct email and
   password, **Then** they are redirected to `/dashboard` and an HttpOnly auth cookie is present
   in the browser.
2. **Given** an unauthenticated user on `/login`, **When** they submit the correct credentials,
   **Then** the session token is NOT accessible via `document.cookie` in the browser console.
3. **Given** a user who has submitted the login form, **When** the Server Action is processing,
   **Then** the submit button is visibly disabled and a loading indicator is displayed until
   the response is received.

---

### User Story 2 - Protected Route Enforcement (Priority: P2)

A user (or a bot) attempts to access `/dashboard` directly without having logged in. The
application detects the absence of a valid session and redirects them to `/login`
immediately, without rendering any protected content.

**Why this priority**: Route protection is a security requirement. Without it, the auth
feature is incomplete regardless of how well the login form works.

**Independent Test**: Can be fully tested by opening `/dashboard` (or any sub-route) in a
fresh browser session (no auth cookie) and confirming an instant redirect to `/login` occurs.

**Acceptance Scenarios**:

1. **Given** a browser with no auth cookie, **When** the user navigates directly to `/dashboard`,
   **Then** they are redirected to `/login` and no dashboard content is rendered.
2. **Given** a browser with no auth cookie, **When** the user navigates to any route under
   `/dashboard/*`, **Then** they are redirected to `/login`.
3. **Given** an authenticated user with a valid cookie, **When** they visit `/login`,
   **Then** they are redirected to `/dashboard` (no re-authentication required).

---

### User Story 3 - Invalid Credentials Handling (Priority: P3)

A user submits the login form with an incorrect email or password. The system rejects the
attempt, shows a clear error message, and does not set any auth cookie. The user remains
on the login page and can try again.

**Why this priority**: Without proper rejection of invalid credentials, the auth system
would be insecure. This story makes the login feature complete and production-safe.

**Independent Test**: Can be fully tested by submitting an incorrect password on `/login`
and confirming: error message is displayed, no cookie is set, user stays on `/login`.

**Acceptance Scenarios**:

1. **Given** a user on `/login`, **When** they submit a wrong password, **Then** an error
   message is displayed, no auth cookie is created, and the user remains on `/login`.
2. **Given** a user on `/login`, **When** they submit an unrecognised email, **Then** the
   same generic error message is shown (no hint about which field is wrong).
3. **Given** a user on `/login`, **When** they submit an empty form, **Then** validation
   prevents submission and indicates the required fields.

---

### User Story 4 - Brute Force Protection (Priority: P4)

A user (or automated bot) repeatedly submits invalid credentials. After 5 consecutive
failed attempts from the same IP address, the system temporarily blocks further login
attempts from that IP and displays a clear lockout message. The counter resets after the
cooldown period expires.

**Why this priority**: Protects the application against credential-stuffing attacks and
brute-force attempts. Delivers measurable security value beyond the challenge baseline.

**Independent Test**: Can be fully tested by submitting 5 invalid login attempts in
sequence from the same IP and confirming the 6th attempt is rejected with a lockout
message, without performing credential verification.

**Acceptance Scenarios**:

1. **Given** a user who has made 4 failed login attempts, **When** they submit a 5th invalid
   attempt, **Then** the system blocks the request and shows a lockout message indicating
   retry is unavailable for 15 minutes.
2. **Given** a locked-out IP, **When** the user submits any login attempt (even with correct
   credentials), **Then** the attempt is rejected without checking credentials.
3. **Given** a locked-out IP after the 15-minute cooldown has elapsed, **When** the user
   submits valid credentials, **Then** the lockout is lifted and login succeeds normally.
4. **Given** a locked-out IP, **When** the server restarts, **Then** the lockout is cleared
   (in-memory storage — accepted tradeoff documented in Assumptions).

---

### Edge Cases

- What happens when the auth cookie is present but contains a tampered/invalid token?
  → Middleware must treat it as unauthenticated and redirect to `/login`.
- What happens if the user bookmarks `/dashboard` and their session expires?
  → Middleware redirects to `/login`; after re-login they return to `/dashboard`.
- What happens if the Server Action throws an unexpected error during login?
  → A generic error message is shown; no partial auth state is left behind.
- What happens when a locked-out user submits correct credentials before cooldown expires?
  → The attempt is rejected without credential verification; lockout message is shown.
- What happens to the failed-attempt counter on a successful login?
  → The counter for that IP is reset to zero upon successful authentication.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a login page at `/login` with email and password input fields
  and a submit button.
- **FR-002**: Login form submission MUST be processed by a Server Action — no client-side
  fetch or XHR call to an authentication endpoint is permitted.
- **FR-003**: On successful authentication, the system MUST generate a signed session token.
- **FR-004**: The session token MUST be stored exclusively in an HttpOnly cookie; storing it
  in `localStorage`, `sessionStorage`, or any JavaScript-accessible location is prohibited.
- **FR-005**: Middleware MUST intercept every request to `/dashboard` and all routes nested
  under it before any page content is rendered.
- **FR-006**: Middleware MUST redirect unauthenticated requests (missing or invalid cookie)
  to `/login` with an appropriate HTTP redirect status.
- **FR-007**: Middleware MUST redirect already-authenticated requests to `/login` toward
  `/dashboard` to prevent redundant login flows.
- **FR-008**: Invalid login attempts MUST result in a visible, generic error message that does
  not reveal whether the email or the password was incorrect.
- **FR-009**: Valid credentials are fixed (defined via environment variables, not stored in a
  database); the system MUST read them from the environment at runtime.
- **FR-010**: The login form MUST enforce client-side required-field validation before
  allowing submission.
- **FR-014**: During Server Action processing, the login form MUST display a visible loading
  state — the submit button MUST be disabled and a loading indicator MUST be shown — until
  the server response is received.
- **FR-015**: The login page MUST be visually polished and structured with clear component
  separation: form, inputs, button, error display, and loading state MUST each be
  independently composable and visually consistent with the rest of the application.
- **FR-011**: System MUST track consecutive failed login attempts per IP address in
  server-side memory (no database or external store required).
- **FR-012**: After 5 consecutive failed attempts from the same IP, the system MUST block
  all further login attempts from that IP for 15 minutes.
- **FR-013**: A blocked login attempt MUST be rejected before credential verification and
  MUST display a lockout message to the user.

### Key Entities

- **Session Token**: A signed, server-generated value that represents an authenticated
  session. Stored as HttpOnly cookie. Has an expiry. Never exposed to JavaScript.
- **Credentials**: A fixed email + password pair read from environment variables. Compared
  server-side during the Server Action execution.
- **Auth Cookie**: The HTTP cookie carrying the Session Token. Attributes: `HttpOnly`,
  `Secure` (in production), `SameSite=Lax`, with a defined `Max-Age`.
- **Rate Limit Entry**: Per-IP record tracking consecutive failed attempt count and block
  expiry timestamp. Stored in a server-side in-memory Map. Resets on server restart
  (accepted tradeoff — no persistence required). Counter resets to zero on successful login.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with valid credentials can complete the login flow and land on the
  dashboard in under 2 seconds on a standard connection.
- **SC-002**: Any unauthenticated attempt to access a protected route results in a redirect
  to `/login` with no protected content rendered — verifiable in 100% of test runs.
- **SC-003**: The session token is inaccessible via browser JavaScript in 100% of test runs
  (verifiable via `document.cookie` inspection in browser DevTools).
- **SC-004**: An invalid login attempt displays an error message within 1 second and leaves
  no auth cookie in the browser.
- **SC-005**: An already-authenticated user visiting `/login` is redirected to `/dashboard`
  without being shown the login form.
- **SC-006**: After 5 consecutive invalid login attempts from the same IP, all further
  login attempts are blocked for 15 minutes — verifiable in 100% of test runs without
  requiring server restart or external tooling.
- **SC-007**: The login form displays a visible loading state within 100ms of submission
  and the submit button remains disabled for the full duration of Server Action processing.
- **SC-008**: The login page UI is composed of clearly separated, independently testable
  components — form structure, inputs, submit button, error display, and loading indicator
  are each encapsulated without cross-component style leakage.

## Assumptions

- Fixed credentials (email + password) are defined in `.env.local` and available to the
  Server Action at runtime. No user registration or password reset flow is in scope.
- Session tokens expire after 24 hours; the expiry is enforced server-side during cookie
  validation in the middleware.
- Logout functionality is **out of scope** for this feature — it will be addressed in a
  future feature if required.
- The cookie `Secure` attribute is enforced only in production; in local development it may
  be omitted to allow `http://localhost`.
- A single set of fixed credentials is sufficient; multi-user or role-based access is out
  of scope.
- The login page is the only public route; all other routes (present and future under
  `/dashboard`) are private and protected by the middleware.
- Rate limit counters are stored in memory only; a server restart clears all lockouts.
  This is an accepted tradeoff — persistence of lockout state across restarts is out of scope.
- Frontend visual quality and component structure are first-class requirements across the
  entire project, not just this feature. The login page sets the visual and structural
  baseline for all subsequent UI work.
