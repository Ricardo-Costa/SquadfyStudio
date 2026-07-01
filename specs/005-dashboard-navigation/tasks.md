# Tasks: Dashboard Navigation Shell

**Input**: Design documents from `specs/005-dashboard-navigation/`

**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not included — this feature introduces no pure calculation functions (Constitution's Jest mandate is scoped to `lib/metrics.ts`, untouched here). Verification is manual via `quickstart.md`, referenced from each story's checkpoint.

**Organization**: Tasks are grouped by user story. US1 (nav shell + routing) is the MVP; US2 extends the same component for mobile; US3 is a fully independent CSS fix.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 = switch sections, US2 = collapsible mobile nav, US3 = mobile squad-panel reorder

---

## Phase 1: Setup & Foundational

**Purpose**: This feature adds no new dependencies and no backend/schema changes (per plan.md — no npm install, `db.json` untouched). US1/US2 share one new component; US3 is fully independent of it, so there is no shared scaffolding that blocks all three stories. Foundational work is limited to a verification check.

- [X] T001 Confirm the existing `middleware.ts` matcher `/dashboard/:path*` already protects the new `/dashboard/squads` route with no code change (open `middleware.ts`, verify the matcher pattern; no edit expected)

---

## Phase 2: User Story 1 - Switch Between Dashboard Sections (Priority: P1) 🎯 MVP

**Goal**: A persistent navigation with "Catálogo" and "Squads" entries lets the Tech Lead move between `/dashboard` (unchanged) and the new `/dashboard/squads` placeholder, with the active section indicated and in-progress squad state preserved across the switch.

**Independent Test**: Load `/dashboard`, confirm both nav entries are visible with "Catálogo" active; click "Squads" and confirm the placeholder renders at `/dashboard/squads` with "Squads" now active; click back to "Catálogo" and confirm the catalogue/squad state is unchanged; reload directly on `/dashboard/squads` and confirm it still resolves correctly.

### Implementation for User Story 1

- [X] T002 [P] [US1] Create `app/(private)/dashboard/squads/page.tsx` — a server component rendering a centered empty-state placeholder ("Squads chegando em breve"), no interactive elements, visually consistent with the existing squad-panel empty state in `app/(private)/dashboard/_components/SquadPanel.tsx` (icon + message pattern), per spec FR-012
- [X] T003 [P] [US1] Create `app/(private)/dashboard/_components/DashboardNav.tsx` — `'use client'`; define an internal `NavItem[]` constant per `data-model.md` (`{ label: 'Catálogo', href: '/dashboard' }`, `{ label: 'Squads', href: '/dashboard/squads' }`); use `usePathname()` from `next/navigation` to compute the active item (exact match for `/dashboard`, prefix match for `/dashboard/squads` per `research.md` §4); render a `<nav>` with a `next/link` per item, marking the active one with `aria-current="page"` and distinct styling; visible as a persistent sidebar on `lg:` and up (mobile responsiveness is added in US2 — for now it can render unconditionally)
- [X] T004 [US1] Create `app/(private)/dashboard/layout.tsx` — server component rendering `<DashboardNav />` followed by `{children}`, so it automatically wraps both `dashboard/page.tsx` and the new `dashboard/squads/page.tsx` per the plan.md structure decision (depends on T003)
- [X] T005 [US1] Manual verification against `quickstart.md` § US1 (steps 1–5): both destinations reachable and correctly active, direct reload on `/dashboard/squads` works, in-progress squad selection is preserved when switching sections (depends on T002, T004)

**Checkpoint**: User Story 1 is fully functional on desktop — nav shell + routing complete.

---

## Phase 3: User Story 2 - Collapsible Navigation on Narrow Screens (Priority: P2)

**Goal**: Below the `lg` breakpoint, the sidebar collapses into a hamburger toggle that opens an overlay drawer (dimmed backdrop), dismissible via backdrop tap, Escape, link selection, or crossing back above the breakpoint — without ever navigating unintentionally.

**Independent Test**: Resize below 1024px, confirm the sidebar is replaced by a hamburger button; open it and confirm both links appear in an overlay drawer with a dimmed backdrop; confirm backdrop click and Escape both close it without navigating; confirm selecting a link closes it and navigates; confirm resizing to desktop while open closes the drawer and restores the sidebar.

### Implementation for User Story 2

- [X] T006 [US2] Extend `app/(private)/dashboard/_components/DashboardNav.tsx` (builds on T003/T004): add `isOpen` boolean `useState(false)`; render a hamburger `<button>` (visible only below `lg:`, with `aria-label` toggling between "Abrir menu"/"Fechar menu" and `aria-expanded={isOpen}`) that toggles `isOpen`; render the nav links inside a mobile-only overlay — a full-viewport dimmed backdrop plus a slide-in panel — shown only when `isOpen` is `true` and hidden at `lg:` (where the US1 persistent sidebar already applies)
- [X] T007 [US2] In `DashboardNav.tsx`, wire dismissal behavior: clicking a nav link sets `isOpen` to `false` (in addition to navigating); clicking the backdrop sets `isOpen` to `false` without navigating; add a `useEffect` (active only while `isOpen`) that attaches a `keydown` listener closing the drawer on `Escape` without navigating (depends on T006)
- [X] T008 [US2] In `DashboardNav.tsx`, add a `useEffect` that resets `isOpen` to `false` whenever `usePathname()` changes, so the drawer never stays open across a navigation (covers the breakpoint-resize and back/forward edge cases) (depends on T006)
- [X] T009 [US2] Manual verification against `quickstart.md` § US2 (steps 1–6): sidebar↔hamburger swap at the breakpoint, drawer open/close via toggle/backdrop/Escape, drawer closes on link selection, drawer closes when resized to desktop while open (depends on T007, T008)

**Checkpoint**: User Stories 1 and 2 both work — nav shell is fully responsive.

---

## Phase 4: User Story 3 - Squad Panel Precedes Catalogue on Mobile (Priority: P3)

**Goal**: On narrow viewports, the squad-in-progress panel renders directly below the header and before the catalogue filters/listing; the desktop two-column layout is unchanged. This is a standalone CSS fix, independent of US1/US2.

**Independent Test**: View `/dashboard` on a narrow viewport and confirm the squad panel appears first (above the catalogue); confirm the desktop two-column layout (catalogue left, squad panel right) is unchanged at `lg:` and up.

### Implementation for User Story 3

- [X] T010 [P] [US3] Edit `app/(private)/dashboard/page.tsx`: within the existing `grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]` container, add `order-2 lg:order-1` to the `<CatalogueView />` element and `order-1 lg:order-2` to the `<SquadPanel />` element, so the squad panel renders first on mobile (below `lg:`) while the desktop column mapping (catalogue left, squad panel right) is visually unchanged — per `research.md` §5, this is CSS-only and does not touch either component's internals
- [X] T011 [US3] Manual verification against `quickstart.md` § US3 (steps 1–3): mobile shows squad panel directly below the header before catalogue filters/listing and updates live on add/remove; desktop shows the original two-column layout unchanged (depends on T010)

**Checkpoint**: All three user stories are independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all three stories together.

- [X] T012 [P] Run `npm run build` — confirm zero TypeScript/build errors after adding `layout.tsx`, `squads/page.tsx`, `DashboardNav.tsx`, and the `page.tsx` grid-order edit
- [X] T013 Full regression pass against `quickstart.md` "Cross-cutting checks": logged-out access to `/dashboard/squads` redirects to `/login` (confirms T001's assumption held); `/login` never renders `DashboardNav` (depends on T005, T009, T011, T012)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup/Foundational (Phase 1)**: No dependencies — T001 can run anytime, including in parallel with early US1 work (it's a read-only check)
- **US1 (Phase 2)**: No dependency on Phase 1 completing first; T002 and T003 run in parallel, T004 depends on T003, T005 depends on T002 + T004
- **US2 (Phase 3)**: Depends on US1's T003/T004 (extends the same `DashboardNav.tsx` and relies on the layout being wired) — T006 → T007 & T008 (can run together once T006 lands) → T009
- **US3 (Phase 4)**: Fully independent of US1/US2 — T010 can start any time (even in parallel with Phase 2/3); T011 depends on T010
- **Polish (Phase 5)**: T012 depends on all implementation tasks (T002–T004, T006–T008, T010); T013 depends on T005, T009, T011, T012

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories — MVP
- **US2 (P2)**: Builds on US1's `DashboardNav.tsx`/`layout.tsx` (same file, extended) — cannot start meaningfully before T003/T004 exist, but is independently testable once done
- **US3 (P3)**: No dependency on US1 or US2 — can be implemented and tested in complete isolation, in parallel with either

### Parallel Opportunities

- T002 and T003 (both US1) run in parallel — different files
- T010 (US3) can run in parallel with any US1/US2 task — different file, zero overlap
- T007 and T008 (both US2, both edit `DashboardNav.tsx`) are NOT parallel — same file, apply sequentially after T006

---

## Parallel Example: Phase 2 (US1) + Phase 4 (US3)

```bash
# These can all be worked simultaneously — no file overlap:
Task T002: "Create app/(private)/dashboard/squads/page.tsx placeholder"
Task T003: "Create app/(private)/dashboard/_components/DashboardNav.tsx"
Task T010: "Add order-* utilities to app/(private)/dashboard/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (T001 — quick check)
2. Complete Phase 2: US1 (T002–T005)
3. **STOP and VALIDATE**: nav shell works on desktop, both routes reachable, squad state preserved
4. Demo if ready — this alone satisfies the "base estrutural" goal of the feature

### Incremental Delivery

1. Phase 1 → quick auth-matcher check done
2. US1 → nav shell + routing works (MVP)
3. US2 → nav is fully responsive (mobile hamburger/drawer)
4. US3 → mobile squad-panel ordering fixed (can be delivered independently, any time, even before US1/US2)
5. Polish → build + full quickstart regression

### Parallel Team Strategy

With two developers: Developer A takes US1 → US2 (sequential, same file); Developer B takes US3 in parallel from the start (zero file overlap) and can finish before US1/US2 land.

---

## Notes

- No new npm dependencies — drawer is a plain `useState` + Tailwind implementation (Constitution Principle V)
- `DashboardNav.tsx` is the single new interactive component; US1 builds its core (links + active state + desktop sidebar), US2 extends the same file with mobile hamburger/drawer behavior — do not split it into multiple files/abstractions
- US3's `order-*` fix in `page.tsx` must NOT change DOM order or touch `SquadPanel.tsx`/`CatalogueView.tsx` internals, to avoid any risk to existing tests/behavior
- Commit after each task or logical group
- Stop at any checkpoint to validate a story independently
