---
title: "The Deltagos mark on the floating icon, the app icon and the Help header"
status: now
repos: [organizer]
branch: deltagos-mark
seat: dm-build
stage: one-window
updated: 2026-10-09
next: "review: deltagos-mark, F17 F18 F19 F22 H1 X0 met, F20 and F21 Finder/Dock views need a look (status to sup50), 5c61b3f"
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
- [ ] F20: not shot; needs a Dock look on lodestar from an installed review build (no input allowed to this seat)
- [ ] F21: slots proven by iconutil (above); Finder list view and sidebar not shot (needs a Finder window)
- [x] F22: `f18-f22-icons.txt` (sha256 equal: both files and the bundle's copy)
- [x] H1: `chrome-1440x360-H1-help-header.png` (the real HelpView, headless Chrome) beside `deltagos-mark-drawn.png`; motion by vitest; not shot in the review build (opening Help needs a click)
- [x] X0: `x0-*.txt`, and from a clean clone of 5c61b3f `x0-clean-*.txt`; existing F-rows: F2, F12 seen, the rest not re-run (desktops, pointer)

## Done
- 2026-10-09: dm-build: native mark on the tile (30cab0f), exported app icon plus a Makefile line (8c91c94), DeltagosMark in the Help header (5c61b3f); branch rebased on main.

## Notes
- 2026-10-09: supervisor sup50 (window 8383), spawned by the FSE.
- 2026-10-09, dm-build: Wails 2.15 never reads `build/darwin/iconfile.icns`; `processDarwinIcon` always encodes the bundle's .icns from `appicon.png` (checked in v2.15.0's packager.go, and the first build's .icns differed). So `make build` copies the exported .icns into the bundle and re-signs ad hoc (the Makefile line the boundary allows); `cmp` after `make review-build` and a clean-clone build: identical, signature valid. `.github/workflows/release.yml` calls `wails build` directly, so a tagged release still ships the regenerated icon without the 16/32 cuts (outside this card).
- 2026-10-09, dm-build: check-only `FLOAT_SHOW_ICON=1` (under FLOAT_LOG) shows the icon at start, so its window is shot without moving desktops.
- 2026-10-09, dm-build: the Help's mark moves for as long as Help is open; the drawing had a Pause button, the spec has none (WCAG 2.2.2). For Aglaea.
