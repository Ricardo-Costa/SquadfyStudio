# Feature Specification: Multi-Squad Browsing & Comparison

**Feature Branch**: `006-multi-squad-management`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Multi-squad browsing and comparison: replace the Squads placeholder from 005-dashboard-navigation with a real screen listing saved squads as cards (fetched via React Query from GET /squads), with search/filter similar to the catalogue; each squad gets a name at save time (extending 004's save flow) so it can be searched; cards show cost/seniority/skill summaries reusing lib/metrics.ts. Comparing/browsing only — no editing or deleting saved squads, no concurrent multi-squad building."

## Clarifications

### Session 2026-07-01

- Q: How should the Tech Lead be prompted for the squad name at save time? → A: A modal/dialog opens when "Save Squad" is clicked, asking for the name before confirming the save (rather than an always-visible inline field in the narrow sidebar).
- Q: Does the name modal remember the last-used name across saves, or always start blank? → A: Always starts blank on every open — no pre-filling from a previous save.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Name a Squad When Saving (Priority: P1)

As a Tech Lead saving a squad composition, I want to give it a short name so I can recognize and find it later among other squads I've saved for different projects.

**Why this priority**: Without a name, saved squads have no human-readable identity — every later capability (browsing, searching) depends on this existing first. It's the smallest possible slice that unblocks everything else.

**Independent Test**: Can be fully tested by building a squad, saving it with a chosen name, and confirming the persisted record includes that name (verifiable directly against the backend even before a browsing screen exists).

**Acceptance Scenarios**:

1. **Given** a Tech Lead has assembled a squad with at least one member, **When** they click "Save Squad", **Then** a modal opens prompting them to enter a name for the squad before it is persisted.
2. **Given** the modal is open with an empty (or whitespace-only) name, **When** the Tech Lead attempts to confirm, **Then** the confirm action is disabled/blocked and a message indicates a name is required.
3. **Given** the Tech Lead enters a name in the modal and confirms successfully, **When** the save completes, **Then** the modal closes, the persisted squad record includes that name alongside the existing member/cost data, and the existing "Salvo ✓" confirmation is shown.
4. **Given** the Tech Lead saves two different squad compositions using the same name, **When** both saves complete, **Then** both are persisted as separate records (duplicate names are allowed, since each save is a distinct snapshot).
5. **Given** the modal is open, **When** the Tech Lead dismisses it (cancel, backdrop, or Escape) without confirming, **Then** no save occurs and the squad builder state is unchanged.

---

### User Story 2 - Browse and Compare Saved Squads (Priority: P2)

As a Tech Lead deciding which squad best fits a project, I want to see all previously saved squads as cards — each showing its name, members, total cost, average seniority, and skill coverage — so I can compare them at a glance without opening each one individually.

**Why this priority**: This is the core value of the feature described in the project refinement: letting the Tech Lead visually compare squads to pick the best fit. It depends on User Story 1 (squads need names to be distinguishable) but delivers the actual "browsing" value on its own.

**Independent Test**: Can be fully tested by saving two or more named squads, opening the Squads section, and confirming each renders as a card with correct name, member info, and metrics — replacing the placeholder from the navigation feature.

**Acceptance Scenarios**:

1. **Given** the Tech Lead has saved three squads, **When** they open the Squads section, **Then** three cards render, each showing its name, member count/avatars, total cost, average seniority, and number of distinct skills.
2. **Given** no squads have been saved yet, **When** the Tech Lead opens the Squads section, **Then** a meaningful empty state is shown instead of an empty grid or an error.
3. **Given** the squads data is still loading, **When** the Tech Lead opens the Squads section, **Then** a loading indicator is shown instead of a blank or broken layout.
4. **Given** the backend is unavailable, **When** the Tech Lead opens the Squads section, **Then** an error state is shown with no partial/broken card rendering.
5. **Given** a squad was saved before this feature existed (no name on record), **When** its card renders, **Then** it shows a readable fallback label (derived from its saved date) instead of a blank or broken name.

---

### User Story 3 - Search and Filter Saved Squads (Priority: P3)

As a Tech Lead with many saved squads, I want to search by name and filter by seniority level so I can narrow down to the squads relevant to my current decision, the same way I already filter the developer catalogue.

**Why this priority**: This is a refinement on top of browsing (User Story 2) — valuable once there are enough saved squads to make scanning them inefficient, but the feature is still useful without it for a small number of squads.

**Independent Test**: Can be fully tested by saving several distinctly-named squads with different seniority profiles, then confirming that typing a name fragment and toggling seniority filters narrows the visible cards correctly, matching the existing catalogue filter behavior.

**Acceptance Scenarios**:

1. **Given** several saved squads exist, **When** the Tech Lead types part of a squad's name into the search field, **Then** only cards whose name matches are shown.
2. **Given** several saved squads exist with different average seniority levels, **When** the Tech Lead toggles a seniority filter, **Then** only cards whose average seniority matches the selected level(s) are shown.
3. **Given** search text and seniority filters are both active, **When** applied together, **Then** only cards matching both conditions are shown.
4. **Given** active search/filter criteria match no saved squads, **When** the result is empty, **Then** a "no results" message is shown (distinct from the "no squads saved yet" empty state from User Story 2).

---

### Edge Cases

- Saving a squad with a name consisting only of whitespace must be treated as empty (blocked, per FR-002).
- Squads saved before this feature shipped have no `name` field — they must render using the fallback label (derived from their saved date) everywhere a name would otherwise appear, including in search (searchable by that fallback text) and in seniority filtering (still computed from their members as normal).
- A saved squad with zero remaining valid data (e.g., malformed record) must not crash the Squads section — it is skipped from rendering rather than breaking the whole list.
- Clearing the search field and all seniority filters must restore the full list of saved squads.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clicking "Save Squad" MUST open a modal prompting the Tech Lead for a squad name before persisting the squad composition (rather than an inline field).
- **FR-002**: The modal's confirm action MUST be disabled (or blocked with a clear message) when the name field is empty or contains only whitespace.
- **FR-003**: A saved squad record MUST include the provided name alongside its existing member/timestamp data.
- **FR-003a**: Dismissing the modal (cancel, backdrop click, or Escape) without confirming MUST NOT persist anything and MUST leave the squad builder state unchanged.
- **FR-003b**: The name modal MUST always open with an empty name field — it MUST NOT pre-fill or remember a name from a previous save.
- **FR-004**: Duplicate squad names MUST be allowed — each save produces an independent record regardless of name reuse.
- **FR-005**: The Squads section MUST fetch all saved squad records from the backend and render each as a card.
- **FR-006**: Each squad card MUST display: the squad's name (or fallback label if absent), its members (count and/or avatars), total hourly cost, average seniority level, and count of distinct skills — computed the same way as the existing squad-builder metrics.
- **FR-007**: The Squads section MUST show a distinct empty state when no squads have been saved yet (replacing the static placeholder from the navigation feature).
- **FR-008**: The Squads section MUST show a loading state while fetching and an error state if the fetch fails, without partially rendering broken cards.
- **FR-009**: The Squads section MUST provide a text search over squad names (including fallback labels for unnamed legacy records).
- **FR-010**: The Squads section MUST provide a seniority-level filter over squads' computed average seniority, mirroring the catalogue's existing seniority filter pattern.
- **FR-011**: Search and filter criteria MUST combine (AND logic) and MUST be able to be cleared back to the full list.
- **FR-012**: The Squads section MUST NOT provide any way to edit or delete a previously saved squad.
- **FR-013**: The Squads section MUST NOT allow building or editing more than one squad composition concurrently — the existing single-builder flow (features 003/004) is unchanged.
- **FR-014**: A malformed or unrenderable saved squad record MUST be skipped rather than breaking the rendering of the rest of the list.

### Key Entities

- **Saved Squad** (extended): builds on the existing persisted squad record — adds a `name` (string, provided at save time) to the existing member snapshot, save timestamp, and unique identifier. Records saved before this feature lack `name` and are handled via a fallback display label.
- **Squad Card (derived, non-persisted)**: the comparable summary shown per saved squad — name/fallback label, member list, total cost, average seniority, distinct skill count — computed from a Saved Squad using the same calculation logic already used for the in-progress squad builder.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Tech Lead can name and save a squad in the same single flow used today, with at most one additional field to fill in.
- **SC-002**: All previously saved squads are visible and comparable (name, cost, seniority, skills) within a single screen, with no need to open individual records.
- **SC-003**: Searching or filtering narrows the visible squads to matching results within 100ms of input (no perceptible delay, same responsiveness bar as the catalogue filters).
- **SC-004**: 100% of saved squad records render without error, including any saved before this feature shipped (via fallback labeling).
- **SC-005**: A Tech Lead can go from "many saved squads" to "the one relevant candidate" using only name search and seniority filtering, without needing to scroll through unrelated squads.

## Assumptions

- The Squads section built here replaces the placeholder page introduced in `005-dashboard-navigation` at `/dashboard/squads` — that feature's navigation shell (route, nav link, active state) is reused unchanged.
- Squad naming is a required, free-text field with no uniqueness constraint — duplicate names across different saved squads are permitted, since each save is an independent, timestamped snapshot (consistent with 004's append-only save semantics).
- Legacy saved squads (persisted before this feature, without a `name`) are displayed using a fallback label derived from their saved date (e.g., "Squad salvo em 30/06/2026") rather than being hidden or treated as errors.
- Filtering criteria mirror the catalogue's existing pattern exactly: free-text name search plus a multi-select seniority filter — no additional filter dimensions (e.g., skill-based filtering) are introduced in this feature.
- Saved squad data continues to be fetched as server state, consistent with how the catalogue is already fetched; the in-progress squad builder's own state management is unaffected by this feature.
- No pagination is required — the expected number of saved squads for this project's scope is small enough to render as a single grid.
