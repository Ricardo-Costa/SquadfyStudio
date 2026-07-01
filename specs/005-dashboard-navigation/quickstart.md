# Quickstart: Manual Verification — Dashboard Navigation Shell

Prerequisites: `npm run mock` (port 3001) and `npm run dev` both running; logged in with the
fixed credentials so you land on `/dashboard`.

## US1 — Switch Between Dashboard Sections (P1)

1. Load `/dashboard` on a desktop-width window (≥1024px). Confirm a sidebar with "Catálogo" and
   "Squads" is visible, "Catálogo" marked active.
2. Click "Squads". URL becomes `/dashboard/squads`; the placeholder empty-state renders; "Squads"
   is now marked active.
3. Click "Catálogo". URL returns to `/dashboard`; the catalogue + squad panel render exactly as
   before.
4. Add 1–2 developers to the squad on Catálogo, then switch to Squads and back to Catálogo.
   Confirm the squad member list is unchanged (state preserved — FR-009).
5. Reload directly on `/dashboard/squads` (paste the URL / refresh). Confirm it loads correctly
   with "Squads" active, no error.

## US2 — Collapsible Navigation on Narrow Screens (P2)

1. Resize the window below 1024px (or use device emulation). Confirm the sidebar is replaced by a
   hamburger toggle only — no persistent nav taking up width.
2. Click the hamburger. Confirm an overlay drawer slides in with both links, and the page content
   behind it is dimmed.
3. Click the backdrop (outside the drawer). Confirm the drawer closes and you remain on the same
   section (no navigation occurred).
4. Reopen the drawer, press `Escape`. Confirm the same close-without-navigate behavior.
5. Reopen the drawer, click "Squads". Confirm the drawer closes AND the Squads section renders.
6. With the drawer open, resize the window to desktop width. Confirm the drawer closes and the
   persistent sidebar appears, still on the correct section.

## US3 — Squad Panel Precedes Catalogue on Mobile (P3)

1. On a narrow viewport (<1024px), load `/dashboard`. Confirm the page header renders, then the
   squad-in-progress panel (with metrics/save button if members are present), THEN the catalogue
   filters and listing below it.
2. Add/remove a squad member while narrow. Confirm the panel (still positioned first) updates
   immediately.
3. Widen to desktop (≥1024px). Confirm the original two-column layout returns (catalogue left,
   squad panel right) — unchanged from before this feature.

## Cross-cutting checks

- Log out (or clear the `auth-token` cookie) and attempt to load `/dashboard/squads` directly.
  Confirm redirect to `/login` (FR-013).
- Confirm `/login` never renders the dashboard nav.
- `npm run build` completes with no TypeScript errors.
