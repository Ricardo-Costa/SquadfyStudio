# Tasks: Logout Action

**Input**: Design documents from `specs/009-logout-action/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not included — per `plan.md`'s Technical Context → Testing, this feature adds no new `lib/` pure function to unit-test (unlike `lib/metrics.ts`/`lib/pagination.ts`); verification is manual against `quickstart.md`, consistent with how `001-server-action-auth`'s own login Server Action and `middleware.ts` are verified today.

**Organization**: Tasks are grouped by user story. The `logout` Server Action and `LogoutButton` component are shared prerequisites both stories need to exist before either is testable, so they land in Foundational. User Story 2 requires no new implementation of its own — `research.md` §4 established that the existing `middleware.ts` already enforces it once the cookie is gone — so its phase is verification-only.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = end the current session, US2 = session cannot be reused after logout

---

## Phase 1: Foundational (Blocking Prerequisite)

**Purpose**: The `logout` Server Action and the `LogoutButton` component are the shared pieces both user stories depend on — neither story is testable without them existing.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T001 [P] Create `app/(private)/actions.ts` — `'use server'` file exporting `export async function logout(): Promise<never>` per `contracts/logout.md`: `const cookieStore = await cookies(); cookieStore.delete('auth-token'); redirect('/login')`. No parameters, no `try/catch` needed (deleting a nonexistent cookie is a safe no-op per the contract's double-logout row).
- [X] T002 Create `app/(private)/dashboard/_components/LogoutButton.tsx` — client component (`'use client'`) importing `logout` from `../../actions`; renders `<form action={logout}><button type="submit">...</button></form>` per `contracts/logout.md`; use `useFormStatus` from `react-dom` for a pending-disabled state, mirroring the existing pattern in `app/(auth)/login/_components/SubmitButton.tsx`; label the button "Sair"; style with the app's existing `rust`/`ink` design tokens (e.g. an outline/ghost button consistent with other secondary controls like `NewSquadButton.tsx`) (depends on T001 for the `logout` import)

**Checkpoint**: `logout()` and `<LogoutButton />` exist and compile — both user stories can now proceed.

---

## Phase 2: User Story 1 - End the Current Session (Priority: P1) 🎯 MVP

**Goal**: A "Sair" control is visible in the top-right corner of every private route; clicking it ends the session and lands on `/login`.

**Independent Test**: Log in, visit `/dashboard`, `/dashboard/squads`, and `/dashboard/<id>`, confirm "Sair" is visible top-right on each without scrolling; click it and confirm immediate arrival at `/login`.

### Implementation for User Story 1

- [X] T003 [US1] Update `app/(private)/dashboard/layout.tsx`: add a slim bar above `{children}` (inside the `<div className="flex-1">` content column, alongside the existing `<DashboardNav />`) containing `<LogoutButton />` right-aligned (e.g. `<div className="flex justify-end px-4 py-3 sm:px-6 lg:px-10"><LogoutButton /></div>`), per `plan.md`'s Project Structure and `research.md` §5 — do not modify `DashboardNav.tsx` (depends on T002)
- [ ] T004 [US1] Manual verification against `quickstart.md` § US1 (steps 1–4): "Sair" visible top-right on `/dashboard`, `/dashboard/squads`, and a squad edit page, on both desktop and mobile viewport widths, without scrolling or opening a menu; clicking it lands on `/login` immediately (depends on T003)

**Checkpoint**: User Story 1 is fully functional — a session can be ended from anywhere in the dashboard.

---

## Phase 3: User Story 2 - Session Cannot Be Reused After Logout (Priority: P2)

**Goal**: Confirm that once logged out, private routes are genuinely inaccessible (not just visually redirected away from once).

**Independent Test**: Log out, then try the browser back button and a direct URL to a private route; confirm both land on `/login`, never on cached/rendered private content.

### Implementation for User Story 2

- [ ] T005 [US2] Manual verification against `quickstart.md` § US2 (steps 1–3): after logout, browser back button does not reveal private content; typing a private URL directly redirects to `/login`; logging back in shows an empty squad builder. No new code — confirms `middleware.ts`'s existing no-cookie → redirect check (from `001-server-action-auth`) already covers this once T001–T003 make logout possible (depends on T003)

**Checkpoint**: Both user stories are independently verified — logout is a real security boundary, not a cosmetic redirect.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and the spec's documented edge cases.

- [X] T006 [P] Run `npm run build` — confirm zero TypeScript/build errors after the new action, component, and layout change
- [X] T007 [P] Run `npm test` — confirm the existing suite (`lib/metrics.test.ts`, `lib/pagination.test.ts`) still passes unmodified; no new test file is expected (see plan.md Testing)
- [ ] T008 Edge case verification against `quickstart.md` "Edge cases": double-clicking "Sair" lands cleanly on `/login` with no error; tabbing to "Sair" with the keyboard shows visible focus and Enter activates it (FR-006) (depends on T003)
- [ ] T009 Full regression pass against `quickstart.md` "Cross-cutting checks": build clean, tests pass, keyboard-only activation works (depends on T004, T005, T006, T007, T008)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: T001 has no dependencies; T002 depends on T001 (imports `logout`) — blocks Phase 2 and Phase 3
- **US1 (Phase 2)**: T003 depends on T002; T004 depends on T003
- **US2 (Phase 3)**: T005 depends on T003 (needs the button to exist to trigger a logout to then verify against) — has no code of its own, so it cannot start before US1's T003 lands, but adds no new file
- **Polish (Phase 4)**: T006/T007 depend on all implementation tasks (T001–T003); T008 depends on T003; T009 depends on T004, T005, T006, T007, T008

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational — MVP
- **US2 (P2)**: Depends on US1's T003 existing (there is nothing to verify "session cannot be reused" against until logout can actually be triggered) — this is a verification-only dependency, not a shared-file dependency; it does not block or get blocked by US1's own completion of T004

### Parallel Opportunities

- T001 has no dependencies and could start immediately; T002 follows right after
- T006 and T007 (Polish) run in parallel — independent commands

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (T001–T002)
2. Complete Phase 2: US1 (T003–T004)
3. **STOP and VALIDATE**: A working "Sair" control exists on every private route and ends the session — this alone delivers the entire user-facing feature
4. Proceed to US2's verification pass to confirm the security property, not just the visible behavior

### Incremental Delivery

1. Foundational → `logout()` + `LogoutButton` exist and compile
2. US1 → control is wired into the layout and visibly works (MVP)
3. US2 → verifies the existing middleware makes US1 a real security boundary, not just a redirect
4. Polish → build + tests + edge cases + full quickstart regression

---

## Notes

- No new npm dependencies — `LogoutButton` reuses `react-dom`'s `useFormStatus`, already used by `SubmitButton.tsx`
- `middleware.ts`, `lib/auth.ts`, and `DashboardNav.tsx` are not modified by any task in this feature
- Commit after each task or logical group
- Stop at either checkpoint to validate a story independently
