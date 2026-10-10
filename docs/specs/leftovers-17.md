# Leftovers 17: the Initiatives card opens and shows details, and the top bar by kind: the build spec

status: proposed (0113)
by: the FSE, 2026-10-10, on main at 9650e0c
sources: Pablo, 2026-10-10 ~00:2x, in the FSE session on lodestar, with
screenshots: "On clicking the card I should be able to go to the initiative.
Also, getting details of the project. We need to review [the top bar] button
disposition". Design: Aglaea's `docs/ux/specs/initiatives-view.md`
Amendment 2 (9b9f8e6), rows I17-I21; it supersedes `docs/ux/specs/usage.md`'s
and ram-indicator's top-bar placement lines. Gate rows follow 0095 and 0108:
no row drives Pablo's desktops, focus or input; screen rows run on the
review app's own process (AX reads and AXPress on its pid, `screencapture -o
-l` of its window), else vitest.

## Requirements, card `lf17-initiative-card` (frontend)

- **FR-1** A press on an Initiatives card's body opens the initiative on
  Overview (asleep opens read-only). The id stays the one link, its hit area
  stretched under the card; the keyboard and screen reader get one link per
  card, named `Open <id>`. Hover raises the surface. Sleep, Wake and Details
  never open it, and an open Sleep confirm takes the press (I17).
- **FR-2** `Details ▾`, left of Sleep/Wake, opens the card across its whole
  row, cards below flowing down. Charter: goal in full, measure, target in
  words, scope In/Out, current stage with outcome and n of m, verbatim from
  initiative.yaml and the roadmap, `no … yet` when missing: the same
  fields as the initiative header's Details, from **one** component both use.
  Workspace: Home's chevron detail (`InitiativeDetail`) mounted as is, 0042
  for asleep. One open at a time; Escape closes and returns focus to the
  button; Charter and Workspace stack below 1280 (I18).

## Requirements, card `lf17-top-bar` (frontend)

- **FR-3** The top bar by kind, left to right, groups 16 px apart, no rules:
  brand (version always in its hover) · places nav `Home` / `Initiatives` /
  `Usage` as text tabs, named `Places`, the current one `aria-current="page"`
  with the accent underline, then the crumb inside a place (`/ organizer`,
  `/ Settings`, `/ Help`) · right: the Mac's memory button and the sync
  line · Needs me (the one badge) and Rescan/Sync · Compact, Help, Settings
  (I19, I20).
- **FR-4** The sync line (`n machines · remote …`) shows only with `auth:
  firebase`; with auth off it is gone (I20).
- **FR-5** One line at 1024×640 with the rail open: the version only in the
  brand's hover, the memory button in its short form, the crumb's id clamped
  (I21).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| C1 | 1 | vitest of the card (press on body, on Sleep, on Details, with a confirm open; asleep); review build on the fixture: AX tree of its own process, AXPress on a card's link | body opens Overview, buttons never do; one link per card named `Open <id>`; asleep read-only |
| C2 | 2 | vitest of Details (fields present, each missing one, Escape, one open at a time); a test that the header and the card render the same Charter component; review build at 1440×900 and 1024×640, window shot of its own process | Charter fields verbatim or `no … yet`; Workspace present; focus back on the button; stacked below 1280 |
| T1 | 3, 4 | vitest of TopBar over each screen and both auth modes; AX tree of the review process | order brand · Places (current marked) · crumb · memory, sync · Needs me, Rescan · Compact, Help, Settings; no sync line with auth off |
| T2 | 5 | review build on the fixture at 1024×640 with the rail open: window shot (`screencapture -o -l`) and the bar's AX frame | one line (bar height as at 1440); version in the brand's hover |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` | pass |

## Boundary

`lf17-initiative-card`: `InitiativesView.tsx` and its css, a new Charter
component extracted from `InitiativeHeader.tsx` (which then uses it),
their tests. `Initiatives.tsx` (`InitiativeDetail`) is mounted, not edited.
Not: `lib/initiatives.ts` (sup53's lf16-memory-words), `Rail.tsx`.
`lf17-top-bar`: `TopBar.tsx`, `MemoryButton.tsx` (short form only), the
top bar's rules in `styles/shell.css`, their tests. Not: the rail's rules in
`shell.css` (lf16-folds may edit them), the store beyond reading.

Amendment 1, 2026-10-10, the FSE (from sup54 at launch): the Boundary missed
the css the components import. `lf17-top-bar` also owns the `.topbar`,
`.brand` and `.brand-version` rules in `styles/global.css` and the memory
button's rules in `styles/memory.css` (not `.memory-pop` or the float
line's). `lf17-initiative-card` also owns the Details rules of
`styles/header.css` and the Initiatives view's rules of
`styles/initiatives.css`.

## No-gos

- No new screen; Details is in place, not a drawer or a route.
- No change to what Home's chevron detail shows.
- A3 (Tab in WKWebView) stays Pablo's Q1.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf17-initiative-card` | C1, C2, X0 | — | true |
| `lf17-top-bar` | T1, T2, X0 | — | true |
