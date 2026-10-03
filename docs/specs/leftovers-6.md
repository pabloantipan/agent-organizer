# Leftovers 6: zoom-decisions-polish and markdown-and-labels' findings, and a review build: the build spec

status: proposed (0077, amended)
by: the FSE, 2026-10-03, on main 7f6de27
design: Aglaea's ranking `docs/ux/reviews/2026-10-03-rank-leftovers-6.md`
(b582a27), "row n", and the design system's Timeline as amended in that
commit (the axis grows a title row, then "+N" past three; tick labels at
least 12 px apart; the today line passes under title text; a scrolling
`pre` or table carries the scroll edge). Rows 8, 9, 10 and 12 change
`docs/ux/specs/decisions-view.md` and `roadmap-time-zoom.md` as the ranking
says.

## Problem

sup29's and sup30's reviews left thirteen severity 2 and 1 rows and five
gate and code rows; none needs a design call from Pablo. Separately, review
builds keep writing into Pablo's installed app's WebKit storage (S4, the
third sighting: hw4-ui, zdp-ui, mal-build), because they share its bundle id.

## Rows folded into leftovers-5's cards

Added to `docs/specs/leftovers-5.md` as its amendment 1:

- **rule-box-and-stages** takes row 13 (a bar's text that does not fit sits
  after the bar, never cut inside, `StageRoadmap.tsx`) and S2
  (a fixture record with eight options and a long question in
  `testdata/fixture-overlay/`, so leftovers-4's L7 is reachable).
- **home-signals-5** takes row 5 (a `pre` or table that scrolls carries the
  scroll edge, reusing its own `useScrollEdges`).

## Requirements, card `timeline-and-find-6`

After rule-box-and-stages (row 2 touches `RuleDecisionBox.tsx`).

- **FR-1** (row 1) At Days the axis says `today · Sat 3`; the context label
  names the first whole unit in view.
- **FR-2** (row 2) After a ruling, focus goes to the next waiting record's
  line, else the To rule heading.
- **FR-3** (row 3) "Show the other N" puts focus on the first record it
  revealed; "Show only the newest ten" keeps focus on its toggle and scrolls
  it into view.
- **FR-4** (rows 4, 6, 7) A third colliding title grows the axis a row; past
  three rows, "+N" at that date. Tick labels at least 12 px apart. The today
  line passes under title text.
- **FR-5** (rows 8, 9, 10) While a find is on: `Timeline · 1 of 73 · 1 more
  among 3 hidden` (with no hidden match, `· 3 hidden`); opening and closing a
  section is for the visit only; a landing opens its section whatever the
  find did.
- **FR-6a** (row 11) Stages' frame ring wraps what scrolls: the −16 px
  margin moves from `.srm .tz-frame` onto `.tz-wrap` (`time-zoom.css:41`).
- **FR-6** (row 12) At Hours with today in view, the empty line reads `No
  cards in this window.` and shows no Today button.
- **FR-7** (S3, S5) A committed generated fixture initiative with at least 70
  decision records; `.tz-labelcol` takes `LABEL_W`, not a hard-coded 240;
  `placeAxisLabels` does not force layout on every render.

## Requirements, card `review-build`

- **FR-8** (S4) `make review-build` builds the app under the bundle id
  `cl.antipan.organizer.review` and the name `Deltagos Review`
  (`build/bin/Deltagos Review.app`), signed ad hoc as `make build` is, so its
  WebKit storage is its own; `make build` and `make install` are unchanged.
  CLAUDE.md's Packaging line names it.

## Acceptance → gate

Every width row names window or content, the rail state and the scrollbar
kind; every zoom row runs on each graph, Cards, Stages and Decisions (S1);
rows over a fixture run from a clean checkout.

| # | FR | Check | Expected |
|---|---|---|---|
| N1 | 1 | Cards and Decisions at Days with today in view, scrolled mid-month; the built app | `today · Sat 3` in the axis; the context label names the first whole month in view |
| N2 | 2, 3 | rule a waiting record with Ruled closed; with none left; press "Show the other N", then "Show only the newest ten" | `activeElement` as FR-2 and FR-3, in view |
| N3 | 4 | the fixture with three titles on one date, and four; Decisions at Fit at a 1024×640 window | rows grow to three, then "+1"; tick labels ≥ 12 px apart; no title under the today line (DOM) |
| N4 | 5 | the many-records fixture: find with a hidden match, toggle a section, clear; land on a record in a section closed during the find | the count as FR-5; storage unchanged by the toggles; the landed record visible |
| N5 | 6, 6a | Cards at Hours, today in view, no card in the window; Stages zoomed, Tab into its frame | `No cards in this window.`, no Today button; the ring wraps the scrolling lane |
| N6 | 7 | `npm test` over `lib/axis.ts`; the fixture's record count | tests green; ≥ 70 records committed |
| N7 | 8 | `make review-build`, launch it, toggle the rail, quit | its `CFBundleIdentifier` is `cl.antipan.organizer.review`; `~/Library/WebKit/cl.antipan.organizer` unchanged (mtime) |
| N0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

- **timeline-and-find-6:** `TimeZoom.tsx`, `lib/axis.ts` and its tests,
  `time-zoom.css`, `DecisionsView.tsx`, `decisions.css`,
  `RuleDecisionBox.tsx` (the after-rule focus only), a new fixture
  initiative under `testdata/`, `scripts/fixture-home.sh` (to lay it out).
  Not: Go, `docs/design-system.md`.
- **review-build:** `Makefile`, a script under `scripts/` if needed, CLAUDE.md
  (the Packaging line only). Not: `wails.json`, `build/darwin/` templates,
  frontend, Go.

## Technical notes

- FR-8: the plist's bundle id comes from `build/darwin/Info.plist`; the target
  rewrites the built copy's `CFBundleIdentifier` and `CFBundleName` with
  `plutil`, renames the bundle and re-signs ad hoc, so the templates stay
  untouched. The keychain service and config paths are app constants, not
  the bundle id; reviewers keep using `XDG_DATA_HOME` and the fixture
  config. The supervise skill's switch to `make review-build` goes to
  Hephaistos.
- Spec check (spec-craft 5b with the proposed lines): rows read against
  decisions-view's §2/§6 and the zoom spec's States as the ranking amends
  them (FR-5 stores nothing during a find); files found by grep
  (`CFBundleIdentifier` in `build/darwin/Info.plist:12`, `LABEL_W`,
  `.tz-labelcol`). Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `timeline-and-find-6` | N1–N6, N0 | rule-box-and-stages | true |
| `review-build` | N7, N0 | — | false |
