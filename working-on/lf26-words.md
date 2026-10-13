---
title: "A description says each fact with its noun"
status: now
repos: [organizer]
branch: lf26-words
seat: wd-build
stage: one-window
updated: 2026-10-13
next: "review: lf26-words, gate met (W1, W2, X0), 2df2892"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-words"]
spec: "docs/specs/leftovers-26.md (FR-4 to FR-7; tab-reaches-links Amendment 3, T23)"
gate: "docs/specs/leftovers-26.md Acceptance, rows W1, W2 and X0"
ui_review: true
---

## Goal
A description says each fact with its noun (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows W1, W2 and X0.
- [x] W1: `.wt-notes/wd-build/w1-ax-description.txt` (AX of the person rows), vitest `SlackView.words.test.tsx`, `AgentsView.words.test.tsx`, `Controls.test.tsx`
- [x] W2: `.wt-notes/wd-build/w2.jsonl`, `w2-focused-crop.png`, `w2-grep.txt`
- [x] X0: `.wt-notes/wd-build/x0-make-test.log`, `x0-pnpm-build.log`, `x0-wails-build.log`, `x0-status.txt` (empty), clean clone of 2df2892

## Done
- 2026-10-13 wd-build: F3 says `session <word>, mail <word>, owes <n> message(s), context <n>%` in one description; F1 and the toolbar count through `plural`; the search field's wrapper draws the ring; the dead `.cell-filters` selector is gone. Branch `lf26-words` (28ab5d5, 2ee4d25, 2df2892) on main fa15ec5; how to rerun each row in `.wt-notes/wd-build/progress.md`.

## Notes
- The row's `title` is what macOS reports as AXHelp; the description is in AXCustomContent (both read by VoiceOver). Left as is.
