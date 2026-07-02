# Data Model: Input Length Limits Across Forms

## No new entities

This feature adds validation constraints to existing form fields — no schema, persisted-data
shape, or entity changes. There is nothing to model as an entity; the "data" this feature
governs is a set of named limit constants and two stateless validation rules.

## Validation Rules (constants)

All defined in `frontend/lib/config.ts`, consumed by both browser-side and backend-side checks
(single source of truth per FR-005):

| Constant | Value | Applies to | Rule |
|---|---|---|---|
| `EMAIL_MAX_LENGTH` | 254 | Login e-mail | max length only (no min beyond existing `required`) |
| `PASSWORD_MAX_LENGTH` | 128 | Login password | max length only (no min beyond existing `required`) |
| `SQUAD_NAME_MIN_LENGTH` | 2 | Squad name (create/edit) | min length (trimmed) |
| `SQUAD_NAME_MAX_LENGTH` | 60 | Squad name (create/edit) | max length (trimmed) |
| `SEARCH_MAX_LENGTH` | 100 | Catalogue search, Squads search | max length only, browser-side only |

## Validation Functions (`frontend/lib/validation.ts`)

Pure, stateless, no dependencies — same category as `lib/squad/metrics.ts`'s pure calculation
functions.

```ts
function containsDangerousContent(value: string): boolean
// true if value contains '<' or '>' — used for login e-mail/password and squad name only

function exceedsMaxLength(value: string, max: number): boolean
// true if value.length > max — used as-is (untrimmed) for login fields and search fields;
// called with a pre-trimmed value for squad name

function isBelowMinLength(trimmedValue: string, min: number): boolean
// true if trimmedValue.length < min — caller is responsible for trimming first (only squad
// name uses this; login fields have no minimum per spec Assumptions)
```

## Field → Rule Mapping

| Field | Component | Min | Max | Dangerous-content check | Enforcement |
|---|---|---|---|---|---|
| Login e-mail | `LoginInput` (in `LoginForm`) | — | `EMAIL_MAX_LENGTH` | Yes | Browser (`maxLength` + `login` action's error message) + Backend (`login` action) |
| Login password | `LoginInput` (in `LoginForm`) | — | `PASSWORD_MAX_LENGTH` | Yes | Browser (`maxLength` + `login` action's error message) + Backend (`login` action) |
| Squad name | `SaveSquadModal` | `SQUAD_NAME_MIN_LENGTH` | `SQUAD_NAME_MAX_LENGTH` | Yes | Browser (`maxLength` + inline message, blocks Salvar) + Backend (`saveSquad` action) |
| Catalogue search | `FilterBar` (via `CatalogueView`) | — | `SEARCH_MAX_LENGTH` | No | Browser (`maxLength`) only |
| Squads search | `FilterBar` (via `SquadsView`) | — | `SEARCH_MAX_LENGTH` | No | Browser (`maxLength`) only |

No lifecycle/state-transition changes — every field above already exists; this feature only
adds a rejection path that fires before the field's existing behavior (submit / filter) would
otherwise proceed.
