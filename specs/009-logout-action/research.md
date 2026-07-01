# Phase 0 Research: Logout Action

## 1. Triggering the Server Action from the UI

**Decision**: A plain HTML `<form action={logout}>` wrapping a `<button type="submit">`, exactly
the same binding style `LoginForm` already uses for the `login` Server Action.

**Rationale**: This is the simplest correct way to invoke a Server Action that takes no user
input and always redirects — no `useState`, no `useTransition`, no client-side `onClick` handler
needed. It also works if JavaScript is slow to hydrate (progressive enhancement), and gives a
free pending state via `useFormStatus` if a loading indicator is ever wanted, matching
`SubmitButton.tsx`'s existing pattern.

**Alternatives considered**:
- `onClick={() => logout()}` calling the Server Action directly from a client event handler —
  works, but loses the no-JS-fallback property for no benefit, and departs from the form-action
  convention already established by `LoginForm`.
- A dedicated API route (`app/api/logout/route.ts`) called via `fetch` — rejected; Constitution
  Principle I requires the Server Action pattern already used for login, and introducing a route
  handler as well would be an unjustified second pattern for the same category of operation.

## 2. Clearing the session cookie

**Decision**: `(await cookies()).delete('auth-token')` inside the Server Action.

**Rationale**: `middleware.ts` already uses this exact call (`response.cookies.delete('auth-token')`)
when it encounters an invalid token, so it's a proven, already-present pattern in this codebase for
"the token is gone" — reusing it keeps cookie-clearing logic consistent in one idiom across the app
rather than introducing a second style (e.g., `cookies().set('auth-token', '', { maxAge: 0 })`).

**Alternatives considered**:
- `cookies().set('auth-token', '', { maxAge: 0, ...sameOptions })` — functionally equivalent but
  requires repeating the cookie's `httpOnly`/`secure`/`sameSite`/`path` options a second time
  (they already live in `login/actions.ts`); `.delete()` needs none of that repetition.

## 3. Ending the request (redirect)

**Decision**: `redirect('/login')` called directly inside the Server Action, after deleting the
cookie — no separate client-side navigation.

**Rationale**: Identical to how `login()` already ends with `redirect('/dashboard')` after a
successful sign-in. `redirect()` thrown from a Server Action invoked via a form's `action` prop is
a fully supported, idiomatic Next.js pattern and requires no client involvement.

**Alternatives considered**:
- Returning a status from the action and having the client call `router.push('/login')` — rejected,
  adds a client round-trip and state (`useState`/`useActionState`) for no behavioral difference,
  and departs from the simpler pattern `login()` already sets.

## 4. Making "session cannot be reused" (User Story 2) actually true

**Decision**: No new enforcement code. `middleware.ts` already redirects any request without a
valid `auth-token` cookie to `/login` (established in `001-server-action-auth`) — once `logout`
deletes the cookie, every subsequent private-route request (including via browser back/forward,
which re-requests the page rather than reading from an in-memory cache since these are dynamic
server-rendered/protected routes) is already caught by that existing check.

**Rationale**: Avoids duplicating route-protection logic in a second place. This is the most
direct application of Constitution Principle V (no abstraction beyond what's needed) — the
feature's only real job is making the existing gate's precondition (no valid cookie) become true
on demand.

**Alternatives considered**:
- Adding a server-side token blocklist/invalidation list so a *stolen* still-valid token can't be
  reused even before its 24h expiry — out of scope per the spec (User Story 2 only requires that
  *this browser's own subsequent requests* are refused after logout, which cookie deletion alone
  satisfies; token revocation for a copied/stolen token is a different, unrequested threat model).

## 5. Where the control lives in the layout

**Decision**: A new slim top-right bar rendered inside `app/(private)/dashboard/layout.tsx`,
above `{children}`, alongside the existing `<DashboardNav />` — not merged into `DashboardNav.tsx`
itself.

**Rationale**: `DashboardNav` renders a left-aligned vertical sidebar on desktop and a top bar
(wordmark + hamburger) on mobile; there is currently no element that sits at the top-right of the
*content column* on desktop. FR-001 requires the control specifically in the top-right corner on
every private route, which `dashboard/layout.tsx` already wraps in full (it's the only private
route subtree — see `CLAUDE.md`'s expected structure, `(private)/dashboard/` is the whole private
area). Keeping it as a sibling to `DashboardNav` rather than folded inside it separates "primary
navigation" from "session control," two different concerns that happen to both live in persistent
chrome.

**Alternatives considered**:
- Adding the logout button into `DashboardNav`'s sidebar (bottom) and mobile bar (next to the
  hamburger) — rejected: on desktop this would place it at the bottom-left/bottom of a left-hand
  sidebar, not the top-right corner FR-001 asks for; would also make `DashboardNav` responsible for
  two unrelated concerns.
