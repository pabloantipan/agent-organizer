---
title: Time zoom, second pass - focus kept at the ends, Today only where it moves, readable day bands, whole marks after a pointer
status: now
repos: [organizer]
branch: time-zoom-2
updated: 2026-10-03
next: "review: time-zoom-2, gate met (A15-A23 measured, build row green)"
depends_on: []
boundary: ["frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts and axis.test.ts, frontend/src/styles/time-zoom.css", "frontend/src/components/Roadmap.tsx (A19's minutes label only), StageRoadmap.tsx (A22's row highlight only)", "scripts/fixture-home.sh (A23's card only)", "not: DecisionsView.tsx, RoadmapView.tsx, Home, the stores, Go, docs/design-system.md"]
spec: "docs/ux/specs/roadmap-time-zoom.md, Amendment 1 (Aglaea, 726cbe8) and its Technical notes"
gate: "docs/ux/specs/roadmap-time-zoom.md Acceptance A15-A23, plus the build row below"
ui_review: true
review: pass
seat: tz2-build
---

## Goal
time-zoom's UI leftovers, ranked by Aglaea: Amendment 1 of
`docs/ux/specs/roadmap-time-zoom.md`.

## Gate
- [x] A15-A23: see `docs/ux/specs/roadmap-time-zoom.md`, Acceptance
- [x] `go test ./...` and `cd frontend && npm test` green (axis tests for A15's focus target and A20's cut-label rule where pure); `wails build` succeeds

## Done
- 2026-10-03 tz2-build built Amendment 1 on `time-zoom-2` (d0ebc90, 7d25c11, 17def3a, rebased on main); A15-A23 measured in .wt-notes/tz2-build/measurements.md; go test, make test, npm run build, wails build green
- 2026-10-03 sup27 launched by the FSE (0074 ruled, accept as written)
- 2026-10-03 cut by the FSE from Aglaea's Amendment 1 (726cbe8)

## Next

## Blockers

## Review
- Verdict: pass (code review; the UI review is separate).
- Unmet gate items: none. A15-A23 checked against the diff, the vitest cases (focusAfter, revealScroll, contextAt, tickLabelWhole, timesLabel) and the builder's measurements and shots in `.wt-notes/tz2-build/`. Build row re-run in the worktree: `make test` (go + vitest 107) green, `npm run build` green, `wails build` green.
- Findings outside the gate:
  - Boundary: A23's card went into `testdata/fixture-overlay/init-a/working-on/w-later.md` and the overlay README, not `scripts/fixture-home.sh`, which is the only fixture path the boundary names. It is the right place (the script copies the overlay), but it is outside the boundary as written. `Roadmap.tsx` also swaps the Hours band markup for `DayBand` (A17), beyond "A19's minutes label only". The card's Notes declare both.
  - `--status-done` against the lane is 2.42:1, under A17's 3:1. No done band is drawn today (Hours exists only on Cards, which shows open cards only), but a done or superseded band at Hours would fail A17.
  - A20's cut-label rule estimates text width from character count (`tickLabelExtent`, 6-7.4 px per character), not from the rendered width. It holds for today's fonts (the sweeps found 0 cut labels), but it will drift if the font or size changes.
  - All measurements are from headless Chromium; WKWebView is left to the UI reviewer (0074).
  - `wails build` rewrites `frontend/wailsjs/runtime/*` in the worktree. I reverted it; nothing was committed.
- Reviewer: tz2-review, 2026-10-03

## Notes
Parallel with decisions-view: disjoint files (decisions-view does not touch the zoom control or the axis).
- A17's pinned dot needed the band markup: it moved to `DayBand` in TimeZoom.tsx and Roadmap.tsx calls it (one line beyond A19's label). A22 is CSS only; StageRoadmap.tsx is untouched. A23's card is in the overlay (`w-later.md`), so the script is unchanged.
- `--status-done` on the lane is 2.42:1, under A17's 3:1; no done band is drawn today (open cards only).
- The fixture stand-ins ignore SIGTERM; `kill $FIXTURE_AGENT_PIDS` does not end them, `kill -9` does.
