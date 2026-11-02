# Leftovers 72: the last count titles and the commas beside a padded link: the build spec

status: accepted (0185, ruled 2026-11-02)
by: the FSE, 2026-11-02, on main at 1373564
sources: l71-ui's UI review of lf71-count-look (F1-F3 and question c);
Aglaea's `docs/ux/specs/run-report.md` Amendment 8 and `docs/design-system.md`
(f62790a; AR33 amended, AR35, AR36): "a count after a title is
`<title> · N`, wherever a title carries one", a disclosure label with a
count is a title, a fraction (`Exit 0/2`) is not a count.

## Premises (read 2026-11-02 at 1373564; a grep of every `<span className="num">` after a word in non-test files under `frontend/src/components/`)

| Premise | Shown by |
|---|---|
| a padded `.rr-card` link in a track's `left` list puts space before its comma (`e  ,f`) | `frontend/src/components/RunTracks.tsx:88`; l71-ui F2 |
| five titles carry a count without the shared piece | `frontend/src/components/UsageSessions.tsx:27` (`Sessions · N`, disclosure, uneven gap); `frontend/src/components/Overview.tsx:152` (`Gates N`); `frontend/src/components/Rail.tsx:279` (an initiative group's count) and `:380` (`Roles N`), both `rail-group-n`; `frontend/src/components/RunReport.tsx:172` (`Ruled while you were away N`) |
| not counts by the rule: `Overview.tsx:158` (`Exit 0/2`, a fraction); `FsePanel.tsx:135` (`and N more`, prose) | Aglaea f62790a (d) |

## Requirements

Card `lf72-counts-commas` (frontend, ui_review):
- **FR-1 (AR35)** In a track's `left` list the comma sits outside the
  link, pulled in by `margin-inline-start: calc(-1 * var(--space-1))`, so
  it reads `a, b`; a focused ring may touch the comma, never the name.
- **FR-2 (AR36)** The five titles of the premise draw `<title> · N`
  through `SecCount` (lf71), the disclosure's chevron kept before it; the
  rail's group counts keep their place at the header's end.
- **FR-3** AR33 is as built (padding, no glyph covered): no change.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; a ring row by the offscreen Tab harness, saying so). No row drives
Pablo's desktops, focus or input.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest of a track's `left` list over three slugs | each comma outside its button with the negative margin; text reads `a, b, c` |
| V2 | 2 | vitest: lf71's V2 scan widened to a word followed by a count span (`<span className="num` or `rail-group-n`) with no dot, in every non-test file under `frontend/src/components/`, with the count span written as `<span className="num`, `<b className="num` or `rail-group-n` and the title class plain or through `cx(`, allowing only `Overview.tsx`'s Exit fraction, `FsePanel.tsx`'s prose and the number-first stats (`Overview.tsx:207`, `:218`, `InitiativeHeader.tsx:218`'s date) | none (main: five) |
| AR35, AR36 | 1, 2 | review build at 1024x640: a run report with a `left` list; Usage's Sessions; Overview's Gates; the rail with a group and Roles; the run report's Ruled while you were away | as Aglaea's rows; equal gaps either side of each `·` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/components/RunTracks.tsx`, `UsageSessions.tsx`,
`Overview.tsx` (the Gates label only), `Rail.tsx` (the two group counts
only), `RunReport.tsx` (that title only), `SecCount.tsx`;
`frontend/src/styles/runreport.css`, `usage.css`, `overview.css`,
`shell.css` (rail-group rules only); and the tests asserting their old
markup: `RunTracks.test.tsx`, `RunReport.test.tsx`,
`RunReport.lf64.test.tsx`, `SecCount.test.tsx`, and any other test a grep
for the old text finds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf72-counts-commas` | V1, V2, AR35, AR36, X0 | lf71-count-look (merged #59) | true |
