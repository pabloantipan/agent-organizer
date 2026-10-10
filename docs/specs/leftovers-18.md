# Leftovers 18: one current mark, a fact once, every view at 1024, the statusline's lost samples, and the build's last drift: the build spec

status: proposed (0114)
by: the FSE, 2026-10-10, on main at 5e3080a
sources: sup54's close (leftovers-17 reviews: top bar U1-U4, card Q1 and
U2-U4, the 1024 overflows), Aglaea's `docs/ux/specs/initiatives-view.md`
Amendment 3 (237db96, rows I22-I27) and the design system's two new rules
(one current mark per screen; a fact shows once per screen); the
bitácora's repetition log (statusline samples stop after one, seen in
sup50's and sup53's seats; a bare `wails build` still dirties
`frontend/wailsjs/runtime/`). Gate rows follow 0095 and 0108: no row drives
Pablo's desktops, focus or input; screen rows run on the review app's own
process (AX reads, AXPress on its pid, `screencapture -o -l` of its window,
computed styles), else vitest or Go tests. Nothing here needs the floating
panel open.

## Requirements, card `lf18-current-mark` (frontend)

- **FR-1** One "you are here" per screen (I22). An initiative belongs to
  Initiatives (`placeOf`, whichever door opened it): the `Initiatives` tab
  gets the parent underline in `--fg-subtle` and no `aria-current`; the id
  is the current title. Settings and Help map to no place: their own icon is
  `.on` with `aria-current="page"`. Needs me is never `.on`.
- **FR-2** The crumb loses its slash and sits after the places with the
  group gap; the tabs never move. Settings and Help show no crumb (I23).
- **FR-3** With `auth: firebase` at 1024 the bar folds, in this order:
  memory short; the sync line into Sync's name and hover (past a day stale:
  `Sync · stale`, stale in magenta, a word, not a dot); the account to a
  28 px icon named `Account <email>`, last in the app group; then the title
  clamps to 12ch; fifth, Rescan to its glyph, named `Rescan` (Amendment 2).
  Never wraps; Settings is never pushed off (I24).

## Requirements, card `lf18-charter-once` (frontend)

