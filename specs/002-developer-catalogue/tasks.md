---
description: "Task list for 002-developer-catalogue implementation"
---

# Tasks: Developer Catalogue

**Input**: Design documents from `specs/002-developer-catalogue/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅

**Tests**: No automated test tasks — Jest covers only `lib/metrics.ts` per constitution.
Manual validation via `quickstart.md` after each user story phase.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in every task description

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Install new dependency and create shared types consumed by all user stories.

- [x] T001 Install `@tanstack/react-query@^5` — run `npm install @tanstack/react-query` at project root; verify entry appears in `package.json` dependencies
- [x] T002 [P] Create `lib/types.ts` with three exports: `Seniority` type (`'junior' | 'mid' | 'senior'`), `Developer` interface (`id: string`, `name: string`, `avatar: string`, `seniority: Seniority`, `cost: number`, `skills: string[]`), and `FilterState` interface (`name: string`, `seniorities: Seniority[]`) — file: `lib/types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: React Query provider infrastructure that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Create `app/providers.tsx` as a `'use client'` component that instantiates `QueryClient` with `defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2 } }` via `useState` (prevents client recreation on re-render) and wraps `children` with `<QueryClientProvider client={queryClient}>` — file: `app/providers.tsx`
- [x] T004 Create `app/(private)/layout.tsx` as a Server Component that imports `Providers` from `app/providers.tsx` and wraps `{children}` with `<Providers>`, providing the QueryClient scope to all private routes — file: `app/(private)/layout.tsx`

**Checkpoint**: Foundation ready. `QueryClientProvider` available on all `/dashboard` routes before Phase 3 begins.

---

## Phase 3: User Story 1 — Browse Developer Catalogue (Priority: P1) 🎯 MVP

**Goal**: Authenticated Tech Lead opens `/dashboard` and sees a grid of developer cards; skeleton cards appear while data loads; error state with retry appears if JSON Server is unreachable.

