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
- **JSON Server** — mock REST API (data in `db.json`, script in `package.json`)
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

## Dev Commands

```bash
# Install dependencies
npm install

# Run JSON Server mock API (port 3001 by default)
npm run mock

# Run Next.js dev server
npm run dev

# Run tests
npm test

# Run a single test file
npx jest <path/to/file>

# Build for production
npm run build
```

> `npm run mock` must be running alongside `npm run dev` for API calls to work locally.

## JSON Server Setup

- Mock data lives in `db.json` at the project root
- Minimum 20 developer profiles with: `id`, `name`, `avatar`, `seniority` (`junior`|`mid`|`senior`), `cost` (number), `skills` (string[])
- Typical script: `"mock": "json-server --watch db.json --port 3001"`

## Key Folder Conventions (expected structure)

```
app/
  (auth)/login/      # login page + server action
  (private)/
    middleware.ts    # or root middleware.ts
    dashboard/       # catalogue + squad builder
context/
  squad/
    actions.ts
    reducer.ts
    SquadContext.tsx
hooks/
  useSquad.ts
lib/
  metrics.ts         # pure functions (tested with Jest)
  auth.ts            # token generation/validation
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
`specs/006-multi-squad-management/plan.md`
<!-- SPECKIT END -->
