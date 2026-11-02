---
title: "Every count reads the same, and a focused slug reads whole"
status: now
repos: [organizer]
branch: lf71-count-look
seat: l71-build
reviewer: l71-rev, l71-ui
stage:
updated: 2026-11-02
next: "review: lf71-count-look, gate met (V1 V2 X0 pass; AR33 AR34 for l71-ui), 003c839"
depends_on: []
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/Home.tsx", "frontend/src/components/Overview.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/components/SecCount.test.tsx", "frontend/src/styles/shell.css", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/Home.waits.test.tsx"]
spec: "docs/specs/leftovers-71.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-71.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
One look for every count, and no ring over a glyph.

## Gate
docs/specs/leftovers-71.md, rows V1, V2, AR33, AR34 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build, ring rows by the offscreen Tab harness.
- Design: Aglaea's 25baf46; anything else to the FSE.
- Short-sample fallback: the existing fixtures; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l71-build: FR-1 (5a5f9a6), FR-2 SecCount (ee2403e), stale asserts (003c839); V1 V2 fail on bb7f54d and pass; X0 pass from a clean clone; AR34 states and AR33's 38x24 link checked by AX in the review build; branch at 003c839 on origin/main bb7f54d, not pushed. Reviewer steps: .wt-notes/l71-build/progress.md.

## Declared changes
- modified `frontend/src/styles/runreport.css:.rr-card`: padding-inline 4 px so the inset ring clears the slug's glyphs (FR-1)
- added `frontend/src/components/SecCount.tsx:SecCount`: draws `<title> · N` as one flex item (FR-2)
- added `frontend/src/components/SecCount.test.tsx`: V2, the piece and the hand-written-count scan
- modified `frontend/src/components/Home.tsx`: Needs me and Waiting on others titles use SecCount; one import
- modified `frontend/src/components/Overview.tsx`: the stage title uses SecCount (`Stage N · name`); one import
- modified `frontend/src/components/UsageTable.tsx:UsageRejected`: Not accepted uses SecCount; one import
- modified `frontend/src/components/RunReport.test.tsx`: V1
- modified `frontend/src/components/RunReport.lf64.test.tsx`: the `.rr-card` padding assert follows FR-1 (Amendment 1)
- modified `frontend/src/components/Home.waits.test.tsx`: the Waiting on others heading assert follows SecCount (Amendment 1)
Risky:
- `.rr-card`: every card link (tracks, cards lists, waits) is 8 px wider, so the waits line folds a little sooner into `+N`
- `Overview.tsx` stage title: its count gains class `num` (tabular-nums on a mono face, no visible change)
Not changed, on purpose:
- `frontend/src/styles/shell.css`: the cause is two flex items, fixed in SecCount; `.sec-count` needed no change
- `frontend/src/components/Usage.rejected.test.tsx`: its U10 assert matches SecCount's markup as is

## Notes
- Two tests outside the boundary assert the pre-FR markup: `RunReport.lf64.test.tsx:139` (`.rr-card` `padding: var(--space-1) 0`) and `Home.waits.test.tsx:135` (`Waiting on others · <span…>` as the h3's first text). Asked sup115 to extend the boundary to them.
