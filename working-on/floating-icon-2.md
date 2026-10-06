---
title: Floating icon, second pass - double-click opens the full app at once; the icon grows on big screens
status: now
repos: [organizer]
branch: floating-icon-2
seat: fi2-build
updated: 2026-10-05
next: "fi2-build builds it in .wt/floating-icon-2 (sup44)"
depends_on: [floating-icon]
boundary: ["floaticon_darwin.m, floaticon_darwin.h, floaticon_darwin.go, floaticon_other.go (click count, size by display, scaled layers)", "frontend/src/components/FloatList.tsx (grow into the full window on the second click; the last view on double-click)", "frontend/src/stores/board.store.ts (the last view to restore, read only if already kept there)", "scripts/floating-icon-by-hand.sh (the new steps)", "not: other Go packages, wails.json, build/darwin templates, docs/design-system.md"]
spec: "docs/ux/specs/floating-icon.md, Amendment 1 (Aglaea, 2c07195); ruling 0091"
gate: "docs/ux/specs/floating-icon.md Acceptance F10-F12, plus the rows below"
ui_review: true
---

## Goal
Pablo's two asks after using the icon (0091): a double-click opens the full
app straight away, and the icon is big enough on a big screen.

## Gate
- [ ] F10-F12: see `docs/ux/specs/floating-icon.md`, Acceptance (Amendment 1); the double-click and the drag across displays performed by Pablo with the by-hand script, recorded
- [ ] F4, F5, F7, F8 rerun by Pablo in the same take (the click handling changes)
- [ ] N3 again: `make install` and a Finder launch, after both reviews pass and with Pablo's Deltagos quit first (ask him through the FSE)
- [ ] `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`

## Done
- 2026-10-05 sup44 launched by the FSE
- 2026-10-05 cut by the FSE from 0091 and Aglaea's Amendment 1

## Next

## Blockers

## Notes
Aglaea's calls: a single click opens the list at once (within 100 ms); a
second click within the double-click interval grows it into the full window
(200 ms, as choosing a row) at the view last shown, and this desktop becomes
Deltagos' own. Size by the display's visible width: 56 pt up to 1920, 72 up
to 2999, 88 from 3000; radius a quarter of it; bars, breathing and shadow
scale by size/56; resizes when dragged across displays.
