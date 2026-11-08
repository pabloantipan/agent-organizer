---
title: "The map reader draws each level's own diagram from a shared page"
status: now
repos: [organizer]
branch: lf84-map-region
seat: l84-build
reviewer: l84-rev
review: "pass at 549c092f: R1-R4 (with Amendment 1) and X0 met (l84-rev, 2026-11-08)"
stage:
updated: 2026-11-08
next: "PR with talos-lab"
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
- 2026-11-08 l84-build, round 2 (l84-rev's fail at 87bc0bd2): unclosed regions are refused, per the FSE's leftovers-84 Amendment 1, which overrode my first pick of ending an open region at the next begin. A region not closed before the next `c4-map:begin` or the page's end is `Map not drawn: <page>'s <level> region is not closed` (822309d6; CLAUDE.md's line names it, 549c092f). R3 adds three cases (`TestMapRegionRefuses`: not closed before another level's begin, which is l84-rev's input; the same with its own block; not closed before the page's end), and `TestLevelBlock` adds three rows. l84-rev's probe file reruns: both unclosed probes now refuse with that line, and the organizer's own map is still drawn. R1-R3 pass with CONTRACTS_DIR. X0 from a clean clone at 549c092f: make test exit 0 (19 Go packages ok, vitest 1798 passed), wails build exit 0, porcelain empty, `git diff --name-only 513db0c6` lists only CLAUDE.md, map.go, map_test.go and testdata/fixture-map/. Branch rebased on origin/main 513db0c6 (unchanged). Logs: `.wt-notes/l84-build/*round2*`.

## Declared changes
- modified `internal/service/map.go:ReadMap`: each level's block comes from `levelBlock`, refusal line passed through
- added `internal/service/map.go:regionKey`: the marker `<level>` of a map level (`modules <container>`, else the level)
- added `internal/service/map.go:marker`: reads a `<!-- c4-map:begin|end <key> -->` line
- added `internal/service/map.go:levelBlock`: the block inside the level's region, else the page's first; FR-2's two refusals and Amendment 1's not-closed refusal
- modified `internal/service/map.go`: doc comments of the file and `MapLevelSource` say region, else first
- modified `internal/service/map_test.go`: added `TestMapRegions` (R1), `TestMapRegionRefuses` (R3), `TestLevelBlock`
- added `testdata/fixture-map/harbor-two-modules/`: the two-container variant (modules.md with two regions after an outside block, map.json with both modules levels)
- modified `testdata/fixture-map/README.md`: one row naming the new variant
- modified `CLAUDE.md`: the Map reader line (region, else first; FR-2's and Amendment 1's lines; the new fixture)
Risky:
- `levelBlock`: runs of spaces inside a marker collapse to one (c4-map writes single spaces); an unclosed region is refused (Amendment 1), never read leniently
- `levelBlock`: a key both left open and repeated reads "two <level> regions", the two-regions check coming first
Not changed, on purpose:
- `firstMermaid`: unchanged, now also applied to a region
- `testdata/fixture-map/harbor*`: the existing fixtures stay as they are (R2)
- `docs/architecture/`: read as an extra check, not edited

## Notes
- The reader does not compare a block's `%% c4: <level>` line with its level; possible, out of this spec.

## Review
- Verdict: **pass** (round 2). Unmet: none.
- Round 1: fail at 87bc0bd2, an unclosed region drew the next region's block (FR-1); answered by Amendment 1 (c2726d4c) and 822309d6.
- Reviewer l84-rev, 2026-11-08, commit 549c092f (on origin/main 513db0c6), fresh clone of origin plus the builder's branch.

**change-check** (`--base origin/main`): 10 files, 1 flag: `untested? map.go regionKey`. Explained: exercised through `ReadMap` by `TestMapRegions` (both `modules <container>` keys) and the harbor/contract tests (`context`, `containers`). Outside boundary 0, undeclared 0, declared not changed 0.

**Rows**
- R1 pass: `TestMapRegions` PASS; DeepEqual against two different hand-written blocks, each its own region's. On 513db0c6 (old map.go, new test and fixture): FAIL.
- R2 pass: with CONTRACTS_DIR every `TestMap*` PASS, `TestMapContract` not skipped; `git diff --stat 513db0c6..549c092f -- testdata/fixture-map/` is only `harbor-two-modules/` and the README row.
- R3 pass: `TestMapRegionRefuses` 7/7 PASS, including Amendment 1's three cases (`modules.md's modules harbor_api region is not closed` before another begin, with or without its own block; `modules.md's modules web region is not closed` at the page's end), every refusal with Index and Levels nil. On 513db0c6 all seven FAIL (state drawn).
- R4 pass: the CLAUDE.md diff is the Map reader line only; it names the marker region, else the first block, and FR-2's three lines.
- X0 pass: `test-lease run --share -- make test` exit 0 (Go ok, vitest 1798 passed), `test-lease run -- make review-build` exit 0, `git status --porcelain` empty, the diff touches only map.go, map_test.go, testdata/fixture-map/, CLAUDE.md. Dependencies through `test-lease run -- pnpm install --frozen-lockfile` (the frontend is pnpm; `npm ci` has no lockfile to read).

**Probes** (throwaway test, removed; `.wt-notes/l84-rev/zz_l84rev_test.go.txt`, output `probes-r2.txt`)
- Round 1's input (harbor_api left open, then web's region): refused `modules.md's modules harbor_api region is not closed`; same with harbor_api's own block before web's begin. Fixed.
- Organizer's own `docs/architecture/` on origin/main: each modules source is `flowchart LR` / `%% c4: modules <its container>`, neither holds the other's. No markers: first block. Extra spaces in markers: read right. End marker before begin: right blocks. Containers level beside a modules block: its region's block.
- Note (goes to the FSE, leftovers-84 spec): FR-1's fallback still takes the page's first block when it sits in another level's region (modules.md with only `modules web` → harbor_api draws web's block; context.md whose first block is in a `modules x` region draws it). Spec-conformant; an amendment could skip blocks inside other regions.
- Note (goes to the FSE, optional follow-up card): a marker line inside a plain ``` fence counts as a marker (a fenced `begin modules harbor_api` example gives "two modules harbor_api regions"). c4-map never writes that.
