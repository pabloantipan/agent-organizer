---
title: "The landed row stays in view; Seat up closes; badges show the deaf count"
status: done
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

## UI review
Pass, at 7c35c18b01693a1a75c54ef768d043e70e658f3f (every row checked on that commit). Sev 4/3: none. Shots and logs `.wt-notes/lvw-ui/`.

How each state was checked:
- V1 / L13: Tab harness 1024×640, my own `wails dev` on 34179 from a clean detached worktree (fixture, auth off, probe stub), the builder's steps. Landed: centreOff 0. After +3, +3, +3 rows above: whole in view each time (scrollTop 406, 412, 520). Lead scrolls to 370, one more update: stays at 370, focus kept. `out/v1.jsonl`, `wkwebview-1024x640-V1-{landed,update2,after-scroll-update4}.png`. Fake updates go through the store's own `applyAgents`, the path the `agents` event takes, and one real tick (9.6 s) fell inside the run, so they meet the row as written. The zero-timeout start is the same code the app runs, not a harness branch.
- V2 / L14: same harness: `Bring 1 up`, Return twice. `Seat up · 1 of 1 running` at 7.3 s, present 1 s after, gone at 12.3 s (5.0 s), absent at the 6 s read. Focus then on `Reattach all`, never the body. `out/v2.jsonl`, `wkwebview-1024x640-V2-{seat-up-1s,closed-6s}.png`
- V3: vitest `lib/queue.test.ts` "V3", in the shared run.
- V4: vitest `ContextBar.test.tsx` in the shared run. AX of my own review build (pid saved, killed by it; screen unlocked; auth off). In my temp copy of canned health, dev_bruno and build-help were deaf with 3 waiting, and po_ana capped with 3. Crew block: `capped · 3 waiting` (po_ana), `deaf · 3 waiting` (dev_bruno). Agents rows: `deaf · 3 waiting` (build-help), `capped · 3 waiting` (sup10). `out/v4-ax-agents.txt`, `wkwebview-1440x900-V4-agents-deaf-capped.png`. The word comes first and the count is text, so it is not colour alone (1.4.1).
- Shared test run: reused, run 0f898035-59948 of 7c35c18b0169 (lvw-review's), exit 0: Go all ok, vitest 684/684.

Findings:
- U1 (sev 1). The lead cannot see the landed row's whole focus ring once a feed update has moved it. Where: Agents, 1024×640, after update 2 (`wkwebview-1024x640-V1-update2.png`). Evidence: `nearest` leaves the row flush with the scroller's bottom edge (row bottom 640, view bottom 640). The 2 px outline at a 2 px offset falls outside the scroller, so the ring's bottom edge is clipped. The row stays whole and focused, so V1 holds. Proposal: give the landed row `scroll-margin-block: var(--space-2)` (Safari 15 has it), so `nearest` leaves the ring inside.

Spec gaps (for the FSE):
- L13 and FR-3 say "back in view" without saying whether the focus ring counts as part of the row (U1).
- Nothing says where focus goes when `Seat up` closes by time. As built it lands on `Reattach all`, which is reasonable. Write it down so it is not changed by accident.

For aglaea:
- A1: should a landing that a feed update scrolls back with `nearest` keep a margin from the edge (U1), or is flush acceptable for a row that has just landed?

Not verified in WKWebView:
- The hold over real 10 s ticks alone: only fake updates, plus one real tick that the fake re-applied.
- Release on blur: vitest `Crew.hold.test.ts` only.
- The `openAgentRow` / `agentFocus` landing in AgentsView: V1 used `openAgentsAt` through Crew.
- `Crew up` closing after 5 s: V2 covers `Seat up` only.
- The V3 row's date as drawn on Home: vitest only.
- Firebase: not run (forbidden), and no row depends on it.
