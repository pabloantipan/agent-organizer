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
review: pass
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

## Review
- Verdict: pass at 5c61b3f. Unmet gate rows: none.
- Reviewer: dm-review, 2026-10-09. Evidence of my own in `.wt-notes/dm-review/` (clean clone of 5c61b3f, removed after).
- X0 from the clean clone: `make test` (go ok, vitest 372 passed), `npm run build`, `wails build` exit 0. Existing F-rows: the diff to `floaticon_darwin.m` touches only the tile's layers, `breathe()` and a `FLOAT_SHOW_ICON` stand-in gated on `FLOAT_LOG`; F2 and F12 seen in the builder's shots and log, the ring by `float-ring.log`; F3's bars are replaced by F17/F19 (Amendment 4).
- F18/F22 from the clone's `make review-build`: both files and both bundles' icns sha256-equal to `app-icon/` (b087f05…, 774b539…), signatures valid; iconutil slots: 16 the D alone, 16@2x and 32 the D and gears.
- F20/F21: my IconServices renders of the clone's `Deltagos Review.app` match the builder's numbers line for line; the grey plate shows at 16 and 32 pt only, recorded under Amendment 3.
- F17, F19, H1: the builder's native shots (a/b differ; reduce-motion a/b sha-equal), logs, and vitest; the Help mark's constants and loop match `deltagos-mark-drawn.html`.
- Not covered by the gate: a bare `wails build` (X0's own command and `.github/workflows/release.yml`) ships a regenerated icns (81bdf58…, no 16/32 cuts); only `make build` copies the exported one. The spec's rabbit hole says Wails reads `build/darwin/iconfile.icns`; it does not. Amendment 3 says the plate shows "at every size"; the renders show it at 16 and 32 pt only.

## UI review
- Verdict: **pass** at 5c61b3f (run 2026-10-09, dm-ui, its own detached worktree and `make review-build`, fixture home; no driven input). Sev 4/3 against the spec: none. Evidence in `.wt-notes/dm-ui/`.

| Row | How checked | Result |
|---|---|---|
| F17 | my review build, `FLOAT_SHOW_ICON=1` with `FLOAT_SIZE_WIDTH` 1440/2560/3440, `screencapture -l` of my icon window twice 1.5 s apart: `native-{56x56,72x72,88x88}-F17-moving-a/b.png`; `float-F17-moving.log` (56/72/88 pt read back, `breathe: on`); critical fixture + `FLOAT_LOOK=hover`: `native-56x56-F17-hover-critical-ring-a/b.png` | met: the D, its gaps and both gears read at every size, a/b differ (gears turned, gaps moved); colours as FR-1; hover look and the ring sit around the mark |
| F18 | `iconutil` of my bundle's icns, slots enlarged (`px/slot-*-x.png`) | met: 16 the D alone, 16@2x and 32 the D and gears with no gaps, 32@2x up the whole still frame; nothing smears |
| F19 | `FLOAT_REDUCE_MOTION=1` at 88 pt: `native-88x88-F19-reduce-motion-a/b.png` byte-identical, log `still (reduce motion)`; Help: vitest (`vitest-deltagos-mark.txt`, 10 passed) and the builder's Chrome reduce-motion shot | met: the still frame, gaps and gears in place, same picture as the app icon |
| F20 | IconServices renders of my bundle (`iconservices/`, `f20-f21-iconservices.txt`, numbers equal to the builder's) | met under Amendment 3: 128 and 512 pt the tile, D and both gears, no frame; the plate at 16 and 32 pt recorded (U1) |
| F21 | same renders, enlarged | met: 16 pt the D alone, 32 pt the D and gears, neither a smear; both inside the plate (U1) |
| F22 | `f22-sha.txt`: sha256 of `app-icon/` files, `build/` copies and my bundle's icns | met: equal (b087f05…, 774b539…); signature valid |
| H1 | the builder's `chrome-1440x360-H1-help-header.png` beside `deltagos-mark-drawn.png`; `DeltagosMark.tsx`/css read | met: same D, gears and colours; "Deltagos" in Manrope 800; the subtitle word for word; motion by vitest only |

- **U1 (sev 2, recorded, not failed: Amendment 3, card `app-icon-composer`).** The lead sees the Deltagos icon at 16 and 32 pt shrunk inside a light grey plate (about 0.9 grey) in Finder lists and the sidebar. Where: `iconservices/iconservices-16x16-…-16pt@1x-x.png`, `…-32pt@1x-x.png`. Evidence: IconServices renders, `edge max alpha` 0.17/0.01, top-centre ≈ 0.90-0.93 grey; 128 pt up clean. The D still reads (about 9 px tall at 16 pt) but the tile reads as a light square in a dark UI. Proposal: the asset catalog / `.icon` card already cut.
- **U2 (sev 2, for aglaea).** The lead cannot stop the Help's mark: it moves for as long as Help is open, beside the text he reads (WCAG 2.2.2 Pause, Stop, Hide; decorative motion is not exempt). Where: Help header (`DeltagosMark.tsx`, `DeltagosLockup`). Evidence: code (rAF loop, no control), the drawing has a Pause button, FR-4 asks none; only the system's Reduce motion stops it. Proposal: stop after one lap, or play on hover only, or a pause control.
- **U3 (sev 1).** A screen reader hears the name twice in the Help header: the mark is `role="img"` `aria-label="Deltagos mark"` beside the wordmark "Deltagos". Where: `DeltagosMark.tsx:161`. Proposal: `aria-hidden` on the mark inside the lockup.
- **Spec gaps (for the FSE).** (1) X0 names `wails build`, and `.github/workflows/release.yml` runs it, but only `make build` puts the exported icns in the bundle; a tagged release ships a regenerated icon without the 16/32 cuts (dm-review saw the same). (2) Amendment 3 says the plate shows "at every size"; the renders show it at 16 and 32 pt only. (3) FR-4 says nothing about how long the Help's mark moves (U2).
- **Design questions, for aglaea.** A1: U2, which pause. A2: while the plate lasts, should the 16 px cut grow (the D fills ~60 % of the slot inside it)? A3: the critical ring is still magenta (amber waits on 0109, `ram-ring-amber`); not this card.
- **Not verified in WKWebView.** The Help header (opening it needs a click): judged from headless Chrome and vitest; Chrome showed first frames only, so the full motion (points, notches, varying speed) is code and tests, not seen. Real hover, press and drag (the hover look is the check-only override). Reduce motion from the system setting (overrides only). Live Dock and Finder (IconServices only). The ring's breathing (two frames).
