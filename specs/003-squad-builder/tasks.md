# Tasks: Squad Builder

**Input**: Design documents from `specs/003-squad-builder/`

**Feature Branch**: `003-squad-builder`

**Prerequisites**: plan.md ✅ spec.md ✅ data-model.md ✅ contracts/hook.md ✅ research.md ✅ quickstart.md ✅

**Tests**: No test tasks — Jest covers `lib/metrics.ts` only (per constitution). Manual validation via `quickstart.md`.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Format: `[ID] [P?] [Story?] Description — file path`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US4)
- Exact file paths in every task description

---

## Phase 2: Foundational (Context/State Infrastructure)

**Purpose**: State management infrastructure that ALL user stories depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: These 5 tasks establish the global SquadContext. Complete them before any Phase 3+ work.

- [X] T001 [P] Create `context/squad/actions.ts` — export `SquadAction` union type (`ADD_MEMBER: Developer` | `REMOVE_MEMBER: string`)
- [X] T002 [P] Create `context/squad/reducer.ts` — export `MAX_SQUAD_SIZE = 5`, `SquadState`, `initialSquadState`, and `squadReducer` with guards (no overflow, no duplicates)
- [X] T003 Create `context/squad/SquadContext.tsx` — export `SquadContextValue`, `SquadContext` (createContext null default), and `SquadProvider` ('use client'; wraps children with `useReducer`)
- [X] T004 Create `hooks/useSquad.ts` — export `useSquad()` hook using `use(SquadContext)`; throw if outside provider; return `{ members, count, isFull, isMember, addMember, removeMember }`
- [X] T005 Update `app/(private)/layout.tsx` — import `SquadProvider`; wrap children with `<SquadProvider>` inside existing `<Providers>` (React Query outermost, SquadProvider innermost)

**Checkpoint**: Foundation ready — `useSquad()` callable from any component inside `(private)/layout.tsx`. Verify: import `useSquad` in any component and confirm TypeScript resolves the return type without errors.

---

## Phase 3: User Story 1 — Add Developer to Squad (Priority: P1) 🎯 MVP

**Goal**: Tech Lead clicks "Adicionar" on a catalogue card → developer appears in squad panel immediately; card updates to show "No Squad" badge.

**Independent Test**: Click add on any developer → developer name appears in squad panel → that card shows emerald "No Squad" badge (no add button).

- [X] T006 [US1] Update `app/(private)/dashboard/_components/DeveloperCard.tsx` — add three new props (`isInSquad: boolean`, `isFull: boolean`, `onAdd: (dev: Developer) => void`); render emerald "No Squad" badge when `isInSquad`; render active "Adicionar" button calling `onAdd(developer)` when `!isInSquad && !isFull`; keep props optional with sensible defaults so existing usage is not broken
- [X] T007 [US1] Create `app/(private)/dashboard/_components/SquadPanel.tsx` — 'use client'; calls `useSquad()`; renders member names list (basic `<ul>` — will be enhanced in US2); renders empty state ("Nenhum membro selecionado. Adicione desenvolvedores do catálogo.") when `count === 0`; renders capacity indicator ("X/5 membros") above the list; sticky on desktop (`lg:sticky lg:top-8`)
- [X] T008 [US1] Update `app/(private)/dashboard/_components/CatalogueView.tsx` — import and call `useSquad()`; destructure `isFull` and `isMember` from hook; pass `isInSquad={isMember(dev.id)}`, `isFull={isFull}`, `onAdd={addMember}` to each `<DeveloperCard>` inside the `filteredDevelopers.map()`
- [X] T009 [US1] Update `app/(private)/dashboard/page.tsx` — replace single-column layout with two-column grid (`<div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">`); import and render `<SquadPanel />` as the second grid column alongside `<CatalogueView />`

**Checkpoint**: US1 fully functional. Add developer → appears in squad panel list → card shows badge. No add button visible for in-squad cards.

---

## Phase 4: User Story 2 — View Squad Panel (Priority: P2)

