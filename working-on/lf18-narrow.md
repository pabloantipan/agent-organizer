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

## UI review
nw-ui, 2026-10-10, on a793f26 (Deltagos Review from `make review-build` in a detached worktree, fixture home, its own pid; AX tree and `screencapture -o -l`). Shots and trees in `.wt-notes/nw-ui/` (`web-<w>x<h>-<row>-<state>.*`).

**Verdict: pass.** No sev 4 or 3 inside this card's boundary.

- W1 met: at 1024×640 rail open on init-a, `.ov` 823 px, FSE panel at y 994 under WORK NOW (stacked); at 1440×900, main 681 px and FSE 440 px side by side at one top. On init-b at 1024 (header fits) the pane is 774 px, stacked, nothing past x 2024 (window edge).
- W2 met: Help at 1024×640, `.help-doc` 804 px ends at the window edge, text 615 px, tables 726 px (= min(72ch, 100%)), no element past the edge, paragraphs wrap (the nowrap fix holds). vitest `Overview.narrow.test.tsx` 6/6.

Findings
- U1 (3, owned by lf18-charter-once H4, not this card). The lead cannot read Overview's right side at 1024 on an initiative with every header pill: init-a's gate lozenges (`ruled`, `waiting`) are cut at the window edge. Evidence `web-1024x640-W1-overview.png/.txt`: `.subtabs` 877 px from x 1250, `.ov` ends x 2093 > 2024; the header's pills set the pane's minimum, Overview only fills it. I27 ("nothing runs past the right edge") is met only once charter-once's pills wrap; re-shoot init-a at 1024 after both merge.
- U2 (1). The stack point is Overview's own box, not the pane: `.ov` is the pane less its padding, so it stacks under ~934 px of pane, not 880 (at window 1180 the pane is 930 and it still stacks; side by side at 1200). Evidence: widths probe 1120/1150/1180/1200. Harmless, arguably better; proposal: say "Overview's box" in the spec or measure the pane.

Spec gaps (for the FSE)
- W2's "tables and code scroll in their own box with the edge line" cannot be seen at the app's 1024 floor: no table or block in how-we-build.md is wider than 726 px there. It rests on global.css `.markdown :where(pre, table) { overflow-x: auto; max-width: 100% }` and the vitest reading the stylesheets. A fixture Help page with a wide table would make it a screen check.

For aglaea: none.

Not verified in WKWebView: the edge line on an overflowing table or code block (no such content at 1024); `overflow-wrap: anywhere` on a real long path in Help's body (the shipped page has none; the property needs Safari 15.4, above the 15.0 floor, as elsewhere in the app).
