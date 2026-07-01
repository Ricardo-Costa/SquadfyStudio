# Contract: `saveSquad` Server Action + `SaveSquadModal`

## `saveSquad` (extended)

`app/(private)/dashboard/actions.ts` — `'use server'`

```ts
export async function saveSquad(name: string, members: Developer[]): Promise<SavedSquad>
```

| Input | Validation | On failure |
|---|---|---|
| `name` | `name.trim().length > 0` | `throw new Error('Squad name is required')` before any network call |
| `members` | `members.length > 0` | `throw new Error('Cannot save empty squad')` — unchanged from 004 |

On success: `POST http://localhost:3001/squads` with body
`{ name, savedAt: new Date().toISOString(), members }`, returns the parsed JSON response
(`SavedSquad`, including the backend-assigned `id`). Throws `Error('Failed to save squad')` on a
non-`ok` response — unchanged from 004.

**Breaking change note**: call-site update required in `SaveSquadButton.tsx` (the only caller) —
`saveSquad(members)` → `saveSquad(name, members)`.

## `SaveSquadModal` component contract

`app/(private)/dashboard/_components/SaveSquadModal.tsx` — `'use client'`

### Props

| Prop | Type | Notes |
|---|---|---|
| `isOpen` | `boolean` | Controlled by `SaveSquadButton` |
| `onConfirm` | `(name: string) => void` | Called with the trimmed, non-empty name; caller is responsible for invoking `saveSquad` |
| `onCancel` | `() => void` | Called on cancel button, backdrop click, or Escape — MUST NOT trigger `onConfirm` |

### Behavior contract

| Trigger | Effect | Requirement |
|---|---|---|
| `isOpen` becomes `true` | Renders with an empty name field, focused | FR-003b (never pre-filled) |
| Confirm button clicked with blank/whitespace-only name | No-op; confirm button is disabled and a validation message is shown | FR-002 |
| Confirm button clicked with a valid name | Calls `onConfirm(trimmedName)`; the modal itself does not close (parent closes it after the save resolves, so loading/error state can still show if needed) | FR-001, FR-003 |
| Cancel button, backdrop click, or `Escape` | Calls `onCancel()`; nothing is persisted | FR-003a |

### Accessibility contract

- Modal MUST trap focus contextually (input auto-focused on open) and expose the dialog via
  `role="dialog"` + `aria-modal="true"` + an `aria-label` (e.g., "Nomear squad").
- Escape-to-cancel MUST work while focus is anywhere within the modal.

### Explicit non-goals

- No name length limit beyond "non-empty after trim" (no arbitrary max enforced by this feature).
- No duplicate-name warning or validation (FR-004 explicitly allows duplicates).
