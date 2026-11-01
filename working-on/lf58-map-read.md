---
title: "Deltagos reads an initiative's C4 map.json and each level's mermaid source"
status: now
repos: [organizer]
branch: lf58-map-read
seat: l58-read
stage:
updated: 2026-11-01
next: "review: lf58-map-read, gate met (R1, R2, X0 pass), d395b7f"
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
