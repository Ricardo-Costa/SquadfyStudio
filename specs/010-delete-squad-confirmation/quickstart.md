# Quickstart: Delete Saved Squad with Confirmation

Manual verification steps once implemented (run `npm run dev` + `npm run mock` from the repo
root, or `docker compose up --build`).

## Happy path

1. Log in, build a squad in the Catalogue, save it (any name).
2. Go to the Squads grid, click the saved squad's card to open its detail panel.
3. Click the new delete button (next to "Editar").
4. Confirm the dialog warns the action is permanent.
5. Click confirm.
6. **Expect**: the detail panel closes, and the squad no longer appears in the Squads grid
   (refresh the page too, to confirm it's actually gone from the mock API, not just the cache).

## Cancel path

1. Repeat steps 1–3 above.
2. Click cancel (or press Escape, or click the backdrop) on the confirmation dialog.
3. **Expect**: the squad is untouched — still visible in the grid, detail panel still open.

## Builder-association clearing

1. Save a squad, then click "Editar" on it from the Squads grid to load it into the builder
   (you're now on `/dashboard/<id>`).
2. Navigate back to `/dashboard/squads`, open that same squad's detail panel, delete + confirm.
3. Navigate to `/dashboard` (the builder).
4. **Expect**: the builder is empty (not still showing the deleted squad's members) — no
   leftover association with a squad that no longer exists.

## Builder unaffected when a different squad is deleted

1. Load Squad A into the builder via "Editar".
2. Without navigating away, open the Squads grid in a new tab (or after navigating and back),
   delete a *different* Squad B, confirm.
3. Return to the builder.
4. **Expect**: Squad A's members are still loaded, association intact — deleting B did not
   touch the builder.

## Failure path (optional — requires stopping the mock API mid-flow)

1. Open a squad's detail panel, trigger delete, confirm.
2. Stop `npm run mock` (or block the mock-api container) before the request completes, if
   timing allows — or delete the same squad twice in two tabs to trigger a 404 on the second.
3. **Expect**: an inline error indication, the squad remains in the Squads grid, and the detail
   panel does not silently close.
