---
title: "A crew start skips running seats and dates its failures"
status: done
repos: [organizer]
branch: lf30-launch-go
seat: lgo-build
stage: one-window
updated: 2026-10-14
next: "review: lf30-launch-go, gate met (G1, G2, X0), 6c91145"
depends_on: []
boundary: ["docs/specs/leftovers-30.md Boundary, lf30-launch-go"]
spec: "docs/specs/leftovers-30.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-30.md Acceptance, rows G1, G2 and X0"
ui_review: false
review: pass
---

## Goal
A crew start skips running seats and dates its failures (launch-progress Amendment 2; sup66's close).

## Gate
docs/specs/leftovers-30.md, rows G1, G2 and X0.
- [x] G1 two entries, two probe calls; the CLI names the skipped seat — /Users/pabloantipan/organizer/.wt-notes/lgo-build/g1.txt
- [x] G2 `failed_at` the second failure's time, after `started_at` — /Users/pabloantipan/organizer/.wt-notes/lgo-build/g2.txt
- [x] X0 make test, pnpm run build, wails build pass; porcelain empty — /Users/pabloantipan/organizer/.wt-notes/lgo-build/x0-summary.txt, x0-porcelain.txt

## Done
- lgo-build: `StartCrew` skips seats live by the Agents feed's check (no entry, no probe call, CLI names them); failed entries carry `failed_at`; wailsjs regenerated. ec8b375, aa836f6, 6c91145.

## Notes
- With every seat running, Bring crew up queues nothing and no list shows; lf30-launch-view may want words for that.

## Review
Pass: G1, G2 and X0 met at 6c911456c76e09970bb5be61ecfa7f4e0aae61b5 (fresh clone, removed after).
- G1: `TestCreateCrewSkipsRunningSeats` / `TestCreateCrewAllRunningStartsNothing` (fake live set, fake probe: entries po_ana and qa_cleo, two wrapper calls, no prelude for dev_bruno) and `TestCrewCmdSkipsRunningSeat` (`organizer crew` with scripts/probe-stub.sh) pass; by hand, the wails-built binary with the stub and a live stand-in for dev_bruno queued two seats, the stub logged ana and cleo only, the CLI printed `already running, not started: dev_bruno` (also in `--print`); with the stand-in killed, all three started. /Users/pabloantipan/organizer/.wt-notes/lgo-review/g-service.txt, g1-cli.txt, g1-manual.txt
- G2: `TestFailedSeatCarriesFailedAt` passes: exits 3, 3 under a fake clock, `failed_at` 12:02 (the second failure), `started_at` 12:01, JSON `"failed_at":"2026-10-14T12:02:00Z"`, cleared by Try again. /Users/pabloantipan/organizer/.wt-notes/lgo-review/g-service.txt
- X0: `make test` exit 0 (Go all ok, vitest 676/676), `pnpm run build` exit 0, `wails build` exit 0, `git status --porcelain` empty. /Users/pabloantipan/organizer/.wt-notes/lgo-review/x0-*.log, x0-porcelain.txt
- Unmet: none.
- Test run: fresh, test-lease run fe6598e1-8443 (sha 6c91145, rc 0).
- Note: G1's service half uses the package's fake probe, not scripts/probe-stub.sh; the stub half is the CLI test and the hand run.
- Reviewer lgo-review, 2026-10-14, commit 6c91145.
