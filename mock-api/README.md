# Squadfy Mock API (Vercel deployment)

A standalone deployment of the same JSON Server mock API used locally (`npm run mock` at the
repo root), packaged to run as a Vercel Serverless Function.

## Why a separate project

Vercel Functions don't have a persistent, shared filesystem — `json-server`'s normal mode
(`--watch db.json`) expects a single long-running process writing to a local file, which isn't
how serverless compute works. This wraps the same `json-server` router, but points it at `/tmp`
(the only writable directory in a Vercel Function) and re-seeds from `db.json` whenever that
file doesn't exist yet.

**Data resets on cold starts, redeploys, and when a request lands on a different warm
instance.** This is intentional for this project (demo/interview fixture, not real
persistence) — do not use this pattern for anything that needs durable storage.

## Deploying

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

Same as local: `GET/POST /developers`, `GET/POST/PUT/DELETE /squads`, `/squads/:id`, etc. —
standard `json-server` REST conventions over `db.json`'s top-level keys.
