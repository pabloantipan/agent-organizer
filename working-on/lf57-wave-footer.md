---
title: "A finished wave's footer opens its run record over the report"
status: now
repos: [organizer]
branch: lf57-wave-footer
seat: l57-foot
stage:
updated: 2026-11-01
next: "FR-17: an unread run record of a non-active initiative presses onto Home with no unread row (dead press); route it somewhere live and add the case to W9"
review: fail
reviewer: l57-foot-rev
cause: execution
depends_on: [lf57-run-report]
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/components/SpecReader.tsx", "internal/service/spec.go", "internal/service/spec_test.go"]
spec: "docs/specs/leftovers-57.md (Amendment 4, FR-15 to FR-17)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Every wave footer in the report leads somewhere: a finished wave to its run record, a running one to Work.

## Gate
docs/specs/leftovers-57.md Amendment 4 and its addendum: W9, W10, W11, X0.

## Pre-answered
- Base: origin/main with lf57-run-report merged (d4c67af).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); W10 in the review build.
- Design: Aglaea's progress-and-waves Amendment 1 (754615b); anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a fixture without a finished wave's run record gets one added under the fixture's `runs/`; never the real home.
- Data shape across states: `model.Wave` as the scan gives it, with its run record's path.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- l57-foot built it on `lf57-wave-footer` (efec0f2, 45e3699, 957cc37), rebased on origin/main e968fc1; W9, W11 fail on base and pass; W10 checked offscreen over `wails dev` (screen locked); X0 passes from a clean clone. Detail: `.wt-notes/l57-foot/progress.md`.

## Declared changes
- modified `internal/service/spec.go:ReadSpec`: also allows the run records the scan read the waves from (FR-18)
- added `internal/service/spec.go:runRecords`: `runs/<Wave.Record>` for the initiative's waves
- modified `internal/service/spec_test.go`: W11 (`TestW11ReadSpecRunRecords`, `runFixture`)
- added `frontend/src/lib/runReport.ts:waveTarget`: a wave's target, record, unread or work (FR-15, FR-17)
- added `frontend/src/lib/runReport.ts:waveLabel`: supervisor, else key
- added `frontend/src/lib/runReport.ts:waveLinkName`: the link's name and hover (FR-16)
- added `frontend/src/lib/runReport.ts:recordRel`: the report's record relative to the root
- added `frontend/src/lib/runReport.ts:RUNS_DIR`: the scan's runs directory
- added `frontend/src/lib/runReport.ts:WaveTarget`: the target type
- added `frontend/src/lib/runReport.ts:ScanRuns`: what the scan knows of the runs
- modified `frontend/src/components/RunReport.tsx:Nav`: `wave` takes the pressed element; optional `waveTarget`
- modified `frontend/src/components/RunReport.tsx:Progress`: footer name and title by target
- added `frontend/src/components/RunReport.tsx:goToWave`: the press by target (reader, Needs me, Work)
- modified `frontend/src/components/RunReport.tsx:LocalRunReport`: targets from the board's scan waves and problems
- modified `frontend/src/components/RunReport.test.tsx`: W9; W2 reads the first argument of `nav.wave`
- modified `frontend/src/components/SpecReader.tsx:openSpec`: optional `back`, what the drawer opened over
- added `frontend/src/components/SpecReader.tsx:ReaderBack`: ← Back to the file under, else onto the view (closes)
- modified `frontend/src/components/SpecReader.tsx:SpecReader`: ReaderBack in the header, frontmatter as code, focus back without scrolling
- modified `frontend/src/components/SpecReader.test.tsx`: FR-15 Back rows
- added `frontend/src/lib/specReader.ts:frontmatterAsCode`: a leading YAML block as a yaml code block
- modified `frontend/src/lib/specReader.test.ts`: frontmatterAsCode rows
Risky:
- `SpecReader`: focus returns with `preventScroll` for every opener, not only the report's
- `frontmatterAsCode`: applies to any spec starting with a `---` block
Not changed, on purpose:
- `internal/scan/runs.go`: reads `runs/` only; docs/runs records stay unreadable (Notes)
- `stores/board.store.ts:openWave`, `openNeedsMe`: used as they are
- `runPlace`, `latestRun`, `presetsOf`, `seenAtOf`, `markSeen`: untouched (lf57-home-signal reads them)

## Notes
- The scan reads run records under `runs/` only (`internal/scan/runs.go`); the addendum's "under its runs/ and docs/runs/" holds for runs/ alone. A finished wave whose record sits in `docs/runs/` keeps the Work press, named `show <wave> on Work`, never dead; reading docs/runs is a scan card.
- An unread run record's name: `show <wave>'s run record in Needs me, Deltagos can't read it`.

## Review

**fail.** Unmet: FR-17 (proved finding below; the gate rows W9, W11 and X0 pass). Reviewer `l57-foot-rev`, 2026-11-01, X0 on 957cc37, fresh run (`test-lease` queued then ran; no reuse). W10 is the UI reviewer's.
cause: execution