**Independent Test**: Start both `npm run mock` and `npm run dev`. Navigate to `/dashboard` after login. Confirm: (1) skeleton cards show briefly during fetch; (2) 22 developer cards appear, each with name, avatar, seniority, cost, and skills; (3) stopping `npm run mock` and reloading shows an error message with a retry button.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create `hooks/useDevelopers.ts` exporting `useDevelopers()` — calls `useQuery<Developer[]>` with `queryKey: ['developers']` and `queryFn` fetching `http://localhost:3001/developers`, throwing on `!res.ok`; import `Developer` from `lib/types.ts` — file: `hooks/useDevelopers.ts`
- [x] T006 [P] [US1] Create `app/(private)/dashboard/_components/DeveloperCard.tsx` as a Server-compatible functional component (no `'use client'` needed) accepting `developer: Developer` prop; renders a Tailwind card (`rounded-xl border border-gray-200 bg-white p-4 shadow-sm`) with: `<img>` avatar (with `onError` setting `src` to `https://api.dicebear.com/7.x/initials/svg?seed=${developer.name}`), name (`font-semibold text-gray-900`), seniority chip (capitalize first letter, color-coded: junior=blue, mid=amber, senior=emerald), cost (`$${developer.cost}/hr`, `text-gray-600 text-sm`), and skills as pill badges (`flex-wrap gap-1`) — file: `app/(private)/dashboard/_components/DeveloperCard.tsx`
- [x] T007 [US1] Create `app/(private)/dashboard/_components/CatalogueGrid.tsx` as a functional component accepting props `{ developers: Developer[]; isLoading: boolean; isError: boolean; onRetry: () => void }`; renders: (a) when `isLoading`: 8 skeleton `<div>` placeholders with `animate-pulse bg-gray-200 rounded-xl h-56`; (b) when `isError`: centered error message ("Não foi possível carregar o catálogo.") with a retry `<button>` calling `onRetry`; (c) when `developers.length === 0`: empty state message ("Nenhum desenvolvedor encontrado." + hint to clear filters); (d) otherwise: a responsive CSS grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4`) of `<DeveloperCard>` components — import `DeveloperCard` and `Developer` from their respective paths — file: `app/(private)/dashboard/_components/CatalogueGrid.tsx`
- [x] T008 [US1] Create `app/(private)/dashboard/_components/CatalogueView.tsx` as a `'use client'` component; calls `useDevelopers()` to get `{ data: developers = [], isLoading, isError, refetch }`; initializes `filterState: FilterState` via `useState({ name: '', seniorities: [] })`; computes `filteredDevelopers` via `useMemo(() => developers.filter(dev => dev.name.toLowerCase().includes(filterState.name.toLowerCase()) && (filterState.seniorities.length === 0 || filterState.seniorities.includes(dev.seniority))), [developers, filterState])`; renders `<CatalogueGrid developers={filteredDevelopers} isLoading={isLoading} isError={isError} onRetry={refetch} />` — stub FilterBar slot with a `{/* FilterBar will be added in US2/US3 */}` comment for now — file: `app/(private)/dashboard/_components/CatalogueView.tsx`
- [x] T009 [US1] Replace `app/(private)/dashboard/page.tsx` placeholder content — import `CatalogueView` from `./_components/CatalogueView` and render it inside a `<main className="min-h-screen bg-gray-50 px-4 py-8">` wrapper with a page heading "Developer Catalogue" (`text-2xl font-bold text-gray-900 mb-6`) — file: `app/(private)/dashboard/page.tsx`

**Checkpoint**: US1 fully functional. 22 developer cards visible on `/dashboard`. Skeleton cards appear on load. Error state and retry button appear when `npm run mock` is stopped. Validate via quickstart.md US1 checklist before proceeding.

---

## Phase 4: User Story 2 — Filter Catalogue by Name (Priority: P2)

**Goal**: A search field on the dashboard filters the catalogue in real time by developer name (case-insensitive, partial match). Clearing the field restores all profiles.

**Independent Test**: With catalogue loaded, type "ana" in the search field — only developers whose names contain "ana" (case-insensitive) appear. Type "zzzzz" — empty state message shown. Clear field — all 22 cards return.

### Implementation for User Story 2

- [x] T010 [P] [US2] Create `app/(private)/dashboard/_components/FilterBar.tsx` as a `'use client'` component accepting props `{ name: string; onNameChange: (v: string) => void; seniorities: Seniority[]; onSeniorityToggle: (s: Seniority) => void }`; for this task, render only the name search input: `<input type="text" placeholder="Buscar desenvolvedor..." value={name} onChange={e => onNameChange(e.target.value)}` with Tailwind focus ring and border styling; leave a `{/* seniority toggles — added in US3 */}` comment placeholder — file: `app/(private)/dashboard/_components/FilterBar.tsx`
- [x] T011 [US2] Update `app/(private)/dashboard/_components/CatalogueView.tsx` — replace the stub FilterBar comment with `<FilterBar name={filterState.name} onNameChange={name => setFilterState(s => ({ ...s, name }))} seniorities={filterState.seniorities} onSeniorityToggle={() => {}} />`; import `FilterBar` and `Seniority` from their respective paths; ensure the existing `useMemo` filter for name already works (it was stubbed in T008) — file: `app/(private)/dashboard/_components/CatalogueView.tsx`

**Checkpoint**: US2 fully functional. Name search filters cards in real time. Empty state shown for zero results. Clearing field restores full catalogue. Validate via quickstart.md US2 checklist.

---

## Phase 5: User Story 3 — Filter Catalogue by Seniority (Priority: P3)

**Goal**: Multi-select seniority toggle buttons (Junior / Mid / Senior) filter the catalogue. Any combination of levels can be active simultaneously. Works alongside the name filter.

**Independent Test**: Click "Junior" — only junior developers shown. Click "Senior" — juniors AND seniors shown. Click "Junior" to deselect — only seniors. Deselect all — full catalogue. With name filter "a" active AND "Senior" toggled — only senior developers whose names contain "a" are shown.

### Implementation for User Story 3

- [x] T012 [US3] Update `app/(private)/dashboard/_components/FilterBar.tsx` — replace the seniority placeholder comment with three pill toggle buttons for Junior / Mid / Senior; each button reads its active state from `seniorities.includes(level)` and calls `onSeniorityToggle(level)` on click; active style: filled background matching seniority color (blue/amber/emerald); inactive: white with border; labels capitalized ("Junior", "Mid", "Senior") — file: `app/(private)/dashboard/_components/FilterBar.tsx`
- [x] T013 [US3] Update `app/(private)/dashboard/_components/CatalogueView.tsx` — implement `onSeniorityToggle` handler: `(level: Seniority) => setFilterState(s => ({ ...s, seniorities: s.seniorities.includes(level) ? s.seniorities.filter(x => x !== level) : [...s.seniorities, level] }))`; replace the empty stub `() => {}` passed to FilterBar with this handler — file: `app/(private)/dashboard/_components/CatalogueView.tsx`

**Checkpoint**: US3 fully functional. Seniority toggles filter independently and combined with name search. Empty state shown when combined filters yield zero results. Validate via quickstart.md US3 checklist.

---

## Phase 6: User Story 4 — Handle Catalogue Errors (Priority: P4)

**Goal**: If JSON Server is unreachable, the Tech Lead sees a clear error message with a retry button. Clicking retry after the server is restored loads the catalogue successfully.

**Independent Test**: Stop `npm run mock`. Navigate to `/dashboard`. Confirm error message is displayed with a retry button. Restart `npm run mock`. Click retry. Confirm catalogue loads successfully (22 cards appear).

### Implementation for User Story 4

- [x] T014 [US4] Verify error state is correct in `app/(private)/dashboard/_components/CatalogueGrid.tsx` — confirm the retry button is rendered when `isError` is true, `onRetry` prop is called on click, and the message is user-friendly in Portuguese; confirm `CatalogueView.tsx` passes `refetch` from `useDevelopers()` as `onRetry` — no code changes expected if T007/T008 were implemented correctly; fix if wire-up is missing — files: `app/(private)/dashboard/_components/CatalogueGrid.tsx`, `app/(private)/dashboard/_components/CatalogueView.tsx`

**Checkpoint**: US4 fully functional. Error state displays with retry. Clicking retry after server recovery loads catalogue. Validate via quickstart.md US4 checklist.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Visual quality pass and final validation.

- [x] T015 [P] Responsive grid audit — verify `CatalogueGrid.tsx` grid breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) render correctly at mobile (375px), tablet (768px), and desktop (1280px); verify `DeveloperCard.tsx` has consistent height and no overflow at all breakpoints — file: `app/(private)/dashboard/_components/CatalogueGrid.tsx`
- [x] T016 [P] Accessibility pass — add `aria-label="Search developers"` to the name `<input>` in `FilterBar.tsx`; add `aria-pressed={isActive}` to each seniority toggle button; confirm skeleton cards have `aria-busy` or are hidden from screen readers with `aria-hidden="true"` — file: `app/(private)/dashboard/_components/FilterBar.tsx`
- [x] T017 Run full quickstart.md manual validation — execute all checklists: US1 (browse + skeleton + error), US2 (name filter), US3 (seniority multi-select + combined), US4 (error + retry), Visual Quality, Performance — file: `specs/002-developer-catalogue/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (`@tanstack/react-query` installed) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 (QueryClient provider ready, types available)
- **US2 (Phase 4)**: Depends on US1 Phase 3 completion (CatalogueView and CatalogueGrid exist)
- **US3 (Phase 5)**: Depends on US2 Phase 4 completion (FilterBar exists with name input)
- **US4 (Phase 6)**: Depends on US1 Phase 3 completion (CatalogueGrid error state already implemented)
- **Polish (Phase N)**: Depends on US1–US4 completion

