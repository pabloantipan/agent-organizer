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

## Amendment 1 (FSE, 2026-10-24): reduced motion, and three regressions from main

From l52-layer-ui's UI review of lf52-state-layer (pass at e6d77d6; A3, U1-U3,
A1, A2) and Aglaea's `docs/ux/specs/review-view.md` Amendment 18 (d45db6a).
All inside the card's boundary (the stylesheets), so in this card:

- **FR-1a** (A3, R51) Under `prefers-reduced-motion: reduce` no transition
  runs, hover included, from one global guard in that media query, never per
  control.
- **FR-1b** (U1, R52) A bordered control's layer sits at inset -1px, so the
  fill covers the border box.
- **FR-1c** (U2, R52) The critical memory chip's open ring is 2px outside the
  border's outer edge, as on main.
- **FR-1d** (U3, A2, R52) Hover does nothing on an opaque mark: its rule
  keeps `background: transparent` under the layer; see-through marks keep
  their hover.
- **FR-2a** (A1) The hover transition covers `color` too, so an ink-only
  hover (the sub-tabs) eases.

S2 adds: the reduced-motion guard exists once and sets every transition to
none; the hover transition lists background-color and color. S3 adds: a
bordered control's fill covers its border box; hover on the current rail
row draws no rim. The UI re-review checks R51 and R52.

Not in this card, for the next leftovers (Amendment 18): `.ib-row.focused`
and every `focused` mark as state marks; the strip's role items and the
rail's role rows in R50; the header's last-line gap (A4, R53).

## Amendment 2 (FSE, 2026-10-24): ink never eases, FR-2a withdrawn

From l52-layer-ui's re-review of lf52-state-layer at 8b27732 (A5, U5:
FR-2a's `color` under the hover transition made a leaving mark's ink ease,
the old sub-tab keeping its current ink for 400 ms) and Aglaea's
`docs/ux/specs/review-view.md` Amendment 19 (41523a6), which withdraws her
Amendment 18 A1. FR-2a is withdrawn: the hover transition covers
`background-color` only; ink switches at once, hover and mark alike. S2
reads: the hover transition lists `background-color` and not `color`. S3
adds: after a press on another sub-tab, the old one's ink is the unmarked
ink in the next frame. The UI re-review checks R50 as amended by
Amendment 19.
