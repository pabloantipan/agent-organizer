---
title: "Deltagos reads an initiative's C4 map.json and each level's mermaid source"
status: now
repos: [organizer]
branch: lf58-map-read
seat: l58-read
stage:
updated: 2026-11-01
next: "PR with talos-lab"
review: pass
reviewer: l58-read-rev
depends_on: []
boundary: ["internal/service/map.go", "internal/service/map_test.go", "app.go", "frontend/wailsjs/", "testdata/fixture-map/", "CLAUDE.md"]
spec: "docs/specs/leftovers-58.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
The map lens has one reader, refusing any map it cannot draw whole.

## Gate
docs/specs/leftovers-58.md, rows R1, R2 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Fixture: `testdata/fixture-map/` from the contract's harbor files (specs 54cf10d or later), plus the three variants the spec names; lf58-map-read creates it, the others read it.
- Short-sample fallback: a state the fixture lacks is added as a variant beside it; never the real home, never skipped.
- Data shape across states: c4-map/1 as `contracts/c4-map/map.schema.json` gives it; Deltagos stores nothing but the diagram cache it already keeps.
- Tests: Go in `internal/service/map_test.go`; vitest beside the new lib and components (`cd frontend && npm test`).
- Design questions: Aglaea's map-and-roadmap Amendments 1 and 2 answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and review-build shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-01 l58-read: map reader, App.Map, fixture testdata/fixture-map/ (harbor, harbor-ruled, harbor-ungrounded, harbor-v2, harbor-nomap; recipe `eval "$(testdata/fixture-map/home.sh)"`); R1, R2 fail on base (undefined: ReadMap) and pass on the branch; X0 passes from the clean clone. Branch lf58-map-read rebased on origin/main bf66580, head d395b7f, not pushed. Detail in .wt-notes/l58-read/progress.md.

