---
title: "One word for alive seats; a busy button keeps focus; focus then words"
status: now
repos: [organizer]
branch: lf34-busy-focus
seat: bf-build
stage: one-window
updated: 2026-10-15
next: "review: lf34-busy-focus, gate met (F1-F4, X0), 87abf10"
depends_on: []
boundary: ["docs/specs/leftovers-34.md Boundary, lf34-busy-focus"]
spec: "docs/specs/leftovers-34.md (FR-1 to FR-3; launch-progress L24, L26, L27)"
gate: "docs/specs/leftovers-34.md Acceptance, rows F1, F2, F3, F4 and X0"
ui_review: true
---

## Goal
An assumed-live seat reads idle; a busy button keeps focus and says what it is doing; focus moves before the reason is said (launch-progress Amendment 7).

## Gate
docs/specs/leftovers-34.md, rows F1, F2, F3, F4 and X0.

- [x] F1: at once (no feed since the press) and after the next feed, fse, po_ana, dev_bruno all read `idle` (`.wt-notes/bf-build/out/f1.jsonl`)
- [x] F2: helper and seven controls, aria-disabled, gerund, one call, focus kept (`.wt-notes/bf-build/out/f2-vitest.txt`)
- [x] F3: Start `Starting…` aria-disabled with focus, then the heading; 0 body samples (`.wt-notes/bf-build/out/f3.jsonl`)
- [x] F4: N3 and the race, focusin on `Attach fse` before the region's text (`.wt-notes/bf-build/out/f4.jsonl`, `out/f1.jsonl`)
- [x] X0: clean clone at 87abf10, make test, pnpm run build, wails build pass, status empty (`.wt-notes/bf-build/out/x0-*.txt`)

## Done
- 2026-10-15 bf-build: busy rule helper `lib/busy.ts` on Start, Draft the cell's Open, Rule, Retire, comment Save and both Sends; assumed seats read idle; feed-closed confirm moves focus before the words; branch lf34-busy-focus at 87abf10 (progress: `.wt-notes/bf-build/progress.md`).

## Notes
- "New agent's Open" read as Draft the cell's Open, the only Open/Opening… in AgentsView; New agent's own Start has no busy state (progress.md, Found, not asked).
- F2 runs without a DOM (no DOM library in package.json): server render with seeded state and a stand-in focus; F3 is the live check.
- F3's 20 ms interval stalls around the harness's key step; samples on every mutation and focusin cover it.
