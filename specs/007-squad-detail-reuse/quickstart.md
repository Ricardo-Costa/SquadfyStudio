# Quickstart: Manual Verification — Squad Detail Panel & Reuse

Prerequisites: `npm run mock` (port 3001) and `npm run dev` both running; logged in; at least 2-3
squads already saved (via the existing 006 flow) with different member counts/seniority mixes.

## US1 — View Full Squad Details (P1)

1. Open `/dashboard/squads`. Click a squad card. Confirm a detail panel opens beside the grid
   (desktop) showing: every member individually (name, seniority, cost), the complete list of
   distinct skills (not just a count), and the same aggregate metrics as the card.
2. Click the panel's close control. Confirm the panel closes and the grid is unchanged.
3. With the panel open for squad A, click squad B's card. Confirm the panel updates to squad B's
   details without needing to close first.
4. If a legacy squad (no `name`) exists, click it — confirm its panel shows the same fallback label
   already on its card, no error.
5. On a narrow viewport, confirm the panel appears above the grid when open (mirrors the catalogue's
   mobile squad-panel placement from 005).

## US2 — Edit and Re-save a Saved Squad (P2)

1. Open a squad's detail panel, click "Editar" (builder empty beforehand). Confirm no confirm
   dialog appears (nothing to lose) and you land on `/dashboard` with that squad's members already
   selected in the builder.
2. Add one developer, remove one developer. Confirm the builder behaves normally (5-member cap
   still enforced).
3. Click "Save Squad". Confirm the name modal opens pre-filled with the original squad's name
   (editable). Confirm it unchanged.
4. Verify via `curl http://localhost:3001/squads/<id>` that the same `id` now reflects the updated
   member list and a refreshed `savedAt`, and that `curl http://localhost:3001/squads` shows no new
   extra record was created.
5. Navigate to `/dashboard/squads` and confirm the edited squad's card reflects the new data
   immediately (no manual refresh needed — cache invalidation, `research.md` §5).
6. Repeat steps 1–3, but this time save with a *different* name. Confirm the record's name changes,
   same `id`.
7. Build a squad from scratch (don't load one), click "Save Squad" — confirm the modal is blank as
   before (006 behavior unaffected for non-edit saves).
8. Load a squad via "Editar", then manually remove every member from the builder, then add
   different members and save. Confirm this creates a **new** record (not an update to the
   originally-loaded squad) — per FR-010b.
9. Load squad A via "Editar" (builder now has A's members, unsaved). Without saving, click "Editar"
   on squad B. Confirm a blocking confirm dialog appears; canceling leaves A's members in the
   builder untouched and does not navigate; confirming replaces the builder with B's members.

## US3 — Reliable Avatar Display on Squad Cards (P3)

1. Temporarily point a member's `avatar` URL at an unreachable address (e.g., edit `db.json`
   directly for a test squad, or throttle/block the dicebear domain). Reload the Squads screen.
   Confirm a fallback avatar (initials-based) renders instead of a broken-image icon — matching
   `DeveloperCard`'s existing fallback.

## Cross-cutting checks

- `npm run build` completes with no TypeScript errors.
- `npm test` — existing `lib/metrics.test.ts` suite (14 tests) still passes unmodified.
- Confirm the existing squad-builder page (`/dashboard`) still works normally when reached directly
  (not via "Editar") — `editingSquadId`/`editingSquadName` stay `null` for a from-scratch session.
