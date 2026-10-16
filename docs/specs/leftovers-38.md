# Leftovers 38: Needs me says the owner once and keeps the age column in one line: the build spec

status: proposed (0142)
by: the FSE, 2026-10-15, on main at 4285b0d
sources: lf37-waits-polish's UI review (`working-on/done/lf37-waits-polish.md`,
`## UI review`, U1, U2, U3), answered by Aglaea in `docs/ux/specs/needs-me-waits.md`
Amendment 2 (4285b0d, W11, W12).

## Premises (each read today)

- `decisionContext` (`components/Home.tsx:309`) feeds the context line of
  both `DecisionRow` (:331) and the others' row (:369), and starts with
  `ownerPhrase`.
- The row grid is `112px minmax(0, 1fr) 48px auto` (`styles/shell.css:121`):
  the verb column is `auto`, so its width follows the button's word, which
  moves the age column (U2: 862.98 with Rule, 857.84 with Open).
- `.lz.waiting.dashed` (`styles/shell.css:33`) has no user in
  `frontend/src` since lf37 (grep of `dashed` in components and lib).

## Requirements, card `lf38-owner-once` (frontend)

- **FR-1** (W11) An others' row's context line drops the owner and starts
  at `raised …`; the lead's own record rows keep theirs as today.
- **FR-2** (W12) The verb cell is as wide as the widest verb (Rule, Open,
  Answer, Agents, Launch) with the button right-aligned in it, so every
  age column in both groups has one left x. A min-width on the verb cell
  is enough; no row changes its other columns.
- **FR-3** (U3) `.lz.waiting.dashed` goes.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| O1 | 1 | vitest of the others' row and `DecisionRow` | others' context starts `raised`, holds no `owner `; the lead's row context unchanged |
| O2 | 2 | Tab harness at 1024×640 and at 1440 wide, fixture with Rule, Open and Answer rows in view (both groups) | every `ib-age` left x equal within 0.5 px, at each width |
| O3 | 3 | `grep -rn 'waiting.dashed' frontend/src` | nothing |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf38-owner-once`: `components/Home.tsx` (`decisionContext` or the
  others' row's use of it), `styles/shell.css` (the verb cell, the dead
  rule), their tests. Not: `lib/queue.ts`, `lib/decisions.ts`'s
  `ownerPhrase`, Go.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf38-owner-once` | O1, O2, O3, X0 | — | true |
