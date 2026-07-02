# Quickstart: Input Length Limits Across Forms

Manual verification steps once implemented (`npm run dev` + `npm run mock`, or
`docker compose up --build`).

## Login — max length (browser)

1. On `/login`, try to type/paste an e-mail longer than 254 characters into the e-mail field.
2. **Expect**: the browser stops the field from growing past 254 characters (native `maxLength`)
   — you physically cannot type more.
3. Repeat for the password field with 128 characters.

## Login — dangerous content

1. On `/login`, enter `<script>` (or any string containing `<`/`>`) as the e-mail or password,
   with the rest of the value otherwise plausible.
2. Submit.
3. **Expect**: a clear "input rejected" message distinct from "e-mail ou senha inválidos" — the
   form does not proceed to a credential check.

## Login — still works normally

1. Log in with the real, valid credentials (from `.env`/`.env.local`).
2. **Expect**: login succeeds exactly as before — no regression (SC-002, SC-006).

## Squad name — min/max (browser)

1. Build a squad, click "Salvar Squad".
2. Try to save with a 1-character name (e.g. "A").
3. **Expect**: Salvar is disabled/blocked with a message indicating the minimum (2 characters).
4. Try to type/paste a name longer than 60 characters.
5. **Expect**: the field stops growing past 60 characters.
6. Save with a name inside the bounds (e.g. "Squad Alpha").
7. **Expect**: saves normally.

## Squad name — dangerous content

1. Repeat the save flow with a name like `<b>Alpha</b>`.
2. **Expect**: Salvar is disabled/blocked with a message indicating invalid characters.

## Squad name — bypassing the browser (backend enforcement)

1. With dev tools, or via `curl` directly against the Next.js server action endpoint (or by
   temporarily commenting out the client-side check), attempt to save a squad with a name
   outside the bounds or containing `<`/`>`.
2. **Expect**: the `saveSquad` Server Action throws/rejects — the squad is never persisted to
   the mock API.

## Search fields — max length only

1. On the Catalogue or Squads grid, try to type/paste more than 100 characters into the search
   box.
2. **Expect**: the field stops growing past 100 characters; no error message appears (there's
   nothing to submit — it's a live filter).

## No regressions

1. Run through the existing core flows (login, build squad, save, edit, delete, search, filter,
   paginate) with normal, in-bounds input.
2. **Expect**: everything behaves exactly as before this feature.
