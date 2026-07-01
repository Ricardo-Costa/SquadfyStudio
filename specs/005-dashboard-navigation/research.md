# Phase 0 Research: Dashboard Navigation Shell

## 1. Where does the nav shell live?

**Decision**: New `app/(private)/dashboard/layout.tsx`, nested under the existing
`app/(private)/layout.tsx` (which keeps owning `Providers` + `SquadProvider`).

**Rationale**: Next.js App Router layouts wrap every nested route automatically. Placing the nav
in `dashboard/layout.tsx` means both `dashboard/page.tsx` (Catálogo) and the new
`dashboard/squads/page.tsx` get it for free, with zero duplication and no prop drilling. It also
keeps the existing `(private)/layout.tsx` focused on its current single responsibility
(providers), matching Constitution Principle V.

**Alternatives considered**:
- Render the nav inside `dashboard/page.tsx` itself and duplicate it in `squads/page.tsx` — rejected, violates DRY and risks the two copies drifting.
- Put the nav in `(private)/layout.tsx` — rejected, that layout also wraps any future non-dashboard private route (none exist today, but the nav is dashboard-specific per FR-008, so scoping it to `dashboard/layout.tsx` is the tighter fit).

## 2. Route for the Squads placeholder

**Decision**: New file route `app/(private)/dashboard/squads/page.tsx`.

**Rationale**: Clarification session locked `/dashboard/squads` as the URL (Q1). A dedicated
`page.tsx` under a `squads/` segment is the direct, idiomatic App Router way to get that URL with
its own server component, satisfying FR-004 (direct navigation/reload/bookmark must work) without
any client-side routing trick.

**Alternatives considered**:
- Query-param-based section switching (`/dashboard?section=squads`) — rejected in clarification (Option C).
- Parallel/intercepting routes — unnecessary complexity for a static placeholder; rejected per Principle V.

## 3. Drawer implementation (mobile overlay)

**Decision**: Plain `useState`-controlled `<div>` overlay with a semi-transparent backdrop,
rendered directly inside `DashboardNav.tsx`. No new npm dependency.

**Rationale**: The clarification session settled on "overlay drawer that dims content, dismissible
via backdrop tap or Escape" (Q2) — a well-understood pattern implementable with existing tools
(`useState` + `useEffect` for the Escape listener + Tailwind for position/transition/backdrop).
Adding a headless-UI or dialog library would be a new dependency for a two-item menu, which fails
Constitution Principle V's bar ("justify any complexity beyond the required stack").

**Alternatives considered**:
- `@headlessui/react` `Dialog`/`Disclosure` — rejected, unnecessary dependency for 2 static links.
- Native `<dialog>` element — rejected, inconsistent backdrop/animation behavior across the
  project's supported browsers and no clear benefit over a controlled div for this scope.

## 4. Active-link detection

**Decision**: `usePathname()` from `next/navigation` inside `DashboardNav.tsx` (a client
component). "Catálogo" is active on exact match `/dashboard`; "Squads" is active when the pathname
starts with `/dashboard/squads`.

**Rationale**: `usePathname()` is the standard App Router primitive for this and requires no
additional state, context, or prop passed down from a server component — it reads directly from
the router. Exact-match for Catálogo avoids it appearing active while viewing Squads (since
`/dashboard/squads` also starts with `/dashboard`).

**Alternatives considered**:
- Passing the active section as a layout prop computed server-side — rejected, more indirection for no benefit since `usePathname()` is already the idiomatic client-side answer and the nav must be interactive (toggle) anyway, so it is a client component regardless.

## 5. Mobile squad-panel reorder

**Decision**: Add Tailwind `order-*` utilities to the two children of the existing grid in
`dashboard/page.tsx` — `SquadPanel` gets `order-1 lg:order-2`, `CatalogueView` gets
`order-2 lg:order-1` — leaving DOM order and both components' internals untouched.

**Rationale**: `order-*` is a pure CSS reorder; it satisfies FR-010/FR-011 (mobile: squad panel
first; desktop: unchanged two-column layout) without moving JSX/DOM nodes, so no existing tests or
component logic in `SquadPanel`/`CatalogueView` need to change. This is the minimal-risk approach
given the tight delivery timeline.

**Alternatives considered**:
- Physically swapping the JSX order of `<CatalogueView />` and `<SquadPanel />` — rejected; would require re-verifying the `lg:grid-cols-[1fr_340px]` column mapping still assigns the correct component to each column, adding avoidable risk for no behavioral difference from the CSS-only fix.
- `flex-direction: column-reverse` on mobile — rejected; would also reverse internal stacking assumptions and is less explicit than per-item `order-*`.

## 6. Escape-key and outside-click dismissal

**Decision**: A single `useEffect` in `DashboardNav.tsx`, active only while the drawer is open,
that attaches a `keydown` listener (closes on `Escape`) and relies on a full-viewport backdrop
element whose `onClick` also closes the drawer (no separate "outside click" detection needed since
the backdrop *is* the outside area).

**Rationale**: This satisfies FR-006 and the corresponding edge case (dismiss must not navigate)
with the smallest possible implementation — no dependency, no ref-based outside-click library.

**Alternatives considered**:
- `mousedown` on `document` with ref containment checks — rejected as unnecessary; the backdrop element already exclusively covers the "outside" area, making containment checks redundant.
