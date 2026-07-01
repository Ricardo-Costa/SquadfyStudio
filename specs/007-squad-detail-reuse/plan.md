# Implementation Plan: Squad Detail Panel & Reuse

**Branch**: `007-squad-detail-reuse` | **Date**: 2026-07-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-squad-detail-reuse/spec.md`

---

## Summary

Turn saved squads from dead-end cards into something the Tech Lead can actually evaluate and reuse.
Clicking a `SquadCard` opens a `SquadDetailPanel` beside the grid (desktop) — full member roster
(via the existing `SquadMemberCard`, read-only), the complete skill list, and the same aggregate
metrics — all computed from data already available in `SquadsView`, no new calculations. An
"Editar" action loads that squad's members into the active builder (via a new Context action) and
navigates to the catalogue; if the builder already holds unsaved members, a blocking
`window.confirm()` gates the replacement. Saving after an edit reuses the existing `SaveSquadModal`
(now pre-filled with the original name) and updates the original record in place via `PUT`, instead
of the existing `POST`-only path. A small unrelated fix rides along: `SquadCard` gains the same
avatar-load-error fallback `DeveloperCard` already has.

---

## Technical Context

**Language/Version**: TypeScript 5.8, strict mode

**Primary Dependencies**:
- `next@^15.3.4` — `useRouter()` (client-side navigation from Squads to Catálogo), extended Server Action (`saveSquad` now supports `PUT`)
- `react@^19.0.0` — `useState` (selected squad, panel), reducer extension
- `@tanstack/react-query@^5` — `useQueryClient()` to invalidate the `['squads']` cache after a successful save (new AND edited squads), so the Squads screen reflects changes without a manual refresh
- `tailwindcss@^3.4.0` — detail panel layout, reusing the catalogue's existing two-column/`order-*` responsive pattern (005)

**No new npm packages** — the FR-008 blocking confirmation uses the native `window.confirm()`
(synchronous, genuinely blocking, zero new UI code) rather than a new custom modal component.

**Storage**: JSON Server `/squads/:id` — `PUT` (already supported natively by json-server for any
collection) replaces the resource body while preserving `id` from the URL; no schema change.

**Testing**: No new mandatory Jest coverage — no new pure calculation functions are introduced
(`SquadDetailPanel` consumes already-computed `SquadCardData` from `SquadsView`, per 006's
research.md §2 precompute pattern). Verification is manual via `quickstart.md`.

**Target Platform**: Browser (all new/changed components are client components) + Next.js Server
Action (`saveSquad`, extended)

**Performance Goals**:
- SC-001 (details visible within one click): trivial, `SquadDetailPanel` reads precomputed data already in memory — no fetch, no calculation on open.

**Constraints**:
- `window.confirm()` for FR-008 — a deliberate simplicity choice over a new custom modal (Constitution Principle V); it is synchronous and blocking by nature, which is exactly what FR-008 requires.
- `SquadMemberCard` (existing, from 003) is reused as-is for the panel's member rows — it already supports a "read-only" mode by simply omitting its optional `onRemove` prop; no new member-row component is created.
- The builder-loading mechanism uses the existing squad Context (already provider-wrapped across both `/dashboard` and `/dashboard/squads`, per 005's shared `(private)/layout.tsx`) rather than a URL parameter — "Editar" dispatches into Context, then navigates; no new dynamic route is introduced. This achieves the same practical outcome the user described (navigate to the catalogue with the squad pre-loaded) with less surface area.
- `context/squad/reducer.ts`'s `SquadState` gains `editingSquadId`/`editingSquadName` (both `| null`) — metadata about which saved squad (if any) the current builder session originated from. This stays within Constitution Principle II's "squad composition" scope: it is data about the composition being built, not a separate concern.
- Type `any` prohibited — strict TypeScript throughout.

**Scale/Scope**: 1 new component (`SquadDetailPanel`), 1 reducer/action extension, 1 hook extension,
1 Server Action extension (adds `PUT` support), 2 existing components updated (`SaveSquadModal` for
pre-fill, `SaveSquadButton` for the edit-aware save + cache invalidation), 1 layout change
(`SquadsView` becomes two-column on desktop). No new routes, no new npm dependencies.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| I. Server-Side Auth | No auth changes; both routes already protected (005) | ✅ PASS | Unaffected |
| II. State Management Split | React Query still exclusively owns the saved-squads server state (now also invalidated post-save); Context/reducer extended with `editingSquadId`/`editingSquadName` — metadata about the squad composition itself, not a new concern | ✅ PASS | Consistent with the reasoning already applied in 006's Constitution Check for React Query's scope |
| III. Optimized Rendering | `SquadDetailPanel` receives already-`useMemo`'d `SquadCardData` from `SquadsView` (006's research.md §2) — zero new calculation on panel open/close | ✅ PASS | No recomputation introduced |
| IV. Feature-Driven Delivery | Builds directly on 004 (save), 005 (nav/layout pattern), 006 (Squads screen, append-only model) — this feature explicitly and narrowly revises 006's FR-012, per the clarification session, via the Server Action's new `PUT` path | ✅ PASS | Deviation from 006's "no edit" rule is deliberate, scoped, and documented (spec Clarifications) |
| V. Simplicity Over Abstraction | `window.confirm()` instead of a new modal component; `SquadMemberCard` reused unmodified; no new npm dependency; no new route | ✅ PASS | Every reuse opportunity in the existing codebase was taken before adding new files |

**All gates pass. No Complexity Tracking entries required.**

---

## Project Structure

### Documentation (this feature)

```text
specs/007-squad-detail-reuse/
├── plan.md              ← this file
├── research.md          ← Phase 0 decisions (confirm mechanism, navigation approach, edit-mode exit rule, cache invalidation)
├── data-model.md         ← Phase 1 — SquadState extension, saveSquad contract change
├── quickstart.md        ← manual verification checklist (US1, US2, US3)
├── contracts/
│   ├── squad-context.md      ← reducer/action/hook extension contract
│   └── save-squad-update.md  ← saveSquad Server Action + SaveSquadModal pre-fill contract
├── checklists/
│   └── requirements.md  ← spec quality checklist (all pass)
└── tasks.md              ← generated by /speckit-tasks (not yet created)
```

### Source Code

```text
context/squad/
  reducer.ts                              # UPDATED — SquadState gains editingSquadId/editingSquadName; new LOAD_SQUAD action; REMOVE_MEMBER clears edit fields when members become empty
  actions.ts                              # UPDATED — add LOAD_SQUAD action type

