---
title: "Waiting mail said, scroll stops padded, the harness scrolls"
status: now
repos: [organizer]
branch: lf27-polish
seat: po-build
stage: one-window
updated: 2026-10-14
next: "review: lf27-polish, gate met (W1, W2, W3, X0), be6efec"
depends_on: []
boundary: ["docs/specs/leftovers-27.md Boundary, lf27-polish"]
spec: "docs/specs/leftovers-27.md (FR-9 to FR-11; tab-reaches-links A3 T22, T23)"
gate: "docs/specs/leftovers-27.md Acceptance, rows W1, W2, W3 and X0"
ui_review: true
review: pass
---

## Goal
Waiting mail said, scroll stops padded, the harness scrolls (launch-progress 91cf067; tab-reaches-links A3; sup62 and sup63 closes).

## Gate
docs/specs/leftovers-27.md, rows W1, W2, W3 and X0.
- [x] W1 (row 9): vitest 0/1/2 waiting under alive, stale, deaf, capped; AX of dev_bruno's row reads `session live, mail deaf, 2 messages waiting` — .wt-notes/po-build/w1-vitest.txt, w1-ax-person.txt
- [x] W2 (row 10): harness 1024x640, every stop padded >= 4px each side under `outline-offset: -2px`, ring clears the first line (rule record 3/2 px, header open 6/2 px) — .wt-notes/po-build/w2-*.jsonl, shots/*.png
- [x] W3 (row 11): `inactiveSchedulingPolicy = .none` at tabharness.swift:82; Down x3 in the card body, scrollTop 80/40/80/40/80 — .wt-notes/po-build/w3-run1..5.jsonl
- [x] X0 (all): clean clone at be6efec, make test 638 vitest + go pass, pnpm run build, wails build, porcelain empty — .wt-notes/po-build/x0-summary.txt

## Done
- 2026-10-14 po-build: FR-9 waiting count in the person description (5ca2310), FR-10 scroll-stop padding in global/rule-box/float css (6fcc0e5), FR-11 harness scheduling policy plus left/right and snapshot verbs (2f2a5fb), Controls.test F3 expectation (be6efec); gate met, unmerged, rebased on main.

## Notes
- FR-9 vs the badge: the deaf badge's face draws no count (`ContextBar.tsx:32`, outside the boundary); the description says it under deaf anyway, as FR-9 and W1 ask.
- `Controls.test.tsx` F3 expected the pre-FR-9 line; one expectation changed (be6efec), outside the boundary's named files.
- The header's open area already padded 4px each side at compact; unchanged. The floating list had no inset ring; it got `.fl-body:focus-visible { outline-offset: -2px }`.
- main's harness also scrolled once per run here (scrollTop 40, 3/3); the policy gives 40-80. Details in .wt-notes/po-build/progress.md.

## Review
Pass: W1, W2, W3 and X0 met at be6efec (branch unmoved). Checked from a clean clone of be6efec under .wt-notes/po-review/clean (removed after); evidence in .wt-notes/po-review/.
- W1: vitest SlackView.words.test.tsx + Controls.test.tsx, 21/21 (alive, stale, deaf, capped x 0/1/2 waiting; nothing at 0; no watcher, no count) — w1-vitest.txt. AX of my review build (auth off, fixture): "Chat with dev_bruno" AXCustomContent decodes to `session live, mail deaf, 2 messages waiting` — w1-ax-person.txt. The Controls.test F3 change only follows FR-9 (same deaf seat with 3 undelivered, fixture unchanged).
- W2: my harness build of the branch, 1024x640, my own wails dev on :34141; each stop focused, :focus-visible, outline 2px at -2px. Padding T/R/B/L, ring-to-text clear top/left: card body 6/22/22/22, 6/27; card pre 4/4/4/4, 4/8; card table 4/4/4/4, 9/13; header open 4/4/12/4, 6/2; role body 6/22/22/22, 6/20; rule record 4/4/4/4, 3/2; float list (--twenty) 4/8/7/8; Help doc 24/32/48/32, 25/30 (Help pre not overflowing, not a stop). Snapshots rule-record and header-open: ring clears the first line — w2-*.jsonl, shots/.
- W3: tabharness.swift:82 sets inactiveSchedulingPolicy = .none; start line reports "none"; Down x3 in the overflowing card body, scrollTop 0 -> 40, 80, 40 (3/3) — w3-run1..3.jsonl.
- X0: make test reused (run 169eafa4-66796 of be6efec, exit 0: 638 vitest, 16 go ok); pnpm run build 0, wails build 0, git status --porcelain empty — x0-*.
Unmet: none. Test run: reused 169eafa4-66796. Reviewer po-review, 2026-10-14, commit be6efec98f5dad6405698a59e2efcc78e0225f4a. ## UI review not yet written: status and place left alone.
