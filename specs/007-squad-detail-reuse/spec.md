# Feature Specification: Squad Detail Panel & Reuse

**Feature Branch**: `007-squad-detail-reuse`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Squad detail panel and reuse flow, plus two related display gaps found during manual testing of 006. On the Squads screen, clicking a saved squad card opens a detail panel beside the grid (visually similar to the existing squad-builder panel on the catalogue screen), showing the full member list, the complete skill list (not just the count), and per-member cost — closing a gap where saved squad data is computed but never fully shown. From that detail panel, an 'Editar' action navigates to the catalogue/squad-builder screen with that saved squad's members pre-loaded into the active builder, so the Tech Lead can add/remove developers and save again, choosing to keep the existing name or provide a new one. Also fixes a bug found during this investigation: SquadCard has no avatar-load-error fallback (unlike DeveloperCard, which already falls back to a dicebear initials avatar) — SquadCard should get the same fallback."

## Clarifications

### Session 2026-07-01

- Q: When the Tech Lead edits a saved squad (via "Editar") and saves again, does that create a new record or update the original in place? → A: Updates the original record in place (same `id`) — the edited squad replaces the prior version rather than existing alongside it. This revises feature 006's FR-012 ("no editing... of a previously saved squad") specifically for this flow: edits are now possible, but only through the explicit "Editar" action described here, and always as a full update of the same record — no other edit surface is introduced.
- Q: How should the FR-008 warning (unsaved builder selections about to be replaced) behave? → A: A blocking confirmation modal — navigating to the loaded builder only happens if the Tech Lead explicitly confirms; canceling leaves the current builder selection untouched.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Full Squad Details (Priority: P1)

As a Tech Lead comparing saved squads, I want to click a squad card and see its full details — every
member, every skill, and each member's individual cost — so I can actually evaluate whether this
squad fits a project, instead of only seeing three aggregate numbers.

**Why this priority**: This is the gap that makes squad comparison non-functional today: the card
shows a skill *count* and blurry avatars, but never the actual roster or skill names a Tech Lead
needs to decide. Without this, the Squads screen cannot deliver the "compare and choose" value the
feature was built for.

**Independent Test**: Can be fully tested by saving a squad with 2+ members, opening the Squads
screen, clicking its card, and confirming a detail panel shows every member (name, seniority,
individual cost), the complete list of distinct skills, and the same aggregate metrics already on
the card.

**Acceptance Scenarios**:

1. **Given** a saved squad with 3 members, **When** the Tech Lead clicks its card, **Then** a detail
   panel opens showing all 3 members individually (name, seniority, cost) and the full list of
   distinct skills across the squad (not just a count).
2. **Given** the detail panel is open, **When** the Tech Lead closes it, **Then** the panel closes
   and the Squads grid is visible again, unchanged.
3. **Given** the detail panel is open for one squad, **When** the Tech Lead clicks a different
   squad's card, **Then** the panel updates to show the newly selected squad's details.
4. **Given** a squad saved before a `name` field existed (legacy record), **When** its detail panel
   opens, **Then** it shows the same fallback label already used on its card, with no error.

---

### User Story 2 - Edit and Re-save a Saved Squad (Priority: P2)

As a Tech Lead who wants to reuse a previous squad as a starting point, I want an "Editar" action in
the detail panel that loads that squad's members into the active squad builder, so I can adjust the
roster and save the result, keeping the original name or giving it a new one.

**Why this priority**: This turns a saved squad from a dead end into a reusable starting point,
directly enabling the "choose and adapt the best-fit squad" workflow the project refinement asked
for. It depends on User Story 1 (the detail panel is where this action lives) but is independently
testable once available.

**Independent Test**: Can be fully tested by opening a saved squad's detail panel, clicking
"Editar", confirming the catalogue/builder screen now shows that squad's members already selected,
adding or removing a member, saving again, and confirming a squad record reflecting the change now
exists.

**Acceptance Scenarios**:

1. **Given** a saved squad's detail panel is open, **When** the Tech Lead clicks "Editar", **Then**
   they are taken to the squad-builder screen with that squad's members already selected in the
   builder.
2. **Given** the builder now holds a loaded squad's members, **When** the Tech Lead adds or removes
   a member (respecting the existing 5-member cap), **Then** the builder behaves exactly as it does
   for a squad built from scratch.
3. **Given** the Tech Lead has finished adjusting the loaded squad, **When** they click "Save Squad",
   **Then** the name prompt is pre-filled with the original squad's name, editable — they can
   confirm it unchanged to keep the name, or replace it with a new one.
4. **Given** the Tech Lead already has unsaved members in the active builder, **When** they click
   "Editar" on a different saved squad, **Then** a blocking confirmation prompt appears; confirming
   proceeds to the builder with the loaded squad's members, while canceling leaves the current
   builder selection untouched and does not navigate away.

---

### User Story 3 - Reliable Avatar Display on Squad Cards (Priority: P3)

As a Tech Lead browsing squads, I want a member's avatar to still show something recognizable even
if the image fails to load, so a broken-image icon never appears on a squad card.

**Why this priority**: A small, self-contained reliability fix, independent of the detail panel
work — it improves an existing screen (006) without depending on User Stories 1 or 2.

**Independent Test**: Can be fully tested by forcing an avatar image to fail to load (e.g., an
unreachable URL) and confirming the squad card shows a fallback avatar instead of a broken-image icon.

**Acceptance Scenarios**:

