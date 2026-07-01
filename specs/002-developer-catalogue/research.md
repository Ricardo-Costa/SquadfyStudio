# Research: Developer Catalogue

**Feature**: 002-developer-catalogue
**Date**: 2026-06-30
**Status**: Complete — all decisions resolved

---

## Decision 1: React Query provider placement

**Decision**: Wrap `app/(private)/layout.tsx` via a `app/providers.tsx` Client Component

**Rationale**: React Query is needed only for private routes (catalogue, future squad builder, save squad). Scoping the `QueryClientProvider` to `(private)/layout.tsx` avoids instantiating it for the public login page. The `app/providers.tsx` pattern is the standard Next.js 15 App Router approach for client-only wrappers.

**Alternatives considered**:
- Root `app/layout.tsx`: Works but wraps the login page unnecessarily; login doesn't need React Query
- Per-page: Would create multiple QueryClient instances and break cache sharing between pages

---

## Decision 2: Filter implementation approach

**Decision**: Client-side filtering with `useMemo` on cached React Query data

**Rationale**: React Query caches the full developer list after the first fetch. Filtering runs synchronously against in-memory data — no network round-trip, no debouncing needed. This trivially satisfies SC-002 (300ms) and SC-003 (100ms). Server-side filtering via JSON Server query params would add latency and invalidate the cache on every keystroke.

**Alternatives considered**:
- JSON Server query params (`GET /developers?seniority=junior&name_like=ana`): Network call per filter change; slower; breaks cache
- Hybrid (server-side pagination + client filter): Overkill for 20–50 profiles

---

## Decision 3: Debouncing for name search

**Decision**: No debounce — immediate filter on every keystroke

**Rationale**: Debouncing is a performance technique for network calls. Since filtering is pure client-side computation on cached data, it runs in under 1ms. Debouncing would add artificial delay with no benefit and slightly worsen the real-time feel described in FR-005.

**Alternatives considered**:
- 300ms debounce: Unnecessary for synchronous in-memory filtering; would feel sluggish

---

## Decision 4: Seniority filter UI component

**Decision**: Toggle button group (pill buttons) — multi-select, confirmed in `/speckit-clarify`

**Rationale**: Three pill-style toggle buttons (Junior / Mid / Senior) are always visible, support multi-select with a single click per level, and deliver the polished visual quality required by the project. The small fixed set (3 options) is ideal for this pattern.

**Alternatives considered**:
- `<select>` dropdown: Single-select only without custom logic; lower visual quality
- Checkboxes: Functional but visually inferior; inconsistent with a polished dashboard

---

## Decision 5: Avatar image strategy

**Decision**: `<img>` tag with `onError` handler replacing `src` with a DiceBear initials URL

**Rationale**: DiceBear (`https://api.dicebear.com/7.x/initials/svg?seed={name}`) generates consistent, attractive initials-based SVG avatars from a seed string. Using `onError` as a fallback (rather than `next/image`) avoids configuring `remotePatterns` in `next.config.ts` for multiple domains.

**Alternatives considered**:
- `next/image`: Requires whitelisting every avatar domain; adds complexity for mock data
- CSS initials placeholder (client-rendered): More code, same result as DiceBear fallback

---

## Decision 6: Loading state — skeleton vs spinner

**Decision**: Skeleton card grid (CSS pulse animation, matching card dimensions)

**Rationale**: Skeleton screens give better perceived performance by matching the layout of the real content. They prevent layout shift when real cards appear, satisfying SC-004 (no "jump" from empty to populated). A spinner gives no layout preview.

**Alternatives considered**:
- Centered spinner: Simple but causes layout shift; does not preview card dimensions
- Blur placeholder: Only applies per image, not full card

---

## Decision 7: React Query staleTime

**Decision**: `staleTime: 5 * 60 * 1000` (5 minutes)

**Rationale**: 5 minutes satisfies the spec assumption ("data cached after first fetch; navigating back does not trigger a new request unnecessarily") while still allowing React Query's retry logic to work after errors. `Infinity` would prevent automatic re-fetches and break the "retry after error" UX.

**Alternatives considered**:
- `staleTime: 0` (default): Refetches on every window focus; unnecessary for mock data
- `staleTime: Infinity`: Breaks retry-after-error UX; requires manual invalidation

---

## Dependency to install

`@tanstack/react-query@^5` — not yet in `package.json`. Must be installed before implementation begins.

```bash
npm install @tanstack/react-query
```
