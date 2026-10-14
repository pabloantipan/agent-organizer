---
title: "The crew list reads its result, starts only what was asked, closes"
status: now
repos: [organizer]
branch: lf29-crew-list
seat: cl-build
stage: one-window
updated: 2026-10-14
next: "review: lf29-crew-list, gate met (C3 AX on the screen-locked review build rests on offscreen WebKit names and styles), 8fd6dce"
depends_on: []
boundary: ["docs/specs/leftovers-29.md Boundary, lf29-crew-list"]
spec: "docs/specs/leftovers-29.md (FR-1 to FR-4; launch-progress L8-L10)"
gate: "docs/specs/leftovers-29.md Acceptance, rows C1, C2, C3, C4 and X0"
ui_review: true
review: pass
---

## Goal
The crew list reads its result, starts only what was asked, closes (launch-progress Amendment 1, 8c1b167).

## Gate
docs/specs/leftovers-29.md, rows C1, C2, C3, C4 and X0.

- [x] C1: all succeed `Crew up · 3 of 3 running` (closed ~5 s on), one fails `Crew up · 2 of 3 running, 1 didn't start`, Stop starting during the second `Stopped · 2 of 3 running, 1 not started`; live region says each once — .wt-notes/cl-build/out/c1a.txt, c1b.txt, c1c.txt
- [x] C2: two running, `Bring 1 up`: one seat listed, `Starting 1 seat · 0 of 1 running` then `Seat up · 1 of 1 running` — .wt-notes/cl-build/out/c2.txt
- [x] C3: Tab to `Close the list`, Return: list gone, failed seat `off`, `Bring 1 up` present, no Needs me row (badge at the fixture's 15), no kill call in the stub log — .wt-notes/cl-build/out/c3.txt, c3-stub-calls.txt, c3-styles.jsonl; AX not taken: screen locked (.wt-notes/cl-build/out/c3-ax-locked.txt), rests on offscreen WebKit names and computed styles
- [x] C4: "fails alone" and "forecast:" match, "stops the rest" does not — .wt-notes/cl-build/out/c4.txt
- [x] X0: make test, pnpm run build, wails build pass, status empty, clean clone at 8fd6dce — .wt-notes/cl-build/out/x0.txt

## Done
- 2026-10-14 cl-build: heading reads the result, list holds only this press's seats, Close the list (SeenLaunch, kills nothing), CLAUDE.md Crew and Navigation; 35292e6, 5d30aad, 8fd6dce on lf29-crew-list.

## Notes
- C1's cell is the fixture's 3 seats (fse, po_ana, dev_bruno); all three listed via Reattach all. C3 fails fse, not dev_bruno: other seats' fixtures run organizer-fixture-probe-bruno stand-ins that join this crew by family, so dev_bruno cannot read off.
- Unnamed case: nothing running reads `Seat not up · 0 of 1 running, 1 didn't start` / `Crew not up · …`.
- CreateCrew (Go) still re-probes the running seats; the view hides them, a hidden seat that fails is listed. Starting only the off seats would be a crew.go change. See .wt-notes/cl-build/progress.md, Found, not asked.

## Review
Pass: C1, C2, C3, C4 and X0 met at 8fd6dce. Unmet: none.

Evidence is in .wt-notes/cl-review/out/. The fixture is a clean clone at 8fd6dce with auth off. Tab harness rows ran against my own `wails dev` on 34175, with `ORGANIZER_PROBE_BIN` set to the builder's stand-in wrapper over `scripts/probe-stub.sh`. In my temp fixture only, I renamed the cell's project to `clrfix`. Other seats' `organizer-fixture-probe-*` stand-ins were joining this crew by family; with the rename the fixture still has its 3 seats.
- C1: Reattach all of 3, then `Crew up · 3 of 3 running`; the list closed about 4 s later (c1a.txt). With `bruno` failing: `Crew up · 2 of 3 running, 1 didn't start` (c1b.txt). Stop starting by key while po_ana started: `Stopped · 2 of 3 running, 1 not started` (c1c.txt). The live region said each result once, joined to the last seat's word.
- C2: po_ana and dev_bruno running, fse off. `Bring 1 up` listed `fse` alone: `Starting 1 seat · 0 of 1 running`, then `Seat up · 1 of 1 running` (c2.txt).
- C3: fse fails, giving `Seat not up · 0 of 1 running, 1 didn't start`. One Tab from the heading lands on `Close the list`; Return hides the list. The rows read `fse, off` and focus is on `Bring 1 up`. Needs me has no `start:` row, and Home has no "didn't start". The stub log after the mark has no `-k` (c3.txt, c3-before.txt, c3-styles.txt, c3-stub-calls.txt).
  - c3-before also shows that the `start:` row was already gone before Close: showing the list calls `SeenLaunch`, as on main, and Close calls it again.
  - Close the list is `tiny-btn ghost`, like Copy the command.
  - No AX: the screen was locked (`CGSSessionScreenIsLocked` true, c3-ax-locked.txt), so this rests on offscreen WebKit names and computed styles.
- C4: in CLAUDE.md, "fails alone" matches 1 line (Crew), "forecast:" 1 (Navigation), "stops the rest" 0 (c4.txt).
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` passed (Go ok, vitest 664/664). The run was fresh, id a65b9ae9-39291, sha 8fd6dce; cl-ui reused it. `pnpm run build` and `wails build` passed through test-lease, and `git status --porcelain` was empty. The clone was then removed.

Not covered by the gate: `CreateCrew` still runs probe on the hidden running seats (stub log: ana and bruno after Bring 1 up). That keeps C2's `Seat up` on screen about 15 s instead of 5 s.

Reviewer cl-review, 2026-10-14, commit 8fd6dce7118f118755c0b6295fb165be966adf78.
