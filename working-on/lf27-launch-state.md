---
title: "The service keeps each seat's start and returns at once"
status: now
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
