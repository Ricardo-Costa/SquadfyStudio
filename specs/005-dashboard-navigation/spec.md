# Feature Specification: Dashboard Navigation Shell

**Feature Branch**: `005-dashboard-navigation`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Adicionar navegação lateral ao dashboard com dois itens: Catálogo e Squads. Em telas mobile/estreitas o menu lateral colapsa em um hamburger. Isso implica restruturar as rotas do dashboard para suportar múltiplas telas (catálogo e squads) sob um shell de navegação compartilhado, ao invés da página única atual. Também corrigir um bug de ordem no mobile: hoje, na tela do catálogo, o painel do squad em edição aparece depois da listagem/filtros do catálogo no layout mobile (grid-cols-1); deve passar a aparecer primeiro (logo abaixo do header, acima do conteúdo do catálogo). Esta feature é a base estrutural (navegação + rotas) para uma feature seguinte de gerenciamento de múltiplos squads — não inclui ainda o modelo de dados multi-squad nem a tela de Squads em si (isso fica para a próxima spec), apenas a navegação, a restruturação de rotas necessária, e o fix de ordem mobile no catálogo."

## Clarifications

### Session 2026-07-01

- Q: Which URL structure should Catálogo and Squads use? → A: `/dashboard` continues to be the Catálogo URL (unchanged); Squads gets a new dedicated route, `/dashboard/squads`.
- Q: How should the collapsed (mobile) navigation present itself when opened? → A: As an overlay drawer that slides in and dims the page content behind it, dismissible via backdrop tap or Escape key.
- Q: What should the Squads section placeholder contain in this feature? → A: A simple centered empty-state message (e.g. "Squads chegando em breve"), no interactive elements — consistent with the existing squad-panel empty state.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Between Dashboard Sections (Priority: P1)

As a Tech Lead using the dashboard, I want a persistent navigation with "Catálogo" and "Squads" entries so I can move between the developer catalogue and the squads area without losing my place or reloading unrelated context.

**Why this priority**: Today the dashboard is a single page with no way to reach anything beyond the catalogue. A navigation shell is the structural prerequisite for every screen that comes after it (including the future multi-squad management screen) — without it, there is nowhere to link a second screen to.

**Independent Test**: Can be fully tested by loading the dashboard, confirming both "Catálogo" and "Squads" are visible as navigation entries, clicking each, and confirming the correct section renders while the navigation remains present and indicates the active section.

**Acceptance Scenarios**:

1. **Given** an authenticated Tech Lead on the dashboard, **When** the page loads, **Then** a navigation with "Catálogo" and "Squads" entries is visible, with "Catálogo" indicated as the active section by default.
2. **Given** the Tech Lead is viewing the Catálogo section, **When** they select "Squads" in the navigation, **Then** the Squads section renders and the navigation marks "Squads" as active.
3. **Given** the Tech Lead is viewing the Squads section, **When** they select "Catálogo" in the navigation, **Then** the catalogue and squad-in-progress panel render exactly as before, with any in-progress squad selection preserved.
4. **Given** the Tech Lead navigates directly to the Squads section via a bookmarked/reloaded URL, **When** the page loads, **Then** the navigation renders with "Squads" correctly marked active (no dependency on having visited Catálogo first).

---

### User Story 2 - Collapsible Navigation on Narrow Screens (Priority: P2)

As a Tech Lead using the dashboard on a phone or narrow window, I want the navigation to collapse into a hamburger toggle so it doesn't consume screen space needed for the catalogue and squad content.

**Why this priority**: The dashboard must remain usable on mobile per the project's responsive-layout requirement. This depends on User Story 1 existing (there must be a navigation to collapse) but is independently verifiable once it does.

**Independent Test**: Can be fully tested by resizing the viewport below the mobile breakpoint, confirming the navigation collapses into a single toggle control, opening it, confirming both destinations are reachable, and confirming it closes after a selection.

**Acceptance Scenarios**:

1. **Given** the dashboard is viewed on a narrow/mobile viewport, **When** the page loads, **Then** the navigation is collapsed into a hamburger toggle instead of a full sidebar.
2. **Given** the navigation is collapsed, **When** the Tech Lead activates the hamburger toggle, **Then** both "Catálogo" and "Squads" entries become visible and selectable.
3. **Given** the collapsed navigation menu is open, **When** the Tech Lead selects a destination, **Then** the menu closes and the selected section renders.
4. **Given** the viewport is resized from narrow to wide (or vice versa) while the app is open, **When** the breakpoint is crossed, **Then** the navigation switches between collapsed (hamburger) and expanded (sidebar) presentation without losing the current section or in-progress squad state.

---

### User Story 3 - Squad Panel Precedes Catalogue on Mobile (Priority: P3)

As a Tech Lead building a squad on a narrow screen, I want the in-progress squad panel to appear before the catalogue listing and filters (directly below the header) so I can see who I've already selected without scrolling past the entire catalogue first.

**Why this priority**: This is a self-contained layout fix on the existing Catálogo screen. It improves usability but does not block User Stories 1 or 2, and can be verified independently of the navigation work.

