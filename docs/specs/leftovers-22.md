# Leftovers 22: Tab reaches every link: the build spec

status: proposed (0118)
by: the FSE, 2026-10-11, on main at 08add91
sources: 0117 (ruled, "accept; I use Tab, make links reachable app-wide
next"), Aglaea's `docs/ux/specs/tab-reaches-links.md` (3ce6af1, rows
T1-T5). Gate rows follow 0095 and 0108: no row drives Pablo's desktops,
focus or input. Tab presses never go through CGEvent, System Events or
seat-pointer: they are `NSEvent` key-downs a harness posts to its own
offscreen window (below). Chromium cannot show T1 (it always tabs to
links), so every Tab row runs in WKWebView.

## The Tab harness (both cards' gate rows use it)

A seat-run harness, kept in the card's worktree under `scripts/` or
`.wt-notes/`: a Swift or Objective-C program that runs with activation
policy prohibited (no Dock icon, never frontmost), opens an offscreen
`NSWindow` holding a `WKWebView` whose `preferences.tabFocusesLinks` is
set as the review flag says (on, as `main.go` sets it; off, as main sets
it), loads the app's frontend from `wails dev`'s
`http://localhost:34115` on the fixture (`eval "$(scripts/fixture-home.sh)"`,
auth off), posts Tab, Shift-Tab, Up, Down and Return as `NSEvent`s through
`[window sendEvent:]`, and after each prints `document.activeElement`
(tag, role, accessible name, `:focus-visible`, the card's raised style
where it applies) via `evaluateJavaScript`. It never activates, never
takes key focus from another app, and never posts a system event. After
`wails dev`, the builder runs `wails build` again (CLAUDE.md: dev empties
the bundle). If WKWebView refuses key events to a window that is not key,
the builder stops and tells the supervisor before reaching for anything
else.

## Requirements, card `lf22-tab-links` (Go one line, frontend)

- **FR-1** `main.go` sets `Mac.Preferences.TabFocusesLinks = mac.Enabled`
  in `options.App` (T1). No `tabindex="0"` on links; no link turned into a
  button.
- **FR-2** A `Skip to content` link is the first Tab stop on every screen,
  hidden until focused, shown at the top left over the bar with the focus
  ring; Enter moves focus to the `main` region's first heading or control
  (T2).
- **FR-3** Every link shows the same `:focus-visible` ring as buttons;
  `Open <id>` also raises its card (I37, lf20) (T4).
- **FR-4** The inventory (T5): every `<a href>` and every element that
  navigates on click, and the Tab order before and after on Home,
  Initiatives, an initiative's Overview and Settings at 1440×900, written
  to the card. A `div` or `span` that navigates on click is a finding for
  the FSE, not fixed in this card.

## Requirements, card `lf22-rail-roving` (frontend), after `lf21-hero-summary`

- **FR-5** The rail's initiative rows are one Tab stop with a roving
  tabindex: Tab enters on the current row (else the first), Up and Down
  move, Enter opens the row, the next Tab leaves the rail for the main
  region. The rail's own buttons (collapse toggle, `Back to Initiatives`,
  group headers) stay ordinary Tab stops before the rows; drag's Space to
  lift stays (T3).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| K1 | 1 | Go test (or `go vet`-level grep in a test) that the `options.App` built by `main.go` has `Mac.Preferences.TabFocusesLinks` enabled; the harness with the flag on and off, Tab from the top of Initiatives and of Home with a role drawer open | on: plain Tab lands on a card's `Open <id>` and a drawer's initiative link; off: it never does |
| K2 | 2 | harness, flag on: the first Tab on Home, Initiatives, an initiative and Settings, then Return; vitest of the skip link | first stop `Skip to content`, `:focus-visible`, on screen with the ring; after Return the active element is inside `main` |
| K3 | 3, 4 | harness: Tab to each kind of link; computed `outline` and, for `Open <id>`, the card's raise | the ring on every link; the card raised as hovered (lf20 D1's values) |
| K4 | 4 | the inventory and the four Tab-order lists, before (flag off) and after (flag on), on the card | written; every navigating element is a link or a button, else listed as a finding |
| V1 | 5 | harness, flag on, on an initiative: Tab into the rail, Down twice, Up once, Return, then Tab; vitest of the roving tabindex | enters on the current row; one row `tabindex="0"`, the rest `-1`; Return opens the row under focus; the next Tab lands in `main` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf22-tab-links`: `main.go` (the `Mac` options only) and a test for it;
  `App.tsx` (the skip link and a focus target on each `main`); a new
  `SkipLink.tsx` and its test; `styles/shell.css` a new `.skip-link`
  rule; `styles/global.css` a link `:focus-visible` rule only if the
  existing `:focus-visible` (line 39) does not reach links; the harness.
  Not: `Rail.tsx`, `InitiativesView.tsx`, `RoleDrawer.tsx` beyond reading
  them for the inventory.
- `lf22-rail-roving`: `Rail.tsx` (the rows' tabindex and key handling) and
  its tests; `styles/global.css` rail row focus rules only; it reuses
  `lf22-tab-links`' harness if merged, else carries its own copy. Not:
  `App.tsx`, `main.go`, `shell.css`.

## No-gos

- Arrow keys inside the board's columns; keyboard shortcuts; a full focus
  audit (Aglaea, out of scope).
- No fix of a click-navigating `div` in this task (a finding, next task).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf22-tab-links` | K1, K2, K3, K4, X0 | — | true |
| `lf22-rail-roving` | V1, X0 | lf21-hero-summary | true |
