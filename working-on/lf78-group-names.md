---
title: "No rail group reads like another, and a blank client is no client"
status: now
repos: [organizer]
branch: lf78-group-names
seat: l78-build
reviewer: l78-rev
review: "pass, code gate (G1, V1-V5, X0) met at 7cbcbfa8; l78-rev 2026-11-08; AR43-AR45 to l78-ui"
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

## Review
Verdict: **pass** (code gate). Unmet rows: none of G1, V1-V5, X0. AR43-AR45 are l78-ui's.
Reviewer: l78-rev, 2026-11-08. Commit reviewed: 7cbcbfa8 (on origin/main d832cc8a), fresh clone of origin + fetch of the local branch; base clone at d832cc8a with the three new test files laid over. Logs in `.wt-notes/l78-rev/`.

change-check (`change-check organizer lf78-group-names --base origin/main`):
```
change-check: working-on/lf78-group-names.md
risk: medium (missing, read as medium)
repo organizer: base d832cc8a1 (--base origin/main) ... head lf78-group-names (clone HEAD 7cbcbfa88, on detached) 7cbcbfa88; 13 files, 3 flags; read in /Users/pabloantipan/organizer/.wt-notes/l78-rev/clean

## Changed

- organizer/frontend/src/components/FloatList.tsx (modified): labelGroups
- organizer/frontend/src/components/Rail.lf78.test.tsx (added, test)
- organizer/frontend/src/components/Rail.tsx (modified): Rail, RenameField, Refusal
- organizer/frontend/src/lib/railGroup.test.ts (modified, test)
- organizer/frontend/src/lib/railGroup.ts (modified): railGroupLabel, same, isSeed, clientGroups, takenBy, takenLine, renameGroup, savedGroups
- organizer/frontend/src/styles/global.css (modified)
- organizer/internal/scan/client_test.go (added, test)
- organizer/internal/scan/scan.go (modified): ReadInitiative
- organizer/testdata/fixture-overlay/README.md (modified, test)
- organizer/testdata/fixture-overlay/init-blank-client/working-on/initiative.yaml (added, test)
- organizer/testdata/fixture-overlay/init-blank-client/working-on/one-card.md (added, test)
- organizer/testdata/fixture-overlay/init-named-noclient/working-on/initiative.yaml (added, test)
- organizer/testdata/fixture-overlay/init-named-noclient/working-on/one-card.md (added, test)

covered by a mention: organizer/frontend/src/components/Rail.tsx Refusal (`Refusal` in a why)

## Tests touched

- organizer/frontend/src/components/Rail.lf78.test.tsx
- organizer/frontend/src/lib/railGroup.test.ts
- organizer/internal/scan/client_test.go
- organizer/testdata/fixture-overlay/README.md
- organizer/testdata/fixture-overlay/init-blank-client/working-on/initiative.yaml
- organizer/testdata/fixture-overlay/init-blank-client/working-on/one-card.md
- organizer/testdata/fixture-overlay/init-named-noclient/working-on/initiative.yaml
- organizer/testdata/fixture-overlay/init-named-noclient/working-on/one-card.md

## Risky (declared)

- `savedGroups`: runs on every save; a stored seed after a legacy `other` moves the legacy members to the seed's place
- `Rail.tsx:rename`: on blur with a taken name the field stays open after focus left it

## Not changed, on purpose (declared)

- `internal/model/model.go`, `internal/service/`, the store: the trim is in the scan, the save path is the rail's `persist`
- `Rail.lf74.test.tsx`, `FloatList.test.tsx`: their asserts still hold (label with no `among` reads as before)

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| undeclared | organizer/frontend/src/lib/railGroup.ts | same | added |
| undeclared | organizer/frontend/src/lib/railGroup.ts | isSeed | added |
| untested? | organizer/frontend/src/lib/railGroup.ts | isSeed | no test file names it |
| declared, not changed |  | frontend/src/lib/railGroup.ts:NO_CLIENT_LONG | no matching change |

4 flags: outside boundary 0, outside footprint 0, undeclared 2, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 1, could not read 0, boundary unreadable 0
```
- undeclared `same`, `isSeed`: module-private helpers in railGroup.ts used only by the declared `railGroupLabel`, `takenBy`, `renameGroup`, `savedGroups`; not a finding.
- declared, not changed `NO_CLIENT_LONG`: it is added (railGroup.ts, exported const); change-check lists function symbols only. Not a finding.
- untested? `isSeed`: exercised through every V1/V3/V4 case. Not a finding.
- outside boundary: 0.

Rows:
- G1: d832cc8a FAIL (`client "  ", want ""`, `client " acme ", want "acme"`); branch PASS.
- V1-V5: d832cc8a 15 of the 15 new cases fail (railGroup.test.ts, Rail.lf78.test.tsx); branch 33/33 pass. V5 is a static render of `RenameField` with the refusal; the field staying open is `Rail.rename` returning before `setEditing(null)`/`persist` (read in the diff).
- X0: `make test` through test-lease `--share`: fresh run 49e6ab0819b729a39b93ce5b7b538f94 (19 Go packages ok, vitest 107 files / 1757 tests); `wails build` ok; `make review-build` ok (`Deltagos Review.app`, cl.antipan.organizer.review); `git status --porcelain` empty before and after the runtime checkout.

Cases the builder's tests lack (scratch tests, removed):
- FR-1: seed beside `\tNO client  ` reads `Initiatives with no client`; a renamed seed (`misc`) beside `No client` reads `misc`. Rail and float list both call `railGroupLabel(g, groups)`; both accessible names come from `shown`.
- FR-2: line names the other group's label, not the typed text (`  aCmE ` vs `Acme` → `A group is already called Acme.`; `initiatives WITH no client` → `…called Initiatives with no client.`). Refusal returns before any `persist`. Own name in another case: a person's `acme` → `ACME` is stored as `ACME`; the seed → `no client` writes nothing. Line is `role="alert" aria-live="assertive"`, `aria-describedby` from the field.
- FR-3: seed beside a client `No client` renamed ` No Client ` is refused by FR-2 (null), so AR44 needs that client group absent. A person's group renamed `No client` while the seed reads `No client` is refused by FR-2 (`A group is already called No client.`); FR-3 is silent on it, FR-2 covers it.
- FR-4: one line, scan.go:134 `strings.TrimSpace`. Clients `"\n"`, `"\t"`, `" \t\n "`, a `|` block of spaces all read `""`, no problem.
- FR-5: legacy `other` holding a client initiative is left alone; `Other`[c] + seed[a] + `other`[b,a] → one seed [a,c,b]; no seed + `Other`[b] + `other`[e (client "  "),c] → one seed [b,e,c]; legacy with an unknown id left alone; two stored seeds → one. `savedGroups` is called only from `Rail.persist`: nothing on read.
- global.css: `.rail-rename`, `.rail-rename-line`, `:empty`; `var(--danger)`, `--font-size-xs`; no oklch, color-mix, nesting or @layer. Fixture overlay adds only `init-named-noclient` (`No client`) and `init-blank-client` (`"  "`), as the Pre-answered list names.

Notes (none blocks):
- Note: two seeds already stored by d832cc8a's `savedGroups` (seed + legacy `other`) both read `No client` until the next save merges them (`railGroupLabel` ignores other seeds). Goes to: the FSE, as a leftovers item if it shows in Pablo's state.
- Note: the alert line is `display:none` while empty (`.rail-rename-line:empty`); whether VoiceOver announces it on first refusal is AR43's to see. Goes to: l78-ui.

