---
title: "A seat the press found running can be attached at once; a closed confirm says why; a repeat waits 100 ms"
status: now
repos: [organizer]
branch: lf33-press-running
seat: pr-build
stage: one-window
updated: 2026-10-15
next: "review: lf33-press-running, gate met (P1 P2 P3 P4 X0), c0130f2"
depends_on: []
boundary: ["docs/specs/leftovers-33.md Boundary, lf33-press-running"]
spec: "docs/specs/leftovers-33.md (FR-1 to FR-4; launch-progress L23-L25)"
gate: "docs/specs/leftovers-33.md Acceptance, rows P1, P2, P3, P4 and X0"
ui_review: true
---

## Goal
A seat the press found running reads running with Attach at once; a confirm closed by the feed says why; a repeated announcement waits 100 ms (launch-progress Amendment 6).

## Gate
docs/specs/leftovers-33.md, rows P1, P2, P3, P4 and X0.

- [x] P1: `/Users/pabloantipan/organizer/.wt-notes/pr-build/out/p1-go-test.txt` (`TestStartCrewNamesRunningSessions`: running = po_ana, qa_cleo with `crewfix-probe-ana`, `crewfix-probe-cleo`, lines = bruno's; `fakeLive` seam already in crewskip_test.go); CLI `/Users/pabloantipan/organizer/.wt-notes/pr-build/out/p1-cli-main.txt` vs `p1-cli-branch.txt`, `p1-cli-diff.txt` empty
- [x] P2: `/Users/pabloantipan/organizer/.wt-notes/pr-build/out/p2.jsonl` (no feed since the press; fse `running` + `Attach fse` on `organizer-fixture-probe-fse`, focus `Attach fse`, the first seat drawn), steps `/Users/pabloantipan/organizer/.wt-notes/pr-build/steps/p2.txt`
- [x] P3: `/Users/pabloantipan/organizer/.wt-notes/pr-build/out/p3.jsonl` (region `Every seat is already running` and focus `Attach fse` land in one commit 107 ms after the feed, text first; focus never on the body), steps `/Users/pabloantipan/organizer/.wt-notes/pr-build/steps/p3.txt`
- [x] P4: `/Users/pabloantipan/organizer/.wt-notes/pr-build/out/p4-vitest.txt` (`liveRegion.test.ts` P4: empty at 0 and 50 ms, `a` at 100 ms, no requestAnimationFrame)
- [x] X0: clean clone at c0130f2: `/Users/pabloantipan/organizer/.wt-notes/pr-build/out/x0-make-test.txt` (exit 0), `x0-pnpm-build.txt`, `x0-wails-build.txt`, `x0-status.txt` (empty)

## Done
- pr-build, 2026-10-15: CreateCrew returns `{lines, running}`; a seat the press found running reads `running` with Attach at once; a feed-closed confirm says `Every seat is already running`, then focus; the live region waits 100 ms (3b38c8b, 7ee4803, c0130f2). Gate met.

## Notes
- Found, not asked (progress.md): Start goes disabled while CreateCrew runs and WebKit drops focus to the body for ~110 ms in the race (pre-existing, leftovers-32); in the race the words land 100 ms after focus (FR-3 covers only the feed-closed confirm); an assumed row reads `running` while a feed-running row reads `idle`.
