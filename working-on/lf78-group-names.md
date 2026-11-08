---
title: "No rail group reads like another, and a blank client is no client"
status: now
repos: [organizer]
branch: lf78-group-names
seat: l78-build
reviewer: l78-rev
review:
stage:
updated: 2026-11-08
next: "review: lf78-group-names, gate met (G1, V1-V5, X0 pass; AR43-AR45 to the UI reviewer, screen was locked), 7cbcbfa8"
depends_on: [lf77-no-client]
boundary: ["frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/components/", "frontend/src/styles/global.css", "internal/scan/scan.go", "internal/scan/", "testdata/fixture-overlay/"]
spec: "docs/specs/leftovers-78.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-78.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Two rail groups never read alike, a rename never stores a duplicate, and a blank client is no client.

## Gate
docs/specs/leftovers-78.md, rows G1, V1-V5, AR43-AR45 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #72).
- Merge target: `main` through talos-lab's PR.
- Tests: go test beside scan.go; vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old behaviour.
- Design: Aglaea's e7131dd6; the refusal line's words are `A group is already called <label>.`; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a client `No client`, a client of spaces and an initiative with none are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.

## Done
- l78-build, 2026-11-08: FR-1 to FR-5 on `lf78-group-names` (a959de6d scan trim, f469ddbe rail labels/rename/save, 7cbcbfa8 fixture), on origin/main d832cc8a; G1 and V1-V5 fail on d832cc8a and pass on the branch; X0 passes in a clean clone; AR43-AR45 not self-checked (screen locked, AX found no web area): steps for the UI reviewer in `.wt-notes/l78-build/progress.md`.

## Declared changes
- modified `internal/scan/scan.go:ReadInitiative`: trims `client` after decoding initiative.yaml (FR-4)
- added `internal/scan/client_test.go`: G1
- modified `frontend/src/lib/railGroup.ts:railGroupLabel`: takes the groups it stands among; the seed reads `Initiatives with no client` beside a group called `No client` (FR-1)
- added `frontend/src/lib/railGroup.ts:NO_CLIENT_LONG`, `takenBy`, `takenLine`: the long label, the other group a name is taken by, and the refusal line (FR-1, FR-2)
- modified `frontend/src/lib/railGroup.ts:renameGroup`: refuses a taken name; the seed renamed `No client` stores an empty name (FR-2, FR-3)
- modified `frontend/src/lib/railGroup.ts:savedGroups`: merges legacy `other`/`Other` and any second seed into one seed (FR-5)
- modified `frontend/src/lib/railGroup.ts:clientGroups`: trims clients, for snapshots scanned before FR-4
- modified `frontend/src/lib/railGroup.test.ts`: V1-V4 and FR-4 rows added
- modified `frontend/src/components/Rail.tsx:Rail`: label call with the stored groups; `refused` state; rename keeps the field open on a taken name (FR-1, FR-2)
- modified `frontend/src/components/Rail.tsx:RenameField`: `refused` prop, the line in a live region, `aria-invalid`, `aria-describedby`; added type `Refusal`
- added `frontend/src/components/Rail.lf78.test.tsx`: V1 (rail and float list), V5
- modified `frontend/src/components/FloatList.tsx:labelGroups`: label call with the groups (FR-1)
- modified `frontend/src/styles/global.css`: `.rail-rename`, `.rail-rename-line` (tier-2 `--danger`)
- added `testdata/fixture-overlay/init-named-noclient/`, `testdata/fixture-overlay/init-blank-client/`; modified `testdata/fixture-overlay/README.md`: the clients AR43-AR45 need
Risky:
- `savedGroups`: runs on every save; a stored seed after a legacy `other` moves the legacy members to the seed's place
- `Rail.tsx:rename`: on blur with a taken name the field stays open after focus left it
Not changed, on purpose:
- `internal/model/model.go`, `internal/service/`, the store: the trim is in the scan, the save path is the rail's `persist`
- `Rail.lf74.test.tsx`, `FloatList.test.tsx`: their asserts still hold (label with no `among` reads as before)
