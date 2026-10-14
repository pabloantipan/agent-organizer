---
title: "The landed row stays in view; Seat up closes; badges show the deaf count"
status: now
repos: [organizer]
branch: lf30-launch-view
seat: lvw-build
stage: one-window
updated: 2026-10-14
next: "review: lf30-launch-view, gate met (V1, V2, V3, V4, X0), 7c35c18"
depends_on: [lf30-launch-go]
boundary: ["docs/specs/leftovers-30.md Boundary, lf30-launch-view"]
spec: "docs/specs/leftovers-30.md (FR-3 to FR-6; launch-progress L13, L14)"
gate: "docs/specs/leftovers-30.md Acceptance, rows V1, V2, V3, V4 and X0"
ui_review: true
review: pass
---

## Goal
The landed row stays in view; Seat up closes; badges show the deaf count (launch-progress Amendment 2; sup66's close).

## Gate
docs/specs/leftovers-30.md, rows V1, V2, V3, V4 and X0.

- [x] V1: harness 1024×640, landed below the fold, three feed updates above, then a scroll and one more: centred, back in view, not moved after the scroll. .wt-notes/lvw-build/out/v1.txt
- [x] V2: harness with the stub, `Bring 1 up`, the list 1 s and 6 s after `Seat up`: present, then gone. .wt-notes/lvw-build/out/v2.txt
- [x] V3: vitest of `needsMeRows`, `failed_at` 12:05 and `started_at` 12:04: dated 12:05. frontend/src/lib/queue.test.ts ("V3")
- [x] V4: vitest and AX of a deaf and a capped seat with 3 waiting, on Agents and in the crew block: `· 3 waiting` on both. frontend/src/components/ContextBar.test.tsx; .wt-notes/lvw-build/out/v4-ax-agents.txt, out/v4-agents.png
- [x] X0: make test, frontend build, wails build, git status --porcelain empty. .wt-notes/lvw-build/out/x0.txt

## Done
- FR-3 to FR-6 on branch lf30-launch-view (8bfa7cf, 2421418, 2df8c47, 7c35c18), gate met. How each row ran is in .wt-notes/lvw-build/progress.md.

## Notes
- V1's feed updates are the page's own feed applied with fake data: the harness imports the store from the vite dev server and applies the latest real feed with filler seats prepended to init-a's crew. A real tick is re-covered with the same fillers.
- V4's AX ran on the review build, with the screen unlocked. The state comes from the fixture's canned health. Its temp copy was edited: dev_bruno and build-help deaf with 3 waiting, po_ana capped with 3 (sup10 is capped with 3 already). A fake discuss does not reach it, because canned_health wins.
- The harness's hidden window never runs requestAnimationFrame, so the landing now starts from a zero timeout (7c35c18).
- X0 ran from a clean clone at dfb74be. Its tree differs from 7c35c18 only by this card's start commit, which the rebase brought in from main.

## Review
Pass: V1, V2, V3, V4 and X0 met at 7c35c18 (lf30-launch-view), each run from a fresh clone at that SHA.

- V1: Tab harness 1024×640 against my own `wails dev` on 34178 (fixture, auth off, probe stub), the builder's steps. Landed centreOff 0 (row below the fold, scrollTop 0 → 406); after +3, +3, +3 above: whole in view each time (scrollTop 406, 412, 520); lead's scroll to 370, one more update: scrollTop stays 370. The fake feed goes through the store's own `applyAgents`, the path the `agents` event takes, so it counts as a feed update. `.wt-notes/lvw-review/out/v1.txt`
- V2: same harness, stub: `Bring 1 up`, Return twice; `Seat up · 1 of 1 running` at 7.2 s, present 1.5 s after it was seen, gone at 12.2 s (5.0 s), absent at the 6 s read. `out/v2.txt`
- V3: vitest `lib/queue.test.ts` "V3": 12:05 with `failed_at` 12:05, `started_at` 12:04 (main would date it 12:04). `out/vitest-v3v4.txt`
- V4: vitest `ContextBar.test.tsx` (badge, Agents row, crew block); AX of my review build (pid saved, screen unlocked), canned health copy edited: crew block `capped · 3 waiting` (po_ana), `deaf · 3 waiting` (dev_bruno); Agents rows `deaf · 3 waiting` (build-help), `capped · 3 waiting` (sup10). `out/v4-ax-agents.txt`, `out/v4-agents.png`
- X0: `make test` exit 0 (Go all ok, vitest 684/684), `pnpm run build` 0, `wails build` 0, `git status --porcelain` empty. `.wt-notes/lvw-review/x0-*.txt`
- Shared test run: fresh, run 0f898035-59948 (lvw-ui reused it).
- Unmet rows: none. Diff stays inside the boundary (no Go, no SlackView).
- Reviewer lvw-review, 2026-10-14, commit 7c35c18b01693a1a75c54ef768d043e70e658f3f.
