---
title: "Overview and Help fit at 1024"
status: now
repos: [organizer]
branch: lf18-narrow
seat: nw-build
stage: one-window
updated: 2026-10-10
next: "review: lf18-narrow, gate met (W1, W2, X0), a793f26"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-narrow"]
spec: "docs/specs/leftovers-18.md (FR-8, FR-9; initiatives-view Amendment 3, I27)"
gate: "docs/specs/leftovers-18.md Acceptance, rows W1, W2 and X0"
ui_review: true
---

## Goal
sup54's close: at 1024 Overview's FSE column and Help's body run past the right edge (Aglaea, 237db96).

## Gate
docs/specs/leftovers-18.md, rows W1, W2 and X0.
- [x] W1 (FR 8): stacked at 1024×640 rail open (pane 823 px), side by side at 1440×900 — `.wt-notes/nw-build/w1-overview-1024.txt`, `w1-overview-1440.txt` (+ .png)
- [x] W2 (FR 9): Help at 1024×640, body 726 px in an 804 px doc, nothing past the edge; tables and pre scroll in their own box — `.wt-notes/nw-build/w2-help-1024.txt` (+ .png), `frontend/src/components/Overview.narrow.test.tsx`
- [x] X0 (all): clean clone, make test, npm run build, wails build pass; porcelain empty after restoring `frontend/wailsjs/runtime/` except an untracked `package-lock.json` from npm install — `.wt-notes/nw-build/x0-*.log`, `x0-status*.txt`

## Done
- 2026-10-10 nw-build: Overview stacks by its pane (ResizeObserver, 880 px); Help body min(72ch, 100%), breaks anywhere, and no longer inherits the top bar's nowrap (the real overflow). Branch lf18-narrow at a793f26; progress in `.wt-notes/nw-build/progress.md`.

## Notes
- Help's overflow was `.topbar`'s `white-space: nowrap` inherited (Help mounts in TopBar), not the measure; fixed in help.css.
- At 1024 rail open the header's stage strip (header.css, lf18-charter-once FR-7) pushes the pane ~100 px past the window.
- `npm install` leaves an untracked, not ignored `frontend/package-lock.json`, so X0's empty porcelain needs it removed.
