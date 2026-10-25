# Leftovers 55: Deltagos's name shows once, in the top bar: the build spec

status: proposed (0165)
by: the FSE, 2026-10-25, on main at e10e5af
sources: Pablo, 2026-10-25 in the FSE session, with a screenshot: "I see
deltagos twice here, is it neceesary?", then "Send to Aglaea for a propper
aproach please"; Aglaea's `docs/ux/specs/one-title.md` (e10e5af), rows
T1-T5; record 0066 (the name Deltagos in the window and the top bar).
Premises read today.

## Premises (read 2026-10-25 at e10e5af)

| Premise | Shown by |
|---|---|
| the window draws the native title bar with "Deltagos", and the top bar under it starts with the brand "● Deltagos" and the version | Pablo's screenshot; `main.go:28-30` (`mac.Options` sets only `TabFocusesLinks`); `frontend/src/components/TopBar.tsx` |
| the top bar is already a drag region, its children no-drag | `frontend/src/styles/global.css:99-109` |
| the floating icon's list mode drops `NSWindowStyleMaskTitled` and restores the saved style mask | `floaticon_darwin.m:672-698` |
| seat-pointer and the review tooling find the window by its title | supervise 7b; one-title T5 |

## Requirements

Card `lf55-one-title` (Go window options and frontend top bar):

- **FR-1** (T1) The window uses a hidden-inset title bar: no native title
  text is drawn, the content runs under the bar, the traffic lights stay;
  the window's title stays "Deltagos" for Cmd-Tab, Mission Control, the
  Window menu, VoiceOver and seat-pointer (T5).
- **FR-2** (T2) The top bar is at least 40 px high, the lights centred on
  its content line ±2 px, and nothing in it lies within 80 px of the
  window's left edge; that space is a drag region. The 80 px holds in full
  screen, so the brand does not move (T4).
- **FR-3** (T3) Empty top bar space drags the window and a double-click
  zooms it; every control stays no-drag.
- **FR-4** Compact and restore through the floating icon keep the hidden
  title bar (the restored style mask includes the full-size content view).

## Acceptance → gate

No row moves between desktops or drives Pablo's input; window rows run on
the seat's own review build, by seat-pointer against its own pid.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| H1 | 1 | the review build, AX read of its window (`seat-pointer window --pid`), and `shot` | the window's AX title is `Deltagos Review` (the review bundle's name); no native title text in the shot |
| H2 | 2 | vitest reading `TopBar` and the top bar's CSS; the shot at 1024×640 and 1440×900 | min-height 40 px; the first control's left edge at or past 80 px; the lights' centre within 2 px of the content line |
| H3 | 3 | seat, by seat-pointer: `drag` from empty top bar space, `click --double` there, `click` on a control | the window moves, zooms, and the control acts without a drag |
| H4 | 4 | the floating icon's compact then restore, through its FLOAT_LOG hooks, then `shot` | the title bar is still hidden-inset after restore |
| H5 | 2 | seat, by seat-pointer: full screen on the seat's own window (`front --pid` first), `shot` | the brand at the same x as windowed |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=~/agent-slack/specs/contracts make test`, `wails build`, `make review-build` in the worktree, then `git status --porcelain` | pass, empty |

The UI review (ui_review: true) checks one-title T1 to T5.

## Boundary

`main.go` (`mac.Options`), `frontend/src/components/TopBar.tsx` and its
test, `frontend/src/styles/global.css` (`.topbar` and `.brand` only),
`frontend/src/styles/shell.css` (the top bar's rules only),
`floaticon_darwin.m` only if FR-4 needs it. Not CLAUDE.md's naming
paragraph: the name stays Deltagos everywhere it is read.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf55-one-title` | H1-H5, X0 | — | true |
