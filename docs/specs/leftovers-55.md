# Leftovers 55: one band at the top, the name only where the system shows it: the build spec

status: ruled (0165, pablo 2026-10-26)
by: the FSE, 2026-10-25, on main at 269ebd7 (rewritten from Aglaea's second
reply the same day)
sources: Pablo, 2026-10-25 in the FSE session, with a screenshot: "I see
deltagos twice here, is it neceesary?", then "Send to Aglaea for a propper
aproach please"; Aglaea's `docs/ux/specs/one-title.md` as rewritten
(269ebd7), rows T1-T9, which replaces her first reply (e10e5af); record 0066
(the name Deltagos in the window and the top bar). Premises read today.

## Premises (read 2026-10-25 at 269ebd7)

| Premise | Shown by |
|---|---|
| the name shows three times with the window in front: the macOS menu bar, the native title bar, and the top bar's brand | Pablo's screenshot; one-title (269ebd7) |
| the window's title is set from `windowTitle()`; `mac.Options` sets only `TabFocusesLinks`, no title bar style and no About | `main.go:28-30, 45` |
| the top bar's first item is the brand `Deltagos`, and the version is only in its hover | `frontend/src/components/TopBar.tsx:30-31, 83-84` |
| the top bar is a drag region with no-drag children | `frontend/src/styles/global.css:99-109` |
| the lock screen draws its own lockup | `frontend/src/components/Gate.tsx:51` (`LockScreen`), `DeltagosMark.tsx:203` |
| the floating icon's list mode drops `NSWindowStyleMaskTitled` and restores the saved style mask | `floaticon_darwin.m:672-698` |
| CLAUDE.md states 0066's naming ("the window, the top bar, the version line … say so") | `CLAUDE.md`, first paragraph |

## Requirements

Card `lf55-one-title` (Go window options and frontend):

- **FR-1** (T1, T3) The native title bar is hidden and draws no text; the
  content runs to the window's top edge (Wails `TitleBar` Hidden or
  HiddenInset, whichever centres the lights per FR-3); the traffic lights
  stay. The brand word leaves the top bar: with the window in front, the
  name is in the macOS menu bar and nowhere inside the window.
- **FR-2** (T2) The window's title stays `Deltagos` (`Deltagos Review` in
  the review build) for Cmd-Tab, Mission Control, the Window menu, the
  Dock's window list, VoiceOver and seat-pointer.
- **FR-3** (T4, T5) The top bar starts with an 80 px box for the lights:
  no text or control in it, draggable; then Places and the crumbs, then the
  groups as today. Its height is 40 to 52 px, measured so the lights are
  centred on the content line ±2 px. At 1024×640 the bar folds at the same
  step as on main with the same content.
- **FR-4** (T6) Every empty stretch of the bar drags the window; a
  double-click there does what the system setting says (zoom, minimise or
  nothing); a control never drags.
- **FR-5** (T7) The version has real homes: the app menu's About Deltagos
  (`mac.Options.About`, `Version <version>`), and Settings' foot reads
  `Deltagos <version> · <machine>`. The brand's hover goes with the brand.
- **FR-6** (T8, T9) The 80 px box stays in full screen, so the places keep
  their x; the lock screen keeps the box free and shows no title text.
- **FR-7** Compact and restore through the floating icon keep the hidden
  title bar.
- **FR-8** CLAUDE.md's naming paragraph says where the name shows now (the
  menu bar, the window title, About, Settings' foot, the bundle and the DMG),
  per 0165.

## Acceptance → gate

No row moves between desktops or drives Pablo's input; window rows run on
the seat's own review build, by seat-pointer against its own pid.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| H1 | 1, 2 | review build: `seat-pointer window --pid` (AX title), `shot` | AX title `Deltagos Review`; no title text and no brand word in the shot; content from the top edge |
| H2 | 3 | vitest of `TopBar` (no brand; the lights' box first) and the bar's CSS; shots at 1024×640 and 1440×900 | the box 80 px with no child control; height in 40-52 px; the lights' centre within 2 px of the content line; 1024 folds at main's step |
| H3 | 4 | seat, by seat-pointer: `drag` from empty bar space, `click --double` there, `click` on a control | the window moves; the double-click does what `defaults read -g AppleActionOnDoubleClick` says; the control acts without a drag |
| H4 | 5 | review build: About Deltagos from the app menu (AX), Settings' foot (vitest and shot) | `Version <version>`; `Deltagos <version> · <machine>` |
| H5 | 6, 7 | full screen on the seat's own window (`front --pid` first), the lock screen (fixture with a passcode), and the floating icon's compact then restore through its FLOAT_LOG hooks, each with `shot` | the places at the same x; the box free on the lock screen; the title bar still hidden after restore |
| H6 | 8 | grep CLAUDE.md | the naming paragraph lists the new places and cites 0165 |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=~/agent-slack/specs/contracts make test`, `wails build`, `make review-build` in the worktree, then `git status --porcelain` | pass, empty |

The UI review (ui_review: true) checks one-title T1 to T9.

## Boundary

`main.go` (`mac.Options`, the window options), `frontend/src/components/TopBar.tsx`,
`Settings.tsx` (the foot), `Gate.tsx` (the lock screen's top) and their
tests, `frontend/src/styles/global.css` and `shell.css` (the top bar's and
the lock screen's rules only), `floaticon_darwin.m` only if FR-7 needs it,
CLAUDE.md's naming paragraph.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf55-one-title` | H1-H6, X0 | — | true |
