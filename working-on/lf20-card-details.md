---
title: "Focus raises the card; Details never moves"
status: now
repos: [organizer]
branch: lf20-card-details
seat: dt-build
stage: one-window
updated: 2026-10-11
next: "review: lf20-card-details, gate met (D1, D2, X0), f1b6e6e"
depends_on: []
boundary: ["docs/specs/leftovers-20.md Boundary, lf20-card-details"]
spec: "docs/specs/leftovers-20.md (FR-5, FR-6; initiatives-view Amendment 5, I37, I38)"
gate: "docs/specs/leftovers-20.md Acceptance, rows D1, D2 and X0"
ui_review: true
---

## Goal
Keyboard focus raises the card as hover does; the header's Details keeps one frame (Aglaea, 9a058c0, from sup56's close).

## Gate
docs/specs/leftovers-20.md, rows D1, D2 and X0.
- [x] D1 (FR-5): vitest D1 in InitiativesView.test.tsx; Chromium computed style, `Open init-a` focused by Tab, `:focus-visible` true: card `rgb(46, 39, 60)` class `raised`, the same as hover (rest `rgb(39, 32, 51)`), at 1024x640 and 1440x900 — .wt-notes/dt-build/d1-d2-chromium-branch.json, chromium-*-D1-focus-branch.png
- [x] D2 (FR-6): vitest D2 (aria-expanded, Details outside the pills); Chromium frame of Details closed, open, closed on init-a: 1024x640 rail open x 928.70 y 53 w 75.30 h 24 all three, goal line under the first line; 1440x900 x 1344.70 y 53 w 75.30 h 24 all three — .wt-notes/dt-build/d1-d2-chromium-branch.json, chromium-*-D2-*-branch.png
- [x] X0: clean clone at f1b6e6e: make test exit 0, pnpm run build exit 0, wails build exit 0, git status --porcelain empty — .wt-notes/dt-build/x0-*.log, x0-porcelain.txt

## Done
- 2026-10-11 dt-build: focus-visible on `Open <id>` sets hover's `.raised`; the header's pills wrap in `.ihead-pills` and Details sits outside them at the first line's right end, so its frame holds closed and open (410946b, ac951eb, f1b6e6e). Progress and reproduction in .wt-notes/dt-build/progress.md.

## Notes
- At 1024 on init-a the target wraps with the goal, so the goal line is under the bar's first line but shares its line with `target 1 Oct`, not alone on it. Rows measured in Chromium, not offscreen WebKit; no review app launched.
