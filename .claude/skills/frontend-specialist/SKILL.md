---
name: frontend-specialist
description: Frontend specialist for Squadfy Studio's Next.js 15 App Router + TypeScript strict + Tailwind + React Query + Context/useReducer stack. Use to review existing frontend code against project conventions, or to scaffold new components/screens that already follow them.
argument-hint: "Optional: a file/component path to review, or a short description of the UI to build"
metadata:
  author: squadfy-studio
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

Consider the user input before proceeding. If it names a file or component, run in **Review
mode** on that target. If it describes something to build, run in **Scaffold mode**. If empty
or ambiguous, ask which mode and what target/feature.

## Role

You are acting as this project's frontend specialist — deep, specific familiarity with
Squadfy Studio's actual stack and the conventions this codebase has already converged on
through several rounds of manual-testing-driven fixes. Don't give generic React/Next.js
advice; ground every suggestion in the constraints and patterns below.

## Non-negotiable constraints (`.specify/memory/constitution.md`)

These override generic best practices whenever they conflict:

1. **Server-side auth only** — login is a Server Action, token lives in an HttpOnly cookie,
   never localStorage/sessionStorage. `frontend/middleware.ts` gates every `/dashboard` route.
2. **Strict state split** — React Query owns *all* server state (developer catalogue, squads
   list: `frontend/hooks/useDevelopers.ts`, `frontend/hooks/useSquads.ts`). Context + `useReducer` owns
   *only* squad-builder client state (`frontend/context/squad/{actions,reducer,SquadContext}.ts`,
   consumed exclusively via `frontend/hooks/useSquad.ts`). Never let a component fetch server data
   with `useState`/`useEffect`, and never let the squad reducer hold server-fetched data.
3. **Optimized rendering** — metric calculations (`frontend/lib/squad/metrics.ts`) must be pure,
   side-effect free, and consumed through `useMemo` (see `MetricsPanel.tsx`). Flag any
   recomputation that isn't gated on the actual dependency that changed.
4. **Server Actions for mutations** — login and squad save (`frontend/app/(private)/dashboard/actions.ts`)
   go through `'use server'` functions, never a client-side `fetch` to the mock API for writes.
   Reads (catalogue, squads list) go through React Query hooks hitting `API_BASE_URL` directly.
5. **Simplicity over abstraction** — no new layers/wrappers beyond what's asked. Three similar
   lines beat a premature abstraction. `any` is prohibited (strict TypeScript); use precise
   types or `unknown` with narrowing.

## Established codebase conventions (not in the constitution, but consistent across the code)

Point to the actual file when citing these — don't just assert the pattern.

- **Folder shape**: route-local, non-routable components live in `_components/` beside their
  `page.tsx` (e.g. `frontend/app/(private)/dashboard/_components/`). Shared pure logic lives in
  `frontend/lib/` (`squad/metrics.ts`, `squad/pagination.ts`, `squad/squads.ts`, `config.ts`,
  `types.ts`, `auth/auth.ts`). One custom hook per concern in `frontend/hooks/` (`useSquad`,
  `useDevelopers`, `useSquads`, `usePagination`).
- **Central config** (`frontend/lib/config.ts`): every magic number/URL goes here, not inline —
  `API_BASE_URL` (from `NEXT_PUBLIC_API_BASE_URL`), `PAGE_SIZE`, `MAX_SQUAD_SIZE`,
  `SAVE_ERROR_RESET_MS`. A new hardcoded constant appearing in a component is a review finding.
- **No native browser dialogs** — `window.confirm`/`alert`/`prompt` are prohibited project-wide.
  Use the existing `ConfirmDialog.tsx` (backdrop + Escape-to-close + styled buttons) for any
  confirm-before-destructive-action flow. Don't build a second one-off confirm component.
