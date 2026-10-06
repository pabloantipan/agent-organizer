---
title: Deltagos floats as an icon on other desktops; click for the initiative list; Compact to icon
status: next
repos: [organizer]
branch: floating-icon
seat: fic-build
updated: 2026-10-05
next: "pablo: by-hand take (scripts/floating-icon-by-hand.sh, F4 F5 F7 F8) through sup43; then N3 once the installed Deltagos is quit"
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
- [ ] N3: `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`; `codesign --options runtime` unchanged; the installed app (`make install`) launched from Finder shows the icon (a signed build from Finder was unverified in the spike)
- [ ] N4 (noted, not gated): a second, smaller display is untested on this Mac; the card says so. Untested: one 3440x1440 display only. The full-screen check now compares a window with the icon's own display in CG coordinates (the spike compared with any display's size); places are remembered per display key (vendor-model-serial) and re-placed on a screen change, none of it exercised with two displays.

## Done
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
