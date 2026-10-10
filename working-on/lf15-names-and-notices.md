---
title: "One name per session everywhere, notifications only from the installed app, the memory popover's reading state reachable"
status: now
repos: [organizer]
branch: lf15-names-and-notices
seat: ln-build
stage: one-window
updated: 2026-10-09
next: "N2: the notification centre database half is unrun (TCC); sup52 to get N2 amended to the log plus TestNotifyRefusal, or run the db read where TCC allows, then this card goes to done"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-15.md Acceptance, rows N1 to N3 and X0"
ui_review: false
review: fail
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, N1 to N3 and X0.
- [x] N1: .wt-notes/ln-build/go-tests.txt, vitest-memory.txt, n1-memory.txt, n1-memory-json.txt, n2-organizer.log
- [x] N2: .wt-notes/ln-build/n2-organizer.log, go-tests.txt (TestNotifyRefusal); the notification centre db was not read (TCC: authorization denied), see progress.md
- [x] N3: .wt-notes/ln-build/vitest-memory.txt, go-tests.txt
- [x] X0: .wt-notes/ln-build/x0-make-test.log, x0-npm-build.log, x0-wails-build.log (clean clone at db874e1)

## Done
- FR-1 and FR-2 built on lf15-names-and-notices (30ed83b, c5c881e, 47625ec), unit-tested; X0 passed pre-rebase. Progress and repro: .wt-notes/ln-build/progress.md.

- Gate met but for N2's notification db read; FR-3 and the Agents landing done under sup52's grants (memfake.go; AgentList.tsx :44, :112 and its import). Head 70463fd (rebased on 54866d5, AgentList name change kept on top of lp-build's).

## Notes
- The usernoted database is TCC-protected and could not be read from ln-build's session; N2 rests on the app's log and the code path that never calls the centre.
- `model.MemorySession.Name`'s comment still says `else "pid <n>"` (internal/model, outside the boundary).

## Review
Fail on N2 only: its notification-centre database half could not be run (TCC); N1, N3 and X0 are met. The card stays open.
- N1: met. TestMemorySessionNames and TestPrintMemoryListsEverySession pass. vitest memory.test.ts has 18 tests, among them "names the rest one way" and "names an Agents row the same way". On the fixture with a `--resume <uuid>` stand-in in init-a/.wt/w-queued and an unnamed one in init-a: `organizer memory` reads `wave1-queued` and `init-a session … pid N`. The JSON top five and the review build's warning body give the same names. No UUID or bare pid in any name.
- N2: unmet as written. The review build ran on the fixture with `--memory critical`. Its log reads `bundle cl.antipan.organizer.review is not the installed app, none will be posted`, then `memory warning: Memory critical on fixture: …`, then `notification not posted: not the installed app`, with no `notification posted`. TestNotifyRefusal passes, and in the diff NotifyStart returns before UNUserNotificationCenter is touched. The usernoted database is TCC-protected and was not read; the gate on main is not amended.
- N3: met. vitest "is none before the first sample" covers null memory with no reason giving `Reading memory…` (MemoryPopover.tsx:64). TestSampleMemory (ErrNoSample → null, no reason) and TestMemoryFake (`none` → ErrNoSample) pass, and `fixture-home.sh --memory none` writes `none`. The popover was not opened by input.
- X0: met. On a fresh clone at db874e1, `make test` (Go and 427 vitest), `npm run build` and `wails build` all pass. (The wails build rewrote frontend/wailsjs/runtime/; that drift is B1's.)
- Unmet: N2 (database half only).
- Reviewer ln-review, 2026-10-09, commit db874e16abcc8c0d466315ce3f9d3e395e157298. Evidence in .wt-notes/ln-review/ev/.
