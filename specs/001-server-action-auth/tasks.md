---
description: "Task list for 001-server-action-auth implementation"
---

# Tasks: Server-Side Authentication

**Input**: Design documents from `specs/001-server-action-auth/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: No automated test tasks — Jest covers only `lib/metrics.ts` per constitution.
Manual validation via `quickstart.md` after each user story phase.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in every task description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Next.js 15 project with the mandatory stack.

- [ ] T001 Initialize Next.js 15 project using `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"` at the repository root (accept defaults; do not use `/src` directory)
- [ ] T002 [P] Install `jose@^5` for Edge-compatible JWT — `npm install jose`
- [ ] T003 [P] Create `.env.example` at project root with placeholder values: `AUTH_EMAIL=your@email.com`, `AUTH_PASSWORD=yourpassword`, `AUTH_SECRET=minimum-32-character-secret-key-here`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and layouts that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Clean up default Next.js boilerplate: remove auto-generated content from `app/page.tsx` and reset `app/globals.css` to only the three Tailwind directives (`@tailwind base/components/utilities`)
- [ ] T005 [P] Update `app/layout.tsx` as the root layout with `<html lang="en">`, Tailwind font setup (Inter or system font via `next/font`), and correct `<body>` classes — file: `app/layout.tsx`
- [ ] T006 [P] Create `app/page.tsx` as a root redirect to `/login` using `redirect('/login')` from `next/navigation` — file: `app/page.tsx`
- [ ] T007 [P] Create `lib/auth.ts` with `TokenPayload` interface (`sub: string; iat: number; exp: number`), `signToken(payload)` using `jose` `SignJWT` with HS256 and 24h expiry, and `verifyToken(token)` using `jose` `jwtVerify` returning `TokenPayload | null` (catches all errors) — file: `lib/auth.ts`
- [ ] T008 [P] Create `lib/rate-limit.ts` with `RateLimitEntry` type (`count: number; blockedUntil: number | null`), module-level `Map<string, RateLimitEntry>`, constants `MAX_ATTEMPTS = 5` and `BLOCK_DURATION_MS = 15 * 60 * 1000`, and three exported functions: `checkRateLimit(ip)`, `recordFailedAttempt(ip)`, `resetAttempts(ip)` — file: `lib/rate-limit.ts`

**Checkpoint**: Foundation ready. `lib/auth.ts` and `lib/rate-limit.ts` must exist and export correct types before Phase 3 begins.

---

## Phase 3: User Story 1 — Successful Login (Priority: P1) 🎯 MVP

**Goal**: Tech Lead enters valid credentials → redirected to `/dashboard` with HttpOnly `auth-token` cookie set; token NOT accessible via `document.cookie`.

**Independent Test**: Navigate to `/login`, submit valid credentials from `.env.local`, confirm redirect to `/dashboard`, open DevTools → Application → Cookies → verify `auth-token` is HttpOnly; run `document.cookie` in console → confirm `auth-token` absent.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create `app/(auth)/login/_components/LoginInput.tsx` as a `'use client'` component accepting `name`, `label`, `type`, `error?: string` props; renders a Tailwind-styled `<label>` + `<input>` pair with conditional red error border and error message below the input — file: `app/(auth)/login/_components/LoginInput.tsx`
- [ ] T010 [P] [US1] Create `app/(auth)/login/_components/SubmitButton.tsx` as a `'use client'` component using `useFormStatus` from `react-dom`; renders a Tailwind-styled button that is `disabled` and shows a spinner SVG + "Entrando…" text when `pending` is true, and "Entrar" text otherwise — file: `app/(auth)/login/_components/SubmitButton.tsx`
- [ ] T011 [US1] Create `app/(auth)/login/_components/LoginForm.tsx` as a `'use client'` component using `useActionState(login, { status: 'idle' })` from `react`; renders a `<form action={formAction}>` composing `LoginInput` (email + password) and `SubmitButton`; renders error message from action state below the button when `state.status === 'error'` — file: `app/(auth)/login/_components/LoginForm.tsx`
- [ ] T012 [US1] Create `app/(auth)/login/actions.ts` with `'use server'` directive and complete `login(_prevState, formData)` Server Action: (1) extract email + password from `formData`; (2) extract client IP from `headers().get('x-forwarded-for')?.split(',')[0].trim() ?? headers().get('x-real-ip') ?? 'unknown'`; (3) call `checkRateLimit(ip)` — return `rate_limited` error if blocked; (4) compare email + password against `process.env.AUTH_EMAIL` and `AUTH_PASSWORD` — call `recordFailedAttempt(ip)` and return `invalid_credentials` error on mismatch; (5) call `signToken({ sub: email })`; (6) call `resetAttempts(ip)`; (7) set `auth-token` cookie via `cookies().set` with `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 86400`; (8) call `redirect('/dashboard')` OUTSIDE any try/catch — file: `app/(auth)/login/actions.ts`
- [ ] T013 [US1] Create `app/(auth)/login/page.tsx` as a Server Component rendering a full-screen centered layout with a white card (`shadow-md rounded-xl p-8 w-full max-w-sm`), project title heading, and `<LoginForm />` — Tailwind responsive, visually polished (FR-015, SC-008) — file: `app/(auth)/login/page.tsx`

