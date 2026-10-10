---
title: "One name per session everywhere, notifications only from the installed app, the memory popover's reading state reachable"
status: done
repos: [organizer]
branch: lf15-names-and-notices
seat: ln-build
stage: one-window
updated: 2026-10-10
next: "review: ln-review2 re-judges N2 (Amendment 1, 0db55d6) at a3ed8a7, rebased on main (sup53)"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-15.md Acceptance, rows N1 to N3 and X0"
ui_review: false
review: pass
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
Fail on N2 only: its notification-centre database half could not be run (TCC); N1, N3 and X0 are met at the rebased head. The card stays open.
- N1: met. TestMemorySessionNames and TestPrintMemoryListsEverySession pass, and so does vitest memory.test.ts (names past the five, an Agents row named the same way). On the fixture with a `--resume <uuid>` stand-in in init-a/.wt/w-queued and an unnamed one in init-a: `organizer memory` reads `wave1-queued` and `init-a session … pid N`. The JSON top five and the review build's warning body (`Biggest: wave1-queued …, organizer-fixture-probe-build-help …, init-a session …`) give the same names. No UUID or bare pid in any name. In the AgentList.tsx conflict resolution, rowName keeps rowMemoryWords and adds agentLabel.
- N2: unmet as written. The review build ran on the fixture with `--memory critical`. Its log reads `bundle cl.antipan.organizer.review is not the installed app, none will be posted`, then `memory warning: Memory critical on fixture: …`, then `notification not posted: not the installed app`, with no `notification posted`. TestNotifyRefusal passes, and NotifyStart returns before UNUserNotificationCenter is touched. The usernoted database is TCC-protected and was not read; N2 on main is still unamended.
- N3: met. vitest "is none before the first sample" covers null memory with no reason giving `Reading memory…` (MemoryPopover.tsx). TestSampleMemory (ErrNoSample → null, no reason) and TestMemoryFake (`none` → ErrNoSample) pass, and `fixture-home.sh --memory none` writes `none`. The popover was not opened by input.
- X0: met. On a fresh clone at 70463fd, `make test` (Go and 443 vitest), `npm run build` and `wails build` all pass.
- Unmet: N2 (database half only).
- Reviewer ln-review, 2026-10-09, commit 70463fd1bcb581a1dc10d637dd5f4efd27f3a5c0, rebased on main 54866d5 (supersedes the review of db874e1). Evidence in .wt-notes/ln-review/ev2/.

Pass: N2 as amended (Amendment 1, 0db55d6) is met at a3ed8a7; with ln-review's N1, N3 and X0 above, every gate row is met.
- N2: met. From a fresh clone at a3ed8a7, `make review-build` (through test-lease) built `Deltagos Review.app` (cl.antipan.organizer.review), and `go test -run TestNotifyRefusal .` passes. The test covers the installed id posting, the installed id refused while faked, the review id faked or not, and another id. In notify_darwin.m, NotifyStart returns before `UNUserNotificationCenter` when Go gives a refusal, and NotifyPost and readSettings return on `!bundled`. The review build ran on the fixture with `--memory critical` (`ORGANIZER_MEMORY_FAKE=@file` holding `critical`). Its organizer.log reads `notifications: bundle cl.antipan.organizer.review is not the installed app, none will be posted`, then `memory warning: Memory critical on fixture: 1.2 GB free. Biggest: …`, then `notification not posted: not the installed app`. No `notification posted` line and no authorization line.
- Unmet: none.
- Reviewer ln-review2, 2026-10-10, commit a3ed8a70f994b740a54ff3d1d984127dd4de99e5 (branch not moved). Evidence in .wt-notes/ln-review2/ev/. The clone was removed, and the app and fixture stand-ins were killed by saved pid.
