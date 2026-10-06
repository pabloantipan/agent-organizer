---
title: Deltagos floats as an icon on other desktops; click for the initiative list; Compact to icon
status: next
repos: [organizer]
branch: floating-icon
seat: fic-build
updated: 2026-10-05
next: "review: floating-icon, gate met, c2ee232"
review: fail
depends_on: []
boundary: ["floaticon_darwin.m, floaticon_darwin.h, floaticon_darwin.go (new, darwin-only) and the hook in app.go", "frontend/src/components/FloatList.tsx (new) and its CSS; TopBar.tsx (the Compact to icon button); the store's openInitiative use only", "frontend/src/lib/ helpers and tests (list rows, search)", "scripts/ (a by-hand check script, like the spike's y1-pointer.sh)", "not: wails.json, build/darwin templates, other Go packages, docs/design-system.md"]
spec: "docs/ux/specs/floating-icon.md (Aglaea, 16ae245) and its Technical notes T1-T8; scope 0088; the spike's Findings (on main as afe792d)"
gate: "docs/ux/specs/floating-icon.md Acceptance F1-F9, plus the rows below"
ui_review: true
---

## Goal
The Teams behaviour Pablo asked for in 0088, built the way the spike proved.

## Gate
- [x] F1-F9: see `docs/ux/specs/floating-icon.md`, Acceptance; F4 (drag), F5 (click), F7 (pick nothing) and F8 (the top-bar button) performed by Pablo with the by-hand script, recorded (the spike never pressed F7 and F8 by hand)
- [x] N1: `nm` on the built binary shows no `CGS`/`SLS` symbols; the startup check logs if `WailsWindow` or `userMinSize` is missing
- [x] N2: twenty back-to-back desktop switches (about 1.5 s apart) with a full-screen app among them: the icon never hides on a normal desktop and never shows on the full-screen one (float log)
- [x] N3: `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout and `wails build` green; signing untouched (an ad hoc `--options runtime` copy shows the icon too). 2026-10-05 22:06 `make install` from the worktree at c48cdf2 (with the review fixes, after Pablo quit his app; v0.2.0-1141-gc48cdf2), `open /Applications/Deltagos.app` (LaunchServices; the first open left no process, the second ran as pid 93991): the icon shows on the next desktop (`.wt-notes/fic-build/n3-finder-other-desktop.png`, `n3-finder-other-crop.png`); quit by pid, nothing clicked or typed in it
- [ ] N4 (noted, not gated): a second, smaller display is untested on this Mac; the card says so. Untested: one 3440x1440 display only. The full-screen check now compares a window with the icon's own display in CG coordinates (the spike compared with any display's size); places are remembered per display key (vendor-model-serial) and re-placed on a screen change, none of it exercised with two displays.

## Done
- 2026-10-05 fic-build: code review fixes on the same branch (rebased on 093daf7). daedb1c: Wails' minimum always comes back after the list; checked by putting the window in native full screen, opening the list from another desktop and picking (`float-fs.log`: `full: … min={1024, 640}`). c48cdf2: clicks beside the icon pass through its shadow margin; the panel ignores the pointer unless it is over the tile's hover-scaled bounds or a press/drag is under way (20 Hz check, which also drives hover); proven from the code path and the start log (`ignoresMouse=1`), and step 5b of the by-hand script checks it in a later take
- 2026-10-05 Pablo's take 2 (`.wt-notes/fic-build/by-hand-20261005-214917.{log,mov}`; t = log epoch − 1791247762; frames in `take2/`). Step 7 (fix): the list followed the icon on every drag with it open, 8 drops (t 16.5-27.4, `list follows the icon to …`). Step 2: dragged up to the menu bar and dropped just under it (tile top 71 px from the top, t 60.9, `c-menubar.png`); never under it, Dock edge clamped again at tile y 111 (t 22.1, 26.4). Step 8: he picked billing-api with a click on its row (t 28.8, `c-pay-seq.png`, `c-pay-full.png`): opened full on that desktop, sub-view kept; typing was proven in take 1 (`data`) and by the seat with `pay`. Steps 9-10: a dismiss with no icon click while the pointer rested by the icon (t 64.3, Escape) and one after a click on the empty desktop (t 76.9, `c-dismiss.png`), each back to the icon, the window staying home. F8 again: Compact at t 33.2 and 73.1, icon on the next desktops (t 87.6, 103.8). Gate met but N3's install, deferred by the FSE
- 2026-10-05 Pablo's take 1 (`.wt-notes/fic-build/by-hand-20261005-214028.{log,mov}`; recording t = log epoch − 1791247233, ±0.5 s; frames in `take/`). F4: drags start past 4 px (4.6, 4.9, 6.5 px), clicks at 0.0-0.4 px; a drop onto the Dock lands 8 px above it (t 63.9, tile y 111 = visible bottom 103 + 8); the one panel stands in the same spot on every desktop; the menu-bar drop was not done (highest tile top 1187 < 1345). F5: click opened the list with the search focused; he typed `data` (not `pay`), Enter: data-lake opened full on that desktop (t 123-129.6, `take/c-f5-seq.png`, `c-f5-full.png`). F7: every dismiss came from a click on the icon or from leaving the desktop with the list open; the window was back on its home desktop at t 109 ("window back"); Escape twice and a click outside were not done. F8: Compact to icon at t 170.5 (`compact from …`), the icon stayed on that desktop and on the next (t 184.7); a pick from the compacted icon and Compact again worked (t 180-182). Findings, fixed in 20ffb87: an icon dragged with the list open left the list behind (t 84.9, 89.2, 93.5, 104.2); a list opened after a filtered one came up 160 tall and jumped to 480 (t 173.0)
- 2026-10-05 fic-build: built on `floating-icon` (bff1ae9 icon, bec99c2 list, 32a8547 button, 00ba083 script; rebased on a669ddc). Proven by the seat, evidence in `.wt-notes/fic-build/` (progress.md): F1, F2, F3, F6, F9 (AX role button, name Deltagos; keyboard path), N1 (0 CGS/SLS; T5 check logs and leaves the icon off), N2 (20 switches with TextEdit full screen, no misfire), tests and clean-clone `make test` green. Waiting: F4 F5 F7 F8 (Pablo), N3 (installed app running)
- 2026-10-05 sup43 launched fic-build in .wt/floating-icon from main at 1c88906
- 2026-10-05 0090 ruled by pablo (v2 native panel; no badge; no shortcut for now; Home row); sup43 launched by the FSE
- 2026-10-05 cut by the FSE from Aglaea's design and the spike's Findings

## Next

## Review
- fail: every gate item is met at 898f9a9 except N3. The installed app (`make install`) was never launched from Finder, and that was the one thing the spike left unproven. The FSE deferred it until after the reviews, but a review can only pass a gate it can check.
- Commit reviewed: 898f9a9 (branch head, unchanged).
- Unmet: N3, only its make install + Finder part. Its other parts pass in a fresh clone: `XDG_DATA_HOME=$(mktemp -d) make test` (Go, 265 vitests), `npm test`, `npm run build`, `wails build`. N4 is noted, not gated.
- Met: F1-F9 from the code, the seat's evidence and Pablo's takes 1-2. N1: nm shows 0 CGS/SLS symbols, and T5 logs "floating icon off" to organizer.log (float-t5.log). N2: float-n2.log shows 20 switches with no misfire. The code checks all hold: T3, T4, T5, the 4 px drag, the 8 px inset per display, Reduce motion, AX button "Deltagos", a linux build, the floatList vitests, choosing a row through openInitiative, and no card writes.
- Findings outside the gate: (1) `floaticon_other.go` is outside the boundary as written and as read. It is needed for non-darwin builds, so the boundary should name it. (2) If the main window is in native full screen when the icon is clicked, `listChrome` returns early, `restoreChrome` never puts `setMin(appMinSize)` back, and the 1024x640 minimum stays at 360x160. (3) The icon's transparent 40 px shadow margin swallows clicks on every desktop (the seat's "Found, not asked"). (4) TopBar and FloatList import `wailsjs` directly instead of `hooks/useWails.ts`.
- Reviewer: fic-review, 2026-10-05.

## UI review
- **pass**, at 898f9a9 (detached worktree `.wt/fic-ui`, `make review-build`, `Deltagos Review.app` on `fixture-home.sh --twenty`, one 3440x1440 display at 1x). Every row below was checked on 898f9a9. The branch has since moved to c48cdf2 (the code review's fixes), which this review did not run. Shots, frames and logs are in `.wt-notes/fic-ui/`.
- What I could not do myself: opening the list panel without a pointer. My one AXPress on the icon was refused by this session's permission guard, so I did not open the panel at all. Everything inside the panel (F5-F7, F9's keys, the §3 states) is read from Pablo's takes and the seat's shots, never from Chromium.
- Interference: at t 327.8-331.5 (`float1.log`), someone else pressed Compact on my instance and clicked its icon with a real pointer (moved 0.4 px), then picked a row. Other sessions were also switching desktops. My rows were taken around those moments, and each one is checked against the float log.

| # | How checked | Result |
|---|---|---|
| F1 | My display shot `f1-desk2.png`/`-crop`: desktop 2 shows the icon bottom right, 24 px in (CG 3360,1257, above the Dock). I made TextEdit full screen myself (`f1-fullscreen.png`): no icon, log `fs=1 icon stays hidden`. I left full screen and quit TextEdit after. | pass |
| F2 | Resting, my window shot `f1-icon-desk2.png`, alpha scan: 56 px tile, shadow 28 px below, 11 px above, 19 px at the sides, which fits 0 1 3 + 0 8 24. Hover held by the build's `FLOAT_LOOK=hover` (`f2-hover.png`): 58-59 px tile (1.06), shadow 39 px below and 28 px at the sides. Real hover by pointer was not seen. | pass |
| F3 | Frames 0.3 s apart (`f3on/`): bar heights move out of phase (29/18/21, then 26/19/25, then 30/20/23). With `FLOAT_REDUCE_MOTION=1`, the code's override of the system flag, `f3off/` shows 30/20/25 in every frame and the log says `breathe: still (reduce motion)`. The real system setting was neither read on nor changed. The code path reads `accessibilityDisplayShouldReduceMotion` and re-reads it on the change notification. | pass |
| F4 | Pablo, take 1 t 63.9 (Dock clamp, tile y 111), take 2 t 16.5-27.4 (8 drops, the list follows), t 60.9 (drop under the menu bar, tile top 71 px). The 4 px threshold is in the logs: drags start at 4.6/4.9/6.5 px, clicks at 0.0-0.4 px. A drop flush against the menu bar was not tried. | pass |
| F5 | Pablo, take 1 t 123-129.6 (`data`, Enter, data-lake full here). Take 2 t 28.9-30.4: a click on billing-api opens it full. Typing `pay` with Enter was the seat's (`k2-crop.png`). | pass |
| F6 | Pablo's frame `take2/t28.4.png`, crop `pablo-t28.4-list.png`: partner-payouts shows `5 waiting` and `1 blocked` whole, then `+5`; waiting rows show their names; the order matches the rail and Home (`main-full.png`) for 1-11. | pass (see U1) |
| F7 | Pablo, take 2 t 64.3 (Escape), t 76.9 (click outside), t 20.9/28.2 (the icon): each `dismiss: returning`, then the window back home. | pass |
| F8 | AX query on the Deltagos window: AXButton `Compact to icon`, help `Compact to icon (the icon floats on every desktop)`, left of Help in `main-full.png`, a ghost (default) button. Pressed by Pablo at take 2 t 33.2 and t 73.1, and by the interferer on my instance at t 327.8: `compact: state=compacted`. | pass |
| F9 | My AX query on desktop 2: AXButton, desc `Deltagos`, help `Opens the initiative list`, in a panel window of subrole AXSystemDialog. ↑↓, Enter and Escape twice are from the seat's `f9-keyboard.png`/`k1-k4` and `float-2.log`, not by me (no panel, see above). | pass (keys from evidence) |

- **U1** (sev 2) A row with room left still folds signals into "+N". Where: the list panel, rows auth-gateway and billing-api (`pablo-t28.4-list.png`). Evidence: the row shows `1 now` `+2` with about 120 px empty, though `1 live` (6 chars) fits beside it. `foldSignals` folds by a character budget (`signalRoom`, 290 px / 6.4) and removes wave and live together, both at `FOLD.live`; the design system folds against what fits. Proposal: measure the lozenges, or re-add a folded signal while it fits, live before the wave.
- **U2** (sev 1) The icon's window has the accessibility subrole AXSystemDialog. VoiceOver may announce it as a system dialog. Proposal: a floating-window subrole, or none.
- Spec gaps (for the FSE): §3's no match, no initiatives and still scanning states were never reached on screen by anyone. The not-active group (legacy-intranet in the twenty fixture) folded last is shown by the code alone (`floatList` uses the rail's `inactiveIds`). Neither the spec nor the gate names a fixture or check for them. T3 hides the icon for any layer-0 window that covers the display, so a zoomed, non-full-screen window to its own edges would hide it on a normal desktop. The spec never says whether that is intended.
- For aglaea: A1, the panel uses the window's native shadow, not §3's two-layer shadow (the seat's choice, visible in `l1-crop.png`). A2, the filtered list stayed 480 tall in the seat's `k2-crop.png` and was fixed in 20ffb87, not re-seen by me. Does it now shrink to its rows in WKWebView?
- Not verified: the hover and pressed looks under a real pointer (only the held hover still); the 120/80/160/200 ms timings; the appear fade; the grow on pick; the system's own Reduce motion setting; a second display (N4); the panel's Tab trap; anything on c48cdf2.

## Blockers

## Notes
- fic-build: with Deltagos in native full screen, a click on the icon takes the user to Deltagos's full-screen desktop instead of bringing a list here (a full-screen window cannot move desktops); picking there leaves it full screen. The spec did not anticipate it.
- fic-build: F9's panel was opened by AXPress on the icon (the VoiceOver path), not a pointer event; the reviewer judges whether that fits the seat's "no AppleScript clicks". The native file is ~695 lines, over the 250-300 forecast (states for listing, returning and compacted, the looks, places per display). `screencapture -v` loses its file on SIGINT/SIGTERM, so the by-hand recording is a fixed 4 minutes, one file per run.
The spike branch `floating-icon-spike` holds working code to start from.

Boundary as read by sup43 (consequences, not additions): the one line in `frontend/src/App.tsx` that mounts FloatList, the regenerated `frontend/wailsjs` bindings for new App methods, and `floaticon_other.go` (the non-darwin no-op the darwin-only files need; named in the task prompt, missing here until the code review's finding 1). Nothing else outside the boundary.
