---
title: "Overview's While you were away: the run's rows with their waves, the tracks, the rulings, and Copy as text"
status: now
repos: [organizer]
branch: lf57-run-report
seat: l57-ui
stage:
updated: 2026-11-01
next: "review: lf57-run-report, W1-W6 and X0 pass, W7 needs a seat with Screen Recording (the UI reviewer's), 2f7dccb"
depends_on: [lf57-report-go]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-run-report"]
spec: "docs/specs/leftovers-57.md (FR-7 to FR-13)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
The morning after, Overview shows what moved, which wave moved it and at what cost, what stopped it, where each track is, and what was ruled while Pablo was away.

## Gate
docs/specs/leftovers-57.md, rows W1-W7 and X0.

## Pre-answered
- Base: origin/main at the card's start (the merge target line below names the commit it must include).
- Short-sample fallback: a fixture short of a state gets the state added to the fixture overlay or built from the contract's `make-fixture.sh`; never the real home, never skipped.
- Merge target: `main` through talos-lab's PR; base: origin/main with lf57-report-go merged.
- Tests: vitest beside `RunReport.tsx`, `RunTracks.tsx` and `lib/runReport.ts` (`cd frontend && npm test`), inside the boundary.
- Evidence: review-build shots and AX text under `.wt-notes/<seat>/`.
- Data: the report's JSON as the contract `contracts/factory-report/` (specs 54cf10d, 8474386 content) gives it; every state (no window, one window, waves, no waves, refused remote, factory missing) has a fixture built from `make-fixture.sh` or the contract's `expected*.json`.
- Design questions: Aglaea's `docs/ux/specs/run-report.md` with Amendments 1 and 2 (8d2141a, d9c7a54) and `docs/ux/specs/progress-and-waves.md` option B (0168) answer them; anything else goes to the FSE, which asks the judge-design subagent while Pablo is away.
- Copy as text is checked against the app's own text, never the system pasteboard.
- Overview.tsx: if lf61 has not landed, the change is the mount line only, rebased before review.
- Data shape across states: the report JSON as the factory-report schema gives it; the view stores nothing.
- Retention: n/a.

## Done
- l57-ui built FR-7 to FR-13 on lf57-run-report (2b10006, eb7a85b, 2160482, 2f7dccb), rebased on origin/main bf66580 (lf61 merged). W1-W6 pass and fail on b3905ba; X0 passes from a clean clone. W7 not shot: this seat has no Screen Recording permission (the recipe is in .wt-notes/l57-ui/progress.md).

## Declared changes
- added `frontend/src/lib/runReport.ts`: puts App.Report's JSON in words and order (presets, rows, wave column, cost, tracks, rulings, Copy as text); `runPlace` is the recent rule lf57-home-signal reads
- added `frontend/src/lib/runReport.test.ts`: W6 and the row model over expected.json
- added `frontend/src/components/RunReport.tsx`: the section (window control, caption, rows, disclosure, waves footer, rulings, states, Copy as text, placement)
- added `frontend/src/components/RunTracks.tsx`: Amendment 2's tracks
- added `frontend/src/components/RunReport.test.tsx`: W1, W2, W4, W5
- added `frontend/src/components/RunTracks.test.tsx`: W3 and the 1024 width rules
- added `frontend/src/components/runreport.fixtures/`: the contract's expected.json, expected-windows.json, expected.txt (54cf10d, 8474386), checked against CONTRACTS_DIR when set
- added `frontend/src/styles/runreport.css`: the section's layout, tier-2 tokens
- modified `frontend/src/components/Overview.tsx`: the mount line and its import
- modified `frontend/src/stores/board.store.ts:openWave`: Work with a wave's strip scrolled into view (`waveFocus`, `scrollToWave`)
Risky:
- `openWave`: Work draws a WaveStrip only for a wave with a running card, and names it `wave <n>` from seat names; a report wave that has merged has no strip, so the press lands on Work with nothing scrolled (Notes)
- `.rr-bar.hatch`: hatching is a hard-stop repeating-linear-gradient (stripes, not a colour blend), the only way to draw it without an image
Not changed, on purpose:
- `Board.tsx`, `WaveStrip.tsx`: outside the boundary; the store scrolls to the strip by its label
- `hooks/useWails.ts`: outside the boundary; the components call the generated `App.Report`, `ReportText`, `ReportWindows` directly
- `DecisionsView.tsx`: lf52's line is inline there, not a component; the rulings draw the same anatomy (diamond, number, title, ruler, time, lozenge) and open the record in Decisions with `openDecision`

## Notes
- Report waves vs Work's WaveStrip: the report keys waves `<supervisor>/<wave>` from run records, while Work builds strips from `wave<N>-` seat names and only for running waves. PW4 ("opens Work with that WaveStrip in view") cannot land on a merged wave. Asked sup101 (--kind question).
- Mode-row words come from the picked preset, not from `window.kind`: a picked window is drawn with `@since/@until`, so it always comes back as `given`.
- "Opening the record in the drawer" (§3): Deltagos has no record drawer; the line opens the record in Decisions (`openDecision`), as Overview's gate rows do.
