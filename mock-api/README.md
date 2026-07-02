# Squadfy Mock API

The JSON Server mock API for Squadfy Studio — a standalone Node project used both for local
development and as its own Vercel deployment, so there's exactly one implementation and one
seed data file to keep in sync.

- **Local**: `npm run mock` at the repo root installs this project's dependencies if needed and
  runs `local.js`, which starts the same app on `http://localhost:3001`.
- **Deployed**: `index.js` exports the Express app directly (no `.listen()` call) — Vercel's
  Node backend convention deploys it as a single Lambda with routes introspected automatically.

## Why /tmp instead of writing db.json directly

Vercel Functions don't have a persistent, shared filesystem, so `json-server`'s normal mode
(`--watch db.json`, writing straight to that file) doesn't work there. Both `index.js` (used
locally and on Vercel) instead copy the seed from `db.json` into `/tmp/db.json` on first run and
serve/mutate that copy.

**Data resets whenever `/tmp/db.json` goes away** — a cold start or redeploy on Vercel, or
whenever `/tmp` gets cleared locally (typically only on reboot, not on every `npm run mock`
restart). This is intentional for this project (demo/interview fixture, not real persistence) —
don't use this pattern for anything that needs durable storage. `db.json` itself is never
written to at runtime — it's just the seed, safe to edit and commit like any other source file.

## Deploying (Vercel)

1. In the Vercel dashboard, create a **new project** from this same GitHub repo.
2. Set **Root Directory** to `mock-api`. Application/Framework Preset: **Node**.
3. No build command, no output directory, no environment variables needed — Vercel detects the
   Express app from `index.js` (Node backends are deployed as a single Lambda with routes
   introspected automatically; no `vercel.json` rewrites needed).
4. Deploy. Note the resulting URL (e.g. `https://squadfy-mock-api.vercel.app`).
5. On the **main** Squadfy Studio Vercel project, set the environment variable
   `NEXT_PUBLIC_API_BASE_URL` to that URL (no trailing slash), then redeploy the main project so
   the client picks up the new value.

## Endpoints

`GET/POST /developers`, `GET/POST/PUT/DELETE /squads`, `/squads/:id`, etc. — standard
`json-server` REST conventions over `db.json`'s top-level keys.