1. **Given** a squad member's avatar image fails to load, **When** their squad's card renders,
   **Then** a fallback avatar (derived from the member's name) is shown instead of a broken image.

---

### Edge Cases

- Closing the detail panel must not affect the underlying saved squad data — it is a read-only view except for the explicit "Editar" action.
- Clicking "Editar" on a squad whose saved member snapshot references a developer no longer in the current catalogue must still load that member into the builder using the squad's saved snapshot data (not a live catalogue lookup) — consistent with the existing snapshot semantics from feature 004.
- Re-saving a loaded squad with an empty/whitespace-only name must be blocked, identical to the existing name-validation rule from feature 006.
- If the Tech Lead navigates away from the builder after loading a squad for editing without saving, the in-progress changes are lost with no special warning beyond what already applies to the existing builder (no change from current behavior).
- A squad detail panel opened for a squad with exactly 1 member must still render correctly (no layout assuming multiple members).
- Editing a legacy squad (no real `name`, only a fallback label) pre-fills the save prompt with that fallback label text rather than leaving it blank — see FR-009.
- If the Tech Lead empties the builder entirely (removes every member) while editing a loaded squad, the builder MUST stop being associated with that squad — the next save (once new members are added) MUST create a new squad record, not update the one that was being edited.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Clicking a saved squad's card on the Squads screen MUST open a detail panel for that squad.
- **FR-002**: The detail panel MUST show every member of the squad individually, including at minimum: name, seniority level, and individual hourly cost.
- **FR-003**: The detail panel MUST show the complete list of distinct skills covered by the squad (not only a count).
- **FR-004**: The detail panel MUST also show the same aggregate metrics already shown on the card (total cost, average seniority, skill count) for consistency.
- **FR-005**: The Tech Lead MUST be able to close the detail panel and return to the unmodified Squads grid.
- **FR-006**: Selecting a different squad's card while a detail panel is open MUST update the panel to that squad's details (not require closing and reopening).
- **FR-007**: The detail panel MUST provide an "Editar" action that navigates to the squad-builder screen with the selected squad's members pre-loaded into the active builder.
- **FR-008**: If the active builder already holds unsaved member selections when "Editar" is triggered, the Tech Lead MUST confirm via a blocking confirmation prompt before those selections are replaced by the loaded squad's members; canceling MUST leave the current builder selection untouched and MUST NOT navigate away.
- **FR-009**: When saving a squad that was loaded via "Editar", the name prompt MUST be pre-filled with the original squad's name (editable) rather than blank — this is the one case where the save flow deviates from feature 006's "always blank" rule, since an existing name is already known. For a legacy record with no real `name` (only a fallback label), the prompt MUST pre-fill with that fallback label text, so the Tech Lead can either keep it as the squad's first real name or replace it.
- **FR-010**: Saving after an edit MUST update the original saved squad record in place (same identity) — the edited version replaces the prior version; no separate/duplicate record is created for this flow. This is the one exception to features 004/006's append-only model, scoped exclusively to the "Editar" flow described in this feature — no other way to modify or remove a saved squad is introduced.
- **FR-010a**: When an edit-save completes, the record's saved timestamp MUST update to reflect the time of that save (acting as a last-modified time for updated records).
- **FR-011**: All existing name validation rules from feature 006 (required, non-blank) apply identically when saving a loaded/edited squad.
- **FR-010b**: If the Tech Lead removes every member from the builder while it is associated with a loaded squad, that association MUST end — a subsequent save (once the builder has members again) MUST create a new squad record rather than update the previously-loaded one.
- **FR-012**: `SquadCard` MUST display a fallback avatar (derived from the member's name) for any member whose avatar image fails to load, matching the existing fallback already used in the developer catalogue.

### Key Entities

- **Squad Detail View (derived, non-persisted)**: An expanded, read-only presentation of a single `SavedSquad` — full member roster with individual cost/seniority, complete skill list, and the same aggregate metrics as its card. Not a new persisted entity; built from data already captured at save time.
- **Loaded Squad (transient builder state)**: The squad-builder's existing in-progress state, populated from a `SavedSquad`'s member snapshot when "Editar" is used. Behaves identically to a builder populated by hand — same 5-member cap, same add/remove rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From the Squads screen, a Tech Lead can see every member and every skill of any saved squad within one click — no missing roster or skill information for any saved squad.
- **SC-002**: A Tech Lead can go from "viewing a saved squad" to "editing it in the builder" in a single action ("Editar").
- **SC-003**: 100% of squad cards display a usable avatar for every member, even when the source image fails to load — no broken-image icons appear.
- **SC-004**: Re-saving an edited squad succeeds in one click when keeping the original name (no retyping required).

## Assumptions

- The detail panel's placement mirrors the existing squad-builder panel pattern from the catalogue screen (a panel beside the main content), per explicit user direction; exact responsive behavior on narrow viewports is a plan-level decision, likely following the same pattern already established for the catalogue's panel (005).
- Loading a squad via "Editar" replaces the builder's current member selection entirely (not merged with whatever was already selected) — the Tech Lead is now editing a copy of that specific squad, not combining two squads.
- The pre-filled name on re-save (FR-009) only applies to the "Editar" flow; saving a squad built from scratch (not loaded via "Editar") continues to always start blank, per feature 006's existing behavior — unaffected by this feature.
- Loaded member data comes from the saved squad's own snapshot (already-persisted `Developer[]` data), not a fresh catalogue lookup — consistent with 004's existing snapshot semantics, and avoids any dependency on catalogue data being unchanged since the original save.
- This feature does not introduce squad deletion — "Editar" plus a new save is the only way to modify a saved squad, and per FR-010 it updates the existing record in place (same `id`) rather than creating a duplicate.
