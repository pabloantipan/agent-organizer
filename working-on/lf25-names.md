---
title: "A row says what it shows; focus stays put"
status: now
repos: [organizer]
branch: lf25-names
seat: nm-build
stage: one-window
updated: 2026-10-13
next: "review: lf25-names, gate met (N1-N4, X0), 3f76114"
depends_on: []
boundary: ["docs/specs/leftovers-25.md Boundary, lf25-names"]
spec: "docs/specs/leftovers-25.md (FR-1 to FR-5; tab-reaches-links Amendment 2, T13, T14, T19, T21)"
gate: "docs/specs/leftovers-25.md Acceptance, rows N1, N2, N3, N4 and X0"
ui_review: true
---

## Goal
A row says what it shows; focus stays put (Aglaea, a5c30ed, from sup60's close).

## Gate
docs/specs/leftovers-25.md, rows N1, N2, N3, N4 and X0.
- [x] N1: vitest `frontend/src/components/Controls.test.tsx` (F1, F3, F5: short name, aria-describedby target and its text; F1 no aria-pressed); AX of the review build .wt-notes/nm-build/n1-ax.txt (F1 and F3 descriptions in AXCustomContent, no AXPressed). F5's AX read was not possible: the fixture mailbox holds no decision, so no ruling is drawn; F5 met by vitest (sup61, spec Amendment 1)
- [x] N2: .wt-notes/nm-build/n2-on.jsonl (Return on `Chat with fse` leaves focus on it; after `Show only init-a` focus is on init-a's first agent row)
- [x] N3: .wt-notes/nm-build/n3-on.jsonl, .wt-notes/nm-build/n3-divider-focus.png (focused Escalate: `.a-actions` opacity 1, 2 px ring)
- [x] N4: .wt-notes/nm-build/n4-grep.txt (no cell list, no rule left), .wt-notes/nm-build/n4-on.jsonl (35/35 clickable elements in Conversations reached)
- [x] X0: .wt-notes/nm-build/x0-make-test.log, x0-pnpm-build.log, x0-wails-build.log, x0-status.txt (clean clone of 3f76114, all pass, porcelain empty)

## Done
- 2026-10-13 nm-build: FR-1..FR-5 built on lf25-names (9514feb..3f76114); Chat with <seat> lost focus because a chat switch mounted the new-thread form with autoFocus, now it takes focus only when asked or landed on. Evidence and reproduction in .wt-notes/nm-build/progress.md.

## Notes
- Opening Conversations no longer puts focus in the new thread's Subject by itself (FR-3's fix); + and "new thread instead" still do.
- With macOS Keyboard navigation off (`--links off`) WebKit's Tab reaches only Conversations' 4 text fields (.wt-notes/nm-build/n4-off.jsonl): platform behaviour, not this card.
