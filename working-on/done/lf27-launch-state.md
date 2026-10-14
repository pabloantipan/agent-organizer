---
title: "The service keeps each seat's start and returns at once"
status: done
repos: [organizer]
branch: lf27-launch-state
seat: st-build
stage: one-window
updated: 2026-10-14
next: "review: lf27-launch-state, gate met (P1 P2 P3 X0), 4ce65d7"
depends_on: []
boundary: ["docs/specs/leftovers-27.md Boundary, lf27-launch-state"]
spec: "docs/specs/leftovers-27.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-27.md Acceptance, rows P1, P2, P3 and X0"
ui_review: false
review: pass
---

## Goal
The service keeps each seat's start and returns at once (launch-progress 91cf067; tab-reaches-links A3; sup62 and sup63 closes).

## Gate
docs/specs/leftovers-27.md, rows P1, P2, P3 and X0.
- [x] P1: queued → starting → running / retrying → failed (reason, exit 3, output); third skipped after Stop; retry restarts one seat; dropped 5 s after all run, kept on failure — .wt-notes/st-build/p1.txt
- [x] P2: App.CreateCrew returns in < 1 ms; `organizer crew` prints one line per state in order — .wt-notes/st-build/p2.txt, .wt-notes/st-build/p3/p3.txt
- [x] P3: stub used, bruno (second seat) fails twice, no claude started (stub.log), iTerm2 windows 3 → 3; no openInTerminal; the comment says detached (now app.go:399-402) — .wt-notes/st-build/p3/p3.txt
- [x] X0: make test, pnpm run build, wails build pass; git status --porcelain empty, clean clone at 4ce65d7 — .wt-notes/st-build/x0.txt

## Done
- st-build: Service.launches on AgentsView.launches with an agents emit per change; CreateCrew/CreateAgent return once queued; StopStarting, RetrySeat, SeenLaunch bound; CLI crew/run print each state; probe stub; openInTerminal gone. Branch lf27-launch-state at 4ce65d7, feed shape in .wt-notes/st-build/progress.md.

## Notes
- A failing seat no longer stops the rest, and the token preflight runs per seat in the background (a seat without a token fails alone); --print still refuses up front.
- A seen failed list stays until Try again or a new start: there is no dismiss method; lf27-launch-view may want one (not in FR-3).
- P3's `sed -n 386,387p app.go` line numbers moved to 399-402.

## Review
Pass: P1, P2, P3 and X0 met at 4ce65d7. Unmet: none.
- P1: read `TestLaunchStatesThroughTheStub` and `TestLaunchAllRunningIsDroppedAfterFiveSeconds` against the row; ran them with `-race` from the clean clone, pass. They read the entries after each step: queued, starting, running; bruno starting, retrying, failed with the reason in words, exit 3 and the pane lines; cleo skipped after Stop and never run; Try again reruns bruno alone (bruno 3 calls, cleo 0); a fake clock drops an all-running start at 5 s and keeps a failed one past 10 s. The failed start also stays after SeenLaunch. That follows launch-progress §1 ("stays until the lead acts"), though FR-3's "until it is seen or retried" could be read the other way.
- P2: `TestAppCreateCrewReturnsAtOnce`, App.CreateCrew returned in 0.7 ms against a 3 s stub; `TestCrewCmdPrintsEachState` checks the CLI lines in order. Both pass.
- P3: ran it on fixture init-a with the stub and `PROBE_STUB_FAIL=bruno`, since the stub matches the short name and the row's `b` stands for that seat. `--print` exits 0. The real run prints each state, bruno fails twice and the exit is 1. stub.log has every call. iTerm2 windows 3 → 3, claude processes 6 → 6. No `openInTerminal` in Go. The comment is now app.go:399-402 and says detached; 386-387 is other code now.
- X0: `make test`, `pnpm run build` and `wails build` pass; `git status --porcelain` empty.
- Shared test run: fresh, id e50be8a1-82955.
- Evidence: .wt-notes/st-review/ (p12.txt, p3/p3.txt, x0-*.txt).
- Reviewer st-review, 2026-10-14, commit 4ce65d7076fe9023bd4a602a32c150943acd6dc4.
