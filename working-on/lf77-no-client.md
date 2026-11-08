---
title: "The no-client group reads No client and is the app's by key, not by name"
status: now
repos: [organizer]
branch: lf77-no-client
seat: l77-build
reviewer: l77-rev
review: "pass at 6cfe014a: code by l77-rev (G1, V1-V5, S1, X0), UI by l77-ui (AR40-AR42)"
stage:
updated: 2026-11-08
next: "PR with talos-lab"
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

## Review
- **Verdict: pass** (code gate). Unmet rows: none. Reviewer l77-rev, 2026-11-08, commit reviewed 6cfe014a (on origin/main 85cf237a), fresh clone of the GitHub remote. AR40-AR42 are l77-ui's.
- change-check (`--base origin/main`): 21 files, outside boundary 0. Flags explained: `undeclared FloatList.tsx:FloatList` is the one call `floatList(labelGroups(view), …)` (FR-2, declared under `labelGroups`); the six `undeclared` fixture files and the three `declared, not changed` (`init-other-cap`, `init-loose`, `init-solo`) are the declared overlay directories, which change-check does not match to their files; `untested? cleanup` is the zsh script, covered by S1's grep and `bash -n`/`zsh -n` only.
- G1, V1-V5 pass on the branch (22 vitests in the three files; G1 ok). On 85cf237a with the new tests copied in: G1 does not build (`Group has no field Seed`); V1-V4 and the Rail V3 fail behaviourally (9 of 17) with a shim mapping the new names onto base's `groupName`/`clientGroups`; V5 on base: `groupName` exported by `lib/groupName.ts` and `lib/review.ts`, `NO_CLIENT = "Other"`; branch: one `railGroupLabel` export, `NO_CLIENT = "No client"`. S1: no `FIXTURE_AGENT_PIDS` left (base: line 36 kills it); `bash -n` and `zsh -n` ok; the stop is in `cleanup`, trapped on EXIT and reached from INT/TERM via `exit 130`, the same paths as the old kill.
- X0: `make test` fresh (test-lease run 0b9af8f86602c7d56d8acf6c03b73c1f, 1737 vitests, go ok), `wails build` and `make review-build` exit 0, `git status --porcelain` empty before and after (models.ts is what the generator writes).
- Cases beyond the builder's tests: `SetGroups` (service) then `cache.Load` keeps `{"name":"","initiatives":["a","b"],"seed":"no-client"}`; the order document's payload is that JSON (`PushOrder` marshals `model.Order`). Clients `other`, `Other`, `OTHER`, `No client`, `"  "` each get their own unseeded group; only `""` joins the seed. Seed field: ` No client ` writes nothing (trimmed equals the label; FR-3 does not name padding); `no client` is stored as the person's name `no client` (FR-3 "any other text"); `misc` stored. Legacy: saves only (`persist` is called from handlers only; the store's load path calls nothing that saves); an empty `other`/`Other` is left as stored.
- Note (to the FSE, docs/specs/leftovers-77.md follow-up): a client written `No client` gets an unseeded group that reads exactly like the seed; renaming a renamed seed back to `No client` stores the literal name. Both follow FR-2/FR-3 as written.
- Note (to the FSE): a stored seed plus a legacy `other` holding only no-client initiatives saves as two seeded groups (`savedGroups`), FR-4 as written.
- Note (to the FSE): a whitespace-only client (`"  "`) seeds a group with a blank header; the scan does not trim `client`.

## UI review
- **Verdict: pass.** Reviewer l77-ui, 2026-11-08, commit reviewed 6cfe014a, review build (`make review-build` in a detached worktree), at 1024x640, on the window (screen not locked), fixture by `scripts/fixture-home.sh` (ORGANIZER_CONFIG and XDG_DATA_HOME under `/private/tmp/organizer-fixture.TlZU6S`), pid 21269. AX reads, AXPress, AXFocused and AXValue on that pid only, `screencapture -o -l` of its window; no keys, no pointer, nothing pressed on the floating icon. Helpers copied from l77-build's and l74-ui's notes. Evidence in `.wt-notes/l77-ui/`.
- **AR42 met.** After Group by client the rail's heads read `acme`, `personal`, `No client · 2` (init-loose, init-solo), `other · 1` (init-other), `Other · 1` (init-other-cap), `ccint`; no client-named initiative under `No client`. Stored `{"name": "", "initiatives": ["init-loose", "init-solo"], "seed": "no-client"}` beside `other` and `Other`. `shots/1024x640-ar40-ar42-rail-grouped.png`, `ar40-ar42-rail-ax.txt`, `ar40-ar42-stored.txt`.
- **AR40 met.** Head text and both accessible names read `Collapse No client`, `Actions for No client`; renamed through the app's field to `misc`, they read `misc`, `Collapse misc`, `Actions for misc`, stored `{"name": "misc", …, "seed": "no-client"}`. `shots/1024x640-ar40-misc-renamed.png`, `ar40-ar41-misc.txt`. Collapsed rail (the 46 px strip, by its own toggle): no group heads there by design; init-loose and init-solo are named with no client, init-other `other`, init-other-cap `Other` (`shots/1024x640-ar40-strip-collapsed.png`, `ar40-strip-ax.txt`).
- **AR41 met.** Actions for No client → Rename: `AXTextField t="Rename No client" v="No client"`, focused (`shots/1024x640-ar41-field-open.png`, `ar41-open.txt`). Blurred unchanged: head still `No client`, stored name still `""` with the seed (`ar41-unchanged.txt`). Then `misc` as above.
- **Not verified:** the float list. It opens only on the floating icon's `floaticon:list` event (`FloatList.tsx`), and no row may press the icon; covered by `FloatList.test.tsx` V2 only. Base 85cf237a's behaviour on screen was not run (a second build); l77-rev's tests on base show it.
- **Findings:** none at severity 4 or 3. Design system: the branch changes no CSS; heads keep the existing rail head style; `No client` is the app's label in sentence case; `other` and `Other` shown as written.
- Note (severity 1): right after the rename's blur, AX read the old head `No client` once before the rename landed (the save round-trip); the next read showed `misc`. No user-visible flicker was seen in the shot.
- Shared test run: reused, test-lease run 0b9af8f8-3076 of 6cfe014adba9 by organizer-probe-l77-rev (make test, exit 0).
- Spec gaps (for the FSE): none new beyond l77-rev's notes (a client written `No client` reads exactly like the seed).
- For aglaea: none.
