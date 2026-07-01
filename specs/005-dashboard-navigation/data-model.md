# Phase 1 Data Model: Dashboard Navigation Shell

This feature introduces no persisted entities and no backend schema changes — `db.json` is
unmodified. The only "data" is transient, in-memory UI state scoped to the navigation component.

## NavItem (static, non-persisted)

Describes one navigation destination. Not user-editable; hardcoded as a constant in
`DashboardNav.tsx`.

| Field | Type | Notes |
|---|---|---|
| `label` | `string` | Display text — `"Catálogo"` or `"Squads"` |
| `href` | `string` | Route target — `/dashboard` or `/dashboard/squads` |

There are exactly two `NavItem` values for this feature (FR-001). No id/key beyond `href` is
needed since it doubles as the React list key and the active-match target.

## NavDrawerState (client UI state, non-persisted)

Local `useState<boolean>` inside `DashboardNav.tsx` — not squad state, not server state, not
routed through Context/useReducer (see Constitution Check in `plan.md` for why this is in scope
for local state rather than the squad Context).

| Field | Type | Notes |
|---|---|---|
| `isOpen` | `boolean` | Whether the mobile overlay drawer is open. Defaults to `false`. Set `true` by the hamburger toggle; set `false` on: link selection, backdrop click, Escape key, or a route change while open. |

## Relationships

- `DashboardNav` renders both `NavItem`s always (desktop: inline sidebar; mobile: inside the
  drawer when `NavDrawerState.isOpen` is `true`).
- Active-state highlighting (FR-002) is derived, not stored: computed per render from
  `usePathname()` compared against each `NavItem.href` (see `research.md` §4) — not part of
  `NavDrawerState`.
- No relationship to `SquadState` (`context/squad/reducer.ts`) — the nav reads nothing from and
  writes nothing to squad state, satisfying FR-009 (switching sections preserves squad state)
  trivially, since the two are fully decoupled.
