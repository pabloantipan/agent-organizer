# Leftovers 36: Needs me says how long a record has waited, and shows others' long waits apart: the build spec

status: proposed (0135)
by: the FSE, 2026-10-15, on main at 5846b0f
sources: 0134 (Pablo, "as recommended": record exit 1, act on the waits),
answered by Aglaea in `docs/ux/specs/needs-me-waits.md` (becd438, §0-§4,
W1-W6). Code read before writing: `lib/queue.ts` (`ownedByLead` 0034 FR-8,
`needsMeRows`, `isActive`), `Home.tsx` (`DecisionRow`, `RuleAction`),
`stores/board.store.ts` (`openDecision`, `decisionFocus`), `styles/shell.css`
(`.lz.warning`). Gate rows follow 0095 and 0108: no row drives Pablo's
desktops, focus or input, starts a real seat, or writes the real clipboard.

## Requirements, card `lf36-needs-me-waits` (frontend)

- **FR-1** (§1) A proposed record of the lead's (owner empty, or the cell's
  human in any case, as `ownedByLead` reads it today) raised 7 or more whole
  days before today draws, first on its Needs me row, an amber `--warning`
  lozenge `waiting <n> days` (`days` in full; `waiting 1 day` never occurs
  at the threshold), then id and title. Under 7 days the row is as today.
  Verb stays Rule.
- **FR-2** (§1) Rows with that lozenge lead Needs me, oldest first; every
  other row keeps today's order after them. The badge count is unchanged.
- **FR-3** (§2) Below Needs me's rows, a group headed `Waiting on others ·
  <n>` (an `h3`) lists proposed records on active initiatives whose owner
  is not empty and not the lead (a seat such as `fse` included), raised 7
  or more days ago, oldest first. Row: `waiting on <owner>` in the dashed
  fuchsia waiting lozenge, the amber age lozenge, id and title. Verb
  **Open**, which lands on the record in the initiative's Decisions
  (`openDecision`, focused as Rule's landing is), where Rule stays (0045).
  The group is absent when empty, and its rows are not in the badge or in
  `needsMeRows`' count.
- **FR-4** (§3) A record with no `raised` gets no age, no lozenge, and
  joins no group by age; the lead's sorts as undated today. No date is
  ever computed. Inactive initiatives stay off Home.
- **FR-5** (§4) Accessible names: the lead's row `Rule <initiative>
  <NNNN>`, described by `waiting <n> days, <initiative> <NNNN>, <title>`;
  others' row `Open <initiative> <NNNN>`, described by `waiting on
  <owner>, <n> days, <initiative> <NNNN>, <title>`.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| N1 | 1, 2 | vitest of the queue with a fixed `now`: the lead's records raised 8, 6, 9 and 18 days before, and a thread 2 days old | 18 and 9 and 8 carry age 18, 9, 8 and lead in that order, then the 6-day record and the thread in today's order; the 6-day one has no age; the count equals today's |
| N2 | 1 | vitest of the row: a record exactly 7 days old | `waiting 7 days` before the id, in `.lz.warning` (or the class the build uses for `--warning`) |
| N3 | 3, 4 | vitest of the others' list with a fixed `now`: alejandro 18 days, fse 9 days, alejandro 3 days, alejandro with no `raised`, an alejandro record on a paused initiative, the lead's own 18 days | 18 then 9 in the group; the 3-day, the undated, the paused and the lead's are not; group absent when only those remain |
| N4 | 3 | Tab harness at 1024×640, fixture plus an overlay record owned by someone else, raised long before today: Home's Needs me | `Waiting on others · 1` heading (h3) below the rows; the row reads `waiting on <owner> · <n> days · …`; the top-bar badge equals the Needs me row count without it |
| N5 | 3 | Tab harness: Open on that row | the initiative's Decisions with the record focused and highlighted; Rule offered there |
| N6 | 5 | vitest or harness: accessible name and description of one row of each kind | as FR-5, `days` in full |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf36-needs-me-waits`: `lib/queue.ts` (an age helper and the others'
  list beside `needsMeRows`; `needsMeRows`' own membership unchanged but
  its order), `Home.tsx` (the lozenge, the group, `DecisionRow`, an Open
  action), `styles/shell.css` only for the two lozenges if `.lz` lacks
  them, their tests, and one proposed record owned by someone else in
  `testdata/fixture-overlay/` for N4 and N5 (the status golden refreshed
  if it moves). Not: Go, `Gate.tsx`, the Decisions view beyond what
  `openDecision` already does, the badge's definition.

## No-gos

- No new service call, no new Go field. No computed or invented date. No
  change to who may rule (0045).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf36-needs-me-waits` | N1, N2, N3, N4, N5, N6, X0 | — | true |
