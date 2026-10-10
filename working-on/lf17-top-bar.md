---
title: "The top bar reads by kind and stays one line at 1024"
status: now
repos: [organizer]
branch: lf17-top-bar
seat: tb-build
stage: one-window
updated: 2026-10-10
next: "review: lf17-top-bar, gate met (T1, T2, X0), 26025ca"
depends_on: []
boundary: ["TopBar.tsx", "MemoryButton.tsx (short form only)", "the top bar rules in styles/shell.css", "their tests"]
spec: "docs/specs/leftovers-17.md (FR-3 to FR-5; docs/ux/specs/initiatives-view.md Amendment 2, I19-I21)"
gate: "docs/specs/leftovers-17.md Acceptance, rows T1, T2 and X0"
ui_review: true
---

## Goal
Pablo, 2026-10-10: "We need to review [the top bar] button disposition".

## Gate
docs/specs/leftovers-17.md, rows T1, T2 and X0.

- [x] T1: vitest of TopBar over each screen and both auth modes; AX tree of the review process — `.wt-notes/tb-build/T1-vitest.log`, `ax-1440.txt`, `ax-1024.txt`
- [x] T2: review build on the fixture at 1024×640 with the rail open: window shot and the bar's AX frame — `.wt-notes/tb-build/T2-1024x640-rail-open.png`, `ax-1024.txt` (1024x45 vs 1440x45)
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` — `.wt-notes/tb-build/x0-clean-make-test.log`, `x0-npm-build.log`, `x0-wails-build.log`

## Done
- 2026-10-10 tb-build: top bar by kind (Places nav, crumb, Mac, work, app), sync line firebase-only, version in the brand's hover, crumb id clamped; c73a9a4, 26025ca on lf17-top-bar; choices in `.wt-notes/tb-build/progress.md`

## Notes
- WebKit's AX exposes neither `aria-current` nor a span's `title`; both halves are proven in vitest.
- `styles/usage.css` `.usage-btn` is now unused (outside this card's boundary).
