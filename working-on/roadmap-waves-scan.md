---
title: "The scan reads waves and rounds from run records and joins each wave to its stages"
status: now
repos: [organizer]
branch: roadmap-waves-scan
seat: rws-build
stage: one-window
updated: 2026-10-06
next: "review: roadmap-waves-scan, gate met W1-W4 X0, 7c65191"
depends_on: [usage-view]
boundary: ["internal/scan (runs reader and tests), internal/model (Wave, Round), internal/merge", "app.go (type stubs only), frontend/wailsjs regenerated, testdata/fixture-overlay (run records)", "not: the run record template, internal/session"]
spec: "docs/specs/roadmap-as-a-plan.md (FR-1 to FR-3)"
gate: "docs/specs/roadmap-as-a-plan.md Acceptance, rows W1 to W4 and X0"
ui_review: false
---

## Goal
0093: the Roadmap reads like a project plan.

## Gate
docs/specs/roadmap-as-a-plan.md, W1 to W4 and X0.

- [x] W1: `TestReadRunsWavesRoundsAndDot` (internal/scan/runs_test.go): two
  waves, five rounds, offsets kept as written (-03:00, +02:00, Z), an open
  wave and a round in flight; a prose-only record is a dot dated 2026-09-26;
  README-like files skipped. `TestReadRunsNoDir`: no runs/, no problem.
- [x] W2: `TestReadInitiativeJoinsWavesToStages`: a wave on a `late` card and
  a done `early` card has stages [early, late]; a wave on an unstaged card has
  [] (outside any stage). `TestBuildCarriesWaves` (merge): carried, [] when none.
- [x] W3: `TestReadRunsMalformedKeptAndReported`: time without offset, kind
  outside, result outside, card not listed, end before start, a wave time
  without offset: one problem each, the wave kept; unparseable YAML is one
  problem and the record stays a dot.
- [x] W4: `eval "$(scripts/fixture-home.sh)"; go run . board --json`, init-a's
  `waves`, trimmed:
  ```
  2026-09-20-prose-only.md     dot   stages=[]                  rounds=[]
  2026-09-24-joins-wave.md     wave 1 sup11 stages=[joins]     merged 2026-09-24T13:40-03:00
      build n/a, review fail, build n/a, review pass, take pass (pablo)
  2026-09-28-across-stages.md  wave 1 sup12 stages=[foundations, joins]  merged 2026-09-28T12:15-03:00
      build n/a, build n/a, review pass, ui-review pass
  2026-09-28-across-stages.md  wave 2 sup13 stages=[]  merged "" (open)
      build n/a, review "" (in flight)
  runs problems: []   other initiatives: waves []
  ```
- [x] X0: fresh clone of the branch at 7c65191: `XDG_DATA_HOME=$(mktemp -d)
  make test` (go vet, all Go packages ok, vitest 306/306), `cd frontend &&
  npm run build`, `wails build`: all pass. Clone removed.

## Done
- rws-build, 2026-10-06: runs reader, stage join, problems, merge, fixture,
  bindings on `roadmap-waves-scan` (8dc56d2, baf2ffc, 004f508, 7c65191),
  rebased on main ee3ba7b. Gate W1-W4, X0 met.

## Notes
- For roadmap-outline: `waves` is one list per initiative, oldest record
  first; a record with no block is `{dot: true, record, date, task: first
  heading}` with `[]` cards, rounds and stages. `stages: []` = outside any
  stage. Times are strings as written; `merged: ""` open, round `end: ""` /
  `result: ""` in flight. Shape in `.wt-notes/rws-build/progress.md`.
- No app.go stub was needed: Wails emits model.Wave and model.Round nested.
  No status golden change.
- The fixture's two-stage wave needed a card in a second stage: added a done
  card `testdata/fixture-overlay/init-a/working-on/done/w-founded.md`
  (foundations), so init-a's Done column in the fixture has one more card.
- Not reported (outside FR-3): a wave naming a card the initiative lacks;
  it just adds no stage.
- 0100 ruled 2026-10-06; launches when usage-view is in done/.
- supervisor sup48, spawned by the FSE 2026-10-06.
