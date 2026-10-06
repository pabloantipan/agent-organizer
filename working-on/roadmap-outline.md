---
title: "The Roadmap as an outline: stages, waves, rounds and cards over the axis, decisions as diamonds, four detail steps"
status: now
repos: [organizer]
branch: roadmap-outline
seat: ro-build
stage: one-window
updated: 2026-10-06
next: "review: roadmap-outline, gate met (P1-P8, X0), fb184ee"
depends_on: [roadmap-waves-scan]
boundary: ["RoadmapView.tsx, Roadmap.tsx and its axis helpers, new outline components and css", "frontend/src/lib helpers and tests", "not: Go, the Calendar, Home"]
spec: "docs/specs/roadmap-as-a-plan.md (FR-4; docs/ux/specs/roadmap-as-a-plan.md (1f2ded8))"
gate: "docs/specs/roadmap-as-a-plan.md Acceptance, rows P1 to P8 and X0"
ui_review: true
---

## Goal
0093: the Roadmap reads like a project plan.

## Gate
docs/specs/roadmap-as-a-plan.md, P1 to P8 and X0. Measured in the review build (WKWebView, 1024×640, fixture); shots and logs in `.wt-notes/ro-build/`, detail in its progress.md.

- [x] P1 opens on Current stage: one stage row, two exit items open, axis 17 Aug → today; reopened after Decisions, still step 1 (`webkit-1024x640-P1-step1-full-overlay.png`)
- [x] P2 each step adds its rows (vitest `the detail steps`; `webkit-1024x640-P2-step-*.png`); back to 1 restores; zoom stays Fit
- [x] P3 0004 raised 1 Sep hollow, ruled 3 Sep solid, line between, at Days; waiting dashed to today; pressing a diamond lands on the record (`webkit-1024x640-P3-*.png`). The fixture's pair is in September, not October
- [x] P4 wave rows: task, supervisor, result, launch → merge bar, `also in` (step 3/4 shots)
- [x] P5 Fit `5 rounds · 1 fail` with ✕ (the fixture wave has 5); double-click the bar → Hours, fail outlined magenta, `✕ fail · gate row 2` (`webkit-1024x640-P5-hours-dblclick-full-overlay.png`)
- [x] P6 `Outside any stage · 5 cards` last at steps 1-2, its waves at 3 (`webkit-1024x640-P6-step3-outside-strip-overlay.png`)
- [x] P7 rail expanded and strip, overlay and classic: web area = window (1024×608), titles ellipsised; the short-worded switch fits the line in WebKit, wraps under Stages in Chromium (`webkit-1024x640-P7-*.png`, `chromium-1024x609-P7-rail-expanded.png`)
- [x] P8 radio arrows on the switch; ↑↓ ← → in the outline; Enter on a card opens its card back, Escape returns to the row; diamonds are buttons named with their record (`webkit-1024x640-P8-enter-card-back-full-overlay.png`)
- [x] X0 fresh clone: make test rc 0 (vitest 334), npm run build rc 0, wails build rc 0

## Done
- 2026-10-06 ro-build: Stages is the outline (2686d39 cardBar, 2d71f0d helpers and tests, 90000ed fitTo, fb184ee outline); gate met, branch rebased on main ee1f49c (main ahead only by card commits), unmerged.

## Notes
- Reduced motion checked by inspection only (animation under no-preference).
- A duplicated stage id joins its work to the first stage with that id; the later row says so.
- AXPress on an edge pointer does not scroll in WKWebView, a click does (TimeZoom, outside this boundary).
- `styles/roadmap.css` keeps the old stage-detail rules, now unused (outside this boundary).
- No fixture initiative has waves and no roadmap; that state is covered in vitest only.
- 0100 ruled 2026-10-06; launches when usage-view is in done/.
- supervisor sup48, spawned by the FSE 2026-10-06.
