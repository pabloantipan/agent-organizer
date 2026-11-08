# Leftovers 73: comma lists as inline text, "(N)" gone, names as written: the build spec

status: accepted (0186, ruled 2026-11-02)
by: the FSE, 2026-11-02, on main at 80bd987
sources: l72-ui's UI review of lf72-counts-commas (F1, F2, questions a-d);
Aglaea's `docs/ux/specs/run-report.md` Amendment 9 and `docs/design-system.md`
(e729ecc; AR35 amended, AR37, AR38): an inset ring on links in comma lists,
covering no name, the next item's included; comma-list links are inline
text (WCAG 2.5.8's inline exception, no 24 px minimum; AR28 stays on the
progress rows and the waits line); "(N) is not a count form"; names a
person gave (groups, clients, initiatives) are never uppercased.

## Premises (read 2026-11-02 at 80bd987; greps for `(` before a count and for `text-transform: uppercase` on any name)

| Premise | Shown by |
|---|---|
| a comma-list link (a track's `left`) draws an outset ring and keeps AR28's 24 px minimum, so a focused ring crosses the next item and one-letter slugs keep a gap before the comma | `frontend/src/styles/runreport.css:64-72`; l72-ui F1, F2 |
| three counts are written `(N)`: the rail's folded Asleep and Archived, and the review view's group count | `frontend/src/components/Rail.tsx:446`, `:459`; `frontend/src/components/Review.tsx:418` (`rv-gcount`) |
| not a count: Charter's `(2 of 5)`, a position | `frontend/src/components/Charter.tsx:68` |
| `.rail-group-name` uppercases every rail group header, the names Pablo gave his groups included | `frontend/src/styles/global.css:187`; `Rail.tsx:280` (`{s.name}`) |

## Requirements

Card `lf73-inline-names` (frontend, ui_review):
- **FR-1 (AR35)** A link in a comma list draws its focus ring inset
  (`outline-offset: -2px`); no ring crosses any name.
- **FR-2 (AR37)** A link in a comma list has no 24 px minimum, only its
  4 px inline padding, so it reads `a, b`; `.rr-card` keeps the minimum on
  the progress rows and the waits line.
- **FR-3 (AR38)** The rail's folded groups read `Asleep · N` and
  `Archived · N`, and the review view's group count reads `<title> · N`,
  through `SecCount`; no `(N)` count remains.
- **FR-4** A rail group named by a person shows its name as written (no
  uppercase), at the label's size, weight and colour; the app's own group
  labels (Roles, Asleep, Archived, the ungrouped one) keep the label look.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; ring rows by the offscreen Tab harness, saying so). No row drives
Pablo's desktops, focus or input.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1, 2 | vitest reading `runreport.css`: the comma-list link's outline offset and min-width; the progress-row link's min-width | -2px and none; 24px kept |
| V2 | 3 | vitest scan: no `(` directly before a count span or `.length}` in a title, in non-test files under `frontend/src/components/`, allowing Charter's position | none (main: three) |
| V3 | 4 | vitest of the rail: a group named `acme` renders `acme` with no uppercase class or rule; Roles keeps the label class | as FR-4 |
| AR35, AR37, AR38 | 1-4 | review build at 1024x640: a track's `left` list with a link before a not-cut item, focused; the rail folded with asleep and archived and a named group; the review view's groups | as Aglaea's rows; the group name as written |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/components/RunTracks.tsx`, `Rail.tsx` (the group headers
only), `Review.tsx` (the group count only), `SecCount.tsx`;
`frontend/src/styles/runreport.css`, `global.css` (`.rail-group-name`
only), `review.css` (`.rv-gcount` only); and the tests asserting the old
markup (any a grep for the old text finds, for those asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf73-inline-names` | V1-V3, AR35, AR37, AR38, X0 | lf72-counts-commas (merged #61) | true |

## Amendment 1 (FSE, 2026-11-02, on sup117's question)

A fourth `(N)` sits in `frontend/src/lib/folds.ts:11`: `foldLabel` writes
`Asleep (n)` and `Archived (n)` for the collapsed rail's float list
(`FloatList.tsx:227`). FR-3 covers it: `foldLabel` returns `<word> · n`
(a string; FloatList renders it). V2 adds a vitest of `foldLabel`. The
boundary adds `frontend/src/lib/folds.ts`, `floatList.ts` (the doc comment
only) and the asserts of the old text in `folds.test.ts`,
`floatList.test.ts` and `FloatList.test.tsx`.
