# Leftovers 20: current against open in the bar, the rail's own back button, the card's focus, Details that never moves: the build spec

status: proposed (0116)
by: the FSE, 2026-10-11, on main at 56053a1
sources: sup56's close (`runs/2026-10-11-sup56-leftovers-19.md`: places U1,
the hero-as-back-link gap, card-details A2, A3, cd-ui U1), Aglaea's
`docs/ux/specs/initiatives-view.md` Amendment 5 (9a058c0, rows I35-I38) and
the two rules it added to `docs/design-system.md` (current is a line, open
is a surface; a control does not move when pressed). No change: places U2
(the gear keeps focus) and A1 (the chevron swap). Gate rows follow 0095 and
0108: no row drives Pablo's desktops, focus or input, and none hovers or
focuses by pointer; screen rows run on the review app's own process (AX
reads, AXPress, `screencapture -o -l` of its window) or read computed styles
in Chromium or offscreen WebKit, else vitest. A locked screen (sup56, 02:35)
leaves AX empty: such a row then rests on WebKit computed styles, and the
card says so.

## Requirements, card `lf20-bar-marks` (frontend)

- **FR-1** A current icon in the bar (the gear on Settings, any icon that
  is the screen's place) shows the tabs' 2 px accent underline and no
  filled surface; `.gear.on`'s `--surface-selected` goes (I35).
- **FR-2** `?` while Help is open keeps `--surface-selected` and no
  underline. With Help over Settings both show and differ (I35).

## Requirements, card `lf20-back-button` (frontend)

- **FR-3** On an initiative, `← Initiatives` is its own button at the top
  of the rail hero, at least 24 px tall, accessible name
  `Back to Initiatives`, opening Initiatives as lf19 FR-2 did (I36).
- **FR-4** On an initiative the rest of the hero (client, id, counts) is
  not a button and a press on it does nothing. On Home the hero stays the
  Home button, unchanged (I36).

## Requirements, card `lf20-card-details` (frontend)

- **FR-5** `:focus-visible` on an Initiatives card's `Open <id>` link
  raises the card exactly as hover does (I37).
- **FR-6** The initiative header's Details button sits at the first line's
  right end and never wraps. When the goal line cannot keep its 20ch floor
  beside the pills, the goal line drops to its own line under the bar;
  opening Details removes it and the button's frame (x, y, width, height)
  does not change (I38).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| B1 | 1, 2 | vitest of the bar on Settings, with and without Help open; computed styles of the gear and `?` in Chromium or offscreen WebKit with the build's css | current gear: `box-shadow` inset 0 -2px accent, background transparent; open `?`: `--surface-selected`, no box-shadow; over Settings the two differ |
| R1 | 3 | vitest of the rail hero on an initiative; AX of the review process: AXButton `Back to Initiatives`, its frame height; AXPress on it | one button so named, ≥ 24 px; Initiatives opens |
| R2 | 4 | vitest: on an initiative the hero's counts are not inside a button and a click on them calls nothing; on Home the hero is one button that goes Home | as stated |
| D1 | 5 | vitest of the focus-visible class or rule; computed style of the card with `Open <id>` focused (`:focus-visible` forced by keyboard focus in Chromium or WebKit, not the pointer) | the same raise as the hovered card (C1's values) |
| D2 | 6 | computed frame of Details closed and open in Chromium or offscreen WebKit at 1024×640 with the rail open and at 1440×900, on a fixture initiative whose goal wraps at 1024; vitest of `aria-expanded` | x, y, width, height identical closed and open at both sizes; the goal line under the bar at 1024 |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

Stylesheets per card with the rules each owns.

- `lf20-bar-marks`: `TopBar.tsx` (the gear's and `?`'s classes only);
  `styles/shell.css` rules `.gear`, `.gear.on` and a new `?`-open rule;
  `TopBar.test.tsx`. Not: `global.css`, `Rail.tsx`, `header.css`,
  `initiatives.css`.
- `lf20-back-button`: `Rail.tsx` (the hero only) and its tests;
  `styles/global.css` rules `.rail-hero*` and `.hero-back`. Not:
  `shell.css`, `TopBar.tsx`.
- `lf20-card-details`: `InitiativesView.tsx` and the Initiatives view's card
  rules of `styles/initiatives.css`; `InitiativeHeader.tsx` (the Details
  button and the goal line's placement) and `styles/header.css`; their
  tests; a fixture goal under `testdata/` only if none wraps at 1024. Not:
  `Rail.tsx`, the rail's or Agents' rules of `initiatives.css`, `shell.css`.

## No-gos

- No focus change on Settings' `h1` (U2, no change).
- No change to the chevron swap (A1).
- No other icon's behaviour beyond the current underline and the open fill.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf20-bar-marks` | B1, X0 | — | true |
| `lf20-back-button` | R1, R2, X0 | — | true |
| `lf20-card-details` | D1, D2, X0 | — | true |
