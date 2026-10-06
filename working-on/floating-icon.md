---
title: Deltagos floats as an icon on other desktops; click for the initiative list; Compact to icon
status: next
repos: [organizer]
branch: floating-icon
seat: fic-build
updated: 2026-10-05
next: "N3: make install, launch /Applications/Deltagos.app from Finder, record the icon on another desktop (fic-build, sup43 calls back); then re-review"
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
- [ ] N3 (make install + Finder launch deferred by the FSE until both reviews pass, right before the merge; sup43 calls fic-build back for it; the rest done: clean-clone make test, wails build, signing untouched, a `--options runtime` ad hoc copy shows the icon): `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`; `codesign --options runtime` unchanged; the installed app (`make install`) launched from Finder shows the icon (a signed build from Finder was unverified in the spike)
- [ ] N4 (noted, not gated): a second, smaller display is untested on this Mac; the card says so. Untested: one 3440x1440 display only. The full-screen check now compares a window with the icon's own display in CG coordinates (the spike compared with any display's size); places are remembered per display key (vendor-model-serial) and re-placed on a screen change, none of it exercised with two displays.

## Done
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

## Blockers

## Notes
- fic-build: F9's panel was opened by AXPress on the icon (the VoiceOver path), not a pointer event; the reviewer judges whether that fits the seat's "no AppleScript clicks". The native file is ~695 lines, over the 250-300 forecast (states for listing, returning and compacted, the looks, places per display). `screencapture -v` loses its file on SIGINT/SIGTERM, so the by-hand recording is a fixed 4 minutes, one file per run.
The spike branch `floating-icon-spike` holds working code to start from.

Boundary as read by sup43 (consequences, not additions): the one line in `frontend/src/App.tsx` that mounts FloatList, and the regenerated `frontend/wailsjs` bindings for new App methods. Nothing else outside the boundary.