**Checkpoint**: US1 fully functional. Successful login redirects to `/dashboard`, HttpOnly cookie is set, token not in `document.cookie`, loading state visible on submit. Validate via quickstart.md US1 checklist before proceeding.

---

## Phase 4: User Story 2 — Protected Route Enforcement (Priority: P2)

**Goal**: Any unauthenticated request to `/dashboard` or sub-routes is instantly redirected to `/login`; authenticated users visiting `/login` are redirected to `/dashboard`.

**Independent Test**: Open fresh incognito window → navigate to `http://localhost:3000/dashboard` → confirm redirect to `/login` with no dashboard content rendered; then log in and navigate to `/login` → confirm redirect to `/dashboard`.

### Implementation for User Story 2

- [ ] T014 [US2] Create `middleware.ts` at the project root with Edge Runtime logic: (1) read `request.cookies.get('auth-token')?.value`; (2) if on a protected route and no token → `NextResponse.redirect(new URL('/login', request.url))`; (3) call `verifyToken(token)` from `lib/auth.ts` — if `null` → redirect to `/login`; (4) if request is to `/login` and token is valid → `NextResponse.redirect(new URL('/dashboard', request.url))`; (5) otherwise → `NextResponse.next()`; export `config = { matcher: ['/dashboard/:path*', '/login'] }` — file: `middleware.ts`
- [ ] T015 [US2] Create `app/(private)/dashboard/page.tsx` as a Server Component placeholder with a heading "Dashboard — feature 002 coming soon" confirming authenticated access; this page will be replaced in feature `002-catalogue` — file: `app/(private)/dashboard/page.tsx`

**Checkpoint**: US2 fully functional. Unauthenticated `/dashboard` access redirects to `/login`. Authenticated `/login` visit redirects to `/dashboard`. Validate via quickstart.md US2 checklist.

---

## Phase 5: User Story 3 — Invalid Credentials Handling (Priority: P3)

**Goal**: Wrong email or password shows a generic error message (no field hint); empty form is blocked by client-side validation; no cookie is set on failure.

**Independent Test**: Submit wrong password → confirm generic error message appears, no `auth-token` cookie, user stays on `/login`; submit wrong email → same generic message; submit empty form → browser validation blocks submission.

### Implementation for User Story 3

- [ ] T016 [US3] Add `required` attribute to email and password `<input>` elements inside `LoginInput.tsx` to enforce browser-native required-field validation before form submission — file: `app/(auth)/login/_components/LoginInput.tsx`
- [ ] T017 [US3] Verify `LoginForm.tsx` error display for `invalid_credentials` code shows the message "E-mail ou senha inválidos." without specifying which field is wrong; confirm error is visually distinct (red text, Tailwind `text-red-600 text-sm mt-2`) and rendered below the SubmitButton — file: `app/(auth)/login/_components/LoginForm.tsx`

**Checkpoint**: US3 fully functional. Invalid credentials show generic error. Empty form blocked. No cookie on failure. Validate via quickstart.md US3 checklist.

---

## Phase 6: User Story 4 — Brute Force Protection (Priority: P4)

**Goal**: After 5 consecutive failed attempts from the same IP, all further login attempts are blocked for 15 minutes with a distinct lockout message.

**Independent Test**: Submit wrong credentials 5 times → confirm 6th attempt shows lockout message (not the generic invalid_credentials message); submit correct credentials while locked → still shows lockout; restart dev server → lockout clears (in-memory reset).

### Implementation for User Story 4

- [ ] T018 [US4] Add `rate_limited` error state display to `LoginForm.tsx`: when `state.code === 'rate_limited'`, render a distinct lockout message "Muitas tentativas. Tente novamente em 15 minutos." styled differently from the invalid_credentials error (e.g., amber/orange tone: `text-amber-700 bg-amber-50 border border-amber-200 rounded p-3 text-sm`) — file: `app/(auth)/login/_components/LoginForm.tsx`
- [ ] T019 [US4] Verify `login()` Server Action in `actions.ts` calls `checkRateLimit(ip)` as its FIRST operation before any credential comparison and returns `{ status: 'error', code: 'rate_limited', message: '...' }` when `allowed` is `false`; confirm `recordFailedAttempt(ip)` is NOT called when rate-limited (IP already blocked) — file: `app/(auth)/login/actions.ts`

