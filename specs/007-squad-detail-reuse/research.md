# Phase 0 Research: Squad Detail Panel & Reuse

## 1. Blocking confirmation mechanism (FR-008)

**Decision**: `window.confirm()`, called synchronously in `SquadDetailPanel`'s "Editar" click
handler before dispatching `LOAD_SQUAD` and navigating.

**Rationale**: FR-008 requires a genuinely blocking prompt — the Tech Lead's next action (proceed
or cancel) must gate whether the builder's unsaved members are replaced. `window.confirm()` is
synchronous by construction (execution pauses until answered), requires zero new component/state,
and needs no dependency. Given Constitution Principle V's bar for justifying any new UI surface,
and that this is a low-frequency, high-stakes action (data loss warning), the native dialog's
visual inconsistency with the rest of the app is an acceptable, deliberate trade-off.

**Alternatives considered**:
- A custom confirm modal (reusing the `SaveSquadModal`/`DashboardNav` drawer overlay idiom) —
  considered for visual consistency, but rejected: it would be the third bespoke overlay pattern
  in the codebase for a single yes/no decision, adding a new component and state for no functional
  benefit over the native dialog.
- No confirmation, silent replace — rejected in clarification (FR-008 explicitly requires blocking confirmation).

## 2. How "Editar" gets the squad into the builder

**Decision**: Dispatch a new `LOAD_SQUAD` Context action (replacing `members` and setting
`editingSquadId`/`editingSquadName`), then `router.push('/dashboard')` via `next/navigation`'s
`useRouter()`. No URL parameter carries the squad data.

**Rationale**: The squad Context (`SquadProvider`) already wraps both `/dashboard` and
`/dashboard/squads` via the shared `(private)/layout.tsx` (established in 005) — client-side
navigation between the two routes does not unmount the provider, so state set immediately before
`router.push` is already present when the catalogue page renders. This achieves the same practical
result the user described (navigate to the catalogue with the squad pre-loaded) without a new
dynamic route or reading/parsing squad data from a URL.

**Alternatives considered**:
- A dynamic route (e.g., `/dashboard/squads/[id]/edit` or `/dashboard?edit=<id>`) that the
  catalogue page reads on mount to look up and load the squad — rejected: requires either a fresh
  fetch-by-id (extra round trip, and the squad's data is already in memory in `SquadsView` at the
  moment "Editar" is clicked) or passing serialized squad data through the URL, both more complex
  than dispatching directly into the already-shared Context.
- `sessionStorage`/`localStorage` handoff — rejected, unnecessary given the Context already spans
  both routes; would add a persistence concern with no benefit.

## 3. Exiting "edit mode" (gap found during planning)

**Decision**: `editingSquadId`/`editingSquadName` reset to `null` automatically whenever
`REMOVE_MEMBER` brings `members` down to zero (i.e., the builder becomes empty by any combination
of individual removals).

**Rationale**: The spec's FR-010 locks in "saving after an edit updates the original record," which
implies the builder needs a way to *stop* being "in edit mode" — otherwise a Tech Lead who edits
Squad Alpha, then manually clears the builder to start an unrelated squad from scratch, would have
their new squad silently overwrite Alpha's record instead of creating a new one. An empty builder
cannot represent any specific saved squad, so it is the natural, lowest-risk point to exit edit
mode automatically — no explicit "stop editing" control is needed, and the rule requires one extra
condition in an already-existing reducer case (`REMOVE_MEMBER`), not a new action.

**Alternatives considered**:
- Explicit "new squad" / "stop editing" button — rejected as unnecessary UI for a behavior that
  already has a natural trigger (emptying the builder), per Constitution Principle V.
- Edit mode persists until the next successful save, then always clears — rejected: this would
  turn every subsequent save (while still adjusting the same squad, without ever emptying the
  builder) back into a `POST`, silently creating duplicate records for what the Tech Lead
  experiences as one continuous editing session — contradicts FR-010's intent.
- Edit mode never clears except by loading a different squad — rejected: leaves no way to
  deliberately abandon editing and start a new squad from scratch without accidentally overwriting
  the edited one first.

## 4. Reusing `SquadMemberCard` for the read-only roster

**Decision**: `SquadDetailPanel` renders one `SquadMemberCard` per member, passing no `onRemove`
prop.

**Rationale**: `SquadMemberCard`'s remove button is already conditionally rendered
(`{onRemove && (...)}`), so omitting the prop yields exactly the read-only presentation FR-002
needs (avatar, name, seniority, cost) with zero new component and zero risk of divergence from the
builder's existing visual language.

**Alternatives considered**:
- A new `SquadDetailMemberRow` component — rejected, would duplicate `SquadMemberCard` almost
  exactly for no behavioral difference (Constitution Principle V).

## 5. React Query cache staleness after save (gap found during planning)

**Decision**: `SaveSquadButton` calls `useQueryClient().invalidateQueries({ queryKey: ['squads'] })`
immediately after any successful save (both a brand-new `POST` save and an edit `PUT` save).

**Rationale**: `Providers.tsx` configures a 5-minute `staleTime` for all queries. Without explicit
invalidation, navigating from the catalogue (after saving) to the Squads screen could show a
stale list — most critically for edits, where the Tech Lead expects to see the *updated* card, not
the pre-edit version. This gap already existed for 006's plain "new save" flow (not previously
caught) and is fixed here since this feature is the first to make the staleness user-visible and
already touches `SaveSquadButton`.

**Alternatives considered**:
- Lowering global `staleTime` — rejected, would affect the catalogue's fetch behavior too, for no
  reason; the targeted `invalidateQueries` call is the precise fix for the one query that changes.
- Manual `refetch()` triggered from the Squads screen on every mount — rejected, less reliable
  (depends on the Tech Lead's navigation path) and less idiomatic than invalidating at the mutation
  site.

## 6. Detail panel responsive layout

**Decision**: `SquadsView` adopts the same two-column desktop / `order-*` mobile-reorder pattern
already used by `dashboard/page.tsx` (005) — grid+filter in the primary column, `SquadDetailPanel`
(when a squad is selected) in a `340px` secondary column on `lg:` and up; on narrow viewports the
panel takes `order-1` (appears first, above the grid) when open, matching the existing convention
that in-progress/selected content is prioritized above listing content on mobile.

**Rationale**: The user explicitly asked for a panel "similar to the existing squad-builder panel
on the catalogue screen" — reusing the exact layout mechanism already proven there (rather than
inventing a new responsive pattern) is both the most literal interpretation of that request and the
simplest to implement, since the CSS approach is already validated in the codebase.

**Alternatives considered**:
- An overlay/modal-style detail panel on all viewports — rejected, contradicts the explicit "beside
  the grid" request; reserved as a fallback only if the two-column approach proved unworkable
  (it does not).
