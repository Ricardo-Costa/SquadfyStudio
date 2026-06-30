# Research: Server-Side Authentication (001-server-action-auth)

**Date**: 2026-06-29
**Branch**: `001-server-action-auth`

---

## Decision 1: JWT Library — `jose` over `jsonwebtoken`

**Decision**: Use [`jose`](https://github.com/panva/jose) for JWT signing and verification.

**Rationale**: Next.js middleware runs on the **Edge Runtime** by default. The Edge Runtime
does not support Node.js-specific APIs (e.g., `crypto` module, `Buffer` in older forms).
`jsonwebtoken` depends on Node.js crypto internals and **fails in Edge Runtime**. `jose` is
built on the Web Crypto API and runs in Edge Runtime, Node.js, and browsers — making it
the correct choice for a Next.js 15 project where token verification must happen in both
middleware (Edge) and Server Actions (Node.js).

**Alternatives considered**:
- `jsonwebtoken`: Most popular JWT lib — rejected because it breaks in Edge Runtime.
- Manual HMAC with `crypto.subtle`: Works in Edge, but requires hand-rolling expiry checks,
  claim parsing, and error handling that `jose` provides out of the box.
- `next-auth` / Auth.js: Full auth solution — rejected per Principle V (simplicity);
  overkill for a fixed-credential single-user app.

---

## Decision 2: Rate Limiting Placement — Server Action (not Middleware)

**Decision**: Rate limiting logic lives in the **login Server Action**, not in middleware.

**Rationale**: Middleware runs on Edge Runtime which is stateless across requests in
production deployments. An in-memory `Map` in middleware would reset on every edge
worker invocation in production. The Server Action runs in the **Node.js runtime** where
module-level state persists across requests within the same process — making in-memory
rate limiting viable for a local dev / mock environment as specified.

Middleware's responsibility is strictly: validate auth cookie → redirect or allow.
Rate limiting is a login-attempt concern, not a routing concern.

**Alternatives considered**:
- Rate limiting in middleware: Rejected — Edge Runtime statelessness makes in-memory
  Map unreliable even locally (each worker gets its own memory).
- Redis / external store: Rejected per Principle V and challenge scope (no DB required).
- IP-based blocking in middleware via response headers: Rejected — adds unnecessary
  coupling between routing and auth business logic.

---

## Decision 3: Loading State — `useFormStatus` (not custom state)

**Decision**: Use React's `useFormStatus` hook from `react-dom` for form pending state.

**Rationale**: `useFormStatus` is the idiomatic Next.js 15 / React 19 pattern for
tracking Server Action submission state. It requires zero additional state management —
the `pending` flag is provided automatically while the Server Action is executing. This
keeps the `SubmitButton` component self-contained and avoids prop-drilling a loading
boolean from a parent `useState`. Aligns with Principle V (simplicity) and Principle III
(no unnecessary re-renders — only the button re-renders, not the whole form).

**Alternatives considered**:
- `useState` + manual flag: Rejected — requires additional coordination between form
  submit handler and button state; more code for the same result.
- React Query mutation: Rejected — React Query is reserved for catalogue server state
  per the constitution (Principle II). Using it for a Server Action form would violate
  the State Management Split principle.

---

## Decision 4: Token Payload — Minimal JWT Claims

**Decision**: JWT payload contains only `{ sub: string, iat: number, exp: number }`.

**Rationale**: The app has a single fixed user with no roles or permissions beyond
"authenticated". Storing email in `sub` is sufficient for the middleware to verify
identity. Minimal payload reduces cookie size and avoids leaking user data in the
token (even though it's server-only, keeping JWTs minimal is best practice).

**Alternatives considered**:
- Include `email` and `role` as claims: Rejected — unnecessary for a single-user app;
  `sub` already carries the identifier.

---

## Decision 5: Cookie Name and Attributes

**Decision**: Cookie name `auth-token`, attributes `HttpOnly; Path=/; SameSite=Lax;
Max-Age=86400; Secure` (Secure omitted in development).

**Rationale**:
- `auth-token`: Descriptive, not collision-prone with third-party cookies.
- `SameSite=Lax`: Prevents CSRF on state-changing requests while allowing top-level
  navigation (e.g., user bookmarks dashboard URL and navigates to it).
- `Max-Age=86400`: 24-hour absolute session per spec assumption.
- `Secure` in production only: Allows `http://localhost` in development without
  special config (per spec Assumption).

---

## Decision 6: IP Extraction in Server Action

**Decision**: Extract client IP from `x-forwarded-for` header (first value), falling
back to `x-real-ip`, falling back to `"unknown"`.

**Rationale**: Next.js dev server and most reverse proxies set `x-forwarded-for`.
Falling back to `"unknown"` ensures rate limiting doesn't crash when headers are absent —
all requests from unknown IPs are counted under the same bucket (conservative but safe).

---

## Decision 7: File Structure — App Router Colocation

**Decision**: Use Next.js App Router colocation with `_components/` prefix for
feature-local components that are not shared across routes.

**Rationale**: Underscore prefix (`_components/`) tells Next.js router to exclude these
files from routing. This keeps login-specific components (LoginForm, SubmitButton,
LoginInput) co-located with the route without polluting the global `components/` folder
with single-use UI. Global `components/` is reserved for shared UI used across features.

**Alternatives considered**:
- Global `components/auth/`: Rejected — these components are only used on the login
  page; colocation reduces coupling.
- Flat files in `app/(auth)/login/`: Rejected — makes the route folder harder to scan
  as files multiply.
