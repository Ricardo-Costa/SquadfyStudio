# Feature Specification: Squad Builder

**Feature Branch**: `003-squad-builder`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "squad builder com Context API e useReducer — selecionar até 5 desenvolvedores do catálogo, adicionar e remover membros, estado global do squad"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Developer to Squad (Priority: P1)

The Tech Lead browses the developer catalogue and clicks an "Add to Squad" button on a
developer card. The developer is immediately added to a squad panel visible on the dashboard.
The catalogue card updates to show the developer is already in the squad. The Tech Lead can
confirm the squad member was added by seeing them in the squad panel.

**Why this priority**: Adding members is the core action of the squad builder — without it,
no other squad functionality is accessible. This story delivers the minimum viable squad
experience.

**Independent Test**: Can be fully tested by clicking "Add to Squad" on any developer card
and confirming that developer appears in the squad panel; and that the catalogue card updates
to show an "in squad" state.

**Acceptance Scenarios**:

1. **Given** an authenticated Tech Lead viewing the developer catalogue, **When** they click
   "Add to Squad" on a developer card, **Then** the developer appears in the squad panel
   immediately.
2. **Given** a developer has been added to the squad, **When** the Tech Lead views the
   catalogue, **Then** that developer's card shows a visual "in squad" indicator and the
   add action is no longer available for that card.
3. **Given** a developer is in the squad, **When** they appear in filtered catalogue results,
   **Then** their card still shows the "in squad" state correctly.

---

### User Story 2 - View Squad Panel (Priority: P2)

The Tech Lead sees a persistent squad panel on the dashboard showing all current squad members.
Each member entry displays their name, avatar, seniority level, and hourly cost. A capacity
indicator shows how many members are in the squad out of the maximum allowed (e.g., "3/5").
When the squad is empty, the panel displays a clear empty state message.

**Why this priority**: The squad panel is the primary feedback mechanism — it confirms to the
Tech Lead which developers are selected and gives visibility into squad composition at a glance.
Without it, US1 has no visible output to validate.

**Independent Test**: Can be fully tested by adding multiple developers and confirming the panel
displays each member's name, avatar, seniority, and cost; and shows the correct capacity count.

**Acceptance Scenarios**:

1. **Given** a Tech Lead with no developers added, **When** they view the squad panel,
   **Then** an empty state message is displayed.
2. **Given** one or more developers have been added, **When** the Tech Lead views the squad
   panel, **Then** each member is shown with name, avatar, seniority level, and hourly cost.
3. **Given** 3 developers are in the squad, **When** the Tech Lead views the capacity
   indicator, **Then** it shows "3/5" (or equivalent with clear labelling).

---

### User Story 3 - Remove Developer from Squad (Priority: P3)

The Tech Lead removes a developer from the squad by clicking a remove action on the squad panel
entry. The developer is immediately removed from the squad panel. The developer's catalogue card
resets to its addable state, making them available to be selected again.

**Why this priority**: Removal is the counterpart to addition and completes the squad management
loop. A Tech Lead must be able to correct their selection without starting over.

**Independent Test**: Can be fully tested by removing a squad member from the panel and confirming
they disappear from the panel and their catalogue card returns to the addable state.

**Acceptance Scenarios**:

1. **Given** a developer is in the squad, **When** the Tech Lead clicks the remove action on
   their squad panel entry, **Then** the developer is removed from the squad immediately.
2. **Given** a developer has been removed from the squad, **When** the Tech Lead views the
   catalogue, **Then** that developer's card shows the addable state again.
3. **Given** all members are removed, **When** the Tech Lead views the squad panel,
   **Then** the empty state message is shown.

---

### User Story 4 - Enforce Squad Capacity Limit (Priority: P4)

The squad is limited to a maximum of 5 members. When the squad reaches capacity, all remaining
catalogue cards show their "Add to Squad" action as disabled. The capacity indicator clearly
shows the squad is full. Removing a member from a full squad immediately re-enables adding from
the catalogue.

**Why this priority**: The 5-member limit is a core business rule of the squad builder. Without
it, the product has no meaningful constraint and the squad metrics (feature 004) would be
unreliable.

**Independent Test**: Can be fully tested by adding 5 developers and confirming no further
additions are possible; then removing one and confirming additions become available again.

**Acceptance Scenarios**:

1. **Given** the squad already has 5 members, **When** the Tech Lead views the catalogue,
   **Then** all remaining developer cards show the add action as disabled.
2. **Given** the squad is full, **When** the Tech Lead attempts to add another developer,
   **Then** no action is taken and the squad remains at 5 members.
3. **Given** the squad is full, **When** the Tech Lead removes one member, **Then** the
   add action becomes available again on catalogue cards for non-squad developers.
4. **Given** the squad has 5 members, **When** the Tech Lead views the capacity indicator,
   **Then** it clearly communicates that the squad is at maximum capacity.

---

### Edge Cases

