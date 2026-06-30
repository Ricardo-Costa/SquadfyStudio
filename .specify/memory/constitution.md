<!--
SYNC-IMPACT-REPORT
Version change: 1.0.0 → 1.1.0 (MINOR — new Git discipline rules added)
Added sections:
  - Development Workflow: branch protection rule (no direct commits to main)
  - Development Workflow: atomic commit discipline rule
Modified principles: None
Templates requiring updates:
  - .specify/templates/plan-template.md ✅ aligned
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
Follow-up TODOs: None.
-->

# Squadfy Studio Constitution

## Core Principles

### I. Server-Side Authentication (NON-NEGOTIABLE)

All authentication MUST be handled via Next.js Server Actions — never via client-side fetch.
Session tokens MUST be stored exclusively in HttpOnly cookies; localStorage and sessionStorage
are prohibited for auth data. Middleware MUST protect every route under `/dashboard` (and any
future private routes), redirecting unauthenticated requests to `/login`.

**Rationale**: Explicit security requirement from the challenge spec. HttpOnly cookies prevent
XSS-based token theft; server-side auth prevents token exposure inside client bundles.

### II. Strict State Management Split (NON-NEGOTIABLE)

**React Query** MUST own all server state (developer catalogue fetched from JSON Server):
fetching, caching, loading states, and error handling.
**Context API + useReducer** MUST own all client state (squad composition). Actions and
reducer MUST live in separate files (`context/squad/actions.ts` and `context/squad/reducer.ts`).
Squad state MUST be consumed exclusively via a custom hook (`hooks/useSquad.ts`).
Mixing server and client state managers in the same concern is prohibited.

**Rationale**: The challenge explicitly evaluates this architectural split as a graded
technical requirement. Merging the concerns will fail the evaluation criteria.

### III. Optimized Rendering (NON-NEGOTIABLE)

Metrics calculations (total cost, average seniority level, skill coverage) MUST be wrapped in
`useMemo` or equivalent memoization so they recompute only on squad state changes. Components
MUST NOT trigger unnecessary re-renders from unrelated state updates. Pure calculation logic
MUST live in `lib/metrics.ts` and be free of side effects.

**Rationale**: The challenge specification explicitly states metrics calculation must be
optimized to avoid unnecessary renders — this is a graded evaluation criterion.

### IV. Feature-Driven Delivery

Implementation MUST proceed through independently deliverable features in dependency order:
`001-auth` → `002-catalogue` → `003-squad-builder` → `004-metrics-and-persistence`.
Each feature MUST be independently testable and functional before the next feature begins.
Server Actions MUST be used for both the login operation and the squad save (POST) operation.

**Rationale**: Ordered delivery ensures each architectural layer is stable before the next
depends on it. Auth gates the dashboard; catalogue data feeds the squad builder state.

### V. Simplicity Over Abstraction

No layers, patterns, or abstractions beyond what the requirements explicitly demand are
permitted. Three similar lines of code are preferable to a premature abstraction. Any
complexity introduced beyond the required stack MUST be justified in the feature plan's
Complexity Tracking table with a concrete reason and rejected simpler alternatives.
Type `any` in TypeScript is prohibited — use proper types or `unknown` with narrowing.

**Rationale**: The evaluation rewards correct and deliberate architectural choices over
clever ones. Unnecessary abstraction adds delivery risk with no benefit in a time-boxed
challenge.

## Mandatory Tech Stack

The following stack is FIXED. Substitutions require explicit documented justification in the
relevant `plan.md` under Complexity Tracking:

- **Framework**: Next.js 15+ — App Router only. Pages Router is prohibited.
- **Language**: TypeScript — strict mode (`"strict": true` in `tsconfig.json`). `any` is prohibited.
- **Styling**: Tailwind CSS — utility-first, responsive layout required.
- **Server State**: React Query (TanStack Query) — catalogue data only.
- **Client State**: Context API + useReducer — squad composition only.
- **Mock API**: JSON Server — data in `db.json`, port 3001, script `npm run mock`.
- **Testing**: Jest — unit tests MUST cover all functions in `lib/metrics.ts`.

## Development Workflow

- JSON Server (`npm run mock`) MUST be running alongside the Next.js dev server (`npm run dev`).
- Every new feature MUST start from a dedicated feature branch (via `/speckit-git-feature`).
- Metric functions in `lib/metrics.ts` MUST have Jest unit test coverage before the feature
  that uses them is considered complete.
- Login credentials MUST be stored in `.env.local` and never hardcoded in source files.
- The final repository MUST include a `README.md` with run instructions and an
  "Architectural Decisions" section, delivered before the 2026-07-02 deadline.
- The delivered repository MUST be public on GitHub.

### Speckit Workflow Discipline (NON-NEGOTIABLE)

All Speckit artifacts (`spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`) MUST be generated exclusively through the designated Speckit
slash commands. Manual creation or direct editing of these files outside of the command cycle
is PROHIBITED. The enforced command sequence is:

```
/speckit-specify → /speckit-clarify → /speckit-plan → /speckit-tasks → /speckit-implement
```

Each artifact is the authoritative output of its command. Any deviation (e.g., manually
writing a `spec.md` or editing `plan.md` without running `/speckit-plan`) breaks the audit
trail and invalidates the downstream workflow.

**Rationale**: The spec-driven cycle is the source of truth for architectural decisions,
task traceability, and delivery audit. Manual edits outside the commands undermine
reproducibility and reviewability of every feature decision.

### Git Discipline (NON-NEGOTIABLE)

**Branch protection**: Direct commits to `main` are PROHIBITED. All work MUST land on
a feature branch and be merged via pull request. No exceptions, including hotfixes or
"quick" changes.

**Atomic commits**: Every commit MUST represent a single, coherent unit of change with a
clear and specific message. Bundling unrelated file changes from different contexts into
one commit is PROHIBITED. Commit messages MUST describe exactly WHAT changed and WHY —
generic messages such as "fix", "update", "changes", or "wip" are not acceptable.
Acceptable format: `<type>(<scope>): <concise description>` (e.g.,
`feat(auth): add HttpOnly cookie generation on login success`).

## Governance

This constitution supersedes all other conventions, preferences, or informal practices in
this repository. Any deviation from a principle marked NON-NEGOTIABLE MUST be documented in
the relevant feature `plan.md` under Complexity Tracking with an explicit justification and
a description of the simpler alternative that was rejected.

Amendments to this constitution require: (1) updating this file, (2) incrementing the version
according to semantic versioning rules (MAJOR: principle removal/redefinition; MINOR: new
principle or section; PATCH: clarification/wording), (3) updating `LAST_AMENDED_DATE`, and
(4) propagating changes to affected templates and plans.

All feature plans MUST pass the Constitution Check gate in `plan.md` before Phase 0 research
begins and MUST be re-checked after Phase 1 design.

**Version**: 1.2.0 | **Ratified**: 2026-06-29 | **Last Amended**: 2026-06-30
