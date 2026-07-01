# Quickstart & Manual Validation: Squad Metrics & Persistence

**Feature**: 004-metrics-persistence
**Date**: 2026-06-30

---

## Setup

```bash
# Terminal 1
npm run mock

# Terminal 2
npm run dev

# Terminal 3 (once, before validation)
npm test
```

Log in at `http://localhost:3000/login` → redirected to `/dashboard`.

---

## US1 Checklist — View Real-Time Squad Metrics (P1)

**Goal**: As squad changes, metrics panel shows accurate total cost, seniority level, and skill count.

- [ ] Dashboard loads with squad panel visible on the right sidebar
- [ ] With empty squad: total cost shows "$0/hr", seniority shows "—", skill count shows "0"
- [ ] Add 1 developer (e.g., Ana Lima, Senior, $95/hr, skills: React, TypeScript, Next.js, GraphQL, Testing)
  - [ ] Total cost updates to "$95/hr"
  - [ ] Seniority shows "Senior"
  - [ ] Skill count shows 5 (or lists those 5 skills)
- [ ] Add a 2nd developer (e.g., Bruno Santos, Junior, $30/hr, skills: JavaScript, HTML, CSS, React, Git)
  - [ ] Total cost updates to "$125/hr"
  - [ ] Seniority updates to "Mid" (avg of Senior=3 + Junior=1 = 2.0 → Mid)
  - [ ] Skill count shows 8 unique skills (React is shared, counted once)
- [ ] Remove the Junior developer
  - [ ] All three metrics revert to the values for the Senior developer alone
- [ ] Metrics update instantly — no perceptible delay after add/remove

---

## US2 Checklist — Save Squad Composition (P2)

**Goal**: Clicking "Save Squad" persists the squad to the backend with success/error feedback.

- [ ] With empty squad: "Salvar Squad" button is disabled (grayed out)
- [ ] Add at least 1 developer → button becomes enabled
- [ ] Click "Salvar Squad"
  - [ ] Button shows "Salvando..." and is disabled while request is in progress
  - [ ] On success: button shows "Salvo ✓" in green
  - [ ] After ~2 seconds: button reverts to "Salvar Squad"
- [ ] Verify backend: `curl http://localhost:3001/squads` shows the saved record with `id`, `savedAt`, and `members`
- [ ] Click "Salvar Squad" again (squad unchanged) → new record created in /squads (append-only)
- [ ] Add another developer to the squad while "Salvo ✓" is showing → button immediately reverts to "Salvar Squad" (before 2s timeout)
- [ ] Stop the mock server (`Ctrl+C` in Terminal 1), then click "Salvar Squad"
  - [ ] Button shows "Erro ao salvar" in red
  - [ ] After ~3 seconds: button reverts to "Salvar Squad" (retry available)
  - [ ] Squad state remains unchanged (no members lost)
- [ ] Restart mock server and retry → save succeeds

---

## Metric Accuracy Checks

- [ ] Squad with 5 Seniors ($95 + $105 + $115 + $95 + $105 = $515/hr): total cost = $515/hr, seniority = "Senior"
- [ ] Squad with 5 Juniors: total cost = sum of their rates, seniority = "Junior"
- [ ] Mixed squad (2 Junior + 3 Senior): seniority = "Senior" (avg = (1+1+3+3+3)/5 = 11/5 = 2.2 → round to 2 → Mid)

  Wait: (1+1+3+3+3)/5 = 2.2 → round(2.2) = 2 → 'mid'. So Mixed 2J+3S → "Mid".

- [ ] Skills: add developer with skills [A, B, C] and another with [B, C, D] → skill count = 4 (A, B, C, D — no duplicates)

---

## Jest Unit Tests Checklist

```bash
npm test
```

- [ ] All tests in `lib/metrics.test.ts` pass
- [ ] `calcTotalCost`: empty squad → 0; single member → correct cost; multiple → sum
- [ ] `calcAvgSeniority`: empty → null; all junior → 'junior'; all senior → 'senior'; mixed → correct label
- [ ] `calcSkillCoverage`: empty → []; deduplication correct; sorted alphabetically

---

## State Consistency Checks

- [ ] Filter catalogue while metrics are visible → metrics remain unchanged (squad state unchanged by filters)
- [ ] Add developer, save, remove developer → metrics update immediately, save can be clicked again
- [ ] Page reload → squad resets to empty, metrics show zero state, save button disabled