**Checkpoint**: US4 fully functional. 5 failed attempts trigger 15-minute lockout. Correct credentials rejected during lockout. Counter resets on success. Validate via quickstart.md US4 checklist.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and visual consistency pass.

- [ ] T020 [P] Review and refine Tailwind styling across all login components (`LoginInput`, `SubmitButton`, `LoginForm`, `page.tsx`) for visual consistency, responsive layout (`sm:` breakpoints), and accessible focus rings (`focus:outline-none focus:ring-2`) — validates FR-015 and SC-008
- [ ] T021 [P] Verify `.env.local` is listed in `.gitignore`; confirm no `AUTH_*` env vars are referenced in any `'use client'` file (grep for `process.env.AUTH_` in client components) — prevents accidental secret exposure
- [ ] T022 Run full quickstart.md manual validation: execute the checklist for all 4 user stories (US1 successful login + HttpOnly cookie, US2 route protection, US3 invalid credentials + empty form, US4 5-attempt lockout + cooldown) — `specs/001-server-action-auth/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (needs `lib/auth.ts` and `lib/rate-limit.ts`)
- **US2 (Phase 4)**: Depends on Phase 2 (`lib/auth.ts` only) — can run in parallel with US1
- **US3 (Phase 5)**: Depends on US1 Phase 3 completion (extends LoginForm + LoginInput)
- **US4 (Phase 6)**: Depends on US1 Phase 3 completion (extends LoginForm + actions.ts)
- **Polish (Phase N)**: Depends on US1–US4 completion

### User Story Dependencies

- **US1 (P1)**: After Foundational — no dependency on other stories
- **US2 (P2)**: After Foundational — no dependency on US1 (can run in parallel with US1)
- **US3 (P3)**: After US1 — extends existing LoginInput and LoginForm components
- **US4 (P4)**: After US1 — extends existing LoginForm and actions.ts

### Within Each Phase

- Models/utilities before components
- Components before Server Actions
- Server Actions before page components
- Core implementation before polish pass

---

## Parallel Opportunities

### Phase 2 — Foundational (run T007 and T008 together)

```
Parallel:
  Task: "Create lib/auth.ts with signToken/verifyToken"    → lib/auth.ts
  Task: "Create lib/rate-limit.ts with rate limit logic"   → lib/rate-limit.ts
```

### Phase 3 — US1 (run T009 and T010 together, then T011)

```
Parallel:
  Task: "Create LoginInput.tsx"   → _components/LoginInput.tsx
  Task: "Create SubmitButton.tsx" → _components/SubmitButton.tsx

Then sequential:
  Task: "Create LoginForm.tsx"    → depends on LoginInput + SubmitButton
  Task: "Create actions.ts"       → depends on lib/auth.ts + lib/rate-limit.ts
  Task: "Create page.tsx"         → depends on LoginForm
```

### Phase 4 — US2 (fully independent from US1 — run after Phase 2)

```
  Task: "Create middleware.ts"          → depends on lib/auth.ts only
  Task: "Create dashboard/page.tsx"     → no dependencies
```

---

## Implementation Strategy

### MVP First (US1 Only — Phase 1 + 2 + 3)

1. Complete Phase 1: Project Setup
2. Complete Phase 2: Foundational utilities
3. Complete Phase 3: US1 — Successful Login
4. **STOP and VALIDATE**: Run quickstart.md US1 checklist — login works with HttpOnly cookie and loading state
5. Proceed to US2, US3, US4 in order

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready (utilities + project scaffold)
2. Phase 3 (US1) → Login works ✅
3. Phase 4 (US2) → Route protection works ✅
4. Phase 5 (US3) → Error handling complete ✅
5. Phase 6 (US4) → Security hardened with rate limiting ✅
6. Phase N → Visual polish and final validation ✅

---

## Notes

- `[P]` tasks = different files, no shared dependencies — safe to run in parallel
- `redirect()` from `next/navigation` in Server Actions MUST be called outside try/catch
- `useFormStatus` requires `SubmitButton` to be a direct or nested child of the `<form>` element
- `jose` must be used (not `jsonwebtoken`) — see research.md Decision 1 (Edge Runtime)
- Rate limiting Map lives in `lib/rate-limit.ts` module scope — resets on dev server restart
- Commit after each phase checkpoint using `feat(001-auth): <specific description>` format