### User Story Dependencies

- **US1 (P1)**: After Foundational — foundation of everything else
- **US2 (P2)**: After US1 — adds FilterBar and wires name filter in CatalogueView
- **US3 (P3)**: After US2 — extends FilterBar with seniority toggles
- **US4 (P4)**: After US1 — verification only; error state built in US1

### Within Each Phase

- Types and utilities before components
- Leaf components (`DeveloperCard`) before container components (`CatalogueGrid`)
- Container components before orchestrators (`CatalogueView`)
- Orchestrators before page assembly (`page.tsx`)

---

## Parallel Opportunities

### Phase 1 — Setup (T001 and T002 together)

```
Parallel:
  Task T001: "npm install @tanstack/react-query"
  Task T002: "Create lib/types.ts"
```

### Phase 2 — Foundational (sequential — T004 depends on T003)

```
Sequential:
  Task T003: "Create app/providers.tsx (QueryClientProvider)"
  Task T004: "Create app/(private)/layout.tsx (imports Providers)"
```

### Phase 3 — US1 (T005 and T006 in parallel, then T007, T008, T009)

```
Parallel:
  Task T005: "Create hooks/useDevelopers.ts"
  Task T006: "Create DeveloperCard.tsx"

Then sequential:
  Task T007: "Create CatalogueGrid.tsx" → depends on T006 (uses DeveloperCard)
  Task T008: "Create CatalogueView.tsx" → depends on T005 + T007
  Task T009: "Update page.tsx" → depends on T008
```

### Phase 4 — US2 (T010 in parallel with setup, then T011)

```
  Task T010: "Create FilterBar.tsx (name input only)" → no dependencies within US2
  Task T011: "Update CatalogueView.tsx (wire FilterBar)" → depends on T010
```

---

## Implementation Strategy

### MVP First (US1 Only — Phase 1 + 2 + 3)

1. Complete Phase 1: Install React Query, create types
2. Complete Phase 2: QueryClient provider
3. Complete Phase 3: US1 — grid loads with skeleton + error state
4. **STOP and VALIDATE**: Run quickstart.md US1 checklist — 22 cards visible, skeleton shown, error state with retry
5. Proceed to US2, US3, US4 in order

### Incremental Delivery

1. Phase 1 + 2 → Infrastructure ready
2. Phase 3 (US1) → Catalogue browsable ✅
3. Phase 4 (US2) → Name search working ✅
4. Phase 5 (US3) → Seniority filter working ✅
5. Phase 6 (US4) → Error state verified ✅
6. Phase N → Visual polish and final validation ✅

---

## Notes

- `[P]` tasks = different files, no shared dependencies — safe to run in parallel
- `@tanstack/react-query` uses `useQuery` from `'@tanstack/react-query'` — NOT from the old `react-query` package
- `QueryClient` MUST be created inside `useState(() => new QueryClient())` in providers.tsx to prevent shared client across requests in Next.js SSR
- `onError` on `<img>` must guard against infinite loops: set `e.currentTarget.onerror = null` before setting fallback `src`
- Seniority labels in `db.json` are lowercase (`junior`, `mid`, `senior`) — capitalize for display only
- Commit after each phase checkpoint using `feat(002-catalogue): <specific description>` format
