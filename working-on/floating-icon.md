---
title: Deltagos floats as an icon on other desktops; click for the initiative list; Compact to icon
status: next
repos: [organizer]
branch: floating-icon
updated: 2026-10-05
next: "sup43 builds it (0090 ruled: v2 native panel, no badge, no shortcut, Home row)"
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
- [ ] N1: `nm` on the built binary shows no `CGS`/`SLS` symbols; the startup check logs if `WailsWindow` or `userMinSize` is missing
- [ ] N2: twenty back-to-back desktop switches (about 1.5 s apart) with a full-screen app among them: the icon never hides on a normal desktop and never shows on the full-screen one (float log)
- [ ] N3: `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`; `codesign --options runtime` unchanged; the installed app (`make install`) launched from Finder shows the icon (a signed build from Finder was unverified in the spike)
- [ ] N4 (noted, not gated): a second, smaller display is untested on this Mac; the card says so

## Done
- 2026-10-05 0090 ruled by pablo (v2 native panel; no badge; no shortcut for now; Home row); sup43 launched by the FSE
- 2026-10-05 cut by the FSE from Aglaea's design and the spike's Findings

## Next

## Blockers

## Notes
The spike branch `floating-icon-spike` holds working code to start from.
