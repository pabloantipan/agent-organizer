# Leftovers 37: Needs me's record rows say what they are, their age once, and others' rows line up: the build spec

status: proposed (0139)
by: the FSE, 2026-10-15, on main at 6f90730
sources: lf36-needs-me-waits's UI review (`working-on/done/lf36-needs-me-waits.md`,
`## UI review`, U1, U2) and sup73's close (`runs/2026-10-15-sup73-leftovers-36.md`),
answered by Aglaea in `docs/ux/specs/needs-me-waits.md` Amendment 1
(294e125, W7-W10). Code read before writing: `components/Home.tsx` (`Shell`
:171, its reason lozenge and `ib-age` column; `DecisionRow`;
`WaitingOnOthers` :340), `lib/decisions.ts` (`ownerPhrase` :33). Gate rows
follow 0095 and 0108.

## Requirements, card `lf37-waits-polish` (frontend)

- **FR-1** (W7) Every record row, long or not and in both groups (Needs me
  and Waiting on others), shows the `decision` lozenge in `Shell`'s reason
  column.
- **FR-2** (W8) The amber age lozenge leftovers-36 added goes. A record
  row waiting 7 days or more draws its `ib-age` column in `--warning` at
  weight 600; under 7 days the column is as other rows. The row's
  accessible description still says `waiting <n> days, …` in full.
  Leftovers-36's sort (long rows first, oldest first) stays.
- **FR-3** (W9) A row in Waiting on others starts its subject with the
  owner through `ownerPhrase`: `owner <name> · <initiative> <NNNN> ·
  <title>`; the dashed `waiting on <owner>` lozenge goes. A long name is cut
  at the subject's end, never in the reason column.
- **FR-4** (W10) Under the `Waiting on others · n` heading, one line:
  `Theirs to rule. Not counted in Needs me.`

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| P1 | 1, 2 | vitest of `DecisionRow` and the others' row with a fixed `now`: records 25 and 6 days old, the lead's and alejandro's | every one shows the `decision` lozenge; no age lozenge; the 25-day rows' `ib-age` has the long class, the 6-day row's has not; the description of a long row contains `waiting 25 days` |
| P2 | 2 | Tab harness at 1024×640, fixture: computed colour and weight of a long row's and a short row's age column | long `--warning`'s rgb at 600; short as a thread row's |
| P3 | 3 | Tab harness at 1024, fixture (`owner alejandro` and `owner ana` rows in Waiting on others): left x of each row's lozenge and of each `ib-age` | one x for both lozenges, one x for both ages; subjects start `owner alejandro ·`, `owner ana ·` |
| P4 | 4 | vitest or harness: the group's sub-line | exactly `Theirs to rule. Not counted in Needs me.` under the heading |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf37-waits-polish`: `components/Home.tsx` (`DecisionRow`, the others'
  row, `WaitingOnOthers`), `styles/shell.css` only for the long age
  column's class (and removing the age lozenge's rule if nothing else uses
  it), their tests. Not: `lib/queue.ts`'s membership or sort, Go,
  `Gate.tsx`.

## No-gos

- No new service call. No change to who is counted in the badge.

## Not in the gate

- VoiceOver reading the descriptions: a finding for whoever has a screen
  (Amendment 1), as launch-progress A6.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf37-waits-polish` | P1, P2, P3, P4, X0 | — | true |

Amendment 1, 2026-10-15, the FSE, from wp-review's fail on P4 (sup76,
thread 01M516MP): Aglaea's W10 reads "one line under the heading, as Needs
me has" (needs-me-waits.md:122), and Needs me's sub-line is a `sec-sub`
inside its h2, on the heading's line (Home.tsx:76). The intent is the house
sub-line, so:
- **FR-4** The sub-line is Waiting on others' `sec-sub`, placed as Needs
  me's is.
- **P4** exactly `Theirs to rule. Not counted in Needs me.`, in a
  `sec-sub` of the group's heading, at the same position relative to its
  heading as Needs me's sub-line.
