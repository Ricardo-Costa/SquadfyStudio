# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Spec-Driven Development (Speckit)

This project uses **Speckit** (v0.8.13) for spec-driven development with the Claude integration. The full SDD cycle runs through these slash commands in order:

| Command | Purpose |
|---|---|
| `/speckit-constitution` | Define project principles and governance |
| `/speckit-specify <description>` | Generate a feature spec in `specs/<NNN>-<name>/spec.md` |
| `/speckit-clarify` | Resolve open questions in the spec |
| `/speckit-plan` | Generate implementation plan + data model + contracts |
| `/speckit-tasks` | Break plan into executable tasks |
| `/speckit-implement` | Execute tasks from `tasks.md` |
| `/speckit-analyze` | Analyze existing code against spec |
| `/speckit-checklist` | Generate quality checklists |

**Git extension** is active with `auto_execute_hooks: true`. It automatically creates a feature branch before `/speckit-specify` and offers auto-commits before/after every other step. Spec directories are numbered sequentially (`specs/001-`, `specs/002-`, …).

The text between `<!-- SPECKIT START -->` and `<!-- SPECKIT END -->` at the bottom of this file is managed by Speckit — `/speckit-plan` updates it to point to the current plan file. Do not edit that block manually.

---

## Project Overview

**Squadfy Studio** — a Tech Lead dashboard where users can browse a developer catalogue, build a squad of up to 5 members, view real-time squad metrics, and save the squad composition. Full spec in `project.md`.

## Stack (mandatory)

- **Next.js 15+** — App Router only (no Pages Router)
- **TypeScript** — strict mode
- **Tailwind CSS** — responsive layout
- **React Query** — server state (catalogue fetching, cache, loading/error)
- **Context API + useReducer** — global client state for squad management
- **JSON Server** — mock REST API (`mock-api/` — standalone project, seed data in `mock-api/db.json`)
- **Jest** — unit tests for metric calculation functions

## Architecture Constraints

### Authentication
- Login via **Server Action** (not a client-side fetch)
- On success, generate a token stored in an **HttpOnly cookie**
- Middleware protects `/dashboard` and all private routes — redirect to `/login` if no valid cookie

### State Management split
- **React Query** owns catalogue data (developers list from JSON Server)
- **Context API + useReducer** owns squad state (selected members)
  - Keep actions and reducer in separate files (`actions.ts` / `reducer.ts`)
  - Expose squad state via a custom hook (e.g., `useSquad`)

### Metrics Panel
- Recompute on every squad change: total cost, average seniority level, skill coverage
- Use `useMemo` (or equivalent) to avoid unnecessary recalculations — this is explicitly evaluated

### Persistence
- "Save Squad" sends data to JSON Server via a **Server Action** (POST), not a direct client fetch

## Repo Layout (monorepo)

The repo root holds only project-wide concerns (Speckit, docs, cross-cutting scripts) plus a
thin `package.json` that orchestrates two independent subprojects:

- **`frontend/`** — the Next.js app (own `package.json`, `node_modules`, `tsconfig.json`, etc.)
- **`mock-api/`** — the JSON Server mock API (own `package.json`, deployed standalone to Vercel)

Root-level `npm run <script>` commands just delegate via `npm --prefix frontend|mock-api run <script>`
— see `package.json` at the repo root.

## Dev Commands

```bash
# Install frontend app dependencies (run once, or after pulling dependency changes)
npm --prefix frontend install

# Run JSON Server mock API (port 3001 by default) — installs mock-api deps on first run
npm run mock

# Run Next.js dev server
npm run dev

# Run tests
npm test

# Run a single test file
cd frontend && npx jest <path/to/file>

# Build for production
npm run build

# Kill anything stuck on ports 3000/3001
npm run free-ports
```

> `npm run mock` must be running alongside `npm run dev` for API calls to work locally. All of
> these are run from the **repo root**.

## Running via Docker Compose

`docker compose up --build` runs both services (`frontend` on :3000, `mock-api` on :3001) in
containers — a self-contained alternative to `npm run dev` + `npm run mock` that doesn't need
Node installed on the host.

- Requires `frontend/.env` to exist first (copy from `frontend/.env.example`) — Compose reads
  `AUTH_EMAIL`/`AUTH_PASSWORD`/`AUTH_SECRET` from it via `env_file`.
- `NEXT_PUBLIC_API_BASE_URL` is fixed to `http://localhost:3001` at build time (the browser runs
  outside the Compose network, so it must hit the host-published port). The frontend's Server
  Actions instead use `API_BASE_URL=http://mock-api:3001` (the internal Docker network hostname),
  set directly in `docker-compose.yml` — see `lib/config.ts`'s `SERVER_API_BASE_URL` split.
- `mock-api` has a healthcheck; `frontend` waits for it (`depends_on: condition: service_healthy`)
  before starting.
- `docker compose down` stops both; add `-v` only if you want to drop the (anonymous, currently
  unused) volume state too.

## JSON Server Setup

- Mock API lives in `mock-api/` — a standalone Node project (own `package.json`,
  `node_modules`), used both for local dev and as its own Vercel deployment. There is no
  `db.json` at the repo root; `mock-api/db.json` is the single source of truth for developer
  seed data.
- Minimum 20 developer profiles with: `id`, `name`, `avatar`, `seniority` (`junior`|`mid`|`senior`), `cost` (number), `skills` (string[])
- `npm run mock` (at the repo root) installs `mock-api`'s dependencies if needed and runs
  `mock-api/local.js`, which wraps the same Express app deployed to Vercel (`mock-api/index.js`)
  with a `.listen(3001)` call. See `mock-api/README.md` for the Vercel deployment side.

## Key Folder Conventions (expected structure)

```
package.json         # root orchestrator only (delegates to frontend/ and mock-api/)
mock-api/             # standalone JSON Server project — see mock-api/README.md
frontend/
  app/
    (auth)/login/      # login page + server action
    (private)/
      middleware.ts    # or frontend/middleware.ts
      dashboard/       # catalogue + squad builder
  context/
    squad/
      actions.ts
      reducer.ts
      SquadContext.tsx
  hooks/
    useSquad.ts
  lib/
    config.ts          # central constants (page size, limits, timeouts, URLs)
    types.ts           # shared TypeScript types
    auth/
      auth.ts          # token generation/validation
      rate-limit.ts    # login attempt rate limiting
    squad/
      metrics.ts       # pure functions (tested with Jest)
      squads.ts        # squad display helpers
      pagination.ts    # catalogue/squads grid pagination
```

## Credential Fixture

Fixed credentials for login (define in env or hardcode in the server action for the mock):
- **email:** defined per spec (use `.env.local` for the values)
- **password:** same

## Deadlines & Delivery

- Deadline: **2026-07-02**
- Deliver a public GitHub repo with a `README.md` that includes run instructions and an "Architectural Decisions" section
- Optional: deploy to Vercel

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan at
`specs/009-logout-action/plan.md`
<!-- SPECKIT END -->
