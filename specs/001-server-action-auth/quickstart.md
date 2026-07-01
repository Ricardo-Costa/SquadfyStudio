# Quickstart: Server-Side Authentication (001-server-action-auth)

**Purpose**: Step-by-step guide to set up, run, and manually validate this feature.

---

## 1. Environment Setup

Create `.env.local` at the project root:

```bash
AUTH_EMAIL=admin@squadfy.io
AUTH_PASSWORD=squadfy2026
AUTH_SECRET=super-secret-key-minimum-32-chars-long
```

> `AUTH_SECRET` must be at least 32 characters for HS256 security margin.

---

## 2. Install Dependencies

```bash
npm install
npm install jose   # JWT library (Edge-compatible)
```

---

## 3. Run Dev Server

```bash
npm run dev
# JSON Server is NOT needed for this feature (auth is standalone)
```

---

## 4. Manual Validation Checklist

### ✅ US1 — Successful Login

1. Open `http://localhost:3000` in a fresh browser session.
2. Confirm redirect to `/login`.
3. Enter `AUTH_EMAIL` and `AUTH_PASSWORD` from `.env.local`.
4. Submit the form.
5. **Expected**: Redirected to `/dashboard`.
6. Open DevTools → Application → Cookies → `localhost`.
7. **Expected**: `auth-token` cookie present, `HttpOnly` column checked.
8. Open browser console → run `document.cookie`.
9. **Expected**: `auth-token` does NOT appear in the output.

### ✅ US2 — Protected Route Enforcement

1. Open a fresh incognito window (no cookies).
2. Navigate directly to `http://localhost:3000/dashboard`.
3. **Expected**: Immediately redirected to `/login`. No dashboard content visible.
4. Navigate to `http://localhost:3000/dashboard/anything`.
5. **Expected**: Same redirect behaviour.

### ✅ US2 — Authenticated redirect from `/login`

1. Log in successfully (US1 above).
2. With the auth cookie set, navigate to `http://localhost:3000/login`.
3. **Expected**: Redirected to `/dashboard` without seeing the login form.

### ✅ US3 — Invalid Credentials

1. On `/login`, enter a wrong password.
2. Submit the form.
3. **Expected**: Error message appears on page. No redirect. No `auth-token` cookie set.
4. Enter wrong email.
5. **Expected**: Same generic error message (no hint about which field is wrong).
6. Submit empty form.
7. **Expected**: HTML5 required-field validation prevents submission.

### ✅ US3 — Loading State

1. Open DevTools → Network → throttle to "Slow 3G".
2. Submit the login form with valid credentials.
3. **Expected**: Submit button is visibly disabled and shows loading indicator immediately
   after clicking. Button re-enables only after redirect or error response.

### ✅ US4 — Brute Force Protection

1. Submit the login form with wrong credentials 5 times in a row.
2. **Expected**: On the 6th attempt (or blocked state), the error message changes to a
   lockout message indicating retry is unavailable for 15 minutes.
3. **Expected**: Even submitting correct credentials while blocked returns lockout message.
4. Wait 15 minutes (or restart dev server to clear in-memory state for testing).
5. **Expected**: Login works normally with correct credentials.

---

## 5. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `auth-token` cookie not set | `AUTH_SECRET` missing in `.env.local` | Add `AUTH_SECRET` to `.env.local` and restart dev server |
| Middleware not redirecting | `matcher` config missing or wrong pattern | Verify `middleware.ts` exports `config.matcher` with `/dashboard/:path*` |
| JWT verify fails immediately | `AUTH_SECRET` mismatch between sign and verify | Ensure both use the same env var; restart dev server after `.env.local` change |
| Rate limit not clearing | In-memory state — by design | Restart dev server to clear all rate limit counters |
