# Quickstart: Manual Verification — Logout Action

Prerequisites: `npm run mock` and `npm run dev` both running; logged in with the credentials in
`.env`/`.env.local`.

## US1 — End the Current Session

1. Log in and land on `/dashboard`. Confirm a "Sair" control is visible in the top-right corner
   without scrolling.
2. Navigate to `/dashboard/squads` and to an individual squad's edit page (`/dashboard/<id>`).
   Confirm the same "Sair" control is visible in the top-right corner on each.
3. Resize to a mobile viewport. Confirm the control is still visible top-right (alongside or near
   the existing hamburger menu control) without opening any menu.
4. Click "Sair" from any private page. Confirm the browser lands on `/login` immediately.

## US2 — Session Cannot Be Reused After Logout

1. After completing US1 step 4 (now on `/login`), press the browser's **back** button. Confirm you
   land back on `/login` (or are redirected there), never seeing cached dashboard content.
2. With the browser still logged out, type a private URL directly (e.g., `/dashboard/squads`) into
   the address bar. Confirm you're redirected to `/login`.
3. Log back in. Confirm the squad builder is empty (no leftover in-progress squad from before
   logout), consistent with the spec's Assumptions.

## Edge cases

1. Click "Sair" twice in rapid succession (double-click). Confirm no error is shown and you still
   land on `/login`.
2. Log in, open the squad builder, and click "Salvar Squad" — while the save request is likely
   still in flight, this is hard to race manually, but confirm that logging out shortly after
   still ends cleanly on `/login` with no console error.

## Cross-cutting checks

- `npm run build` completes with no TypeScript errors.
- `npm test` — existing suite (`lib/metrics.test.ts`, `lib/pagination.test.ts`) still passes; no
  new test file is expected for this feature (see `plan.md` Technical Context → Testing).
- Tab through the page with the keyboard only; confirm "Sair" receives visible focus and can be
  activated with Enter.
