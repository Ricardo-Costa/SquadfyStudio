# Contract: `DashboardNav` component

`app/(private)/dashboard/_components/DashboardNav.tsx` — `'use client'`

This is the only new interactive component in this feature. It is a self-contained contract
(no external API/HTTP surface exists in this feature).

## Props

None. `DashboardNav` is self-sufficient: it derives the active section from `usePathname()` and
the two destinations are an internal constant (`NavItem[]`, see `data-model.md`). Rendered with no
props from `app/(private)/dashboard/layout.tsx`.

## Rendered output (behavioral contract)

| Viewport | Structure |
|---|---|
| `lg:` and up | Persistent `<nav>` sidebar with both links always visible; the current-section link is visually marked active (FR-002, FR-007) |
| below `lg:` | A hamburger `<button>` (`aria-expanded`, `aria-label="Abrir menu"` / `"Fechar menu"`) is visible; both links render inside an overlay drawer only while open (FR-005) |

## Behavior contract

| Trigger | Effect | Requirement |
|---|---|---|
| Click hamburger button | Toggles `isOpen` | FR-005 |
| Click a nav link (either viewport) | Navigates via `next/link`; if drawer was open, closes it | FR-006 |
| Click backdrop (drawer open) | Closes drawer, does NOT navigate | FR-006, Edge Case (backdrop dismiss) |
| Press `Escape` (drawer open) | Closes drawer, does NOT navigate | FR-006, Edge Case (Escape dismiss) |
| Viewport crosses the `lg` breakpoint while drawer is open | Drawer closes (mobile-only concept becomes irrelevant on desktop); current section unaffected | Edge Case (breakpoint resize) |
| Pathname changes (e.g. via link click) | `isOpen` resets to `false` | Prevents drawer re-opening on back/forward navigation |

## Accessibility contract

- Hamburger toggle button MUST have an accessible name (`aria-label`) and MUST expose
  `aria-expanded` reflecting `isOpen`.
- The active link MUST be indicated both visually and via `aria-current="page"`.
- Escape-to-close MUST work while focus is anywhere within the open drawer.

## Explicit non-goals (out of scope for this feature)

- No badge/counter, icon customization, or third nav item — exactly two static destinations (FR-001).
- No content inside the Squads destination beyond the placeholder defined in `spec.md` FR-012 —
  full Squads content is deferred to the follow-up multi-squad management feature.
