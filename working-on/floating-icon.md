---
title: Deltagos floats as an icon on other desktops; click for the initiative list; Compact to icon
status: next
repos: [organizer]
branch: floating-icon
seat: fic-build
updated: 2026-10-05
next: "pablo: second by-hand take of the steps take 1 did not exercise (menu-bar drop, pay+Enter, Escape twice, click outside) and the fix (list follows a dragged icon), through sup43"
depends_on: []
boundary: ["floaticon_darwin.m, floaticon_darwin.h, floaticon_darwin.go (new, darwin-only) and the hook in app.go", "frontend/src/components/FloatList.tsx (new) and its CSS; TopBar.tsx (the Compact to icon button); the store's openInitiative use only", "frontend/src/lib/ helpers and tests (list rows, search)", "scripts/ (a by-hand check script, like the spike's y1-pointer.sh)", "not: wails.json, build/darwin templates, other Go packages, docs/design-system.md"]
spec: "docs/ux/specs/floating-icon.md (Aglaea, 16ae245) and its Technical notes T1-T8; scope 0088; the spike's Findings (on main as afe792d)"
gate: "docs/ux/specs/floating-icon.md Acceptance F1-F9, plus the rows below"
ui_review: true
---

## Goal
The Teams behaviour Pablo asked for in 0088, built the way the spike proved.

## Gate
- [ ] F1-F9: see `docs/ux/specs/floating-icon.md`, Acceptance; F4 (drag), F5 (click), F7 (pick nothing) and F8 (the top-bar button) performed by Pablo with the by-hand script, recorded (the spike never pressed F7 and F8 by hand)
- [x] N1: `nm` on the built binary shows no `CGS`/`SLS` symbols; the startup check logs if `WailsWindow` or `userMinSize` is missing
- [x] N2: twenty back-to-back desktop switches (about 1.5 s apart) with a full-screen app among them: the icon never hides on a normal desktop and never shows on the full-screen one (float log)
- [ ] N3 (make install + Finder launch deferred by the FSE until both reviews pass, right before the merge; sup43 calls fic-build back for it; the rest done: clean-clone make test, wails build, signing untouched, a `--options runtime` ad hoc copy shows the icon): `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`; `codesign --options runtime` unchanged; the installed app (`make install`) launched from Finder shows the icon (a signed build from Finder was unverified in the spike)
- [ ] N4 (noted, not gated): a second, smaller display is untested on this Mac; the card says so. Untested: one 3440x1440 display only. The full-screen check now compares a window with the icon's own display in CG coordinates (the spike compared with any display's size); places are remembered per display key (vendor-model-serial) and re-placed on a screen change, none of it exercised with two displays.

## Done
- 2026-10-05 Pablo's take 1 (`.wt-notes/fic-build/by-hand-20261005-214028.{log,mov}`; recording t = log epoch − 1791247233, ±0.5 s; frames in `take/`). F4: drags start past 4 px (4.6, 4.9, 6.5 px), clicks at 0.0-0.4 px; a drop onto the Dock lands 8 px above it (t 63.9, tile y 111 = visible bottom 103 + 8); the one panel stands in the same spot on every desktop; the menu-bar drop was not done (highest tile top 1187 < 1345). F5: click opened the list with the search focused; he typed `data` (not `pay`), Enter: data-lake opened full on that desktop (t 123-129.6, `take/c-f5-seq.png`, `c-f5-full.png`). F7: every dismiss came from a click on the icon or from leaving the desktop with the list open; the window was back on its home desktop at t 109 ("window back"); Escape twice and a click outside were not done. F8: Compact to icon at t 170.5 (`compact from …`), the icon stayed on that desktop and on the next (t 184.7); a pick from the compacted icon and Compact again worked (t 180-182). Findings, fixed in 20ffb87: an icon dragged with the list open left the list behind (t 84.9, 89.2, 93.5, 104.2); a list opened after a filtered one came up 160 tall and jumped to 480 (t 173.0)
- 2026-10-05 fic-build: built on `floating-icon` (bff1ae9 icon, bec99c2 list, 32a8547 button, 00ba083 script; rebased on a669ddc). Proven by the seat, evidence in `.wt-notes/fic-build/` (progress.md): F1, F2, F3, F6, F9 (AX role button, name Deltagos; keyboard path), N1 (0 CGS/SLS; T5 check logs and leaves the icon off), N2 (20 switches with TextEdit full screen, no misfire), tests and clean-clone `make test` green. Waiting: F4 F5 F7 F8 (Pablo), N3 (installed app running)
- 2026-10-05 sup43 launched fic-build in .wt/floating-icon from main at 1c88906
- 2026-10-05 0090 ruled by pablo (v2 native panel; no badge; no shortcut for now; Home row); sup43 launched by the FSE
- 2026-10-05 cut by the FSE from Aglaea's design and the spike's Findings

## Next

## Blockers

## Notes
- fic-build: F9's panel was opened by AXPress on the icon (the VoiceOver path), not a pointer event; the reviewer judges whether that fits the seat's "no AppleScript clicks". The native file is ~695 lines, over the 250-300 forecast (states for listing, returning and compacted, the looks, places per display). `screencapture -v` loses its file on SIGINT/SIGTERM, so the by-hand recording is a fixed 4 minutes, one file per run.
The spike branch `floating-icon-spike` holds working code to start from.

Boundary as read by sup43 (consequences, not additions): the one line in `frontend/src/App.tsx` that mounts FloatList, and the regenerated `frontend/wailsjs` bindings for new App methods. Nothing else outside the boundary.
