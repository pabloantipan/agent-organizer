---
title: "One space after every comma, and the app's own group label as Other"
status: next
repos: [organizer]
branch: lf74-comma-other
seat: l74-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf74-comma-other, gate met (V1-V4, AR39, AR40, X0), 74a2c421"
depends_on: [lf73-inline-names]
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/lib/", "frontend/src/components/RunTracks.test.tsx", "frontend/src/components/RunTracks.lf73.test.tsx", "frontend/src/components/FloatList.test.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-74.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-74.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A comma list reads with one space after each comma, and the app's own group label reads Other.

## Gate
docs/specs/leftovers-74.md, rows V1-V4, AR39, AR40 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #64).
- Merge target: `main` through talos-lab's PR.
- A stored group named exactly `other` reads `Other`; the stored value is never rewritten (FR-2, accepted cost).
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old text or rules (the boundary's last entry, for that only).
- Design: Aglaea's 43ab477; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a group named other, one named misc, and a left list of link, not-cut item, link are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and measurements under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon in the UI review: it activates the app over Pablo's work.

## Done
- l74-build, 2026-11-08: FR-1 b1b37dfc, FR-2 + FR-3 74a2c421 on lf74-comma-other (on origin/main 127b35c, not pushed); V1-V4 fail on 127b35c and pass; AR39 (comma to next glyph 6 vs 5 pt, main 10 vs 5) and AR40 (`Other`, renamed `misc`, stored `other` reads `Other`) by AX of the review build's own pid at 1024x640; X0 passes from a clean clone. Evidence and the reviewer's steps: `.wt-notes/l74-build/progress.md`.

## Notes
- No fixture change: the factory-report contract orders `left` as open cards then `to_cut`, so "link, not-cut item, link" never occurs; `d, e, f (not cut)` holds both cases AR39 compares (comma before a link, comma before plain text).

## Declared changes
- modified `frontend/src/styles/runreport.css`: adds `.rt-comma + .rr-card { margin-inline-start: calc(-1 * var(--space-1)) }` (FR-1, AR39); `.rr-card + .rt-comma` kept
- added `frontend/src/lib/groupName.ts`: `groupName` (stored `other` reads `Other`), `NO_CLIENT`, `clientGroups` (the Group by client seed, no-client into `Other`) (FR-2)
- added `frontend/src/lib/groupName.test.ts`: V2
- modified `frontend/src/components/Rail.tsx:Rail`: `groupByClient` seeds through `clientGroups`; the group head shows `groupName(s.name)` in its name, chevron label and actions name; the rename field keeps the stored name; doc comment reads `Asleep · n`, `Archived · n` (FR-2, FR-3)
- modified `frontend/src/components/FloatList.tsx`: added `FloatSections` (the sections' map, moved out so it renders statically), group label and aria-label through `groupName`; `FloatFolds` doc comment reads `Asleep · n`, `Archived · n` (FR-2, FR-3)
- modified `frontend/src/components/RunTracks.test.tsx`: V1
- added `frontend/src/components/Rail.lf74.test.tsx`: V3 (rail), V4
- modified `frontend/src/components/FloatList.test.tsx`: V3 (float list); the fold test's title reads `Asleep · n` (FR-3)
Risky:
- `.rt-comma + .rr-card`: the link's box now starts 4 px earlier, 2 px over the comma's frame (AX: comma @1362 4w, `e` @1364); the inset ring (AR35, 2 px in) may touch the comma, never a name, as it already may on the link's end side
- `groupName`: a person who typed exactly `other` reads `Other` (FR-2's accepted cost)
Not changed, on purpose:
- the stored group names: never rewritten; the rename field opens on the stored value
- `frontend/src/lib/floatList.ts`: sections keep the stored name; only the display maps it
- `testdata/fixture-report/launch.sh`: no state was missing (see Notes)