- **FR-4** One Charter component with an `omit` prop, the field
  definitions single. The initiative header's open Details pass `omit`
  target and stage (the bar's target and the strip label stay). An open
  Initiatives card hides its head's goal line (I25).
- **FR-5** Hover raises an Initiatives card on its body only, open or
  closed; never on Details, Sleep or Wake (I26).
- **FR-6** `InitiativeDetail` takes a `readOnly` prop for an asleep
  initiative, replacing the css rule tied to button order (sup54's U4).
- **FR-7** The initiative header's pills wrap inside the header at 1024
  (I27, the header's part).
- **FR-7b** The initiative's sub-view tabs (`.subtabs` in
  `InitiativeHeader.tsx`) mark the current one with `aria-current="true"`,
  not `"page"`, so the screen has one `"page"` (I22; Amendment 1).

## Requirements, card `lf18-narrow` (frontend)

- **FR-8** Overview stacks its FSE column below the first when the pane
  (not the window) is under 880 px (I27).
- **FR-9** Help's body is `max-width: min(72ch, 100%)` with
  `overflow-wrap: anywhere`; its tables and code scroll in their own box
  with the edge line (I27).

## Requirements, card `lf18-statusline` (Go), diagnose first

- **FR-10** Some seats' statusline records stop after the first sample
  (sup50's ra-*/aic-* seats, sup53's fo-review and mw-review), so
  `runs.jsonl` lacks their context and cost at the end. Prove the cause
  before fixing it: from `~/.local/share/organizer/sessions/`,
  `runs.jsonl` and Claude Code's statusLine behaviour (Hephaistos's lead,
  unverified: the statusline runs only on a redraw, and a pane never drawn
  after its first turn stops sampling). Then make a run's final line carry
  the last known context and cost whether or not the statusline ran again,
  from a source that does not depend on a redraw (the transcript at
  `transcript_path`, if it carries usage), or, if no such source exists,
  say so on the run's line (`samples: 1`) instead of a silent blank.

## Requirements, card `lf18-build-drift` (build)

- **FR-11** A bare `wails build` (X0's row) leaves `git status --porcelain`
  empty, as `make install` does since lf15-build-drift.
- **FR-12** Unused css removed: `usage.css`'s `.usage-btn` (sup54).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| K1 | 1 | vitest of TopBar on Home, Initiatives, Usage, an initiative (opened from Home and from Initiatives), Settings, Help; AX tree of the review process on each | exactly one `aria-current="page"` per screen; on an initiative `Initiatives` has the parent class and no `aria-current`; Needs me never `.on` |
| K2 | 2 | the same vitest; AX tree on an initiative | the id after the places with no slash; no crumb on Settings and Help |
| K3 | 3 | vitest of the signed-in bar (`auth: firebase`, a 30-character email, a 22-character id) at the compact width class; review build at 1024×640 rail open: computed widths of the bar's groups (the fixture may not sign in: then the vitest plus widths, per I24) | one line; Settings' right edge inside the window; sync words in Sync's name and hover; account an icon named `Account <email>`; `Sync · stale` past a day |
| H1 | 4 | vitest: header Details and an open card render the one Charter; header passes `omit` | no Target and no Stage lines in the header's Details; the goal shown once on an open card |
| H2 | 5 | vitest of the hover class on body, Details, Sleep, Wake, open and closed; computed style on the review process | raised on body only |
| H3 | 6 | vitest of `InitiativeDetail` with `readOnly`; grep of the old css rule | Review with agent hidden by the prop; the order-tied rule gone |
| H5 | 7b | vitest of the sub-tabs | the current sub-tab has `aria-current="true"`; none has `"page"` |
| H4 | 7 | review build at 1024×640 rail open on an initiative with every pill: the header's AX frame and the document's `scrollWidth` | pills inside the header; `scrollWidth` equal to `clientWidth` |
| W1 | 8 | review build at 1024×640 rail open on Overview, and at 1440×900: the columns' AX frames | stacked below 880 px of pane, side by side at 1440 |
| W2 | 9 | review build at 1024×640 on Help with the longest page; computed styles of the body, a table and a code block | no sideways document scroll; tables and code scroll in their own box |
| S1 | 10 | a written cause in the card's Notes, with the evidence (record files, `runs.jsonl` lines, statusLine docs or a reproduced run) | the cause named, or "not found" with what was ruled out |
| S2 | 10 | Go test over a session record with one sample and a transcript fixture carrying later usage; and one without a usable transcript | the final run line carries the transcript's last context and cost; without it, `samples: 1`, never a silent blank |
| D1 | 11 | from a clean clone: `wails build`, then `git status --porcelain` | empty |
| D2 | 12 | `grep -rn usage-btn frontend/src` | nothing |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` (then `git status --porcelain` empty, D1) | pass |

Amendment 1, 2026-10-10, the FSE (0108, from sup55): K1 could not be met
inside lf18-current-mark's boundary, since the initiative's sub-view tabs
also carry `aria-current="page"` and live in `InitiativeHeader.tsx`
(lf18-charter-once's). FR-7b and H5 go to lf18-charter-once; K1's AX check
runs after both merge (charter-once merges first); K1's vitest is the top
bar's alone.

Amendment 2, 2026-10-10, the FSE (0108, from sup55 and cm-build): with
the four folds the bar measured 1066 px at 1024 (22-character id, 30-character
email, badge 15, `Sync · stale`), so FR-3 contradicted its own "Settings is
never pushed off". A fifth fold, Rescan to its glyph named `Rescan`, fits with
9.5 px spare. Told to Aglaea after (0108).

## Boundary

Stylesheets are named per card with the rules each owns (the lesson of
leftovers-15 to 17).

- `lf18-current-mark`: `TopBar.tsx` (with its account menu), a `placeOf`
  helper (new lib file) and its tests; `styles/global.css` rules
  `.topbar`, `.brand*`, the places nav, `.on`; `styles/shell.css` rules
  `.crumbs`, `.crumb*`; `styles/memory.css` the memory button's short form
  only. Not: `board.store.ts` beyond reading.
- `lf18-charter-once`: the Charter component and `styles/charter.css`,
  `InitiativeHeader.tsx` and `styles/header.css` (all of it, the pills
  included), `InitiativesView.tsx` and the Initiatives view's rules of
  `styles/initiatives.css`, `Initiatives.tsx` (`InitiativeDetail`'s
  `readOnly`), its callers in `Home.tsx` only where the prop is passed;
  tests. Not: the rail's or Agents' rules of `initiatives.css`.
- `lf18-narrow`: `Overview.tsx` and `styles/overview.css`, `HelpView.tsx`
  and `styles/help.css`; tests. Not: `shell.css` (its `.ov-stub` rule
  stays).
- `lf18-statusline`: `internal/session`, the `statusline` command in
  `internal/cli`, `internal/service` where it retires sessions, tests,
  fixtures under `testdata/`. Not: `~/.claude/settings.json`, Claude Code
  itself, any other session's records.
- `lf18-build-drift`: `Makefile`, `wails.json`, `.gitattributes`,
  `frontend/wailsjs/runtime/` (as generated), `styles/usage.css`
  (`.usage-btn` only). Not: `Usage.tsx`.

## No-gos

- No new screen or place; Settings and Help stay icons.
- No change to the statusLine command's printed text.
- The floating panel is not checked on screen.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf18-current-mark` | K1-K3, X0 | — | true |
| `lf18-charter-once` | H1-H5, X0 | — | true |
| `lf18-narrow` | W1, W2, X0 | — | true |
| `lf18-statusline` | S1, S2, X0 | — | false |
| `lf18-build-drift` | D1, D2, X0 | — | false |
