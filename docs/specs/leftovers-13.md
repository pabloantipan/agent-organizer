# Leftovers 13: the Ruled line's floor, the review window's title, the dead copies, and the floating icon's Amendment 3: the build spec

status: proposed (0096)
by: the FSE, 2026-10-06, on main at 40b315b
design: Aglaea's calls 5c937df (dln-U1 the chosen option's floor and drop,
dln-U2 the wake count beside Rule, `docs/design-system.md`); the run records
`runs/2026-10-06-decisions-line-and-names.md` and
`runs/2026-10-05-floating-icon.md`; the FSE bitácora (dst G4). Gate rows
follow 0095: a row names Pablo only when no seat can check it.

## Problem

- **dln-U1 (sev 2):** on a Ruled line whose title is long too, the chosen
  option shrinks to 0 with no ellipsis and leaves a stray leading `·`: 13 of
  89 lines at a 1024 window, rail full (run record, decisions-line-and-names).
  The spec's X1 gated only 0082's line (dln G2), so this passed.
- **dln-U2 (sev 1):** the rule box's wake count sits far from Rule; the
  design system now puts it beside the commit, "Start, Send or Rule".
- **dst G4:** the review build's window is titled "Deltagos" like the lead's
  (`main.go:35`), and someone typed into a reviewer's fixture window thinking
  it was the real one.
- **Dead copies:** the state word map is in three files (`AgentList.tsx:8`,
  `Crew.tsx:13`, `RoleDrawer.tsx:192`); `.wakes.hot` (`global.css:560`) is
  no longer used; the wake count's magenta is an inline style
  (`Conversation.tsx:555`).
- **A designed state no reviewer can reach:** the floating list's "no
  initiatives" state (`docs/ux/specs/floating-icon.md` §3) has no fixture.

## Requirements, card `ruled-line-floor`

- **FR-1** A Ruled line follows the design system's order: the chosen option
  ellipsizes down to about 8 characters, then the title down to about 20,
  then the chosen option drops whole **with its separator**, its text kept in
  the hover and the accessible name. No line shows an empty option or a
  stray `·`.
- **FR-2** In every rule box (Needs me's and Conversations'), the wake count
  sits beside Rule, as it does beside Start and Send.
- **FR-3** A window of the review build is titled "Deltagos Review"; the
  installed app's stays "Deltagos". The title follows the bundle's name, so
  `scripts/review-build.sh` needs no Go change per build.
- **FR-4** One state word map, in `lib/`, used by AgentList, Crew and the
  roles drawer; `.wakes.hot` removed; the wake count's magenta is a class on
  the tone token, not an inline style.
- **FR-5** `scripts/fixture-home.sh --empty` lays out a home with no
  initiatives, so the floating list's "no initiatives" state can be shown.

## Acceptance → gate

UI review in `make review-build`, pinned. Every row is the seat's (0095).

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| L1 | 1 | Decisions, Ruled open, every line of the organizer's 94 records copied into init-nopeople, windows 1024×640 and 1512×945, rail full and strip, both engines; a sweep over all lines, not one | no line has a chosen option under the floor without it dropped; no text node is a lone `·`; the board's `scrollWidth` equals its `clientWidth`; a dropped option is whole in hover and name. On main: 13 lines at 1024 full fail |
| L2 | 2 | Needs me's rule box and Conversations' rule box, one seat and all | the wake count is adjacent to Rule (same row, Rule's neighbour), neutral, magenta when all |
| L3 | 3 | launch `Deltagos Review.app` and `Deltagos.app` built from the branch; read each front window's title by System Events | "Deltagos Review" and "Deltagos" |
| L4 | 4 | grep for the word map literal and `.wakes.hot`; vitest over the shared map | one definition, in `lib/`; no `.wakes.hot`; no inline `color` on the wake count; AgentList, Crew and the drawer show the same word for each state |
| L5 | 5 | `eval "$(scripts/fixture-home.sh --empty)"`, the review build, the floating list on another desktop | the list's "no initiatives" words from the design spec |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`DecisionsView.tsx` and `decisions.css` (the Ruled line), `global.css`
(`.dec-meta` and `.wakes` only), `Conversation.tsx` (rule box, `WakeCount`),
`Home.tsx` (its rule box's wake count only), `AgentList.tsx`, `Crew.tsx`,
`RoleDrawer.tsx` (the word map only), one new `lib/` module and its test,
`main.go` (the window title only), `scripts/fixture-home.sh` (`--empty`).
Not: `docs/design-system.md`, the floating panel's native code.

## No-gos

- The floating list's "still scanning" state: reaching it needs a slow-scan
  hook in the scanner, more code than the state is worth. It stays proven by
  code reading.
- dln G1 (X4's row 12 is a seat row no UI path lands on): a wrong gate row,
  not a product gap; nothing to build.

## Requirements, card `floating-icon-3`

Aglaea's Amendment 3 (`docs/ux/specs/floating-icon.md`, 3bc5164), her calls
on four details left by sup43 and sup44; it replaces Amendment 2's wait.

- **FR-6** The list panel shrinks to its content: the field, the rows and
  8 px under the last row, no floor.
- **FR-7** At the top edge the icon's visible top sits 8 px under the menu
  bar like any other edge; the window's transparent margin may overlap the
  menu bar, the icon may not.
- **FR-8** A zoomed (not full-screen) window on a normal desktop does not
  hide the icon; only a full-screen Space does (0088).
- **FR-9** With the list open, a click on the icon closes it at once; a
  second click within the double-click interval grows full Deltagos, and the
  list never reopens.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| F13 | 6 | the review build, the list filtered to one row; the panel's frame and the row's read back | the gap under the row is ≤ 8 px (main: ~50) |
| F14 | 7 | the icon dragged to the top edge by synthetic mouse events | the icon's visible top 8 ± 2 px under the menu bar, measured on the icon (main: ~40) |
| F15 | 8 | a window zoomed by AppleScript on a normal desktop; the same window full screen | the icon shown, then hidden (main: hidden both) |
| F16 | 9 | synthetic clicks on the icon with the list open: one; then two within the interval | closed within 100 ms; closed, then full grows, the list never reopens (main: ~0.5 s wait) |

All four are the seat's, by CGEvent and AppleScript (0095; dln-x1 drove a
phased trackpad swipe the same way). The by-hand script stays for Pablo's
own look if he wants one, not as a gate.

## Technical notes

- Spec check (spec-craft 5b): every row is satisfiable inside the boundary
  with its inputs in hand; L1 and L2 fail on main (run record numbers;
  `Conversation.tsx:543` puts the count before the actions); L3 fails on
  main (`main.go:35`); L4 by grep (three literals). No row needs Pablo
  (0095): L3 reads titles through System Events, L1 is a DOM sweep.
- floating-icon-3's rows fail on main by the run records' numbers (~50 px,
  ~40 px, Amendment 2's wait) and T3's edge-to-edge test
  (`floaticon_darwin.m`). Its boundary shares no file with
  `ruled-line-floor`, so both run in one wave.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `ruled-line-floor` | L1–L5, X0 | — | true |
| `floating-icon-3` | F13–F16, X0 | — | true |
