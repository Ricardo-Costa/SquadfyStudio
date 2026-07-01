# Phase 1 Data Model: Logout Action

This feature introduces **no new entities, no new persisted data, and no new client/server state**.

## Session (existing — not modified in shape, only in lifecycle)

The `Session` concept named in `spec.md`'s Key Entities is the same `auth-token` HttpOnly cookie
already defined by `001-server-action-auth` (a signed JWT with `sub`/`iat`/`exp`, verified by
`lib/auth.ts#verifyToken`). This feature adds exactly one new lifecycle transition to it:

| Transition | Trigger | Effect |
|---|---|---|
| `authenticated → none` | User submits the logout form | `auth-token` cookie deleted server-side; browser holds no cookie for subsequent requests |

No new fields, no new token claims, no new storage. `lib/auth.ts` (token signing/verification) is
unmodified.

## Relationships

- `logout()` (new Server Action) ← consumes nothing, produces the `authenticated → none`
  transition above.
- `middleware.ts` (existing, unmodified) ← already reacts to the resulting cookie-less state on
  the very next request to any `/dashboard/*` route, exactly as it does today for any other
  request with no cookie.
- `LogoutButton` (new component) ← purely presentational trigger for `logout()`; holds no state
  of its own beyond the browser's native pending-form-submission state.
