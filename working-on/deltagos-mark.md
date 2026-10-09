---
title: "The Deltagos mark on the floating icon, the app icon and the Help header"
status: now
repos: [organizer]
branch: deltagos-mark
seat: dm-build
stage: one-window
updated: 2026-10-09
next: "review: deltagos-mark, F17-F22 H1 X0 met (F20/F21 per Amendment 3), 5c61b3f"
depends_on: [ram-view]
boundary: ["floaticon_darwin.m/.h/.go (the tile's layers only)", "build/appicon.png and build/darwin/iconfile.icns (copied from docs/ux/inputs/deltagos-mark/app-icon/, never redrawn)", "new DeltagosMark.tsx and css, HelpView.tsx (header)", "not: the panel's list, activation paths (float-focus-steal), the RAM ring's logic"]
spec: "docs/specs/deltagos-mark.md (FR-1 to FR-4; docs/ux/specs/floating-icon.md Amendment 4)"
gate: "docs/specs/deltagos-mark.md Acceptance, rows F17 to F22, H1 and X0"
ui_review: true
---

## Goal
0102: the mark Pablo suggested, in the app's palette, wherever Deltagos names
itself.

## Gate
docs/specs/deltagos-mark.md, F17 to F22, H1 and X0. Evidence in
`.wt-notes/dm-build/` (progress.md lists each file).
- [x] F17: `native-{56,72,88}x*-F17-moving-a/b.png` (frames differ), `native-56x56-F17-hover-critical-ring-a.png`, `float-w56.log`
- [x] F18: `f18-f22-icons.txt` (iconutil of the bundle's icns), `px/icon_16x16-x.png` (D alone), `px/icon_32x32-x.png` (D and gears); Finder/Dock shots under F20/F21
- [x] F19: `native-88x88-F19-reduce-motion-a/b.png` identical, `float-reduce.log`; Help: vitest `DeltagosMark.test.tsx`, `chrome-1440x360-F19-help-header-reduce-motion.png`
- [x] F20: IconServices renders (Amendment 2) `iconservices-{16,32,128,256,512,1024}…-F20-F21-<pt>pt@<n>x.png`, numbers in `f20-f21-iconservices.txt` (script `iconservices.swift`): 128 and 512 pt @1x/@2x show the tile, the D and both gears with no frame; **16 and 32 pt @1x/@2x show a light grey plate around the art** (opaque grey, about 0.9, outside the tile), recorded, not failed, by spec Amendment 3 (cfefac8); the format is card app-icon-composer
- [x] F21: same renders: 16 pt shows the D alone, 32 pt the D and gears, neither a smear, both inside the grey plate (F20, Amendment 3, cfefac8). Slots also by iconutil (`f18-f22-icons.txt`)
- [x] F22: `f18-f22-icons.txt` (sha256 equal: both files and the bundle's copy)
- [x] H1: `chrome-1440x360-H1-help-header.png` (the real HelpView, headless Chrome) beside `deltagos-mark-drawn.png`; motion by vitest; not shot in the review build (opening Help needs a click)
- [x] X0: `x0-*.txt`, and from a clean clone of 5c61b3f `x0-clean-*.txt`; existing F-rows: F2, F12 seen, the rest not re-run (desktops, pointer)

## Done
- 2026-10-09: dm-build: native mark on the tile (30cab0f), exported app icon plus a Makefile line (8c91c94), DeltagosMark in the Help header (5c61b3f); branch rebased on main.

## Notes
- 2026-10-09: supervisor sup50 (window 8383), spawned by the FSE.
- 2026-10-09, dm-build: Wails 2.15 never reads `build/darwin/iconfile.icns`; `processDarwinIcon` always encodes the bundle's .icns from `appicon.png` (checked in v2.15.0's packager.go, and the first build's .icns differed). So `make build` copies the exported .icns into the bundle and re-signs ad hoc (the Makefile line the boundary allows); `cmp` after `make review-build` and a clean-clone build: identical, signature valid. `.github/workflows/release.yml` calls `wails build` directly, so a tagged release still ships the regenerated icon without the 16/32 cuts (outside this card).
- 2026-10-09, dm-build: check-only `FLOAT_SHOW_ICON=1` (under FLOAT_LOG) shows the icon at start, so its window is shot without moving desktops.
- 2026-10-09, dm-build: the grey plate at 16 and 32 pt is macOS 26's for an icon given only as an `.icns`: zoom.us (`ZPLogo.icns`, no `Assets.car`) renders the same plate at 16 and 32 pt (`.wt-notes/dm-build/controls/zoom.us/`); iTerm, Chrome and Firefox, which ship an `Assets.car`, do not. Not the art: the large sizes take the tile as is. A remedy is an asset catalog or Icon Composer `.icon`, out of this card's scope (floating-icon Amendment 5) and outside my boundary.
- 2026-10-09, dm-build: decide on the grey plate answered by the FSE, spec Amendment 3 (cfefac8): recorded, not failed; new card app-icon-composer takes the format.
- 2026-10-09, dm-build: icon_16x16 and icon_32x32 decode to other pixels than the exported slots because Aglaea's own `iconutil` stores those two as raw ARGB (`ic04`/`ic05`), not PNG; alpha and every opaque pixel match, only semi-transparent edge pixels differ in colour. Wails and the Makefile line do not touch the bytes (sha256 equal).
- 2026-10-09, dm-build: the Help's mark moves for as long as Help is open; the drawing had a Pause button, the spec has none (WCAG 2.2.2). For Aglaea.
