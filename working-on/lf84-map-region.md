---
title: "The map reader draws each level's own diagram from a shared page"
status: now
repos: [organizer]
branch: lf84-map-region
seat: l84-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "review: lf84-map-region, gate met (R1-R4, X0), 87bc0bd2"
depends_on: []
boundary: ["internal/service/map.go", "internal/service/map_test.go", "testdata/fixture-map/", "CLAUDE.md"]
spec: "docs/specs/leftovers-84.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-84.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Every map level draws its own diagram, even when several levels share a page.

## Gate
docs/specs/leftovers-84.md, rows R1-R4 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: go test beside map.go (`go test ./internal/service/ -run TestMap`); X0 is `make test` with CONTRACTS_DIR.
- Design: n/a, no screen change; the refusal words are FR-2's.
- Short-sample fallback: a new two-container variant under `testdata/fixture-map/`; the harbor fixtures stay as they are.
- Data shape across states: c4-map/1.
- Evidence: test output in the card's Done line.
- Retention: n/a.

## Done
- 2026-11-08 l84-build: branch `lf84-map-region` at 87bc0bd2 on origin/main 513db0c6 (2969944c fixture, be149a4e reader, 87bc0bd2 CLAUDE.md). R1 `TestMapRegions` and R3 `TestMapRegionRefuses` fail on 513db0c6 (both modules levels drew the outside block; four refusals came back drawn) and pass on the branch; R2 `TestMap*` green with CONTRACTS_DIR (contract not skipped); R4 grep hits; X0 from a clean clone: make test exit 0 (Go ok, vitest 1798 passed), wails build exit 0, porcelain empty, diff inside the boundary. origin/main's real two-region modules.md draws each container's own block. Commands and logs: `.wt-notes/l84-build/progress.md`.

## Declared changes
- modified `internal/service/map.go:ReadMap`: each level's block comes from `levelBlock`, refusal line passed through
- added `internal/service/map.go:regionKey`: the marker `<level>` of a map level (`modules <container>`, else the level)
- added `internal/service/map.go:marker`: reads a `<!-- c4-map:begin|end <key> -->` line
- added `internal/service/map.go:levelBlock`: the block inside the level's region, else the page's first; FR-2's two refusals
- modified `internal/service/map.go`: doc comments of the file and `MapLevelSource` say region, else first
- modified `internal/service/map_test.go`: added `TestMapRegions` (R1), `TestMapRegionRefuses` (R3), `TestLevelBlock`
- added `testdata/fixture-map/harbor-two-modules/`: the two-container variant (modules.md with two regions after an outside block, map.json with both modules levels)
- modified `testdata/fixture-map/README.md`: one row naming the new variant
- modified `CLAUDE.md`: the Map reader line (region, else first; FR-2's lines; the new fixture)
Risky:
- `levelBlock`: a page whose markers c4-map did not write (odd spacing, an unclosed region) is read leniently: spacing collapses, an unclosed region runs to the page's end
Not changed, on purpose:
- `firstMermaid`: unchanged, now also applied to a region
- `testdata/fixture-map/harbor*`: the existing fixtures stay as they are (R2)
- `docs/architecture/`: read as an extra check, not edited

## Notes
- The reader does not compare a block's `%% c4: <level>` line with its level; possible, out of this spec.
