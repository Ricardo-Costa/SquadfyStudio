# Data Model: Server-Side Authentication (001-server-action-auth)

**Date**: 2026-06-29
**Branch**: `001-server-action-auth`

---

## Entities

### 1. TokenPayload

Represents the JWT claims embedded in the session token.
Signed with `AUTH_SECRET` using the `HS256` algorithm via `jose`.

```typescript
interface TokenPayload {
  sub: string;   // User identifier — value of AUTH_EMAIL env var
  iat: number;   // Issued-at timestamp (Unix seconds) — set by jose automatically
  exp: number;   // Expiry timestamp (Unix seconds) — iat + 86400 (24 hours)
}
```

**Validation rules**:
- `sub` MUST match `AUTH_EMAIL` at token generation time.
- `exp` MUST be greater than `Date.now() / 1000` at verification time.
- Any verification failure (tampered, expired, malformed) returns `null` — treated as unauthenticated.

**State transitions**:
```
[absent] ──login success──▶ [valid JWT in HttpOnly cookie]
[valid]  ──expiry elapsed──▶ [expired — treated as absent by middleware]
[valid]  ──tampered────────▶ [invalid — treated as absent by middleware]
```

---

### 2. AuthCookie

The HTTP cookie that carries the session token. Never accessible to JavaScript.

```
Name:     auth-token
Value:    <signed JWT string>
HttpOnly: true
Secure:   true (production) / false (development)
SameSite: Lax
Path:     /
Max-Age:  86400  (24 hours in seconds)
```

**Lifecycle**:
- Created: Server Action `login()` on successful authentication.
- Deleted: Not in scope for this feature (no logout). Expires naturally after Max-Age.
- Read: Middleware on every request to a protected route.

---

### 3. Credentials

Fixed email + password pair sourced exclusively from environment variables.
Never stored in source code, version control, or client bundle.

```
AUTH_EMAIL:    string  — the fixed login email
AUTH_PASSWORD: string  — the fixed login password
AUTH_SECRET:   string  — minimum 32 characters; used to sign and verify JWTs
```

**Comparison**: Performed server-side in the Server Action using strict equality.
No hashing required (fixed credentials, no user database).

---

### 4. RateLimitEntry

In-memory record tracking failed login attempts per IP address.
Stored in a module-level `Map` inside `lib/rate-limit.ts`.
Cleared on server process restart (accepted tradeoff per spec Assumption).

```typescript
interface RateLimitEntry {
  count: number;            // Consecutive failed login attempts from this IP
  blockedUntil: number | null; // Unix ms timestamp when block expires; null if not blocked
}

// Storage: Map<string, RateLimitEntry>
// Key: client IP string (from x-forwarded-for or x-real-ip headers)
```

**State transitions**:
```
[absent / count < 5]  ──failed attempt──▶  [count + 1]
[count === 5]         ──failed attempt──▶  [blocked: blockedUntil = now + 15min]
[blocked]             ──15 min elapsed──▶  [absent — entry removed or count reset]
[any]                 ──login success──▶   [absent — entry removed]
```

**Constants**:
```typescript
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes in milliseconds
```

---

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_EMAIL` | Yes | Fixed login email for the Tech Lead account |
| `AUTH_PASSWORD` | Yes | Fixed login password |
| `AUTH_SECRET` | Yes | JWT signing secret (min 32 chars recommended) |

All three MUST be defined in `.env.local`. The app MUST NOT start without them (validate
at module load time in `lib/auth.ts`).