**Independent Test**: Can be fully tested by viewing the Catálogo section on a narrow/mobile viewport and confirming the squad-in-progress panel renders above the catalogue filters and listing, immediately below the page header.

**Acceptance Scenarios**:

1. **Given** the Tech Lead views the Catálogo section on a narrow/mobile viewport, **When** the page renders, **Then** the squad-in-progress panel appears first (directly below the header), followed by the catalogue filters and listing.
2. **Given** the same Catálogo section is viewed on a wide/desktop viewport, **When** the page renders, **Then** the existing two-column layout (catalogue left, squad panel right) is unchanged.
3. **Given** the Tech Lead adds or removes a squad member while on a narrow viewport, **When** the change occurs, **Then** the squad panel (still positioned above the catalogue) reflects the update immediately.

---

### Edge Cases

- Deep-linking directly to the Squads section (no prior visit to Catálogo) must render the nav with the correct active state and must not error due to missing prior client state.
- Resizing across the mobile breakpoint while the hamburger menu is open must not leave the menu open-but-empty or the page unscrollable.
- Dismissing the overlay drawer via backdrop tap or Escape key must not navigate away from the current section — it only closes the drawer.
- The Squads section has no dedicated content yet in this feature (full squads listing/filtering ships in a follow-up feature) — it must render a clear, non-broken placeholder rather than an empty white screen or an error.
- Navigation must not appear on `/login` or any unauthenticated route — it is scoped to the authenticated dashboard shell only.
- Switching sections must not reset or clear the in-progress squad state managed by the existing squad builder.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST display a navigation with exactly two entries: "Catálogo" and "Squads".
- **FR-002**: The navigation MUST visually indicate which of the two sections is currently active.
- **FR-003**: Selecting "Catálogo" MUST render the existing catalogue browsing and squad-building experience unchanged in content and behavior, at the existing `/dashboard` URL (unchanged from today).
- **FR-004**: Selecting "Squads" MUST render a distinct Squads section at a dedicated `/dashboard/squads` URL (direct navigation/reload/bookmark must land on the correct section).
- **FR-005**: On narrow/mobile viewports, the navigation MUST collapse into a single toggle control that, when activated, opens an overlay drawer revealing both destinations and dimming the underlying page content.
- **FR-006**: Selecting a destination from the collapsed navigation, tapping the dimmed backdrop, or pressing Escape MUST close the overlay drawer; selecting a destination MUST also render the selected section.
- **FR-007**: On wide/desktop viewports, the navigation MUST remain persistently visible (not collapsed) as a sidebar.
- **FR-008**: The navigation MUST NOT appear on unauthenticated routes (e.g., `/login`); it MUST only render within the authenticated dashboard shell.
- **FR-009**: Switching between Catálogo and Squads MUST preserve the in-progress squad state (members currently selected in the squad builder) without resetting it.
- **FR-010**: On narrow/mobile viewports, the Catálogo section MUST render the squad-in-progress panel before (above) the catalogue filters and listing, directly below the page header.
- **FR-011**: On wide/desktop viewports, the Catálogo section MUST preserve the existing two-column layout (catalogue content and squad panel side by side).
- **FR-012**: The Squads section MUST render a placeholder state in this feature — a simple centered empty-state message with no interactive elements, consistent with the existing squad-panel empty state (its full content is out of scope here and is delivered by a follow-up feature) — without displaying errors or a broken/empty page.
- **FR-013**: All routes under the dashboard, including the new Squads route, MUST remain protected by the existing authentication protection — unauthenticated requests MUST redirect to `/login`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From any dashboard screen, a Tech Lead can reach the other section in a single interaction (one click or tap).
- **SC-002**: On viewports narrower than the app's existing mobile breakpoint, the navigation occupies no persistent horizontal space until the toggle is activated, and both destinations remain reachable through it.
- **SC-003**: On mobile viewports, the squad-in-progress panel is visible immediately below the header without scrolling past the catalogue listing.
- **SC-004**: Switching between Catálogo and Squads never discards the Tech Lead's in-progress squad selection — verified across 100% of navigation transitions.
- **SC-005**: 100% of dashboard routes (existing and newly added) remain inaccessible without a valid authenticated session.
- **SC-006**: The desktop two-column Catálogo layout and all existing squad-building interactions are visually and behaviorally unchanged after this feature ships.

## Assumptions

- The mobile/desktop breakpoint reuses the existing convention already applied in the Catálogo layout (the `lg` breakpoint), so the collapse behavior and the panel-reorder behavior activate at the same width.
- The Squads section's full experience (listing saved squads, filtering, searching, multi-squad management) is explicitly out of scope for this feature and is deferred to a follow-up feature (multi-squad management); here it only needs a non-broken placeholder reachable via navigation and routing.
- Existing squad-in-progress state continues to be provided by the current squad builder without modification in this feature; the navigation restructuring only changes routing/layout, not squad state logic.
- The navigation is only relevant to the authenticated dashboard shell — no navigation changes are required on the login page or other public routes.
- No new backend/API changes are required for this feature — it is routing, layout, and UI only.
