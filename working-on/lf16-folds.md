---
title: "The strip's folds get glyphs; the floating list splits Asleep from Archived"
status: now
repos: [organizer]
branch: lf16-folds
seat: fo-build
stage: one-window
updated: 2026-10-10
next: "sup53: F2's AX half is unrun (the float icon press was refused here); amend F2 to its vitest or run the AX read, then review: lf16-folds, F1 X0 met, F2 vitest met, 1543640"
depends_on: []
boundary: ["Rail.tsx (strip fold buttons)", "FloatList.tsx", "lib/floatList.ts", "their css and tests", "not: lib/initiatives.ts"]
spec: "docs/specs/leftovers-16.md (FR-2, FR-3; docs/ux/specs/initiatives-view.md Amendment 1, I14-I15)"
gate: "docs/specs/leftovers-16.md Acceptance, rows F1, F2 and X0"
ui_review: true
---

## Goal
initiatives-view A1 and lf15-initiatives-polish V3 (Aglaea, b3295f2).

## Gate
docs/specs/leftovers-16.md, rows F1, F2 and X0.

- [x] F1: `.wt-notes/fo-build/F1-F2-vitest.log`, `ax-strip.txt` (lines 40-41), `F1-strip-crop.png`
- [ ] F2: vitest met (`F1-F2-vitest.log`); the floating list's AX read on the review process not run (question to sup53)
- [x] X0: `.wt-notes/fo-build/X0-make-test.log`, `X0-npm-build.log`, `X0-wails-build.log` (clean clone)

## Done
- 2026-10-10 fo-build: the strip draws a moon / box over each fold's count, named `Asleep, n initiatives`; the floating list has `Asleep (n)` (paused only) and `Archived (n)` (bddd515, 1543640 on lf16-folds)

## Notes
- The floating icon's panel is outside the app's AX windows; opening the list by AX needs a system-wide hit test plus AXPress, refused by this session's permission check (`.wt-notes/fo-build/progress.md`).
- One appearing for one: `Asleep, 1 initiative` (the spec writes `n initiatives`).
