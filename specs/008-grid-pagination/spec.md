# Feature Specification: Grid Pagination for Catalogue and Squads

**Feature Branch**: `008-grid-pagination`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Add pagination to both listing screens — Developer Catalogue grid and Squads grid — applied to the already-filtered result set, with Previous/Next controls and page indicator, resetting to page 1 on filter change. Client-side only, no backend changes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse the Developer Catalogue in Pages (Priority: P1)

As a Tech Lead browsing the developer catalogue, I want the results to be split into pages instead
of one long scroll, so I can scan a manageable number of profiles at a time as the catalogue grows.

**Why this priority**: The catalogue is the primary, most-visited screen and the one most likely to
grow largest over time — this is where unpaginated scrolling first becomes a real usability problem.

**Independent Test**: Can be fully tested by loading the catalogue with more developers than fit on
one page, confirming only the first page's worth renders, and confirming Next/Previous move between
pages showing the correct developers each time.

**Acceptance Scenarios**:

1. **Given** the catalogue has more matching developers than fit on one page, **When** the Tech
   Lead views the catalogue, **Then** only the first page of results is shown, along with pagination
   controls and a page indicator.
2. **Given** the Tech Lead is on page 1, **When** they click "Next", **Then** the next page of
   results replaces the current ones and the page indicator updates.
3. **Given** the Tech Lead is on a page other than the first, **When** they click "Previous",
   **Then** the prior page of results is shown.
4. **Given** the Tech Lead is on the first page, **When** they view the pagination controls,
   **Then** "Previous" is disabled (there is no earlier page).
5. **Given** the Tech Lead is on the last page, **When** they view the pagination controls,
   **Then** "Next" is disabled (there is no later page).
6. **Given** the Tech Lead changes the name search or seniority filter, **When** the filtered
   result set updates, **Then** the view returns to page 1 of the new results (never left on a page
   that may now be out of range or empty).
7. **Given** the filtered result set fits within a single page, **When** the Tech Lead views the
   catalogue, **Then** no pagination controls are needed to navigate further (nothing to page
   through).

---

### User Story 2 - Browse Saved Squads in Pages (Priority: P2)

As a Tech Lead browsing saved squads, I want the same paging behavior on the Squads screen, so
comparing many saved squads doesn't turn into one long scroll either.

**Why this priority**: Same usability problem as User Story 1, applied to the second listing
screen. Independently valuable and testable, but naturally follows the catalogue since it reuses
the same pattern.

**Independent Test**: Can be fully tested the same way as User Story 1, but against the Squads
screen's saved-squad cards and its own search/seniority filter.

**Acceptance Scenarios**:

1. **Given** more saved squads match the active search/seniority filter than fit on one page,
   **When** the Tech Lead views the Squads screen, **Then** only the first page renders, with
   pagination controls and a page indicator.
2. **Given** the Tech Lead is browsing paginated squads, **When** they use Next/Previous, **Then**
   the behavior matches User Story 1 exactly (same disabled-state rules at the first/last page).
3. **Given** the Tech Lead changes the squad name search or seniority filter, **When** the filtered
   result set updates, **Then** the view returns to page 1 of the new results.

---

### Edge Cases

- A filter change that narrows results to fewer than the current page's worth must not leave the
  Tech Lead on an empty or partially-rendered page — page 1 of the new, narrower result set is
  shown instead (per FR-004).
- Zero results (no matches for the active filters) must continue to show the existing empty/no-results
  state, not a broken or empty pagination control.
- Pagination state is independent per screen — paging through the catalogue does not affect the
  Squads screen's current page, and vice versa.
- Navigating away from a screen and back to it (e.g., Catálogo → Squads → Catálogo) resets that
  screen's pagination back to page 1, consistent with how its filters already reset on re-entry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Developer Catalogue grid MUST paginate the developer list after the existing
  name search and seniority filters are applied — never before.
- **FR-002**: The Squads grid MUST paginate the saved-squad list after the existing name search
  and seniority filters are applied — never before.
- **FR-003**: Both grids MUST provide "Previous" and "Next" controls plus a page indicator
  (e.g., "Page X of Y") when the filtered result set spans more than one page.
- **FR-004**: Changing the name search text or toggling a seniority filter on either screen MUST
  reset that screen's current page back to page 1.
- **FR-005**: "Previous" MUST be disabled on the first page; "Next" MUST be disabled on the last page.
- **FR-006**: When the filtered result set fits within a single page, no page-to-page navigation
  MUST be necessary (pagination controls may be hidden or simply have both directions disabled).
- **FR-007**: Pagination MUST operate entirely on already-fetched, already-filtered data in memory
  — it MUST NOT trigger any additional network request or change what data is fetched from the backend.
- **FR-008**: Each screen's current page MUST be independent of the other screen's.

### Key Entities

- **Page State (derived, non-persisted)**: The current page number for a given screen's filtered
  result set. Not persisted anywhere — resets to 1 on filter change or on leaving and re-entering
  the screen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On either listing screen, no single page displays more than the fixed page-size limit
  of items, regardless of how large the underlying filtered result set is.
- **SC-002**: Moving between pages updates the visible results within 100ms (no perceptible delay
  — purely an in-memory operation, no network wait).
- **SC-003**: 100% of filter changes (search text or seniority toggle) land the Tech Lead on page 1
  of the new results — never on an out-of-range or empty page.
- **SC-004**: A Tech Lead can always tell which page they're on and whether more pages exist, via
  the page indicator and the enabled/disabled state of Previous/Next.

## Assumptions

- Page size is a fixed default per screen, chosen to divide evenly into full rows at each grid
  breakpoint already in use (both grids use the same responsive column pattern: 1 column on
  mobile, up to 4 columns on wide screens) — 12 items per page is used for both the Catalogue and
  Squads grids, since it divides evenly by 1, 2, 3, and 4.
- Pagination controls are simple Previous/Next plus a "Page X of Y" indicator — not a numbered
  page-link list — since this is the simplest control that satisfies the requirement and avoids
  extra complexity for a mock-data-scale project.
- This feature only changes the two existing grid-rendering screens (Catalogue, Squads); it does
  not introduce any new route, and how the underlying data is fetched is unaffected — pagination
  is applied strictly after filtering, in memory.
- No "items per page" selector is introduced — the fixed default is the only page size.
