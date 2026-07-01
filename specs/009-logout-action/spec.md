# Feature Specification: Logout Action

**Feature Branch**: `009-logout-action`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Add a logout button in the top-right corner of the dashboard shell (visible on every private route) and the corresponding logout action that ends the authenticated session, clearing the HttpOnly auth cookie and redirecting the user back to the login page."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - End the Current Session (Priority: P1)

As an authenticated Tech Lead, I want to log out from anywhere in the dashboard so that I can end my session — especially important on a shared or unattended machine.

**Why this priority**: This is the entire feature. Without it there is no way to end a session short of manually deleting cookies, which is not a viable option for a real user.

**Independent Test**: Log in, land on any private page, click the logout control, and verify the session ends and the login page is shown. Fully testable on its own and delivers the complete value of the feature.

**Acceptance Scenarios**:

1. **Given** I am authenticated and viewing the Catálogo, Squads, or a squad edit page, **When** I click the logout control, **Then** my session ends immediately and I am taken to the login page.
2. **Given** I am authenticated, **When** I look at any private page, **Then** the logout control is visible in the top-right corner without needing to open a menu or scroll.
3. **Given** I just logged out, **When** the login page loads, **Then** no leftover squad-builder or session data is displayed if I log back in as a different session.

---

### User Story 2 - Session Cannot Be Reused After Logout (Priority: P2)

As an authenticated Tech Lead who just logged out, I want the system to actually refuse further access to private pages, so that logging out is a real security boundary and not just a visual redirect.

**Why this priority**: A logout button that only changes the screen without invalidating the session would be misleading and insecure — this story is what makes User Story 1 trustworthy rather than cosmetic.

**Independent Test**: Log out, then attempt to reach a private page directly (e.g., via browser back button or by typing the dashboard URL). Verify the private page never renders and the user lands on login instead. Testable independently of the logout button's visual placement.

**Acceptance Scenarios**:

1. **Given** I have just logged out, **When** I press the browser's back button to return to a private page, **Then** I am redirected to the login page instead of seeing cached dashboard content.
2. **Given** I have just logged out, **When** I navigate directly to a private route by URL, **Then** I am redirected to the login page.

### Edge Cases

- What happens if the logout action is triggered twice in quick succession (e.g., double-click)? The second click MUST be a no-op that still lands the user on the login page, not an error.
- What happens if the logout action is triggered while a network request to save a squad is in flight? The in-flight request's outcome does not need to be preserved; the session still ends and the user is redirected.
- What happens if a user without a valid session somehow reaches the logout control (e.g., an already-expired cookie)? Triggering it MUST still result in the user landing on the login page, not an error state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display a logout control in the top-right corner of the dashboard shell, visible on every private route (Catálogo, Squads listing, squad edit pages).
- **FR-002**: Triggering the logout control MUST end the current authenticated session.
- **FR-003**: Triggering the logout control MUST clear the session credential so it can no longer be used to access private routes.
- **FR-004**: After logout completes, the system MUST redirect the user to the login page.
- **FR-005**: After logout, any attempt to access a private route (including via browser back/forward navigation) MUST redirect to the login page, consistent with existing route protection.
- **FR-006**: The logout control MUST be operable via keyboard (focusable and activatable without a mouse), consistent with other interactive controls in the app.
- **FR-007**: The logout action MUST NOT require the user to re-enter credentials or confirm via a dialog — it is a low-risk, single-step, immediately reversible-by-login action.

### Key Entities

- **Session**: The authenticated state tying a browser to a logged-in Tech Lead; represented by the existing auth credential. Logout terminates it; no new entity is introduced.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can end their session and reach the login page in one interaction (a single click/tap) from any private page.
- **SC-002**: 100% of attempts to reach a private page after logout (including via back/forward navigation) result in the login page being shown, not private content.
- **SC-003**: The logout control is discoverable without scrolling or opening a secondary menu on both desktop and mobile viewports.

## Assumptions

- No confirmation dialog is required before logging out — logging out is low-risk and immediately reversible by logging back in, unlike destructive actions elsewhere in the app (e.g., discarding an in-progress squad).
- Logging out does not attempt to save or warn about an in-progress, unsaved squad composition in the builder; any unsaved squad-builder state is simply discarded, consistent with how a full page reload already behaves today.
- The existing session/credential mechanism and route-protection middleware (established in the `001-server-action-auth` feature) are reused as-is; this feature only adds the ability to end that session on demand, not a new auth mechanism.
- "Top-right corner of the dashboard shell" means visible in that position relative to the page on both the desktop sidebar layout and the mobile top-bar layout — exact placement mechanics are a design/implementation decision, not a functional requirement.
