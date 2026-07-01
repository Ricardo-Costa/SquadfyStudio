# Contract: `logout()` Server Action + `LogoutButton`

## `app/(private)/actions.ts`

```ts
'use server'

export async function logout(): Promise<never>
```

| Behavior | Requirement |
|---|---|
| Called (no arguments, no `FormData` needed) | Deletes the `auth-token` HttpOnly cookie | FR-002, FR-003 |
| After cookie deletion | Calls `redirect('/login')` — function never returns normally (redirect throws) | FR-004 |
| Called when no `auth-token` cookie exists (e.g., double-submit, already-expired session) | Deleting a nonexistent cookie is a no-op; `redirect('/login')` still runs | Edge case: double logout / expired-session logout is safe, not an error |

No parameters, no return value consumed by the caller — the form submission itself triggers the
redirect. Not exported for use outside `app/(private)/**` (no reason to call it from `(auth)`).

## `app/(private)/dashboard/_components/LogoutButton.tsx`

```ts
export default function LogoutButton(): JSX.Element
```

### Behavior

| Condition | Rendered output |
|---|---|
| Always | `<form action={logout}>` wrapping a single `<button type="submit">Sair</button>` |
| Mid-submission | Button reflects pending state via `useFormStatus` (disabled, matching `SubmitButton`'s existing loading treatment) — not a blocking requirement (FR-007 forbids a *confirmation dialog*, not a pending indicator) |
| Keyboard | Native `<button type="submit">` — focusable and activatable with Enter/Space with no extra wiring (FR-006) |

### Explicit non-goals

- No confirmation modal (FR-007 / spec Assumptions).
- No client-side state, no `onClick` handler, no manual `fetch`/`router.push`.
- No icon-only rendering requirement — a labeled button ("Sair") is sufficient and needs no
  `aria-label` beyond its own visible text.
