# Contract: Server Action — `login()`

**File**: `app/(auth)/login/actions.ts`
**Runtime**: Node.js (Server Action)

---

## Signature

```typescript
'use server'

export async function login(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState>
```

## Types

```typescript
type LoginActionState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; code: LoginErrorCode; message: string }

type LoginErrorCode =
  | 'invalid_credentials'  // Email or password does not match
  | 'rate_limited'         // IP has exceeded the failed attempt threshold
  | 'server_error'         // Unexpected internal error
```

## Behaviour

### Happy path (valid credentials, IP not blocked)

1. Extract `email` and `password` from `formData`.
2. Check rate limit for client IP — if blocked, return `rate_limited` error immediately.
3. Compare `email` and `password` against `AUTH_EMAIL` / `AUTH_PASSWORD` env vars.
4. Call `signToken({ sub: email })` from `lib/auth.ts` to generate JWT.
5. Call `resetAttempts(ip)` from `lib/rate-limit.ts` to clear the failed counter.
6. Set `auth-token` cookie via `cookies().set(...)` with attributes from data-model.
7. Call `redirect('/dashboard')` — this throws internally (Next.js redirect mechanism).

### Invalid credentials

1. Steps 1–2 as above.
2. Credential comparison fails.
3. Call `recordFailedAttempt(ip)` from `lib/rate-limit.ts`.
4. Return `{ status: 'error', code: 'invalid_credentials', message: '...' }`.
5. Do NOT set any cookie. Do NOT call redirect.

### Rate limited

1. Steps 1–2 as above.
2. `checkRateLimit(ip)` returns `{ allowed: false, blockedUntil: <timestamp> }`.
3. Return `{ status: 'error', code: 'rate_limited', message: '...' }` immediately.
4. Do NOT check credentials. Do NOT set any cookie.

### Unexpected error

1. Any unhandled exception is caught.
2. Return `{ status: 'error', code: 'server_error', message: 'Something went wrong. Please try again.' }`.
3. Do NOT leak exception details to the client.

## Usage in Form Component

```typescript
// LoginForm.tsx
const [state, formAction] = useActionState(login, { status: 'idle' })
```

## Security Notes

- IP is extracted from `x-forwarded-for` (first value) or `x-real-ip` request headers.
  Accessed via `headers()` from `next/headers`.
- Credential comparison uses strict equality (`===`). No timing-safe compare needed
  for fixed credentials in a mock environment.
- The `redirect()` call from `next/navigation` must happen OUTSIDE a try/catch block
  (it throws internally — catching it suppresses the redirect).