hooks/
  useSquad.ts                             # UPDATED — expose editingSquadId, editingSquadName, loadSquad(id, name, members)

app/(private)/dashboard/
  actions.ts                              # UPDATED — saveSquad(name, members, id?): POST when id is absent (new), PUT to /squads/:id when present (edit)
  _components/
    SaveSquadModal.tsx                    # UPDATED — new optional initialName prop; pre-fills instead of always-blank when provided
    SaveSquadButton.tsx                   # UPDATED — passes editingSquadId/editingSquadName through; invalidates the ['squads'] React Query cache after any successful save
    SquadCard.tsx                         # UPDATED — onClick prop (opens detail panel) + avatar onError fallback (US3 fix)
    SquadDetailPanel.tsx                  # NEW — read-only member roster (reuses SquadMemberCard), full skill list, aggregate metrics, "Editar" action
    SquadsView.tsx                        # UPDATED — selectedSquadId state, two-column responsive layout (grid+filter left, detail panel right), mirrors dashboard/page.tsx's order-* mobile pattern (005)
```

No changes to `lib/metrics.ts`, `lib/squads.ts`, `hooks/useSquads.ts`, `middleware.ts`, or `db.json`'s schema (only existing records' `name`/`savedAt` fields get updated in place by the new edit flow, at runtime).

**Structure Decision**: Single Next.js App Router project (existing structure). The builder-loading
mechanism deliberately avoids a new route — it reuses the squad Context that already spans both
`/dashboard` and `/dashboard/squads` (established in 005's shared layout), which is simpler than
introducing URL-based state transfer for the same outcome.

## Complexity Tracking

*No violations — table intentionally omitted.*
