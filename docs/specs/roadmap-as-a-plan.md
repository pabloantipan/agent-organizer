# The Roadmap as a plan: stages, waves, rounds, cards and decisions: the build spec

status: proposed (0100)
by: the FSE, 2026-10-06, on main
scope: 0093 (ruled). design: Aglaea's `docs/ux/specs/roadmap-as-a-plan.md`
(1f2ded8), acceptance P1-P8. data: the run record's `waves:` block
(`~/agent-slack/docs/runs/TEMPLATE.md`, 55b9524, Pablo via Hephaistos
2026-10-06, "as you propose, do"). Gate rows follow 0095.

## Problem

Pablo, 0093: "I see the road map stage as a block of text. I'd like to see
this a bit more like Microsoft Project, with lines about waves, iterations,
and decisitions." The Roadmap's stage list (`RoadmapView.tsx`) shows each
stage as text with its cards; waves and their rounds exist nowhere the app
reads, and decisions are not on the stage rows.

## Requirements, card `roadmap-waves-scan` (Go)

- **FR-1** The scan reads `<root>/runs/*.md` and parses the YAML
  frontmatter's `waves:` list into `model.Wave` (wave, supervisor, task,
  cards, launched, merged) with `model.Round` (card, kind, start, end,
  result, reviewer, reason), on `ScannedInitiative.Waves` and every
  `BoardInitiative`. A record with no block is a dated dot (its file date),
  not a problem (0022).
- **FR-2** A wave's stage is its cards' `stage:` (a card in `done/`
  included); cards in two stages put the wave under each; none is "outside
  any stage" (Aglaea O2).
- **FR-3** A malformed block is kept and reported, one problem each, never a
  failed scan: a time that is not ISO 8601 with offset, a `kind` or `result`
  outside its set, a round naming a card the wave does not list, an end
  before its start.

## Requirements, card `roadmap-outline` (frontend), after `roadmap-waves-scan`

- **FR-4** Aglaea's design as specified: the outline over the shared
  TimeZoom axis, the four-step Detail switch (opens on Current stage every
  time), stage summary bars, wave bars, the Rounds row with its segments and
  the collapsed `n rounds · k fail`, cards under their wave, decisions as
  diamonds on the stage row, chevrons, double-click to fit, every state she
  names.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| W1 | 1 | Go test: a run record with two waves and five rounds; one without a block | both waves and rounds parsed with their offsets; the other a dot |
| W2 | 2 | a wave whose cards sit in two stages, and one whose cards have none | under both stages; outside any stage |
| W3 | 3 | the four malformed cases | one problem each, the record kept |
| W4 | 1 | `testdata/fixture-overlay` gains run records for init-a covering a pass, a fail and a take | `organizer board --json` carries them |
| P1-P8 | 4 | Aglaea's rows, `make review-build`, the fixture | as her spec |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`roadmap-waves-scan`: `internal/scan` (a new runs reader and its tests),
`internal/model` (Wave, Round), `internal/merge` (carry them), `app.go`
(type-emitting stubs only, if Wails needs them), `frontend/wailsjs`
regenerated, `testdata/fixture-overlay` (run records). Not: the run record
template, `internal/session`.

`roadmap-outline`: `RoadmapView.tsx`, `Roadmap.tsx` and its axis helpers,
new outline components and css, `lib/` helpers and tests. Not: Go, the
Calendar, Home.

## No-gos

- No backfill: run records before 2026-10-06 have no block (Hephaistos's
  ruling) and draw as dots.
- Waves of other initiatives' supervisors use the same reader; nothing
  initiative-specific.

## Technical notes

- Spec check (spec-craft 5b): every row fails on main (no runs reader, no
  outline). After the usage task: both touch `app.go`, `frontend/wailsjs` and
  the fixture, so this task launches when usage lands.
- The organizer's own `runs/` holds no record with a block yet; leftovers
  from now on will. The fixture proves the view meanwhile.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `roadmap-waves-scan` | W1-W4, X0 | usage-view | false |
| `roadmap-outline` | P1-P8, X0 | roadmap-waves-scan | true |