### change-check

Run from the clean clone, `change-check organizer lf57-wave-footer`. The default base is the clone's `origin/main`, which is the root checkout's local main (f77deae). That main does not hold the merged PR #27 (lf58-map-render, e968fc1). GitHub's `origin/main` does, and the branch is rebased on it. So the first run listed `MapFigure*`, `mapSvg*` and `lib/testdata/*` as undeclared and outside the boundary (64 + 9 flags). None of them is this card's work. Rerun on the true base:

```
change-check organizer lf57-wave-footer --base e968fc1
repo organizer: base e968fc171 (--base e968fc1) ... head 957cc3710; 9 files, 9 flags
| outside boundary | frontend/src/components/RunReport.test.tsx | | modified |
| outside boundary | frontend/src/components/SpecReader.test.tsx | | modified |
| outside boundary | frontend/src/lib/specReader.test.ts | | modified |
| undeclared | frontend/src/components/SpecReader.tsx | ReaderState | modified |
| untested? | RunReport.tsx LocalRunReport; runReport.ts recordRel, waveLabel, waveLinkName; spec.go runRecords |
| declared, not changed | | frontend/src/lib/runReport.ts:RUNS_DIR | no matching change |
```

- outside boundary ×3: these are the tests of boundary files. Amendment 4's boundary says "and their tests".
- undeclared `ReaderState`: this is the `back?` field the declared `openSpec`/`ReaderBack` change needs (SpecReader.tsx:47-50).
- declared, not changed `RUNS_DIR`: the export was added (runReport.ts:421). change-check does not parse an `export const` as a symbol.
- untested?: `waveLabel`, `waveLinkName` and `recordRel` are exercised through W9's `Progress` and `waveTarget` rows. `runRecords` is exercised through W11. `LocalRunReport` is the wiring that W10 covers.
- The `runPlace`, `latestRun`, `presetsOf`, `seenAtOf`, `markSeen`, `RECENT_SEEN_MS` and `RECENT_MAX_MS` exports did not change. The only edits to runReport.ts are the import line and an appended block.

### Rows

- **W11** pass. `go test ./internal/service/ -run TestW11ReadSpecRunRecords` passes on 957cc37. On e968fc1's code it fails: `ReadSpec("runs/2026-10-20-sup1.md") … not a spec of this initiative fix`.
- **W9** pass. Five W9 rows plus four FR-15 Back rows; 9 pass on 957cc37. All 9 fail against e968fc1's code (test files copied onto that tree).
- **X0** pass. `make test`: go all ok, vitest 94 files / 1565 tests, exit 0. `npm test`: 1564 passed, 1 skipped. `pnpm run build` ok. `wails build` ok. `git status --porcelain` is empty.

### FR-18 probes (a copy outside the clone, `internal/service/zz_probe_test.go`)

Each of these is refused with zero reads:

- case variants: `RUNS/…`, `Runs/…`, `…-SUP1.md`
- a record written after the scan
- `runs\…`, `/runs/…`, `../secret.md`, `runs/../../secret.md`, `%2e%2e/…`, `~/…`
- empty, and leading-space paths

`#waves`, `runs//…`, `runs/./…` and `runs/x.md/` normalise to the same allowed record. That is the same file, not a widening.

Note: a symlink in `runs/` named like a record and pointing outside the root is read whole (`"OUTSIDE SECRET"`). The scan reads it too, so it is "a file the scan read". Specs behave the same today (`docs/specs/link.md` symlink is read on 957cc37's unchanged spec path), so this is not new. If the reader should stay inside the root, that is a separate card for `ReadSpec` as a whole.

Note: an unparseable run record is a dot wave, so ReadSpec allows it. The footer sends it to Needs me first, which is right.

### Finding (blocking, FR-17)

Found: an unread run record of a non-active initiative is a dead press.

1. `waveTarget` returns `{kind:"unread"}` whatever the initiative's status, and the press calls `openNeedsMe("unread:<id>")`.
2. `needsMeRows` skips inactive initiatives (`lib/queue.ts:154`, `folded.has(i.id)`), so the row never exists.
3. Overview still mounts the report for a local paused initiative (`RunReport` checks only `local`).

The press therefore lands on Home with nothing to highlight. FR-17 says "never a dead press".

Proof: a vitest probe calls `waveTarget` for initiative `paused` (status `paused`) with problem `runs/2026-10-19-sup0.md` unread. It prints `target {"kind":"unread",…}`, then `needsMeRows` prints `rows []`, and `expected false to be true` on `unread:paused`.

The builder listed this under "Found, not asked" without routing it. The gate does not cover it: W9's unread wave sits in an active initiative. W9 should add a non-active case.

### Found, not asked (builder's), where they go

- docs/runs/ records unread by the scan: the Notes say it needs a scan card. It has no slug yet, so it goes to the FSE with this fail.
- inactive-initiative unread row: this card's fail (above).
