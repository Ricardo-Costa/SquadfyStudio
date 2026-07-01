# Quickstart: Manual Verification — Multi-Squad Browsing & Comparison

Prerequisites: `npm run mock` (port 3001) and `npm run dev` both running; logged in; `005-dashboard-navigation`
merged/present so `/dashboard/squads` and the nav shell already exist.

## US1 — Name a Squad When Saving (P1)

1. Build a squad with 1+ members on `/dashboard`, click "Save Squad". Confirm a modal opens with an
   empty, focused name field (never pre-filled, even after a previous save in the same session).
2. Try confirming with an empty/whitespace-only name. Confirm the confirm action stays disabled and
   a validation message appears.
3. Enter a name, confirm. Confirm the modal closes, the existing "Salvo ✓" button feedback appears,
   and `curl http://localhost:3001/squads` shows the new record including the `name` field.
4. Save two squads with the identical name. Confirm both persist as separate records (distinct `id`).
5. Open the modal again, then dismiss via Cancel, via clicking the backdrop, and via `Escape` (three
   separate attempts). Confirm each time: no new record is created and the squad builder is unaffected.

## US2 — Browse and Compare Saved Squads (P2)

1. With 3+ named squads saved (from US1), navigate to the Squads section via the nav. Confirm one
   card renders per saved squad, each showing name, member avatars/count, total cost, average
   seniority, and skill count — verify at least one card's numbers match its members manually.
2. Stop `npm run mock`, reload the Squads section. Confirm an error state renders (no partial/broken
   cards). Restart `npm run mock`.
3. Throttle network (or observe on first load) to confirm a loading indicator appears before cards render.
4. If feasible, POST a squad record directly to `/squads` without a `name` field (simulating a
   legacy 004-era record) and confirm its card shows a fallback label derived from its `savedAt`
   date instead of a blank/broken name.
5. With zero squads saved (fresh `db.json` `"squads": []`), confirm a distinct "no squads saved yet"
   empty state renders — not an empty grid, not an error.

## US3 — Search and Filter Saved Squads (P3)

1. With several distinctly-named squads of different seniority profiles saved, type a fragment of
   one squad's name into the search field. Confirm only matching cards remain.
2. Clear the search, toggle a seniority filter pill. Confirm only cards whose computed average
   seniority matches remain.
3. Combine a search fragment with a seniority filter. Confirm only cards matching both are shown.
4. Enter a search term that matches nothing. Confirm a "no results" message appears, distinct from
   the "no squads saved yet" empty state from US2.
5. Clear all search/filter criteria. Confirm the full list of saved squads returns.

## Cross-cutting checks

- `npm run build` completes with no TypeScript errors after the `saveSquad` signature change and
  the `SavedSquad` type relocation to `lib/types.ts`.
- `npm test` — existing `lib/metrics.test.ts` suite still passes unmodified (metrics functions
  themselves are untouched by this feature).
- Confirm `SaveSquadButton`'s existing empty-squad-disable behavior (from 004) is still intact —
  the modal should not even be reachable when the squad builder has zero members.
