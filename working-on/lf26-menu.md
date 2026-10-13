---
title: "The group menu opens the right way"
status: now
repos: [organizer]
branch: lf26-menu
seat: mn-build
stage: one-window
updated: 2026-10-13
next: "review: lf26-menu, gate met (M1, X0), 6889465"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-menu"]
spec: "docs/specs/leftovers-26.md (FR-8)"
gate: "docs/specs/leftovers-26.md Acceptance, rows M1 and X0"
ui_review: true
review: pass
---

## Goal
The group menu opens the right way (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows M1 and X0.
- [x] M1: vitest `frontend/src/components/Rail.lf26.test.tsx` (4 tests, Rail* 40/40); harness case d (AXPress) at 1024x640: ⋯ 1077 when pressed, menu `up: false` 463-551 below the ⋯ 437-461, 179 px below; cases a, b, c, e as rl-ui found them. Evidence `.wt-notes/mn-build/m1.txt`, `m1.jsonl`, `progress.md`.
- [x] X0: clean clone of lf26-menu at f075b6d: make test (603 vitest, go ok), pnpm run build, wails build exit 0, `git status --porcelain` empty. Evidence `.wt-notes/mn-build/x0-*.log`, `x0-status.txt`; rebased on main after (docs only), head 6889465.

## Done
- `GroupActions` scrolls a ⋯ pressed out of view to the rail's middle before it measures (`placeInView`), so the AXPress case opens downward; in view nothing moves (mn-build, 2026-10-13).

## Notes
- FR-8 read literally (measure after the first item's focus) would still open up: that focus leaves the ⋯ at the rail's bottom edge. The fix centers the ⋯ first; progress.md says why.
- A fresh fixture has no rail groups; the harness steps press Group by client first (lf26-fixture owns the fixture).

## Review
Pass: M1 and X0 met at 6889465 (lf26-menu).
- M1: in a fresh clone at 6889465, `npx vitest run src/components/Rail.lf26.test.tsx` passes 4/4 (a ⋯ out of view below and above the rail is centred, then opens down; in view nothing scrolls). I ran the harness myself (`scripts/tab-harness/tabharness.swift`, `--links on --size 1024x640`, the builder's `m1.txt`) against my own `wails dev` on :34123, with the fixture and auth off. Case d (the AXPress press, rail at scrollTop 0, ⋯ at 1077): `up: false`, menu 463-551 below the ⋯ 437-461, inside the window. With main's `Rail.tsx` swapped in under the same server, the same case opened `up: true` (347-435), so the row fails on main. Cases a, b, c and e behave as before. Evidence: `.wt-notes/mn-review/m1.jsonl`, `m1-main.jsonl`.
- X0: same clone, `XDG_DATA_HOME=$(mktemp -d) make test` (go ok, vitest 603/603), `pnpm run build`, `wails build`, all exit 0, all under test-lease; `git status --porcelain` empty. Evidence: `.wt-notes/mn-review/x0-*.log`, `x0-status.txt`.
- Boundary: the diff touches only `Rail.tsx` and `Rail.lf26.test.tsx`.
- Unmet: none.
- The harness presses the ⋯ with `click()` as a stand-in for AXPress (no focus, no scroll), as rl-ui did; no real AXPress on a review build's pid was run.
- `## UI review` is missing, so status and place stay as they are.
- Reviewer mn-review, 2026-10-13, commit 68894652cc93ac82e9e49029fa167c18b9feb189.