**Goal**: Squad panel shows each member's full profile (avatar, name, seniority chip, cost); capacity indicator accurate; empty state polished.

**Independent Test**: Add 3 developers → panel shows each with avatar, name, seniority chip, "$X/hr"; indicator shows "3/5 membros"; empty state appears after all are removed.

- [X] T010 [US2] Create `app/(private)/dashboard/_components/SquadMemberCard.tsx` — props: `{ member: Developer }`; renders `<img>` avatar (with DiceBear initials fallback on error); name; seniority chip (same color tokens as DeveloperCard: junior=blue, mid=amber, senior=emerald); `$cost/hr`; no remove button yet (added in US3)
- [X] T011 [US2] Enhance `app/(private)/dashboard/_components/SquadPanel.tsx` — replace basic `<ul>` member list with `<SquadMemberCard member={m} />` per member; improve capacity indicator typography (semibold, readable); polish empty state with icon or subtle illustration; add `max-h` + `overflow-y-auto` for overflow safety; refined panel container (rounded-xl border shadow-sm bg-white)

**Checkpoint**: US2 fully functional. Squad panel shows rich member cards with all required details. Capacity indicator accurate.

---

## Phase 5: User Story 3 — Remove Developer from Squad (Priority: P3)

**Goal**: Tech Lead clicks × on a squad member entry → member removed from panel immediately → their catalogue card returns to addable state.

**Independent Test**: Add developer → click × on squad panel entry → developer disappears from panel → their card shows active "Adicionar" button.

- [X] T012 [US3] Update `app/(private)/dashboard/_components/SquadMemberCard.tsx` — add `onRemove: (id: string) => void` prop; render remove button (`<button aria-label="Remover do squad">×</button>`) positioned top-right or inline-end of card; call `onRemove(member.id)` on click; style: circular button, red hover, `cursor-pointer`
- [X] T013 [US3] Update `app/(private)/dashboard/_components/SquadPanel.tsx` — destructure `removeMember` from `useSquad()`; pass `onRemove={removeMember}` to each `<SquadMemberCard>`

**Checkpoint**: US3 fully functional. Remove from panel → member gone → card addable again → capacity indicator decrements.

---

## Phase 6: User Story 4 — Enforce Squad Capacity Limit (Priority: P4)

**Goal**: Squad full (5 members) → remaining catalogue cards show disabled add button; capacity indicator communicates "full" state clearly.

**Independent Test**: Add 5 developers → all remaining cards show grayed-out disabled button (cursor-not-allowed) → indicator shows "5/5" or "Squad completo" → remove 1 → add buttons re-enable.

- [X] T014 [US4] Update `app/(private)/dashboard/_components/DeveloperCard.tsx` — add third button branch: when `!isInSquad && isFull`, render disabled "Adicionar" button with `disabled`, `opacity-50`, `cursor-not-allowed`, `bg-gray-100 text-gray-400` (no onClick handler)
- [X] T015 [US4] Update `app/(private)/dashboard/_components/SquadPanel.tsx` — enhance capacity indicator to visually communicate full state: when `isFull`, show "Squad completo! (5/5)" with amber or red accent color; when not full, show "X/5 membros" in gray; use conditional Tailwind class based on `isFull`

**Checkpoint**: US4 fully functional. All four user stories work end-to-end. Squad builder feature complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, visual polish, and manual validation.

- [X] T016 [P] Accessibility pass: add `aria-label="Adicionar ao squad"` to add buttons; `aria-label="Remover do squad"` to remove buttons; `aria-disabled="true"` to disabled add buttons; `role="list"` + `role="listitem"` to squad member list in `SquadPanel.tsx`
- [X] T017 [P] Visual polish pass: add `transition-colors duration-150` to add/remove buttons; ensure "No Squad" badge has consistent border-radius with DeveloperCard seniority chip; confirm squad panel sidebar has consistent shadow-sm with design system used in feature 002
- [X] T018 Run quickstart.md manual validation checklist — execute all US1–US4 checklists plus Visual Quality Checks and State Consistency Checks; confirm all boxes pass before marking feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. Blocks ALL user stories.
- **US1 (Phase 3)**: Requires Phase 2 complete. Delivers MVPs of DeveloperCard + CatalogueView + SquadPanel + layout.
- **US2 (Phase 4)**: Requires US1 complete (SquadPanel exists). Enhances panel display.
- **US3 (Phase 5)**: Requires US2 complete (SquadMemberCard exists). Adds remove affordance.
- **US4 (Phase 6)**: Requires US1 complete (DeveloperCard props exist). Can run in parallel with US2–US3.
- **Polish (Phase 7)**: Requires all user stories complete.

