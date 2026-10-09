# The Deltagos mark on the floating icon, the app icon and the Help: the build spec

status: proposed (0105)
by: the FSE, 2026-10-09, on main at a9cc5e9
scope: 0102 (ruled A: magenta and periwinkle). design: Aglaea's
`docs/ux/specs/floating-icon.md` Amendment 4 (e1cdce1), acceptance F17-F19;
drawing `docs/ux/inputs/deltagos-mark/deltagos-mark-drawn.html`, geometry and
constants in `deltagos-mark-handoff.md` there. Gate rows follow 0095.

## Problem

Pablo, 2026-10-07: "a sugestion for the floating icon of the app"; 2026-10-09:
"adjust pallete to current one and let's draw it"; 0102 ruled the gears
magenta and periwinkle. Today the floating icon draws three bars
(`floaticon_darwin.m`, §1 of the floating-icon spec) and the app icon is
`build/appicon.png`, the same bars.

## Requirements, card `deltagos-mark`

- **FR-1** The floating icon draws the mark on its tile instead of the bars,
  at 56, 72 and 88 pt: the D in `--accent` #8a3ffc, the big gear
  `--magenta-9` #d946ef, the small gear `--periwinkle-9` #a9a0ff, clipped to
  the D's silhouette, on `--bg`, geometry from the hand-off (100-unit
  space). Natively (Core Animation): the gears turn (small gear twice as
  fast, opposite way) and three gaps travel round the D at constant speed
  (`lineDashPhase`). The points, notches and varying speed are dropped on
  the icon (Aglaea: about 2 px at 56 pt). The icon's existing states (rest,
  hover, breathe, the RAM ring when it lands) keep working around it.
- **FR-2** Reduce motion: the still frame (travel 0), nothing turns.
- **FR-3** The app icon (Dock, Finder) is the still frame on the tile; the
  32 px cut is the D and gears with no gaps, the 16 px cut the D alone.
- **FR-4** The Help's header shows the full mark with its full motion (the
  web drawing ported to a React component, points, notches and varying
  speed kept), the wordmark "Deltagos" in Manrope 800 and the subtitle
  "From deltos, the writing tablet, and strategos, the general." Still
  under Reduce motion. No splash screen.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| F17 | 1 | the review build's icon at 56/72/88 pt, shots | the D, its moving gaps and both turning gears read; colours as FR-1 |
| F18 | 3 | Finder and Dock at large, 32 and 16 px (`iconutil` output, shots) | still frame; 32 px D and gears, no gaps; 16 px D alone; nothing smears |
| F19 | 2, 4 | Reduce motion on: icon and Help header | still frame; nothing turns or travels |
| H1 | 4 | Help header, shot beside `deltagos-mark-drawn.html` | same form and motion, wordmark and subtitle |
| X0 | all | `make test`, `cd frontend && npm run build`, `wails build`, the floating icon's existing F-rows | pass |

## Boundary

`floaticon_darwin.m/.h/.go` (the tile's layers only), `build/appicon.png`
and the darwin icon files, a new `frontend/src/components/DeltagosMark.tsx`
with css, `HelpView.tsx` (the header). Not: the panel's list, activation
paths (card `float-focus-steal`), the RAM ring's logic (`ram-view`).

## Rabbit holes

- **Small-size cuts.** Wails makes the `.icns` from `build/appicon.png`
  alone; per-size cuts need a hand-built `.icns` (`iconutil`) that the build
  keeps. The builder checks how Wails v2.15 takes one and records it.
- **Gear meshing** was checked numerically in the sketch; keep the
  constants exactly, or the teeth overlap.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `deltagos-mark` | F17-F19, H1, X0 | ram-view (both touch `floaticon_darwin.m`) | true |
| `float-focus-steal` | its S1-S4 | — | false |