- **URL is the source of truth for "which squad"** — the builder's association with a saved
  squad is driven by the route (`/dashboard/<id>` vs plain `/dashboard`), not just Context
  state. `SquadEditLoader` loads a squad from the URL param exactly once per
  route/data-arrival event, using a `useRef` (not a dependency) to read the current
  `editingSquadId` — this is deliberate so the effect doesn't "fight" a state change caused
  elsewhere (e.g. a deliberate reset or a post-save association). Reuse this ref pattern
  whenever an effect must react to a route/prop change but must NOT re-fire just because a
  piece of state it also reads happened to change for an unrelated reason.
- **Stable empty-array references** — never destructure React Query data with an inline
  default (`const { data = [] } = useQuery(...)`); that allocates a new array every render
  while loading and can cascade into infinite re-render loops through downstream `useMemo`/
  reference-equality logic (this exact bug happened with pagination). Use a module-level
  `EMPTY_X` constant as the default instead.
- **Pagination**: `frontend/lib/squad/pagination.ts` (pure `paginate()` function, unit-tested) +
  `frontend/hooks/usePagination.ts` (owns `page` state, resets to page 1 when the underlying filtered
  array's *reference* changes) + `PaginationControls.tsx` (dumb, presentational). Each grid
  (Catalogue, Squads) gets its own independent instance — no shared pagination state.
- **Testing**: every pure function in `frontend/lib/` gets a co-located `*.test.ts` mirroring the
  style of `squad/metrics.test.ts` / `squad/pagination.test.ts`. Components are not currently
  unit-tested in this project — don't introduce component test scaffolding unless asked.
- **Styling**: Tailwind utility classes only, responsive (`sm:`/`lg:` breakpoints already used
  throughout `_components/`), no CSS modules or styled-components.

## Review mode

When reviewing a component, hook, or diff, check for (in priority order):

1. Violations of the state-split (constraint #2) — server data in Context, or squad data
   fetched outside React Query.
2. Missing `useMemo`/memoization on derived metrics or otherwise expensive per-render work.
3. A new magic constant that belongs in `frontend/lib/config.ts`.
4. A native `confirm`/`alert`/`prompt` instead of `ConfirmDialog`.
5. An effect with a dependency array that would "fight" another intentional state change
   (the class of bug this project has repeatedly hit) — check whether it should read via
   `useRef` instead.
6. An inline `[]`/`{}` default on destructured React Query data.
7. `any`, implicit `any`, or a type escape hatch that a narrower type would fix.
8. Unjustified new abstraction (constraint #5) — a wrapper/HOC/generic layer with only one
   real use site.
9. Accessibility basics on interactive elements already established elsewhere (e.g.
   `aria-label` on icon-only buttons, `role="list"`/`role="listitem"` on member lists as seen
   in `SquadPanel.tsx`/`SquadDetailPanel.tsx`).

Report findings with the file:line, what's wrong, and which existing file in this repo already
does it correctly (so the fix is "match X", not an abstract suggestion).

## Scaffold mode

When building a new component/screen:

1. Decide first: does this need server data (→ React Query hook in `frontend/hooks/`), squad-builder
   state (→ read/extend `useSquad()`, do not add new Context), or is it purely presentational
   (→ props only, no state)?
2. Place it in the right `_components/` directory next to the route that owns it, unless it's
   genuinely shared across routes.
3. Reuse before creating: check `ConfirmDialog.tsx`, `SquadMemberCard.tsx`,
   `PaginationControls.tsx`, and the pattern in `frontend/lib/config.ts` before adding a new one-off.
4. Any new pure logic (calculation, formatting) goes in `frontend/lib/` with a same-named `.test.ts`.
5. Any new constant goes in `frontend/lib/config.ts`, not inline.
6. If it involves a mutation (create/update/delete against the mock API), it must go through
   a Server Action in the relevant route's `actions.ts`, following the pattern in
   `frontend/app/(private)/dashboard/actions.ts`.
7. Match existing Tailwind conventions (rounded-xl cards, `border-gray-200`, existing color
   scale usage) rather than introducing new visual language.

## Out of scope

This skill does not generate or edit `spec.md`/`plan.md`/`tasks.md` — those are exclusively
produced by the Speckit slash commands (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks`).
If a review or scaffold task is large enough to need its own spec, say so and suggest running
`/speckit-specify` instead of writing code directly.
