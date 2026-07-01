# Contract: Auth & Rate Limit Utilities

---

## `lib/auth.ts`

**Runtime**: Node.js + Edge (jose is Edge-compatible)

### `signToken(payload)`

```typescript
export async function signToken(
  payload: Pick<TokenPayload, 'sub'>
): Promise<string>
```

- Signs a JWT with `HS256` algorithm using `AUTH_SECRET`.
- Automatically sets `iat` (issued at) and `exp` (iat + 86400s).
- Returns a compact JWT string.
- Throws if `AUTH_SECRET` is not defined in environment.

### `verifyToken(token)`

```typescript
export async function verifyToken(
  token: string
): Promise<TokenPayload | null>
```

- Verifies the JWT signature and expiry using `AUTH_SECRET`.
- Returns the decoded `TokenPayload` on success.
- Returns `null` for any failure: invalid signature, expired, malformed, missing.
- Never throws — all jose errors are caught internally and return `null`.

### `TokenPayload` type

```typescript
interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
}
```

---

## `lib/rate-limit.ts`

**Runtime**: Node.js only (module-level Map — not Edge-compatible)

### `checkRateLimit(ip)`

```typescript
export function checkRateLimit(ip: string): {
  allowed: boolean;
  blockedUntil?: number; // Unix ms timestamp
}
```

- Returns `{ allowed: true }` if the IP has fewer than `MAX_ATTEMPTS` (5) consecutive
  failures and is not currently blocked.
- Returns `{ allowed: false, blockedUntil }` if the IP is in the blocked state and the
  block has not yet expired.
- If a block has expired, clears the entry and returns `{ allowed: true }`.

### `recordFailedAttempt(ip)`

```typescript
export function recordFailedAttempt(ip: string): void
```

- Increments the failed attempt counter for the given IP.
- If `count` reaches `MAX_ATTEMPTS` (5), sets `blockedUntil = Date.now() + BLOCK_DURATION_MS`.

### `resetAttempts(ip)`

```typescript
export function resetAttempts(ip: string): void
```

- Removes the rate limit entry for the given IP entirely.
- Called on successful login to clear any prior failed attempt history.

### Constants

```typescript
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
```

---

## `middleware.ts` (project root)

**Runtime**: Edge

```typescript
export function middleware(request: NextRequest): NextResponse

export const config = {
  matcher: ['/dashboard/:path*']
}
```

**Logic**:
1. Read `auth-token` cookie from the request.
2. If absent → `NextResponse.redirect(new URL('/login', request.url))`.
3. Call `verifyToken(token)` from `lib/auth.ts`.
4. If `null` (invalid/expired) → `NextResponse.redirect(new URL('/login', request.url))`.
5. Otherwise → `NextResponse.next()` (allow request through).

**Note**: Middleware does NOT handle rate limiting (Node.js-only concern — see research.md Decision 2).
