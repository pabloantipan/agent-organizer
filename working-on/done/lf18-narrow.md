---
title: "Overview and Help fit at 1024"
status: done
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
review: pass
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

## Review
**Verdict: pass.** Unmet rows: none. Reviewer nw-review, 2026-10-10, commit a793f26 (diff `main...a793f26`: `Overview.tsx`, `overview.css`, `help.css`, `Overview.narrow.test.tsx`, all inside the card's Boundary). My own clean clone, review build and fixture; evidence in `.wt-notes/nw-review/`.
- W1 met. Deltagos Review from `make review-build` at a793f26, my pid, AX resize and press on it. 1024×640 rail open, init-a Overview: `.subtabs` 774 px, STAGE, WORK NOW and FSE all at x 1270 and 720 px wide, FSE at y 802 under WORK NOW (y 623): stacked (`w1-1024.txt/.png`). The removed `@media (max-width: 900px)` would have kept it side by side at this 1024 window, so the stack is by pane. 1440×900: main 689 px at x 1270, FSE 446 px at x 1975, both at y 295: side by side (`w1-1440.txt/.png`).
- W2 met. Help at 1024×640 (how-we-build.md, the only page): `.help-doc` 804 px ending at the window edge; no element of `.help` past x 2024; tables and the four "diagram, scrolls sideways" blocks 726 px = min(72ch, 100%), lists 615 px, paragraphs wrap (`w2-help.txt`, `w2-help-1024.png`, `w2-help-diagram.png`). Computed styles cannot be read from WKWebView without the inspector; the rules are read as text by vitest (`Overview.narrow.test.tsx`: `.help { white-space: normal }`, `max-width: min(72ch, 100%)`, `overflow-wrap: anywhere`, `pre` `overflow-x: auto`, global.css `.markdown :where(pre, table) { overflow-x: auto; max-width: 100% }`).
- X0 met. Fresh clone at a793f26: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` exit 0 (all Go packages ok, vitest 36 files / 492 tests), `npm install` + `npm run build` exit 0, `wails build` exit 0 (`x0-*.log`). Porcelain on the branch alone shows `frontend/wailsjs/runtime/` (the drift lf18-build-drift fixed on main, not in this branch's base 46639bf) and the untracked `package-lock.json` npm install made (`x0-status.txt`). The branch merged with main (clean merge): make test, npm run build and wails build exit 0; after removing the lockfile a bare `wails build` leaves porcelain empty (`x0m-*.log`, `x0m-status2.txt`). The project installs with pnpm (`wails.json`), so the lockfile comes from the review's `npm install`, not from the row's commands.
- Not covered by the gate: the stack point is Overview's own box, not the pane (UI review U2: stacks under ~934 px of pane, not 880); W1 checks only 1024 and 1440, so it cannot see it.

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
