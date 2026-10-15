---
title: "Focus ring violet-11 on every surface; busy twins tested; a sent thread that never shows lets go"
status: now
repos: [organizer]
branch: lf35-ring-tokens
seat: rt-build
stage: one-window
updated: 2026-10-15
next: "review: lf35-ring-tokens, gate met (R1-R6, X0; R6 per Amendment 1), e0779e4"
depends_on: []
boundary: ["docs/specs/leftovers-35.md Boundary, lf35-ring-tokens"]
spec: "docs/specs/leftovers-35.md (FR-1 to FR-6; launch-progress L29, L30)"
gate: "docs/specs/leftovers-35.md Acceptance, rows R1, R2, R3, R4, R5, R6 and X0"
ui_review: true
---

## Goal
Focus is visible on every surface, a busy colour follows its role, and a sent thread the feed never lists stops leaving Send busy (launch-progress Amendment 9, U5).

## Gate
docs/specs/leftovers-35.md, rows R1, R2, R3, R4, R5, R6 and X0.
- [x] R1: outline-color rgb(192, 171, 254) on crew panel 8.38, card back 8.38, selected rail row 9.52 (strip) / 7.45 (expanded), busy Start (aria-disabled) 8.38; `.wt-notes/rt-build/out/r1.jsonl`, `progress.md`
- [x] R2: 0 focus rules naming --accent, #8a3ffc or rgb(138; `.gear.on` keeps --accent; `.wt-notes/rt-build/r2-grep.txt`
- [x] R3: `src/lib/tokens.test.ts` passes on the file, fails on the --fg copy; `.wt-notes/rt-build/out/r3-r4-r5-vitest.txt`
- [x] R4: `src/components/Conversation.sent.test.tsx`; same file
- [x] R5: `src/lib/agentFocus.dom.test.tsx`; same file
- [x] R6: Usage 249 < memory 539 < Rescan 781 (FR-5 met on main, unchanged); every `.ol-gem > i` and `.ol-gem-key` 4px (Amendment 1); `.wt-notes/rt-build/out/r6.jsonl`
- [x] X0: clean clone, make test, pnpm run build, wails build pass, porcelain empty; `.wt-notes/rt-build/out/x0.log`

## Done
- 2026-10-15 rt-build: ring violet-11, busy twins tested, sent-unlisted lets Send go, Agents › by key, gem 4px; commits 74d264f 65fff17 77953ca 3004db3 e6ee99f; after Amendment 1 the `.srm-gem` change reverted (1919794) and the live gem and key at 4px (e0779e4).

## Notes
- 2026-10-15 rt-build: FR-5 was already met on main; `.srm-gem` is dead CSS, so Amendment 1 (dbb77a7) moved FR-6 to outline.css. TopBar.test's fixture email was red on main; fixed (3004db3).
- 2026-10-15: run by sup72 (organizer-probe-sup72), spawned by the FSE after 0133.
