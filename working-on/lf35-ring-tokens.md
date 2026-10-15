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
review: pass
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

## Review
- Verdict: **pass**. Every row met on e0779e4ef48923c364436d4ebed8cda9313918ab (the branch had not moved), from a fresh clone at that SHA; notes in `.wt-notes/rt-review/`.
- R1: Tab harness (my own `wails dev` on :34212, fixture, auth off, 1024x640), `out/r1.jsonl`: outline-color rgb(192, 171, 254), 2px solid, :focus-visible true, on crew panel Bring 1 up 8.38:1 (`.crew` rgb(32,27,43)), card back Close 8.38:1, selected rail row strip 9.52:1 and expanded (inset) 7.45:1, busy Start (aria-disabled, Starting…) 8.38:1. Met.
- R2: my own scan of 66 `:focus`/`:focus-visible` rules in `frontend/src` (comments stripped, multi-line): 0 name `--accent`, `#8a3ffc` or `rgb(138`; the only `#8a3ffc` left is `--violet-9`. In WebKit `.gear.on` (A5) computes `rgb(138, 63, 252) 0 -2px 0 inset`, `--accent` #8a3ffc, the accent fill on Bring 1 up rgb(138, 63, 252), `--focus-ring` #c0abfe. Met.
- R3: `src/lib/tokens.test.ts` passes on the file and asserts exactly one drift on the `--fg`-changed copy; all eight `--busy-*` carry a source comment (read in tokens.css lines 197-204). Met.
- R4: `src/components/Conversation.sent.test.tsx` passes: real NewThread with a fake postToCell returning an id, timers faked to LIST_WAIT_MS: Send not busy on the remounted form, fields empty, region text exact, focus on the docked field, unchanged after the late listing, no "failed". `LIST_WAIT_MS = 20000` is defined once (`lib/listWait.ts`), Crew imports it. Met. (The test drives `sentWatch`/`letGoUnlisted`, not a mounted Conversation; the wiring is in the diff.)
- R5: `src/lib/agentFocus.dom.test.tsx` passes (list order owl, fox vs feed fox, owl; lands on owl's row, not index 1). Also in a real WebKit DOM: on init-a's Agents I moved the last row first and every one of 9 `li[data-agent]` was found by `agentTarget`+`agentRow` at its new index (`out/r2r5.jsonl`). Met.
- R6: harness `out/r6.jsonl`: Usage x 249 < memory 539 < Rescan 781; all 11 drawn `.ol-gem > i` and both `.ol-gem-key` compute `border-radius: 4px` (Amendment 1). TopBar.tsx unchanged. Met.
- X0: shared `make test` was **reused**: run 36a77df8-53433 of e0779e4ef489 by organizer-probe-rt-ui, exit 0 (all Go ok, vitest 66 files 741 tests); `pnpm run build` exit 0 and `make review-build` (wails build) exit 0 in my clone; `git status --porcelain` empty after. Met.
- Boundary and No-gos: diff touches only boundary files (AgentList is the agent row's component; TopBar.test is FR-5's test); no Go, Gate.tsx or lib/queue.ts; no color-mix, oklch or nesting; no new service call.
- Unmet rows: none.
- Gate note, not a failure: R2 and R6's order do not fail on main as the table's header claims (no focus rule named the accent on main; FR-5 was already met).
- Reviewer rt-review, 2026-10-15, commit e0779e4ef48923c364436d4ebed8cda9313918ab.
