# Leftovers 52: every state mark on one untransitioned layer, the Decisions line's last words, and a trimmed chosen: the build spec

status: ruled (0162, pablo 2026-10-24)
by: the FSE, 2026-10-24, on main at e779bd3
sources: Aglaea's `docs/ux/specs/review-view.md` Amendment 17 (039412c, R50)
and `docs/ux/specs/rule-questions.md` Amendment 2 (0dc56ee, UW2, UW3);
sup92's closing report on leftovers 51 (findings 1-3,
`runs/2026-10-24-sup92-leftovers-51.md`); sup91's on leftovers 49 (a
padded plain chosen). Premises read today.

## Premises (read 2026-10-24 at e779bd3)

| Premise | Shown by |
|---|---|
| marks are drawn on the control's own background in most stylesheets; lf51 put the chat row's mark on an untransitioned layer and parked every other marked control at `transition: none` (hover does not ease there) | `frontend/src/styles/global.css` (the Amendment 3 list, `.chat.active` layer); leftovers-51 Amendments 2-3 |
| state-marked selectors live in 14 stylesheets, not only global.css (`.active`, `.on`, `.current`, `.open`, `[aria-current]`, `[aria-expanded="true"]`, `[aria-pressed="true"]`); transitions are set in global, shell, usage, work, overview, roles, rule-box and outline; lf51's K4 read global.css only | `grep -nE '\.(active\|on\|current\|selected\|open)\b\|aria-(current\|selected\|pressed\|expanded)=' frontend/src/styles/*.css`; sup92 finding 1 |
| the Ruled list floors each answer at its first word (8 characters at most) whatever room the line has | `frontend/src/lib/decisions.ts:134` (`chosenFloor`), `components/DecisionsView.tsx:277`; UW2; sup92 finding 3 |
| while a record is open its line's accessible name still carries the full chosen | `frontend/src/lib/decisionsPage.ts:84` (`lineName`); UW3 |
| a one-question record accepts a plain chosen with surrounding spaces and writes it padded | `internal/service/rule.go:46-54` (`scan.CheckAnswers`), `writeRuling` at `:122`; sup91 |
| `review.css` belongs to the review map that moved to Elenx (0159, crossing 0020): no new work on it | `working-on/decisions/0159-review-map-moved-to-elenx.md` |

## Requirements

Card `lf52-state-layer` (stylesheets):

- **FR-1** (R50) One shared rule paints every state mark on a layer with no
  transition: fill marks on an untransitioned `::before` at inset 0 under
  the content, line marks (an underline, the rail's inset) on an
  untransitioned `::after` or an inset `box-shadow`; a control whose
  `::before` is taken uses the shadow. The rule is written once and
  applied by a shared class or selector list, not copied per control.
- **FR-2** Every state-marked control in every stylesheet under
  `frontend/src/styles/` but `review.css` uses FR-1, and its unmarked
  state eases hover's `background-color` over 100 ms with `--ease-out`, in
  and out. lf51's `transition: none` list goes.
- **FR-3** A test enumerates the state-marked selectors itself from the
  stylesheets (the classes and attributes in the premise), so a control
  added later is checked without editing the test.

Card `lf52-decisions-line` (frontend), after lf52-state-layer:

- **FR-4** (UW2) The Ruled list line shows a question record's answers
  whole while the line has room; only when it has not does each answer
  take an equal share of the floor, cut with an ellipsis.
- **FR-5** (UW3) While a record is open under its line, the line's
  accessible name drops the chosen; it gets it back on close.

Card `lf52-chosen-trim` (Go):

- **FR-6** `RuleDecision` trims `chosen` (and each answer of a question
  record) before checking and writes the trimmed form; the scan compares
  trimmed forms, so a record written padded by hand still reads.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| S1 | 1, 3 | vitest reading every `.css` under `frontend/src/styles/` but `review.css`: list each state-marked selector | each paints its mark through FR-1's layer (`::before`/`::after`/inset shadow) and that layer sets no transition; the list is not hand-written in the test |
| S2 | 2 | the same test | each such control's unmarked rule eases `background-color` 100 ms `--ease-out`; no `transition: none` list remains |
| S3 | 1, 2 | vitest in the harness: click from one marked control to another in the rail, the People panel, the subtabs and a segmented control | the row that lost its mark has no fill in the next frame; hover on an unmarked one eases |
| D1 | 4 | vitest of the Ruled line at a wide and a narrow width with the leftovers-49 fixture | wide: `Q1 after-graph-performs-start-now, Q2 record-page` whole; narrow: each answer cut with an ellipsis, equal shares |
| D2 | 5 | vitest of `lineName` with the record open and closed | open: no chosen in the name; closed: the full chosen |
| T1 | 6 | go test: a one-question record ruled `" b "`; `"Q1 a , Q2 x"`; a hand-written padded `chosen` | written `b` and `Q1 a, Q2 x`; the scan reports no problem on the hand-written one |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

The UI review of lf52-state-layer checks review-view R43 and R50 across the
controls S3 names; that of lf52-decisions-line checks rule-questions Q2 at
1024 and 1440 and Q6.

## Boundary

- `lf52-state-layer`: `frontend/src/styles/*.css` but `review.css`, and
  the class names the shared layer needs on those controls' elements in
  their components (no other change there); the CSS test that reads them.
- `lf52-decisions-line`: `frontend/src/lib/decisions.ts` (`chosenFloor`),
  `frontend/src/lib/decisionsPage.ts` (`lineName`), their tests,
  `frontend/src/components/DecisionsView.tsx` and its test,
  `frontend/src/styles/decisions.css`.
- `lf52-chosen-trim`: `internal/service/rule.go`, `internal/scan/` (the
  answers check) and their tests.
- lf52-decisions-line touches `decisions.css`, which lf52-state-layer also
  touches: it waits for lf52-state-layer's merge. lf52-chosen-trim shares
  no file with either.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf52-state-layer` | S1-S3, X0 | — | true |
| `lf52-decisions-line` | D1-D2, X0 | lf52-state-layer | true |
| `lf52-chosen-trim` | T1, X0 | — | false |
