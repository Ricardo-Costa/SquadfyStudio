# Feature Specification: Developer Catalogue

**Feature Branch**: `002-developer-catalogue`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "catálogo de desenvolvedores com React Query, cards com filtros por nome e senioridade, consumindo dados do JSON Server"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Developer Catalogue (Priority: P1)

An authenticated Tech Lead opens the dashboard and sees the full developer catalogue
displayed as a grid of cards. Each card shows the developer's name, avatar, seniority
level, hourly cost, and skills. The data loads automatically with a visible loading
indicator and is ready to interact with within a few seconds.

**Why this priority**: Without the catalogue, the Tech Lead cannot discover or select
developers. This is the foundation for all squad-building functionality.

**Independent Test**: Can be fully tested by navigating to `/dashboard`, confirming
that developer cards appear with name, avatar, seniority, cost, and skills; and that
a loading indicator is shown while data is being fetched.

**Acceptance Scenarios**:

1. **Given** an authenticated Tech Lead on `/dashboard`, **When** the page loads,
   **Then** a grid of developer cards is displayed, each showing name, avatar, seniority,
   cost, and skills list.
2. **Given** the catalogue is loading, **When** the Tech Lead opens the dashboard,
   **Then** a loading indicator is visible until the developer cards appear.
3. **Given** at least 20 developer profiles exist in the data source, **When** no filters
   are applied, **Then** all profiles are displayed in the catalogue.

---

### User Story 2 - Filter Catalogue by Name (Priority: P2)

The Tech Lead types a developer's name (or partial name) into a search field and the
catalogue updates in real time to show only matching profiles. Clearing the search
field restores the full catalogue.

**Why this priority**: Name search is the fastest way to find a specific developer
the Tech Lead already has in mind.

**Independent Test**: Can be fully tested by typing a partial name into the search
field and confirming that only developers whose names contain the typed text are shown.

**Acceptance Scenarios**:

1. **Given** a Tech Lead on the catalogue page, **When** they type a name or partial
   name in the search field, **Then** only developers whose names match (case-insensitive)
   are displayed.
2. **Given** a search term is active, **When** the Tech Lead clears the search field,
   **Then** the full catalogue is restored immediately.
3. **Given** a search term produces no matches, **When** the filter is applied,
   **Then** an empty state message is displayed (not a blank page or error).

---

### User Story 3 - Filter Catalogue by Seniority (Priority: P3)

The Tech Lead selects one or more seniority levels (Junior, Mid, Senior) from a
filter control. The catalogue updates to show only developers matching the selected
level(s). Clearing the seniority filter restores all seniority levels.

**Why this priority**: Seniority is a critical dimension for squad composition —
a Tech Lead needs to balance experience levels within the team budget.

**Independent Test**: Can be fully tested by selecting "Junior" from the seniority
filter and confirming that only junior developers are shown; then clearing the filter
and confirming all developers reappear.

**Acceptance Scenarios**:

1. **Given** a Tech Lead on the catalogue page, **When** they toggle one or more seniority
   levels (Junior, Mid, Senior), **Then** only developers matching any selected level are shown.
2. **Given** multiple seniority levels are toggled, **When** the Tech Lead deselects all
   levels, **Then** the full catalogue is restored.
3. **Given** both a name search and a seniority filter are active simultaneously,
   **When** the catalogue is displayed, **Then** only developers matching BOTH criteria
   are shown.

---

### User Story 4 - Handle Catalogue Errors (Priority: P4)

If the developer data source is unreachable, the Tech Lead sees a clear error message
with an option to retry the request. The rest of the page remains functional.

**Why this priority**: Without graceful error handling, a temporary data source outage
would leave the Tech Lead with a blank or broken page.

**Independent Test**: Can be fully tested by making the data source unavailable and
confirming an error message with a retry action appears in place of the catalogue.

**Acceptance Scenarios**:

1. **Given** the data source is unavailable, **When** the Tech Lead opens the dashboard,
   **Then** an error message is displayed with a visible retry button.
