# Implementation Plan: Input Length Limits Across Forms

**Branch**: `011-input-length-limits` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-input-length-limits/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add centrally-defined length limits (and, for the three fields that submit to a backend, a
dangerous-HTML-content check) to five existing text fields: login e-mail, login password, squad
name (create/edit), Catalogue search, and Squads search. Enforcement is layered per the
Clarifications: browser-side via the native `maxLength` HTML attribute plus inline validation
messages, and — for login and squad name only, since those are the fields that actually reach a
backend — the exact same checks are repeated inside the existing `login` and `saveSquad` Server
Actions, so a request that bypasses the browser entirely is still rejected. All limit values and
the dangerous-content check live in two small new/extended modules (`lib/config.ts` constants,
new `lib/validation.ts` pure functions) so there is exactly one source of truth shared by both
the browser-side and backend-side checks.

## Technical Context

**Language/Version**: TypeScript 5.8, strict mode (existing project setting, unchanged)

**Primary Dependencies**: Next.js 15 (App Router, Server Actions — `login`, `saveSquad`), React
19 (form components), no new npm dependency — deliberately not adding a validation library
(zod/yup/etc.) since the rule set is three small, pure, independently testable functions
(constitution Principle V, Simplicity)

**Storage**: N/A — this feature only adds rejection paths before any request reaches the mock
API; no schema or persisted-data change

**Testing**: Jest — the new `frontend/lib/validation.ts` pure functions get a co-located
`validation.test.ts`, following the same pattern as `lib/squad/metrics.test.ts` /
`lib/squad/pagination.test.ts`

**Target Platform**: Web (existing Next.js app, `frontend/`)

**Project Type**: Web application (existing monorepo: `frontend/` + `mock-api/`) — this feature
only touches `frontend/`

**Performance Goals**: Rejection must be perceived as instant (SC-004, <100ms) — trivially met,
since all checks are synchronous string operations with no I/O

**Constraints**: Limit values MUST NOT change the outcome of any already-valid login or squad
save (SC-002, SC-006) — chosen constants are deliberately generous (see spec Assumptions) to
guarantee this; MUST NOT introduce a new abstraction/library beyond what three pure functions
and five constants require (constitution Principle V)

**Scale/Scope**: Two new files (`lib/validation.ts` + its test), five constants added to
`lib/config.ts`, six existing files modified (`login/actions.ts`, `LoginInput.tsx`,
`LoginForm.tsx`, `dashboard/actions.ts`, `SaveSquadModal.tsx`, `FilterBar.tsx`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Server-Side Authentication (NON-NEGOTIABLE)** — The new login validation (length +
  dangerous-content checks) is added *inside* the existing `login` Server Action, before the
  credential comparison — no client-side fetch is introduced; the auth decision remains
  entirely server-side. **PASS**.
- **II. Strict State Management Split (NON-NEGOTIABLE)** — No server/client state management is
  touched. The new validation functions are pure (no React Query, no Context) and are called
  synchronously from existing component state (`SaveSquadModal`'s local `name` state) and
  existing Server Actions. **PASS**.
- **III. Optimized Rendering (NON-NEGOTIABLE)** — N/A: no metrics calculation is added. The new
  validation checks are trivial synchronous string operations of the same cost class as the
  existing unmemoized `trimmed === ''` check already in `SaveSquadModal`, so no new
  memoization is warranted. **PASS**.
- **IV. Feature-Driven Delivery** — Post-MVP addition on top of the already-delivered
  `004-metrics-and-persistence` and `010-delete-squad-confirmation` features; does not reorder
  or block prior delivery. **PASS**.
- **V. Simplicity Over Abstraction** — Three small pure functions and five named constants,
  reusing the native HTML `maxLength` attribute for browser-side max-length capping instead of
  hand-rolled JS; no new npm dependency (a validation library would be overkill for this rule
  set); the exact same functions are called from both the browser-side (component) and
  backend-side (Server Action) contexts — no duplicated logic. **PASS**.

No violations — Complexity Tracking table is not needed.

## Project Structure

### Documentation (this feature)

```text
specs/011-input-length-limits/
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
├── lib/
│   ├── config.ts                                  # ADD: 5 new length-limit constants
│   ├── validation.ts                              # NEW: containsDangerousContent,
│   │                                               #      exceedsMaxLength, isBelowMinLength
│   └── validation.test.ts                         # NEW: Jest coverage for the above
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       ├── actions.ts                         # MODIFY: validate email/password before
│   │       │                                       #   rate-limit check + credential compare
│   │       └── _components/
│   │           ├── LoginInput.tsx                 # MODIFY: add maxLength prop
│   │           └── LoginForm.tsx                  # MODIFY: pass maxLength; render new
│   │                                               #   validation_error message
│   └── (private)/
│       └── dashboard/
│           ├── actions.ts                         # MODIFY: validate squad name in saveSquad
│           └── _components/
│               ├── SaveSquadModal.tsx             # MODIFY: client-side length/content
│               │                                  #   validation + maxLength attribute
│               └── FilterBar.tsx                  # MODIFY: add maxLength to search input
│                                                   #   (shared by Catalogue + Squads search)

mock-api/                                          # UNCHANGED — no backend/API changes
```

**Structure Decision**: Single existing Next.js app (`frontend/`), no new top-level directories.
The only new files are one small pure-function module and its test, following the exact
placement convention already established by `lib/squad/metrics.ts` /
`lib/squad/metrics.test.ts`. Everything else is a small, targeted edit to existing files.

## Complexity Tracking

*No entries — Constitution Check passed with no violations.*
