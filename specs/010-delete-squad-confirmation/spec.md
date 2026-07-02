# Feature Specification: Delete Saved Squad with Confirmation

**Feature Branch**: `010-delete-squad-confirmation`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Add a delete/remove action for saved squads, with a confirmation step before the deletion happens. On the Squad detail panel (shown when a saved squad is selected from the Squads grid — see the "Editar" button and squad metrics currently displayed there), add a delete button next to the existing "Editar" button. Clicking it opens a confirmation dialog (reusing the existing ConfirmDialog pattern already used elsewhere in the app for destructive actions) warning that the squad will be permanently deleted. Only on explicit confirmation does the squad get deleted via a Server Action against the mock API (DELETE /squads/:id) — mirroring how "Save Squad" already goes through a Server Action rather than a direct client fetch. After a successful delete, the squad should disappear from the Squads grid and the detail panel should close. If the deleted squad was currently loaded into the squad builder (being edited), the builder's association with it should also clear, consistent with existing behavior when a squad's association is cleared elsewhere in the app."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Delete a saved squad after confirming (Priority: P1)

A Tech Lead viewing a saved squad's details decides it's no longer needed (e.g., the project wrapped up, or it was a test composition). They trigger a delete action from the squad's detail view, are warned that the action is permanent, confirm, and the squad is removed from their saved squads.

**Why this priority**: This is the entire feature — without it, saved squads accumulate indefinitely with no way to clean them up. It's the only user story in this feature and must work end-to-end for the feature to deliver any value.

**Independent Test**: Save a squad, open its detail view, trigger delete, confirm in the dialog, and verify the squad no longer appears in the Squads grid.

**Acceptance Scenarios**:

1. **Given** a saved squad's detail view is open, **When** the Tech Lead triggers the delete action, **Then** a confirmation dialog appears warning that the deletion is permanent, and no data is deleted yet.
2. **Given** the confirmation dialog is open, **When** the Tech Lead confirms the deletion, **Then** the squad is permanently removed, the detail view closes, and the squad no longer appears in the Squads grid.
3. **Given** the confirmation dialog is open, **When** the Tech Lead cancels or dismisses it (e.g., closes without confirming), **Then** the squad is not deleted and the detail view remains open and unchanged.
4. **Given** the squad being deleted is currently loaded into the squad builder for editing, **When** the deletion is confirmed, **Then** the builder's association with that squad is cleared (the builder no longer treats itself as "editing" a squad that no longer exists).

### Edge Cases

- What happens if the deletion fails (e.g., the squad was already deleted by another action, or the backend is unreachable)? The Tech Lead must see an error indication and the squad must remain visible in the Squads grid (no false removal from the UI).
- What happens if the Tech Lead triggers delete on a squad, then rapidly navigates away or reopens a different squad's detail view before confirming? The pending confirmation must apply only to the squad it was opened for — it must not delete a different, subsequently-opened squad.
- What happens if the squad being deleted is not the one currently loaded in the builder? The builder's current state and association must be unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a delete action for a saved squad, reachable from that squad's detail view, positioned alongside the existing edit action.
- **FR-002**: The system MUST require explicit confirmation, via a warning that the action is permanent and irreversible, before any squad data is deleted.
- **FR-003**: The system MUST NOT delete the squad if the confirmation is cancelled or dismissed.
- **FR-004**: The system MUST permanently remove the confirmed squad's saved data upon confirmation.
- **FR-005**: The system MUST close the squad's detail view immediately after a successful deletion.
- **FR-006**: The system MUST remove the deleted squad from the list of saved squads shown to the Tech Lead, so it no longer appears after deletion.
- **FR-007**: The system MUST clear the squad builder's association with the deleted squad if that squad was the one currently loaded for editing, leaving the builder in the same state it would be in if the association had never been made.
- **FR-008**: The system MUST leave the squad builder's contents and association unaffected if the deleted squad was not the one currently loaded for editing.
- **FR-009**: The system MUST indicate to the Tech Lead when a deletion attempt fails, and MUST leave the squad's saved data and its presence in the saved squads list unchanged in that case.

### Key Entities

- **Saved Squad**: A previously saved squad composition (name, members, metadata) that a Tech Lead can view, edit, or now also permanently remove.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Tech Lead can remove an unwanted saved squad in 2 actions or fewer after opening its detail view (trigger delete, confirm).
- **SC-002**: 100% of deletions require an explicit confirmation step — no squad is ever removed from a single, un-confirmed interaction.
- **SC-003**: Immediately after a confirmed deletion, the squad is absent from the saved squads list in every subsequent view (no stale/cached reappearance).
- **SC-004**: If the deleted squad was loaded in the builder, the builder's "editing squad X" state is cleared in 100% of cases, with no leftover reference to the deleted squad.

## Assumptions

- Deletion is a hard, permanent removal — there is no "trash" or recovery/undo mechanism in scope for this feature (the user's own wording, "delete/remove," combined with the existing "permanently deleted" confirmation copy pattern, implies no soft-delete).
- Only the squad's owner/session (the currently logged-in Tech Lead) can delete squads; this project has a single-user credential fixture, so no additional authorization model is needed beyond the existing session check already protecting the dashboard.
- The confirmation dialog reuses the same visual/interaction pattern already established for other destructive/discard actions in the app, so no new confirmation UI paradigm is introduced.
- No bulk-delete (multiple squads at once) is in scope — this feature covers deleting one squad at a time from its detail view.