2. **Given** an error state is shown, **When** the Tech Lead clicks retry and the data
   source becomes available, **Then** the catalogue loads successfully.

---

### Edge Cases

- What if no developers exist in the catalogue? → Display an empty state message
  instead of a blank grid.
- What if search text and seniority filter together return zero results? → Display
  the empty state message with a hint to clear filters.
- What if a developer profile is missing an avatar? → Display a default placeholder
  avatar rather than a broken image.
- What if the developer list is very large (50+ profiles)? → All profiles are rendered
  without pagination for this version; performance is acceptable for expected data size.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST display a catalogue of developer profiles in a card grid
  layout immediately upon load.
- **FR-002**: Each developer card MUST display: full name, avatar image, seniority level
  (Junior, Mid, or Senior), hourly cost, and a list of skills.
- **FR-003**: The catalogue MUST show a loading indicator while developer data is being
  fetched.
- **FR-004**: The catalogue MUST display an error state with a retry action if data
  fetching fails.
- **FR-005**: The catalogue MUST provide a text search field that filters developers by
  name in real time (case-insensitive, partial match supported).
- **FR-006**: The catalogue MUST provide a multi-select seniority filter control with three
  toggleable options (Junior / Mid / Senior); the catalogue narrows to developers matching
  any of the selected levels. When no level is selected, all developers are shown.
- **FR-007**: Name search and seniority filter MUST work together — both constraints are
  applied simultaneously when both are active.
- **FR-008**: Clearing any active filter MUST restore the full catalogue without requiring
  a page reload.
- **FR-009**: When filters produce no results, the catalogue MUST display an empty state
  message rather than a blank grid.
- **FR-010**: The catalogue MUST be accessible only to authenticated users — unauthenticated
  access redirects to the login page (enforced by feature 001 middleware).
- **FR-011**: The data source MUST contain at least 20 developer profiles to provide
  a meaningful catalogue experience.

### Key Entities

- **Developer**: A professional profile with `id` (unique), `name` (full name), `avatar`
  (image URL), `seniority` (one of: Junior, Mid, Senior), `cost` (numeric hourly rate),
  `skills` (list of technology names).
- **Filter State**: The combination of active search text and selected seniority level
  that determines which developers are visible at any point in time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The developer catalogue is fully visible and interactive within 2 seconds
  of the authenticated Tech Lead opening the dashboard on a standard connection.
- **SC-002**: Name filter results update within 300ms of the Tech Lead stopping typing,
  with no page reload required.
- **SC-003**: Applying or clearing any filter updates the catalogue within 100ms with
  no visible flicker or full-page reload.
- **SC-004**: The loading state is visible for 100% of fetch operations — the catalogue
  never appears to "jump" from empty to populated without a loading indicator.
- **SC-005**: The error state and retry button are displayed in 100% of cases where the
  data source is unreachable.
- **SC-006**: All 20+ developer profiles are accessible via the catalogue when no filters
  are applied.

## Assumptions

- The developer catalogue is populated from a mock data source with at least 20 profiles
  containing all required fields (id, name, avatar, seniority, cost, skills).
- Seniority levels are limited to exactly three values: Junior, Mid, and Senior.
- The catalogue is a read-only view — developers cannot be added, edited, or removed
  from the catalogue in this feature (those are data administration concerns out of scope).
- Pagination is out of scope for this feature; all profiles are rendered in a single
  scrollable grid.
- The data is cached after the first successful fetch so that navigating back to the
  dashboard does not trigger a new network request unnecessarily.
- The catalogue is part of the dashboard and therefore inherits the authentication
  protection established in feature 001-auth.
- The squad selection functionality (adding developers to a squad) is out of scope for
  this feature — it will be introduced in feature 003-squad-builder.
- Avatar images are hosted externally or as static assets; broken images fall back to
  a placeholder.

## Clarifications

### Session 2026-06-30

- Q: Should the seniority filter allow selecting multiple levels simultaneously? → A: Multi-select — the Tech Lead may toggle any combination of Junior / Mid / Senior; the catalogue narrows to developers matching any selected level. When no level is selected, all developers are shown.