## Declared changes
- added `internal/service/map.go`: `Service.Map`, `ReadMap`, `firstMermaid`, `mapRoot`, types `MapResult`, `MapLevelSource`, `C4Map`, `C4Level`, `C4Node`, `C4Edge`, `C4Evidence` (FR-1 to FR-3)
- added `internal/service/map_test.go`: R1 (TestMapFixture, TestMapFixtureVariants, TestMapContract) and R2 (TestMapRefuses, TestMapRemote, TestFirstMermaid)
- modified `app.go:Map`: the binding only
- modified `frontend/wailsjs/go/main/App.d.ts`, `frontend/wailsjs/go/main/App.js`, `frontend/wailsjs/go/models.ts`: regenerated for App.Map and its types
- added `testdata/fixture-map/`: harbor (the contract's map byte for byte plus claudecode's context.md), four variants, README with the pin, `home.sh` (the review build's home)
- modified `CLAUDE.md`: one Layout line for the map reader
Risky:
- `C4Map`: strict decode (DisallowUnknownFields) refuses a c4-map/1 file carrying a field the schema lacks; the schema says additionalProperties false, so a writer adding one should bump the schema
- `C4Map.Inputs`: a Go map, so re-encoding sorts its keys; equality with map.json is by JSON value, not bytes
Not changed, on purpose:
- `scripts/fixture-home.sh`: outside the boundary; the recipe lives in `testdata/fixture-map/home.sh`
- `internal/diagram`, `frontend/src/`: other cards'

## Notes
- Wails emits `export class string` for `map[string]*string`; `ts_type` tags give `Record<string, string | null>` and `string | null` for kind, parent, status.
- The fixture's roots list no `repos:`, so `repo harbor-api@…` grounding points at a repo that is not there; the lens decides what opening it does then.

## Review
- Verdict: **pass**. Unmet gate items: none (R1, R2, X0 met). Reviewer `l58-read-rev`, 2026-11-01, on d395b7f (branch `lf58-map-read`, rebased on origin/main bf66580), from a fresh clean clone. Test run fresh, not reused: `test-lease run --share -- make test` queued and ran (go all ok, vitest 89 files / 1431 tests), exit 0.
- `change-check organizer lf58-map-read` (base cd4bdc03d, local main; the branch's merge-base is bf66580, the four commits are the same):
  `14 flags: outside boundary 0, outside footprint 0, undeclared 8, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 6, could not read 0, boundary unreadable 0`.
  - undeclared ×8 (`App.js:Map`, `models.ts:C4Evidence, C4Edge, C4Level, C4Node, C4Map, MapLevelSource, MapResult`): generated symbols inside files declared by file bullet ("regenerated for App.Map and its types"); X0's `wails build` regenerates them and `git status --porcelain` stays empty, so they are generated, not hand-written. Explained.
  - untested? ×6: the four `models.ts` classes are generated TS (exercised through the Go types in `map_test.go`); `mapRefused` is called by every R2 refusal and `Service.mapRoot` by `TestMapRemote` (remote, local wins, unknown). Explained.
- R1: `CONTRACTS_DIR=…/sup103/specs/contracts go test ./internal/service/ -run 'TestMap|TestFirstMermaid' -v`: TestMapFixture, TestMapFixtureVariants, TestMapContract (not skipped), TestMapRefuses, TestMapRemote, TestFirstMermaid all PASS. Index re-encodes to map.json by JSON value (fixture and `$CONTRACTS_DIR/c4-map/expected.json`); every schema field is a struct field, decode is strict, schema has `additionalProperties: false` throughout, so nothing is dropped. Sources compared to blocks written by hand in the test. Code read: only the first ```mermaid block is taken; nothing else of the page is parsed.
- R2: lines exact as FR-2/FR-3 (`Map not drawn: map.json is c4-map/2; this Deltagos reads c4-map/1`, `Map not drawn: the map is read on odyssey`); missing file is `state: empty`, encoded `{"state":"empty"}`, distinct from refusal and from error; not-JSON and no-block are `Map not drawn: <reason>`; every refusal asserts `Index` and `Levels` nil. Remote is refused before any path is read.
- Fails on main: the new `map_test.go` plus fixture over bf66580's code: `undefined: ReadMap`, `undefined: C4Evidence`, `undefined: MapResult` … build failed.
- X0 from the clean clone: `make test` exit 0, `wails build` exit 0, `make review-build` exit 0 (`built build/bin/Deltagos Review.app`), `git status --porcelain` empty (wailsjs runtime untouched).
- `App.Map` in `app.go` is the binding only (nil-service guard, then `a.svc.Map`).
- Fixture: `harbor` map.json, containers.md, modules.md `cmp`-equal to the contract's expected files at ca14f12 (contains 54cf10d); `context.md` `cmp`-equal to claudecode 92890ed `tests/c4-map/fixture/docs/architecture/context.md`, source named in the README. Variants checked by diff against harbor: `harbor-ruled` (ledger `ruled`, grounding `record 0002`, record file present; web `retiring`), `harbor-ungrounded` (mail_relay kind/status null, `grounding: []`), `harbor-v2` (`schema: c4-map/2`), `harbor-nomap` (no docs/architecture). `git check-ignore -v` prints nothing for every file under `testdata/fixture-map/`.
- Recipe: `eval "$(testdata/fixture-map/home.sh)"`, launch the review build by its path, pid saved, killed by that pid: works; the app scanned the five initiatives (state.json) and opened its window ("Deltagos Review", CGWindowList by pid). Reading the window by AX of that pid returned no contents (the AX `AXWindows` entries resolve to the application element, 0 nodes beneath), and identically for the same build under the repo's `scripts/fixture-home.sh`, so it is this machine's AX, not the recipe. Note → lf58-map-lens: its M rows read by AX; its reviewer should check the AX dump works before starting.
- Note (not a finding, no gate item): `{"schema": 5}` or a top-level array is refused as `map.json is not JSON: json: cannot unmarshal …`, though it is JSON; the line format holds. A level page that is a symlink is followed outside `docs/architecture/` (the `IsLocal` check is lexical). Both are the owner's own files; no destination needed unless the FSE wants a reader follow-up.
- Card Notes' "repo grounding points at a repo that is not there" → lf58-map-lens (the lens decides what opening it does; M3 runs against a stub).
