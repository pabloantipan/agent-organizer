---
title: "The no-client group reads No client and is the app's by key, not by name"
status: now
repos: [organizer]
branch: lf77-no-client
seat: l77-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf77-no-client, gate met (G1, V1-V5, S1, X0 pass; AR40-AR42 shown by AX, UI review to confirm), 6cfe014a"
depends_on: [lf74-comma-other, lf75-fixture-stop]
boundary: ["internal/model/model.go", "internal/model/", "frontend/wailsjs/", "frontend/src/lib/", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/components/", "testdata/fixture-overlay/", "scripts/floating-icon-by-hand.sh"]
spec: "docs/specs/leftovers-77.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-77.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No client name ever joins or doubles the app's own No client group, and its rename field shows what its header shows.

## Gate
docs/specs/leftovers-77.md, rows G1, V1-V5, S1, AR40-AR42 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #66, #68, #70).
- Merge target: `main` through talos-lab's PR.
- Tests: go test beside model.go; vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old `Other` (the boundary's components entry, for that only).
- Design: Aglaea's 5958a02; anything else to the FSE.
- The field name and value are `seed: "no-client"`; no other value exists.
- Short-sample fallback: the existing fixtures; a client `other` and initiatives with no client are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon in the UI review.

## Done
- l77-build, 2026-11-08: built on `lf77-no-client` from origin/main 85cf237a (unchanged at the last fetch): 3d939e14 FR-1, 7b802507 FR-2/3/5, 05dd3485 FR-4, fb6090e0 FR-6, 6cfe014a fixture. G1 and V1-V5 fail on 85cf237a and pass on the branch; S1 ok; AR40-AR42 by AX of the review build's own pid at 1024x640 (window on screen, not offscreen); X0 passes from a clean clone. Evidence and the reviewer's commands: `.wt-notes/l77-build/progress.md`.

## Declared changes
- modified `internal/model/model.go:Group`: gains `Seed` (json `seed,omitempty`), the seeded group's key
- modified `internal/model/model.go:Regroup`: carries `Seed`
- modified `internal/model/order_test.go`: G1
- modified `frontend/wailsjs/go/models.ts`: regenerated, `seed?` on `model.Group`
- deleted `frontend/src/lib/groupName.ts`: renamed to `railGroup.ts`
- deleted `frontend/src/lib/groupName.test.ts`: renamed to `railGroup.test.ts`
- added `frontend/src/lib/railGroup.ts`: `railGroupLabel`, `NO_CLIENT` (`No client`), `SEED_NO_CLIENT`, `clientGroups` (seed keyed), `renameGroup` (FR-3 save rule), `savedGroups` (FR-4)
- added `frontend/src/lib/railGroup.test.ts`: V1-V5
- modified `frontend/src/components/Rail.tsx`: sections carry the seed; the head, its fold and actions names and the rename field read `railGroupLabel`; `rename` through `renameGroup`; `persist` through `savedGroups`; `groupByClient` comment
- modified `frontend/src/components/FloatList.tsx:labelGroups`: added, the view with groups named as the rail shows them, fed to `floatList`
- modified `frontend/src/components/FloatList.tsx:FloatSections`: draws the section name as given, in text and `aria-label`
- modified `frontend/src/components/Rail.lf74.test.tsx`: its lf74 V3 block asserted the old `Other`; now the seed's names and the rename field (V3 render)
- modified `frontend/src/components/FloatList.test.tsx`: its lf74 V3 block asserted the old `Other`; now the float list's V2
- modified `scripts/floating-icon-by-hand.sh`: cleanup runs `scripts/fixture-home.sh stop "$FIXTURE_DIR"` instead of `kill $FIXTURE_AGENT_PIDS`
- added `testdata/fixture-overlay/init-other`, `init-other-cap`, `init-loose`, `init-solo`: clients `other`, `Other` and two with none, for AR40-AR42
- modified `testdata/fixture-overlay/README.md`: says why they are there
Risky:
- `savedGroups`: rewrites a person's own group named `other`/`Other` that holds only no-client initiatives into the seed on the next save (FR-4 as written); a group with an initiative the board does not know is left alone
- `Rail.tsx:persist`: every rail save now goes through `savedGroups`, which keeps only name, initiatives and seed (as before, plus seed)
- the overlay's four initiatives show in every fixture-home mode (rail, Home, counts); `--groups` still ends with ccint by their card dates
Not changed, on purpose:
- `frontend/src/lib/floatList.ts`: outside the boundary; `FloatList.tsx` labels the groups before calling it
- `internal/service/service.go:SetGroups`, `app.go`, the store: they pass groups through; `Regroup` keeps the seed
- `frontend/src/lib/review.ts:groupName`: a different helper; the rail's is now `railGroupLabel`
