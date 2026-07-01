# Feature Specification: Squad Metrics & Persistence

**Feature Branch**: `004-metrics-persistence`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "metrics panel com useMemo — custo total, seniority médio e cobertura de skills do squad; salvar squad via Server Action (POST para JSON Server)"

## Clarifications

### Session 2026-06-30

- Q: Ao clicar "Save Squad" mais de uma vez, o que acontece no backend — cria novo registro (append-only) ou substitui o existente? → A: Cria um novo registro a cada save (append-only POST). O backend acumula registros; sem deduplicação ou upsert. Alinhado com o requisito explícito de POST no project.md.
- Q: Como as métricas e o botão "Save Squad" se integram ao layout do dashboard? → A: Ficam dentro do sidebar direito existente (340px), abaixo da lista de membros — layout de duas colunas preservado, sem terceira coluna.
- Q: Estado do botão "Save Squad" após save bem-sucedido — retorna imediatamente, feedback temporário, ou persiste até mudança? → A: Mostra "Salvo ✓" por ~2 segundos, depois volta a "Save Squad"; reseta imediatamente se o squad for modificado antes do timeout.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Real-Time Squad Metrics (Priority: P1)

As the Tech Lead assembles a squad on the dashboard, a metrics panel shows a live summary of the
current squad composition: the total hourly cost, the average seniority level, and the number of
unique skills covered. Every time a developer is added or removed, the metrics update instantly
without any manual refresh.

**Why this priority**: Metrics are the primary value of the squad builder — they answer "what does
this squad cost?" and "how well-rounded is this team?" in real time. Without metrics, the squad
panel is a list with no analytical value. Delivering metrics first makes the tool immediately useful.

**Independent Test**: Can be fully tested by adding and removing developers and observing that the
three metrics (total cost, seniority level, skill count) update correctly after each change.
An empty squad shows a meaningful zero/empty state for all three metrics.

**Acceptance Scenarios**:

1. **Given** an authenticated Tech Lead with an empty squad, **When** they view the metrics panel,
   **Then** total cost shows $0/hr, seniority shows "—" (no members), and skill coverage shows 0.
2. **Given** the Tech Lead adds two developers to the squad, **When** they view the metrics panel,
   **Then** total cost reflects the sum of both hourly rates, seniority reflects the average across
   both members, and skill coverage shows the count of distinct skills.
3. **Given** the Tech Lead removes a developer from the squad, **When** they view the metrics panel,
   **Then** all three metrics update immediately to reflect the new squad composition.
4. **Given** a squad of 5 developers, **When** the Tech Lead views the metrics panel,
   **Then** all three metrics accurately represent the full squad.

---

### User Story 2 - Save Squad Composition (Priority: P2)

The Tech Lead reviews the assembled squad and metrics and decides to save it. A single "Save
Squad" action persists the current squad composition to the backend. The Tech Lead receives clear
visual feedback confirming the save was successful. If the save fails, a meaningful error message
is shown and the squad state is preserved unchanged.

**Why this priority**: Persistence closes the loop of the squad builder — the Tech Lead's work
is not lost when they navigate away or reload the page. Saving is the terminal action of the
squad-building workflow. It depends on having a meaningful squad (feature 003) and informed metrics
(US1) before committing.

**Independent Test**: Can be fully tested by building a squad with at least one member, clicking
"Save Squad", and confirming that a success message appears and the data is stored in the backend.

**Acceptance Scenarios**:

1. **Given** a squad with at least one member, **When** the Tech Lead clicks "Save Squad",
   **Then** the squad composition is persisted to the backend and a success confirmation is shown.
2. **Given** a save action is in progress, **When** it is pending, **Then** the save button shows
   a loading/disabled state so the Tech Lead cannot trigger duplicate saves.
3. **Given** the backend is unavailable, **When** the Tech Lead clicks "Save Squad",
   **Then** an error message is shown and the squad state remains unchanged.
4. **Given** an empty squad, **When** the Tech Lead views the save action,
   **Then** the save action is disabled and a message indicates the squad must have at least one
   member before saving.

---

### Edge Cases