### User Story Dependencies

- **US1 (P1)**: Requires Phase 2. No other story dependency. Independent.
- **US2 (P2)**: Requires US1 (SquadPanel exists and useSquad is wired). Enhances existing components.
- **US3 (P3)**: Requires US2 (SquadMemberCard component created in T010). Extends it with remove UI.
- **US4 (P4)**: Requires US1 (DeveloperCard has new props from T006). T014 extends T006, T015 extends T007.

### Within Each Phase

- Models (types/state) before context, context before hook, hook before components.
- T001–T002 can run in parallel (different files); T003 needs both complete.
- T006, T007 in US1 can run in parallel (different files).
- T008 depends on T006 (DeveloperCard must accept new props before CatalogueView can pass them).
- T009 depends on T007 (SquadPanel must exist before page.tsx imports it).

---

## Parallel Opportunities

### Phase 2 (Foundational)
```
Parallel: T001 (actions.ts) + T002 (reducer.ts) simultaneously
Then sequential: T003 → T004 → T005
```

### Phase 3 (US1)
```
Parallel: T006 (DeveloperCard) + T007 (SquadPanel) simultaneously
Then: T008 (CatalogueView) — needs T006 done
Then: T009 (page.tsx) — needs T007 done
```

### Phase 6 (US4) — can overlap with Phase 4–5
```
Parallel with US2–US3: T014 (DeveloperCard disabled state) — same file as T006, but different branch
                        T015 (SquadPanel full state) — same file as T011/T013
Note: T014 modifies DeveloperCard after T006; T015 modifies SquadPanel after T013. Run sequentially per file.
```

### Phase 7 (Polish)
```
Parallel: T016 (accessibility) + T017 (visual polish) simultaneously
Then: T018 (manual validation)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 2: Foundational (T001–T005)
2. Complete Phase 3: US1 (T006–T009)
3. **STOP and VALIDATE**: Click add on any catalogue card, confirm developer appears in squad panel, card shows badge
4. Squad builder is usable at this point (missing remove, full details, capacity limit)

### Incremental Delivery

1. Phase 2 (Foundational) → state infrastructure ready
2. Phase 3 (US1) → add works, basic panel visible → **validate**
3. Phase 4 (US2) → panel shows rich member cards → **validate**
4. Phase 5 (US3) → remove works → **validate**
5. Phase 6 (US4) → capacity limit enforced → **validate**
6. Phase 7 (Polish) → accessibility, visual, manual checklist → **ship**

---

## Notes

- No new npm dependencies — pure React 19 built-ins (`use`, `useReducer`, `createContext`)
- `DeveloperCard` does not need `'use client'` — it renders inside `CatalogueView` which is already client boundary
- `useSquad` uses `use(SquadContext)` (React 19 idiom); both `use()` and `useContext()` work — use `use()` per plan
- Avatar fallback pattern in `SquadMemberCard` matches `DeveloperCard`: `onError` sets `img.onerror = null` then DiceBear initials URL
- Seniority chip color tokens (same as DeveloperCard): junior=`bg-blue-100 text-blue-700`, mid=`bg-amber-100 text-amber-700`, senior=`bg-emerald-100 text-emerald-700`
- [P] tasks = different files, no shared incomplete dependencies
- [Story] label maps each task to its user story for traceability
- Mark task `[X]` in this file immediately upon completion
