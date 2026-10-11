# Leftovers 19: Settings' heading, Help as an overlay, the bar's last marks, the card's hover and Details, one package manager: the build spec

status: proposed (0115)
by: the FSE, 2026-10-11, on main at e93a3ef
sources: sup55's close (lf18-current-mark's UI review U1-U5 and the title,
lf18-charter-once's U1-U2; `.needs-me.on` dead; `make test` uses npm while
`wails build` uses pnpm), Aglaea's `docs/ux/specs/initiatives-view.md`
Amendment 4 (e93a3ef, rows I28-I34). Gate rows follow 0095 and 0108: no row
drives Pablo's desktops, focus or input; screen rows run on the review
app's own process (AX reads, computed styles, `screencapture -o -l` of its
window), else vitest. With `auth: firebase` the review build is not run
(it shares the keychain service with the installed app): those states are
vitest plus computed styles (I24 precedent, accepted by Aglaea).

## Requirements, card `lf19-places` (frontend)

- **FR-1** Settings' body starts with an `h1` `Settings` above Identity
  (I28).
- **FR-2** On an initiative the rail's back link reads `← Initiatives` and
  opens Initiatives, following `placeOf` (I29).
- **FR-3** Sync is a ghost button in every state; stale shows the word
  `stale` in magenta (the bar's only magenta) and no accent fill (I30).
- **FR-4** Help is an overlay: `?` carries `aria-expanded` and
  `--surface-selected` while Help is open, never `aria-current`; the screen
  under it keeps its one `aria-current="page"` (I31; replaces A3's Help row
  and lf18 FR-1's "Settings and Help ... `aria-current`" for Help).
- **FR-5** On an initiative the title is current by weight and ink: `--fg`
  at 600 against the tabs' `--fg-muted` at 500, no underline (I32).
- **FR-6** `.needs-me.on` removed from `shell.css` (dead, sup55).

## Requirements, card `lf19-card-details` (frontend)

- **FR-7** Hovering an Initiatives card's id link raises the card, as the
  rest of the body does (I33).
- **FR-8** The initiative header's Details button reads `Details` open or
  closed, with a turning chevron, one height and `aria-expanded`;
  `Hide details` goes (I34).

## Requirements, card `lf19-one-pm` (build)

- **FR-9** `make test` installs and builds the frontend with pnpm, as
  `wails build` does, from the pnpm lockfile; no `package-lock.json` is
  left behind.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| L1 | 1 | vitest of Settings; AX tree of the review process on Settings | first heading an `h1` `Settings` |
| L2 | 2 | vitest of the rail hero on an initiative; AXPress on the link in the review process | reads `← Initiatives`; opens Initiatives |
| L3 | 3 | vitest of Sync fresh and stale (`auth: firebase`); computed styles in vitest/jsdom or WebKit | ghost in both; `stale` magenta; no accent fill |
| L4 | 4 | vitest with Help open over Home and over an initiative; AX tree of the review process with Help open | `?` has `aria-expanded="true"`, no `aria-current`; exactly one `aria-current="page"`, the screen's |
| L5 | 5 | computed style of the title on an initiative in the review process | color `--fg`, weight 600, no underline |
| L6 | 6 | `grep -rn "needs-me.on" frontend/src` | nothing |
| C1 | 7 | vitest of the hover class with the pointer on the id link; computed style of the hovered state in Chromium or offscreen WebKit (Amendment 5) | raised |
| C2 | 8 | vitest of the header button open and closed; AX frame heights in the review process | label `Details` both ways, `aria-expanded` true/false, equal heights |
| P1 | 9 | from a clean clone: `make test`, then `ls frontend/package-lock.json` and `git status --porcelain` | pass; no lockfile; tree clean |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build` (pnpm after lf19-one-pm), `wails build`, then `git status --porcelain` | pass, empty |

Amendment 5, 2026-10-11, the FSE, per 0108, from sup56 (thread
01M4MQEF8MNF7GE2G9DSYNDEB5): C1's hover in the review process needs the
pointer, which 0108 forbids; it is met by vitest plus the hovered state's
computed style in Chromium or offscreen WebKit, as cd-build and cd-review
did (.wt-notes/cd-build/c1-c2-chromium-1024x640.json). C2 checks heights
only; the 22 px horizontal move of Details at 1024 (cd-ui U1, sev 2) is a
leftovers-20 item, not a fail of this row.

## Boundary

Stylesheets per card with the rules each owns.

- `lf19-places`: `TopBar.tsx`, `Settings.tsx`, `Rail.tsx` (the hero's
  back link only), `HelpView.tsx` only if the overlay needs its open state
  read; `styles/global.css` rules `.topbar`, `.brand*`, the places nav,
  `.hero-back`, `.rail-hero .hero-back` and a Settings `h1` rule;
  `styles/shell.css` rules `.crumbs`, `.crumb*`, `.needs-me*`; tests. Not:
  `initiatives.css`, `header.css`, `help.css` beyond the overlay's state.
- `lf19-card-details`: `InitiativesView.tsx` and the Initiatives view's
  card rules of `styles/initiatives.css`; `InitiativeHeader.tsx` (the
  Details button) and `styles/header.css` (its rules); tests. Not:
  `Rail.tsx`, the rail's or Agents' rules of `initiatives.css`.
- `lf19-one-pm`: `Makefile`, `.github/workflows/release.yml` if its Test
  step runs `make test`. Not: `frontend/package.json` scripts beyond what
  the switch needs.

## No-gos

- No folding by measured overflow (deferred until identity returns, U3).
- No change to the card's open Details (co-ui U3, no change).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf19-places` | L1-L6, X0 | — | true |
| `lf19-card-details` | C1, C2, X0 | — | true |
| `lf19-one-pm` | P1, X0 | — | false |
