---
title: "A crew start skips running seats and dates its failures"
status: now
repos: [organizer]
branch: lf30-launch-go
seat: lgo-build
stage: one-window
updated: 2026-10-14
next: "review: lf30-launch-go, gate met (G1, G2, X0), 076f26f"
depends_on: []
boundary: ["docs/specs/leftovers-30.md Boundary, lf30-launch-go"]
spec: "docs/specs/leftovers-30.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-30.md Acceptance, rows G1, G2 and X0"
ui_review: false
---

## Goal
A crew start skips running seats and dates its failures (launch-progress Amendment 2; sup66's close).

## Gate
docs/specs/leftovers-30.md, rows G1, G2 and X0.
- [x] G1 two entries, two probe calls; the CLI names the skipped seat — /Users/pabloantipan/organizer/.wt-notes/lgo-build/g1.txt
- [x] G2 `failed_at` the second failure's time, after `started_at` — /Users/pabloantipan/organizer/.wt-notes/lgo-build/g2.txt
- [x] X0 make test, pnpm run build, wails build pass; porcelain empty — /Users/pabloantipan/organizer/.wt-notes/lgo-build/x0-summary.txt, x0-porcelain.txt

## Done
- lgo-build: `StartCrew` skips seats live by the Agents feed's check (no entry, no probe call, CLI names them); failed entries carry `failed_at`; wailsjs regenerated. ff8437d, 1d01e3f, 076f26f.

## Notes
- With every seat running, Bring crew up queues nothing and no list shows; lf30-launch-view may want words for that.
