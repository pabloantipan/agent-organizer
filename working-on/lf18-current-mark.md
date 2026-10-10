---
title: "One current mark per screen; the bar keeps one line with firebase at 1024"
status: now
repos: [organizer]
branch: lf18-current-mark
seat: cm-build
stage: one-window
updated: 2026-10-10
next: "review: lf18-current-mark, gate met (K1-K3, X0), 5d358df"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-current-mark"]
spec: "docs/specs/leftovers-18.md (FR-1 to FR-3; initiatives-view Amendment 3, I22-I24)"
gate: "docs/specs/leftovers-18.md Acceptance, rows K1, K2, K3 and X0"
ui_review: true
---

## Goal
lf17-top-bar's review U1-U4 (Aglaea, 237db96).

## Gate
docs/specs/leftovers-18.md, rows K1, K2, K3 and X0.

- [x] K1: /Users/pabloantipan/organizer/.wt-notes/cm-build/K1-K3-vitest.log; AX /Users/pabloantipan/organizer/.wt-notes/cm-build/ax-home.txt, ax-initiatives.txt, ax-usage.txt, ax-initiative-from-*.txt, ax-settings.txt, ax-help-over-*.txt (the bar's one current per screen; the header sub-tab's moves in lf18-charter-once, spec 46639bf)
- [x] K2: /Users/pabloantipan/organizer/.wt-notes/cm-build/K1-K3-vitest.log; /Users/pabloantipan/organizer/.wt-notes/cm-build/ax-initiative-from-rail.txt, K1-K2-initiative-1024.png
- [x] K3: /Users/pabloantipan/organizer/.wt-notes/cm-build/K1-K3-vitest.log; /Users/pabloantipan/organizer/.wt-notes/cm-build/k3-fresh-widths.json, k3-stale-widths.json, k3-stale-syncing-widths.json (offscreen WebKit, built css, 1024x640)
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/cm-build/X0-make-test.log, X0-npm-build.log, X0-wails-build.log, X0-git-status.txt (empty), clean clone of 5d358df

## Done
- 2026-10-10 cm-build: placeOf (lib/place.ts), one current mark, crumb without slash, Needs me never on, firebase fold at compact plus the fifth fold (Rescan glyph); gate met at 5d358df (428f498, 5d358df).

## Notes
- K3 cannot run on the review app with auth: firebase: the keychain service `cl.antipan.organizer` is shared with the real app, so it would read the real refresh token. Widths measured in an offscreen WKWebView with the built css instead (progress.md).
- Folds 1-4 measured 1066 px at 1024 with Needs me's badge and `Sync · stale`; the fifth fold (Rescan glyph) was added and accepted (24d052e). 9.5 px spare remains.
- Stale Sync is a ghost button, not primary: magenta on the accent fill is 1.4:1.
- `.needs-me.on` in shell.css is dead css now (outside this boundary).