- **Empty squad metrics**: All three metrics display a zero/empty state rather than error states.
- **Single-member squad**: Metrics are valid with one developer — average seniority = that developer's level; skills = that developer's skills only.
- **Duplicate skills across members**: Skill coverage counts unique skills — overlapping skills between members are counted only once.
- **Save on squad change**: Saving again after changing the squad overwrites the previously saved composition (no versioning in this feature).
- **Page reload after save**: Squad state resets to empty (in-memory); the saved record persists in the backend but is not automatically reloaded into the builder in this feature.
- **Save fails mid-request**: Backend error is shown; local squad state is preserved and the user may retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dashboard MUST display a metrics panel that shows three real-time metrics for the current squad: total hourly cost, average seniority level, and unique skill count.
- **FR-002**: Total hourly cost MUST be computed as the sum of the hourly rates of all current squad members.
- **FR-003**: Average seniority level MUST reflect the overall experience level of the squad as a single readable indicator derived from the seniority levels of all members.
- **FR-004**: Unique skill count MUST reflect the number of distinct skills covered by the squad, counting each skill once regardless of how many members share it.
- **FR-005**: All three metrics MUST update automatically whenever the squad membership changes (member added or removed) — no user action or page refresh required.
- **FR-006**: When the squad is empty, the metrics panel MUST display a zero/empty state for each metric without showing errors.
- **FR-007**: The dashboard MUST provide a "Save Squad" action that persists the current squad composition to the backend.
- **FR-008**: The save action MUST be disabled when the squad has no members.
- **FR-009**: While a save is in progress, the save action MUST be disabled to prevent duplicate submissions.
- **FR-010**: On successful save, the save action MUST display a "Salvo ✓" confirmation state for approximately 2 seconds, then revert to the default "Save Squad" label. If the squad is modified before the timeout expires, the button reverts to "Save Squad" immediately.
- **FR-011**: On save failure, the Tech Lead MUST receive an error message; the squad state MUST remain unchanged and the save button MUST return to its enabled default state so the user can retry.
- **FR-012**: The metric calculation logic (total cost, seniority average, skill coverage) MUST be covered by unit tests to ensure correctness is verifiable in isolation.

### Key Entities

- **Squad Metrics**: A derived summary computed from the current squad members. Contains: total hourly cost (number), average seniority indicator (derived label or score), and unique skill count (integer) with the list of distinct skills.
- **Saved Squad**: A persisted snapshot of a squad composition stored in the backend. Contains: unique identifier, timestamp of save, and the list of squad member profiles captured at the moment of saving.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three metrics (cost, seniority, skills) update within 100ms of any add/remove action — no perceptible delay or stale display.
- **SC-002**: Metric values are accurate in 100% of cases — total cost always equals the arithmetic sum of member rates; skill count always equals the number of distinct skills across all members.
- **SC-003**: The Tech Lead can save the squad in a single click — no intermediate confirmation dialogs or additional steps required.
- **SC-004**: Save confirmation or error feedback appears within 3 seconds of clicking "Save Squad" under normal network conditions.
- **SC-005**: The save action correctly rejects empty squad saves in 100% of cases — no empty squads are persisted.
- **SC-006**: Unit tests cover all metric calculation functions and pass with 100% of defined test cases.

## Assumptions

- Squad state (the list of current members) is provided by the existing squad builder (feature 003) via `useSquad()` — this feature reads it as a read-only input and does not modify it.
- The metrics panel and "Save Squad" button are displayed inside the existing right sidebar (340px), below the squad member list — the two-column dashboard layout from feature 003 is preserved unchanged. No additional columns or routes are introduced.
- The backend (JSON Server) provides a `/squads` collection that accepts POST requests with a squad payload. No authentication is required for this endpoint in the development environment.
- Each save creates a NEW record in the backend (append-only POST) — the backend assigns a unique ID per save. Multiple saves accumulate as separate records; no deduplication or overwrite occurs. No edit, delete, or list-of-saves UI is in scope for this feature.
- After a successful save, the squad builder state is NOT cleared — the Tech Lead can continue editing the squad in memory. The save button shows "Salvo ✓" for ~2 seconds then reverts; any squad modification before that timeout resets the button immediately.
- Metric calculations are pure functions with no side effects — they are tested with Jest as mandated by the project constitution.
- The "average seniority" metric uses a numeric scoring system (junior = 1, mid = 2, senior = 3) averaged across members, then mapped to the nearest named level. An empty squad returns no seniority indicator.
- The save operation persists the full member profile at the time of saving — if a developer's data changes in the catalogue later, the saved record is unaffected (snapshot semantics).
