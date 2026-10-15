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

## UI review
pr-ui, 2026-10-15, on c0130f2 (every row checked there; the branch did not move). **Verdict: pass.** No severity 4 or 3.

How each row was checked:
- P1: `TestStartCrewNamesRunningSessions` and `TestAppCreateCrewReturnsAtOnce` pass; `organizer crew init-a --print` from main (321f297) and branch binaries on one fixture: identical (`/Users/pabloantipan/organizer/.wt-notes/pr-ui/p1-cli-main.txt`, `p1-cli-branch.txt`). `wails generate module` reproduces `frontend/wailsjs/go` byte for byte (runtime files differ only in mode bits, untouched by the branch). No new service call or feed field in the diff.
- P2: Tab harness, own `wails dev` on 34203, fixture, auth off, probe stub. After the press, with 0 feeds since: fse reads `running` with `Attach fse` on `organizer-fixture-probe-fse` (a session only the real `CreateCrew` result could supply; the stub log shows no start), focus `Attach fse` (`out/p2.jsonl`; shot `wkwebview-1024x640-P2-at-once.png`).
- P3: region `Every seat is already running` and focus `Attach fse` land in one commit 108 ms after the feed; text set before `focus()` (`out/p3.jsonl`; `wkwebview-1024x640-P3-after-feed.png`).
- P4: `liveRegion.test.ts` P4 passes (speaker; the hook's timer is the same `SAY_GAP_MS`, ~104 ms seen in WKWebView in P2).
- X0 shared run: **fresh**, test-lease run 847dec0306599da5a70ca1796c2dbe5f at c0130f2, exit 0 (16 Go packages, vitest 60 files / 708 tests); the code reviewer's line reused it.

Findings (none fails):
- U1 (2) Same state, two words. Lead cannot tell an assumed seat from a feed one: right after the race fse reads `running` while po_ana and dev_bruno, equally alive, read `idle`; after the next feed fse turns `idle` (`P2-at-once` vs `P3-after-feed` shots). Evidence: `stateWord` maps running to idle; Amendment 6 says "as a feed-running row does", which is not what a feed row says. Proposal: say `idle` (the feed's word) for an assumed row, or rename both. Spec contradiction, for aglaea.
- U2 (2) Focus drops to the body ~112 ms while Start is disabled during `CreateCrew` (`out/p2.jsonl` 4147→4259). Against "focus never drops"; pre-existing (leftovers-32), outside FR-1..4. Proposal: keep Start focusable with `aria-disabled` while busy.
- U3 (2) In the race the words come ~104 ms after focus lands on Attach (4259 vs 4363); only the feed-closed confirm says why first. L24 "wherever the confirm goes away because nothing is off" reads as covering both. Spec gap, for aglaea.
- U4 (1) P3: during the 100 ms gap the confirm stays open with Start live while the row already shows fse alive with Attach; harmless (a press finds nothing off).

For aglaea: U1, U3; also whether "said, then focus" in one commit is heard in that order by VoiceOver (no row checks it).
Spec gaps for the FSE: U1 (Amendment 6's premise), U3 (race vs feed-closed scope).
Not verified in WKWebView: VoiceOver order and the 100 ms re-announce (Amendment 6: no VO row); no AX or window shots (no row needs them; WKWebView snapshots only); review build not built (supervisor: no row needs AX). First n0 attempt found fse already live from another seat's `organizer-fixture` stand-in that then ended; n0 rerun brought fse up with my stub.