- What if the Tech Lead attempts to add a developer already in the squad? → No action is
  taken; the duplicate is silently rejected (the add action is not available for in-squad cards).
- What if the squad is empty and the Tech Lead views the squad panel? → Empty state message
  is displayed with a prompt to add developers from the catalogue.
- What if the page is refreshed? → Squad state resets to empty; session-only persistence
  (cross-session persistence is handled in feature 004-metrics-and-persistence).
- What if filters are active in the catalogue and squad members appear in filtered results? →
  Their cards show the correct "in squad" state regardless of filter context.
- What if the Tech Lead removes the last member from a full squad? → Capacity indicator
  updates immediately and add actions are re-enabled on all remaining catalogue cards.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST provide an "Add to Squad" action on each developer catalogue
  card that is not already in the squad and when the squad is not full.
- **FR-002**: The squad MUST be limited to a maximum of 5 members; adding a 6th member is
  prevented in all scenarios.
- **FR-003**: Each developer MUST appear in the squad at most once; duplicate additions are
  silently rejected based on developer identity.
- **FR-004**: The dashboard MUST display a squad panel showing all current squad members with
  name, avatar, seniority level, and hourly cost.
- **FR-005**: The squad panel MUST provide a remove action for each squad member.
- **FR-006**: Removing a squad member MUST immediately restore the developer's catalogue card
  to its addable state.
- **FR-007**: Catalogue cards for developers already in the squad MUST display a distinct
  "in squad" badge in place of the add action. No remove action is available on catalogue
  cards — removal happens exclusively through the squad panel.
- **FR-008**: When the squad is at full capacity, all non-squad catalogue cards MUST display
  their add action as disabled.
- **FR-009**: The squad panel MUST display a capacity indicator showing current member count
  out of maximum (e.g., "2/5 membros").
- **FR-010**: The squad panel MUST display an empty state message when no members are selected.
- **FR-011**: Squad state MUST be globally accessible across all dashboard components so that
  catalogue cards and the squad panel always reflect the same consistent state.

### Key Entities

- **Squad Member**: A developer selected for the squad — carries the same profile data as a
  Developer (unique id, name, avatar, seniority level, hourly cost, skills). Identity is based
  on the developer's unique id.
- **Squad State**: The current ordered list of squad members (0 to 5 items) and derived metadata
  (current count, whether the squad is at full capacity). Managed globally and available to all
  dashboard components.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Tech Lead can add a developer to the squad in a single click from the
  catalogue — no intermediate steps or confirmations required.
- **SC-002**: The squad panel and all catalogue card states update within 100ms of any
  add or remove action — no visible delay or flicker.
- **SC-003**: The 5-member limit is enforced in 100% of cases — no scenario allows a 6th
  member to be added.
- **SC-004**: Duplicate prevention is enforced in 100% of cases — the same developer cannot
  appear twice in the squad regardless of filter state or interaction order.
- **SC-005**: The capacity indicator is accurate at all times — it reflects the true squad
  count immediately after every add or remove action.
- **SC-006**: The squad panel empty state is displayed in 100% of cases when no members are
  selected, including after all members are removed one by one.

## Clarifications

### Session 2026-06-30

- Q: Where is the squad panel positioned relative to the catalogue on the dashboard? → A: Right sidebar on desktop (~30% width, catalogue ~70%); stacks below the catalogue on mobile in a single-column layout — consistent with patterns from tools such as Jira, Linear, and Figma.
- Q: What happens to the add button on catalogue cards for developers already in the squad — badge only or also a remove shortcut? → A: Badge "No Squad" replaces the add button; no remove action on catalogue cards. Removal happens exclusively through the squad panel.

## Assumptions

- Squad state is in-memory and session-only — it does not persist across page reloads.
  Cross-session persistence via "Save Squad" is out of scope for this feature (covered in
  feature 004-metrics-and-persistence).
- A developer's identity within the squad is determined by their unique `id` field from the
  catalogue. Two records with different IDs are treated as distinct individuals.
- The maximum squad size is fixed at 5 members and is not user-configurable.
- The developer catalogue (feature 002) is a prerequisite — the squad builder operates on
  developers loaded from the catalogue and displayed on the same dashboard page.
- The squad panel is displayed on the same dashboard page as the catalogue, not on a
  separate route. On desktop, the squad panel is a right sidebar occupying approximately
  30% of the page width while the catalogue grid occupies the remaining 70%. On mobile
  viewports, the squad panel stacks below the catalogue grid in a single-column layout.
- Squad state must be globally accessible to both the catalogue grid (for per-card states)
  and the squad panel (for member display and removal) — these are sibling components sharing
  the same global state.
- The metrics panel (feature 004) will consume squad state as a read-only input; metrics
  calculation is out of scope for this feature.
- Visual quality of squad-related UI (add/remove buttons, squad panel, capacity indicator)
  is a first-class requirement alongside functional correctness.
