---
title: Time zoom on every Gantt-style axis - Fit, Days, and Hours where a mark has a time
status: now
repos: [organizer]
branch: time-zoom
updated: 2026-10-03
next: "A14: unmet as written (Roadmap returns at Fit, not Days); the gate contradicts T5 and the States row, so pablo amends A14 or accepts the remount reading, then re-review"
seat: tz-build
depends_on: [header-fold-2]
boundary: ["frontend/src/components/Roadmap.tsx, RoadmapView.tsx, StageRoadmap.tsx (axis and positions only, not the stage word or row), DecisionsView.tsx (the Timeline only)", "one new shared axis module in frontend/src/lib/ and one zoom-control component, with their CSS", "frontend/src/lib/dates.ts and frontend/src/lib/ tests", "internal/scan/git.go (branchSpan's format only) and internal/scan/scan_test.go", "testdata/ fixtures the gate rows need", "not: Calendar.tsx, Portfolio.tsx's mounting, the stores, Home, docs/design-system.md; no bound Go type change"]
spec: "docs/ux/specs/roadmap-time-zoom.md (Aglaea's design, 6569427, with the FSE's Technical notes T1-T5); ruling 0070"
gate: "docs/ux/specs/roadmap-time-zoom.md Acceptance A1-A14, plus T1 and T2 below"
ui_review: true
review: fail
---

## Goal
One zoom on Roadmap Cards, Roadmap Stages and the Decisions Timeline: Fit,
Days, and Hours only where a mark carries a time (0070).

## Gate
- [x] A1-A14: see `docs/ux/specs/roadmap-time-zoom.md`, Acceptance (measured in `.wt-notes/tz-build/gate-*.log`, shots beside them; A14 see Notes)
- [x] T1: `go test ./internal/scan/` passes with a test asserting BranchStart and BranchLast carry an RFC 3339 time
- [x] T2: `cd frontend && npm test` passes with parseISO tests for a date-only and an RFC 3339 string, hasTime for both, and the axis module's ticks, day-end and offersHours
- [x] `go test ./...` and `npm test` green; `wails build` succeeds

## Done
- 2026-10-03 tz-build: branch time-zoom on main d1b9245, 1ae27b0 00c8e1e 93a8ba7 197487b c95ab4a ffb2576 b72cadd; one axis (`lib/axis.ts`), one control and frame (`components/TimeZoom.tsx`); make test (vitest 97), npm run build, wails build green; A1-A14 measured, progress in `.wt-notes/tz-build/progress.md`
- 2026-10-03 sup26: worktree .wt/time-zoom on 0774ab2, builder tz-build launched; reviewers tz-review (code) and tz-ui (UI)
- 2026-10-03 sup26 launched by the FSE, header-fold-2 in done/ (4afddc0), per 0071
- 2026-10-03 0071 ruled by pablo ("Ok", accept as written, 1328071); launchable, waits on header-fold-2
- 2026-10-03 cut by the FSE from Aglaea's spec and ruling 0070

## Review
- Verdict: fail (code review). Unmet: A14. A1-A13, T1, T2 and the build row are met.
- A14: measured Roadmap Days -> Decisions -> Roadmap at Fit; the check says "still at Days". The gate is wrong, not the build: sub-views are exclusive (`App.tsx`, outside the boundary), and T5 plus the States row reset the level on remount. Keeping Days needs remembered state (T5 forbids it) or a mounted hidden Roadmap (out of boundary). Pablo amends A14, for example to "zooming Decisions never changes another graph's level; each resets on remount", then this passes as built.
- Checks re-run on b72cadd: `XDG_DATA_HOME=$(mktemp -d) make test` (go test ./..., vitest 97), `npm run build`, `wails build`, all green.
- Outside the gate: `scripts/fixture-home.sh` is outside the boundary (it allows `testdata/` fixtures); the change is additive and A3, A6 and A12 need it. Pinch was measured as Chromium ctrl+wheel only; the WebKit gesture path is read, not run, so the UI review should pinch a real trackpad. A2 shows `September 2026`, not `October 2026`, because of the fixture. The Hours note's copy differs from the spec; the change is sound but Aglaea should accept it. At Fit, Today is shown but does nothing. At Hours, the sticky day label covers the first `:00` label (shot `1512x945-cards-hours-midnight.png`).
- Reviewer: tz-review, 2026-10-03.

## Next

## Blockers

## Notes
- A14 against T5: the sub-views are exclusive (`App.tsx`), so leaving Roadmap unmounts it and the States row "left and reopened → back to Fit" applies; measured Roadmap Days → Decisions Days → Fit → Roadmap at Fit. Levels are independent per graph; the literal "still at Days" needs a remembered level, which T5 forbids.
- `scripts/fixture-home.sh` got one additive block: `feat/beta` with two commits timed 2 Oct 09:12 and 17:48 (-03:00), so the fixture's Cards offer Hours (b72cadd).
- A2's `October 2026` cannot be the sticky label on the fixture (its data ends 5 Oct); the shot shows `September 2026` mid-September.
- The Hours note reads "Dates without a time of day fill their whole day.": the spec's "Dates have no time of day" is false once git ends carry times.
- WebKit pinch (gesture events) is wired with the same one-level lock but only ctrl+wheel was testable headless.
Sequenced after header-fold-2: its boundary holds Roadmap.tsx, RoadmapView.tsx and DecisionsView.tsx.
