# Leftovers 21: the rail hero is a summary, never a button: the build spec

status: proposed (0117)
by: the FSE, 2026-10-11, on main at 8b40e10
sources: sup57's close (`runs/2026-10-11-sup57-leftovers-20.md`, bk-ui sev
1: the Home hero's accessible name), Aglaea's
`docs/ux/specs/initiatives-view.md` Amendment 6 (f5d0302, row I39), which
replaces A5 §3's "on Home the hero stays one button". Kept as built (A6):
dt-ui U1 (pointer and keyboard each raise their own card), the goal line
sharing target's line at 1024. dt-ui U2 (plain Tab skips links) waits on
Pablo's answer in 0117. Gate rows follow 0095 and 0108: no row drives
Pablo's desktops, focus or input; screen rows read AX on the review app's
own pid, else computed styles in Chromium or offscreen WebKit, else vitest.

## Requirements, card `lf21-hero-summary` (frontend)

- **FR-1** The rail hero is never a button, on any screen: a summary with
  no role and no press, hover or pointer cursor. On Home it is the same
  summary (no `title`, no `onClick`); the Home tab is the way Home (I39).
- **FR-2** On an initiative the hero's one control stays `Back to
  Initiatives`, as lf20 FR-3 built it.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| H1 | 1, 2 | vitest of `RailHero` on Home and on an initiative | Home: no `button` in or as the hero; initiative: exactly one button, `Back to Initiatives` |
| H2 | 1, 2 | AX tree of the review process on Home and on an initiative | Home: no AXButton for the hero; initiative: one AXButton `Back to Initiatives` in it; the Home tab still an AXButton that opens Home (AXPress) |
| H3 | 1 | computed style of `.rail-hero` on Home in Chromium or offscreen WebKit, plain and with `:hover` forced by the stylesheet's rule (no pointer) | `cursor` not `pointer`; hovered background and border equal to plain |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf21-hero-summary`: `Rail.tsx` (`RailHero` and its call site only) and
  its tests; `styles/global.css` rules `.rail-hero*` and `.hero-back`. Not:
  `shell.css`, `TopBar.tsx`, `initiatives.css`, `header.css`.

## No-gos

- No change to the back button (lf20 FR-3) or to the Home tab.
- No Tab-order or keyboard-navigation change until 0117 answers Q1.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf21-hero-summary` | H1, H2, H3, X0 | — | true |
