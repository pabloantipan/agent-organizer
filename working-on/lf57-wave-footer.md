---
title: "A finished wave's footer opens its run record over the report"
status: now
repos: [organizer]
branch: lf57-wave-footer
seat: l57-foot
stage:
updated: 2026-11-01
next: "review: lf57-wave-footer, round 2 (Amendment 6), W9 W11 X0 pass, b98452f"
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
- Round 2 (Amendment 6): a paused initiative's unread run record opens in the reader with the scan's reason as the error line (b98452f); new W9 rows fail on 957cc37 and pass; W9, W11, X0 pass from a clean clone at b98452f on origin/main e968fc1.

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
- modified `frontend/src/lib/runReport.ts:waveTarget`, `ScanRuns`, `WaveTarget` (round 2): a non-active initiative's unread record is a record target carrying the scan's reason (Amendment 6)
- modified `frontend/src/components/RunReport.tsx:goToWave`, `LocalRunReport` (round 2): pass `unread` to openSpec; active from `inactiveIds`
- modified `frontend/src/components/SpecReader.tsx:ReaderEntry`, `openSpec`, `SpecReader` (round 2): `unread` reason on the entry, shown over the text
- added `frontend/src/components/SpecReader.tsx:ReaderError` (round 2): the drawer's error line, refusal or unread reason
- modified `frontend/src/components/SpecReader.tsx:ReaderState` (round 1, undeclared there): `back`
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

## UI review

**pass.** Commit reviewed 957cc37. Reviewer `l57-foot-ux`, 2026-11-01. W10 met, measured offscreen. No severity 4 or 3 finding.

**Shared test run: reused.** `test-lease: reused run c507c2c7-82527 of 957cc371050e by organizer-probe-l57-foot-rev`, exit 0, vitest 94 files / 1565 tests (`.wt-notes/l57-foot-ux/x0-make-test.log`).

### How each state was checked

The screen was locked (`CGSSessionScreenIsLocked` = 1). I launched the review build myself from my worktree (`make review-build`, pid 51979, `auth: off`, `discuss_state_dir` under the fixture temp dir). Its AX tree came back as nested `AXApplication` nodes with no web content, so AX reads, AXPress, AXSize and `screencapture -l` were not possible. I quit it by its pid. Instead I measured with the offscreen WKWebView harness (`h.swift`, copied from l57-foot, from l57-ui-ux) over `wails dev` of the same SHA, using the contract fixture (`make-fixture.sh`) plus `fixture-home.sh`. The stub `factory` was dropped from PATH, so the real `factory report` read the fixture's state. Presses were DOM clicks. The window size was set by the harness, not by AXSize. This is the builder's recipe from progress.md; the only difference is my own step file (`steps-*.txt`).

- **(a) Footer lines.** At 1440×900 and 1024×640 there are two `<button>` lines. `sup2/1 · sup2 · … · not merged` has accessible name and title `show sup2 on Work`. `sup1/1 · sup1 · …` has accessible name and title `open sup1's run record`. The visible text is the FR-8 line, as PW7 says. Each line is 28 px high: 1118 px wide at 1440, 906 px at 1024. Shots `1440x900-a-footer.png`, `1024x640-a-footer.png`.
- **(b) W10.** Pressing `open sup1's run record` opens the drawer (`role=dialog`, labelled by its title) over the dimmed report. The drawer reads `runs/2026-10-20-sup1.md`, with no error and no horizontal scroll. Its header has `← Back`, named `Back to the run report`, 28 px high. The frontmatter shows as a yaml code block. Pressing Back closes the drawer and puts focus on the link. Scroll position:
  - 1440×900: `.board-wrap` scrollTop 17 → 17 → 17, link top 496 → 496.
  - 1024×640: scrollTop 147 → 147, link top 366 → 366.
  - Escape gives the same result at both sizes.

  The drawer matches the existing reader (surface `rgb(46,39,60)`, 880 px, Back in `--text-muted`). Shots `1440x900-b-drawer.png`, `1440x900-b-back.png`, `1024x640-b-drawer.png`, `1024x640-b-back.png`.
- **(c) Running wave.** sup2/1 has no merge, so the footer press is the Work press. Work opens with Work selected and the fixture in the crumbs. The fixture's Work draws no WaveStrip (0 strips), so nothing scrolls into view (U1). The press is checked here; the strip scroll rests on vitest W9. Shots `1440x900-c-work.png`, `1024x640-c-work.png`.
- **(d) Unread record.** In a temp copy only (`.wt-notes/l57-foot-ux/fx2`), I changed sup1's `cards: [a, c]` to a map in the copy's `runs/2026-10-20-sup1.md`. The real factory still lists sup1/1 as finished, and the scan reports the file unreadable. The footer is named `show sup1's run record in Needs me, Deltagos can't read it`. Pressing it opens Home, and the `fixture · 1 file Deltagos can't read` row is highlighted (`focused`), with focus on its `Show`. Shots `1440x900-d-unread-footer.png`, `1440x900-d-needs-me.png`.

All shots are under `.wt-notes/l57-foot-ux/`.

### Findings

- **U1 (2) — for aglaea, spec gap.**
  - What the person cannot do: after pressing `show sup2 on Work`, they cannot see sup2 on Work.
  - Where: Work after the running wave's footer press, `1440x900-c-work.png`.
  - Evidence: the report says `not merged`, but Work draws no WaveStrip for sup2 in this fixture (Work draws strips only for waves it sees as live, Amendment 3). The press keeps its promise only when a strip exists.
  - Proposal: aglaea to decide what a running wave with no strip shows (for example, Work with the wave's cards marked). This is not this card's boundary.
- **U2 (1) — for aglaea.**
  - What the person cannot do: read the wave's story at a glance.
  - Where: the drawer, `1440x900-b-drawer.png`.
  - Evidence: the record opens on about 60 lines of the `waves:` yaml (rounds, verdicts, causes) before its prose heading `2026-10-20 - sample run`. It is legible, but it is code.
  - Proposal: aglaea to decide whether a run record's yaml folds under the prose, or the prose comes first.

### Not verified

- Anything in the real window: AX names, AXPress and `screencapture -l`. The screen was locked.
- Window sizes set by AXSize.
- An unread record of a non-active initiative. The code review's FR-17 fail covers it from code; I did not put it on screen.
- A finished wave whose record is in `docs/runs/` (Notes: it keeps the Work press).

### Spec gaps (for the FSE)

- U1: what a running wave's footer shows when Work draws no strip for it.
- The unread link's name: the spec gives two names, and the builder chose the third. It reads clearly in the hover.

### For aglaea

U1 and U2.
