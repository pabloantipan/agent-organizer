---
title: "A refused rename shows, says the way out, and is heard every time"
status: now
repos: [organizer]
branch: lf79-refused-field
seat: l79-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf79-refused-field, V1-V3 and X0 pass, AR46-AR48 to the UI reviewer (screen locked), 6220c78f"
depends_on: [lf78-group-names]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-79.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-79.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A refused group rename is marked, says how to leave, and is announced every time.

## Gate
docs/specs/leftovers-79.md, rows V1-V3, AR46-AR48 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #74).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`), fake timers for V3; there is no DOM test library, so "stays open" and "Escape closes" are UI rows; a test outside the named files may change only where it asserts the old line.
- Design: Aglaea's fa0d4ca0 and the design system's "Refused field"; the words are FR-2's; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.

## Done
- 2026-11-08 l79-build: FR-1 to FR-3 on `lf79-refused-field` (7dae2859, b091e21a, 6220c78f) on origin/main a9890871. V1-V3 fail on a9890871 (7 of 10 cases) and pass on the branch; X0 passes in a clean clone. AR46-AR48 not self-checked (screen locked); steps in `.wt-notes/l79-build/progress.md`.

## Declared changes
- modified `frontend/src/lib/railGroup.ts:takenLine`: takes the current name and adds `Type another name, or press Escape to keep <current>.` (FR-2)
- modified `frontend/src/components/Rail.tsx:Rail`: passes the group's shown label as the current name; owns an sr-only live region (`useLiveRegion`) in both navs and says the line on every refusal (FR-2, FR-3)
- added `frontend/src/components/Rail.tsx:holdsRefused`: the field is invalid only while its value is the refused text (FR-1)
- modified `frontend/src/components/Rail.tsx:RenameField`: tracks its value; `aria-invalid` follows `holdsRefused`; the visible line loses `role`/`aria-live` (FR-1, FR-3)
- modified `frontend/src/styles/global.css`: `.rail-group-name-input[aria-invalid="true"]` 2 px `--status-blocked`, padding 0 5px (FR-1)
- added `frontend/src/components/Rail.lf79.test.tsx`: V1, V3
- modified `frontend/src/lib/railGroup.test.ts`: V2; leftovers-78 V2's two old-line asserts
- modified `frontend/src/components/Rail.lf78.test.tsx`: V5's old-line asserts only (line text, no role/aria-live)
Risky:
- `RenameField`: value tracked by `onChange`; a value set without an `input` event would not clear the mark
- `Rail`: the region is a direct child of `nav.rail` (positioned scroller); a layout test counting nav children would see one more
Not changed, on purpose:
- `frontend/src/lib/liveRegion.ts`: `useLiveRegion` already empties and sets 100 ms later; no new announcer
- `.rail-rename-line:empty { display: none }`: the visible line is no longer the live region
- `FloatList.tsx`, the store, Go: outside the boundary and not needed

