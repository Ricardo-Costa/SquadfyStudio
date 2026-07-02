# Implementation Plan: Delete Saved Squad with Confirmation

**Branch**: `010-delete-squad-confirmation` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-delete-squad-confirmation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a permanent-delete action for a saved squad, triggered from the squad's detail panel next
to the existing "Editar" button, gated behind the app's existing `ConfirmDialog` pattern. The
delete request goes through a new Server Action (`deleteSquad`) mirroring the existing
`saveSquad` action — `fetch(DELETE /squads/:id)` against the mock API, which already supports
`DELETE` on any resource via `json-server`'s default router (no backend change needed). On
success, the squads list (owned by React Query) is invalidated, the detail panel closes, and if
the deleted squad was the one currently loaded in the squad builder, the builder's association is
cleared via the existing `resetSquad()` action — reusing the exact mechanism `ClearSquadAssociation`
already uses for the same purpose.

## Technical Context

**Language/Version**: TypeScript 5.8, strict mode (existing project setting, unchanged)

**Primary Dependencies**: Next.js 15 (App Router, Server Actions), React 19, TanStack React
Query 5 (squads list invalidation), Tailwind CSS (styling, no new classes beyond existing
patterns)

**Storage**: JSON Server mock API (`mock-api/`) — `DELETE /squads/:id` is already supported by
`json-server`'s default router; no schema or endpoint changes required

**Testing**: Jest (existing suite) — this feature adds no new pure functions to
`frontend/lib/`, so no new unit-test obligation under the constitution's testing rule; existing
`frontend/lib/squad/metrics.test.ts` / `pagination.test.ts` are unaffected and must continue to
pass

**Target Platform**: Web (existing Next.js app, `frontend/`)

**Project Type**: Web application (existing monorepo: `frontend/` + `mock-api/`) — this feature
only touches `frontend/`

**Performance Goals**: N/A — single fetch on user-triggered action, no new rendering hot path

**Constraints**: Must not introduce a new confirmation UI paradigm (constitution Principle V,
Simplicity) — reuse `ConfirmDialog` as-is; must not violate the React Query / Context state
split (constitution Principle II)

**Scale/Scope**: One new Server Action, changes confined to two existing files
(`frontend/app/(private)/dashboard/actions.ts`, `frontend/app/(private)/dashboard/_components/SquadDetailPanel.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Server-Side Authentication (NON-NEGOTIABLE)** — N/A to this feature; no change to auth,
  and the delete action itself runs behind the existing `/dashboard` middleware gate like every
  other dashboard interaction. **PASS**.
- **II. Strict State Management Split (NON-NEGOTIABLE)** — The delete mutation invalidates the
  `['squads']` React Query cache (server state, owned by React Query) and, separately, calls the
  existing `resetSquad()` action (client state, owned by Context/useReducer) only when the
  deleted squad is the one currently loaded in the builder. No mixing: the Server Action never
  touches Context state, and the Context update never touches server data. **PASS**.
- **III. Optimized Rendering (NON-NEGOTIABLE)** — No new metrics calculations are introduced.
  **PASS**.
- **IV. Feature-Driven Delivery** — This is a post-MVP addition on top of an already-delivered,
  functioning `004-metrics-and-persistence` foundation; it does not reorder or block the
  original delivery sequence. **PASS**.
- **V. Simplicity Over Abstraction** — Reuses `ConfirmDialog` verbatim (no new dialog
  component), mirrors `saveSquad`'s existing Server Action + `idle`/`loading`/`error` state
  pattern (already established by `SaveSquadButton`) instead of inventing a new one, and adds
  the delete button/dialog inline in `SquadDetailPanel` rather than extracting a new component,
  since (unlike `SaveSquadButton`/`NewSquadButton`) it has no second render location. **PASS**.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/010-delete-squad-confirmation/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   └── (private)/
│       └── dashboard/
│           ├── actions.ts                        # ADD: deleteSquad(id) Server Action
│           └── _components/
│               └── SquadDetailPanel.tsx           # MODIFY: delete button + confirm dialog + handling
└── lib/
    └── config.ts                                  # unchanged — reuses existing SERVER_API_BASE_URL

mock-api/                                          # UNCHANGED — DELETE /squads/:id already
                                                     # supported by json-server's default router
```

**Structure Decision**: Single existing Next.js app (`frontend/`) in the established monorepo
(`frontend/` + `mock-api/`, see `CLAUDE.md`). This feature is a small, self-contained addition
entirely within `frontend/app/(private)/dashboard/` — no new top-level directories, no
`mock-api/` changes, no new shared `lib/` modules.

## Complexity Tracking

*No entries — Constitution Check passed with no violations.*
