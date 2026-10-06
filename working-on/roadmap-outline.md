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
review: pass
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

## Review
- Verdict: pass (code, checks, recorded evidence; the WKWebView visual rows are ro-ui's).
- Commit reviewed: fb184ee1c39ffeae75df48517f2161c3b75df1d1 (branch head at review time).
- Unmet gate items: none.
- X0 from a fresh clone: `XDG_DATA_HOME=$(mktemp -d) make test` rc 0 (Go ok, vitest 334); `npm install && npm test && npm run build` rc 0; `wails build` rc 0.
- Boundary: 8 paths, all inside (StageRoadmap, Roadmap, TimeZoom `fitTo`, new OutlineRows, lib/outline, lib/cardBar, outline.test, styles/outline.css). No Go, no wailsjs.
- In the code: step is `useState(1)`, reset per initiative, no storage; the switch clears chevrons; zoom kept across steps; a dot wave draws on its record date, a wave or round with no times draws nothing (0022); diamonds are buttons named by `decisionName`, open via `openDecision`; outline.css has no oklch, color-mix, nesting or @layer, tier-2 tokens only; the in-flight breathe sits under `no-preference`.
- Findings: (1) the chevron's 100 ms rotate transition is not under the reduced-motion guard, against the States row "nothing animates" (not a gate row). (2) The vitest "back to step 1" case calls a pure function twice and proves nothing; the restore really rests on `setStep` clearing `open`, shown only by the WebKit AX check. (3) Hours at step 3 reads as Days at step 2 and comes back at 3: the spec's "the step never changes the zoom" and "Hours only from step 3" (0070) disagree, and the build took 0070's side; the FSE should write that into the spec. (4) Diamond buttons sit inside `role=tree` outside any treeitem, and ↑↓ pressed on a focused diamond move the row focus. (5) "Every stage is done" at step 1 is in no test and no fixture. (6) `styles/roadmap.css` keeps unused `srm-detail`/`srm-gem` rules: dead weight, harmless, a cleanup card.
- Gate gap: P7's "wraps under Stages" never happens in WebKit at 1024 (the short words fit); it was seen only in Chromium.
- Reviewer: ro-review (reviewer seat), 2026-10-06.
