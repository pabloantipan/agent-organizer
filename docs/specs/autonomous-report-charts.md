# Autonomous-report charts: progress along a run, and where each track is

status: proposed
owner: pablo (the organizer initiative); step 2's format: the talos skill; step 3's card fields: the working-on skill
by: Hephaistos (factory smith), 2026-10-27, on agent-organizer origin/main at 21b5d5d5, on odyssey
sources: Pablo, 2026-10-27, Hephaistos session: "Go with what Deltagos shall include. Idea is placing
a detailed spec in deltagos repos and push for resolving in lodestar", answering a client
initiative's FSE and its three-step proposal (in a mailbox thread on odyssey, quoted in Appendix A).
The chart rules: `~/.claude/skills/fse/references/autonomous-report-charts.md` (Pablo, 2026-10-26:
"This kind of chart shall be part of reporting"). The hand-drawn example: a morning report of a client initiative on odyssey, 2026-10-26 (path
given in the Hephaistos hand-off, not in this repo); "the example" below.

## Problem

After an autonomous run (the operator away, `factory autonomous`), the FSE's morning report must carry
two plain-text charts: (1) the cumulative share of cards that passed review along the run, with the
dead time drawn in `x`; (2) one row per track with its local %, the environment it runs on, and what
it waits on. Today an FSE draws both by hand from `git log`, the cards and Argos's digest
(the example): about 20 minutes, and the first dependency chart counted the
wrong denominator (100% where the full count was 67-71%, chart rules, "Say what every percentage
counts"). Deltagos already scans the cards, records and git; it should draw both charts, the same
text for the CLI (what an FSE pastes) and the app (what Pablo reads).

The work comes in three steps, in this order, each its own card with a disjoint boundary:

1. **Chart 1 as a Deltagos view now** (no format change; Deltagos reads what exists).
2. **A machine-readable deploy record**: the format is the talos skill's (proposed here), Deltagos
   only reads it. Chart 2 needs it, so it comes first.
3. **Chart 2** after two card fields, `track:` and `waits_on:`: the format is the working-on skill's
   (proposed here), Deltagos reads and draws.

**Appetite:** step 1 one wave (one card); step 2 one wave on the Deltagos side, once the talos skill
has adopted the format; step 3 one wave, once the working-on skill has adopted the fields. Stop and
report if a step needs a second wave.

## Premises (read 2026-10-27 on odyssey)

| # | Premise | Shown by |
|---|---|---|
| P1 | Deltagos already shells out to `git log` per file during the scan: a record's ruling commit time (`RuledAt`), branch spans, the FSE's signed commits | `internal/scan/decisions.go:279` (`rulingCommitTime`), `internal/scan/git.go:144`, `internal/scan/fse.go:107` |
| P2 | Cards under `working-on/done/` are scanned (`Archived: true`) but carry no time of the move to `done/`; only `updated` (a date) | `internal/model/model.go:247-296` (`Card`) |
| P3 | A decision record has `cards`, `forecast`, `RuledAt`, but no `supervisor` field: Deltagos does not read `supervisor:` | `internal/model/decision.go:34-60`; 20 records of the example's initiative carry `supervisor:` (`grep -l '^supervisor:' <its root>/working-on/decisions/*.md \| wc -l`) |
| P4 | In the example's initiative the root is not a git repo; `working-on/` is its own repo. In agent-organizer the root is the repo. `git -C <root>/working-on log -- done/` works in both | `git -C <its root> rev-parse` fails (exit 128); `git -C <its root>/working-on rev-parse --show-toplevel` = `<its root>/working-on`; `git -C ~/claudecode/agent-organizer/working-on log --diff-filter=A -- done/` lists 184 lines |
| P5 | The example's denominator is reproducible: 20 cards were added under `done/` between 01:41 and 09:00 on 2026-10-26, at 02:06 02:07 02:12 02:25 02:25 02:29 06:02 06:15 06:20 06:20 06:43 06:44 07:38 07:39 07:52 08:10 08:15 08:23 08:47 08:58 (committer = author time); the report says "the 20 cards", 30% at 02:29, 60% at 06:44, 100% at 08:58 | `git -C <its root>/working-on log --reverse --diff-filter=A --since=2026-10-26T01:41 --until=2026-10-26T09:00 --format=%cd --date=format:%H:%M -- done/`; the example's chart 1 |
| P6 | The example's line grouping is by hand: no single gap rule reproduces its five lines (06:20 to 06:43 is 23 min and shares a line, 07:52 to 08:10 is 18 min and does not) | P5's times against the example's chart 1 |
| P7 | The autonomous window is in the factory digest: a `kind: switch` line "autonomous mode ended …" carries `since` and `until` (epoch s); for 2026-10-26: since 01:41, end 09:00 | `~/.local/state/factory/away-log.jsonl` line 131; format comment `personal-cloude/scripts/factory/away.sh:105` |
| P8 | The digest is archived at a mode reset (`away-archive/away-log-<YYYYMMDD-HHMM>.jsonl`) | `personal-cloude/scripts/factory/away.sh:816-824`; `ls ~/.local/state/factory/away-archive/` |
| P9 | Usage-limit dead time is not a start/end record. Argos posts `window:usage` findings ("N seat(s) at the usage limit wait on the window") and the FSE wrote the span in prose ("~02:40 to ~05:50"). Structured: `pulse-history.jsonl`, one line per seat per Argos run (median 185 s apart), `state: usage_limit`, with `initiative`; kept 14 days. On 2026-10-26: 100 such rows, 02:36 to 05:58 across all seats (the example's initiative's seats alone: 02:36 to 05:00). The limit is account-wide | away-log line with key `window:usage` (t 1792992982); `pulse.sh:15, 152, 924-926`; a python pass over `pulse-history.jsonl` |
| P10 | Memory outages are Argos posts in the digest, key `ram:critical`, text "…flag set…" then "memory outage cleared…"; no seat or machine outage record was found | `grep ram:critical ~/.local/state/factory/away-log.jsonl` (22 rows) |
| P11 | Deltagos reads nothing under `~/.local/state/factory/` today | `grep -rn 'state/factory' internal --include='*.go'` returns nothing |
| P12 | The Firestore snapshot is the whole `ScannedInitiative` as JSON (cards with bodies, decisions, waves); derived fields stamped by the scan travel with it; machine-level files do not | `internal/sync/firestore.go:165-197` (`Push`), `internal/model/model.go:532-549, 594-600` |
| P13 | Odyssey's Deltagos runs with `auth: false`, so it pushes no snapshot: lodestar's Deltagos cannot see odyssey's client initiatives through Firestore today | `~/.config/organizer/config.yaml` on odyssey (`auth: false`, `machine: odyssey`); `CLAUDE.md` Identity paragraph (off means `Sync` skips) |
| P14 | Talos's deploys live only in prose: the `## Deploy log` of `~/claudecode/ops/bitacora/talos_bitacora.md` (line 500; 69 lines starting `- 20…`), in two styles (`\|`-separated with header comment `service \| env \| commit \| build \| result \| verified how`, and `·`-separated with a time), mixed with read-only entries, with no initiative, card or track field; the talos skill says "one bitácora line — service, env, commit, build number, result, how it was verified" | `talos_bitacora.md:500-565`; `~/claudecode/ops/skills/talos/SKILL.md:159-162` |
| P15 | No `deploys.yaml`, `deploy record`, `track:` or `waits_on:` exists in agent-organizer, agent-mailbox-docs, the talos skill or the example's cards | `grep -rli 'deploy record\|deploys.yaml' …` and `grep -rn 'waits_on\|^track:' …` return nothing |
| P16 | The card frontmatter is read with a non-strict `yaml.Unmarshal`: unknown fields (`track`, `waits_on`) are ignored today, not a problem | `internal/scan/frontmatter.go:37` |
| P17 | `stage:` is not a track: the example's tracks (A to E) are not its roadmap stages; agent-organizer's 7 open cards carry an empty `stage:` | the example's chart 2; `grep -h '^stage:' working-on/*.md` |
| P18 | No chart library in the frontend; JetBrains Mono is bundled, and the design system says data is mono | `frontend/package.json` dependencies; `docs/design-system.md:17, 32` |
| P19 | No base map: `docs/architecture/` does not exist | `ls docs/architecture` |
| P20 | Run records' waves (`<root>/runs/*.md`, scanned into `Waves`) carry review rounds with `end` and `result: pass`: a second source of pass moments, not used here | a run record of the example's initiative (`<its root>/runs/<date>-<task>.md`); `internal/model/wave.go` |
| P21 | not verified: lodestar's roots, whether lodestar holds any initiative with a `done/` history in git, and whether `~/agent-slack/specs/contracts/working-on/` (the working-on contract sample) exists there; it does not exist on odyssey | first gate row of each step card (S0, D0, T0) |

## Goals

- An FSE gets chart 1 for a run with one command and pastes it unchanged into the morning report.
- Pablo sees the same chart in Deltagos for the initiative he selected.
- After steps 2 and 3, chart 2 draws itself from the deploy record and the cards, with every
  percentage saying what it counts.

## Non-goals

- Writing anything: Deltagos never writes a card, a record, the deploy record or the factory state
  (initiative scope `out: never writes cards`, 0038).
- Graphical charts (SVG, a chart library): the reports are plain text; the view shows that text.
- Reproducing the hand-drawn grouping of P6 exactly: lines follow one rule (FR-6).
- Drawing chart 2's goal line by computation (open question Q6).
- Backfilling the deploy record from Talos's bitácora (talos skill's choice, not Deltagos's).
- Cross-machine dead time before Q1 is ruled.
- Any personal-data handling (LPD is another team's): the charts show cards, tracks, records,
  services and roles only.

## Requirements

### Step 1: chart 1, progress along the run (card `charts-progress`)

- **FR-1** The scan shall stamp every archived card with `done_at`: the committer time (ISO 8601 with
  offset) of the oldest commit that added the file under `working-on/done/`, read with one
  `git -C <root>/working-on log --diff-filter=A --format=… --name-only -- done/` per initiative, under
  the scan's git timeout. If `working-on/` is in no git repo, or git fails, `done_at` shall be empty
  and no problem is raised (P1, P2, P4).
- **FR-2** The scan shall read a decision record's `supervisor:` (one session or a list; a
  comma-separated scalar is split) into `Decision.Supervisor` (P3).
- **FR-3** The window of a run shall be, in order: the `--from`/`--to` given; else, on the machine
  that holds the factory state, the latest completed autonomous run in the digest (a `switch` line
  "ended" with `since`; its `t` is the end), reading `away-log.jsonl` then `away-archive/*.jsonl`
  (P7, P8). If neither gives a window, the chart is FR-10's one line.
- **FR-4** Dead time shall be drawn from the factory state, read-only, in the window:
  (a) usage limit: account-wide spans of `pulse-history.jsonl` rows with `state: usage_limit` (any
  seat, any initiative), consecutive rows at most 10 min apart joined, each span from its first to its
  last row (P9); (b) memory outage: from an away-log `ram:critical` "flag set" post to the next
  "outage cleared" post (P10). The source paths come from one config key, `factory_state_dir`,
  default `~/.local/state/factory`; empty disables dead time. [NEEDS CLARIFICATION: Q3 — read
  Argos's files as they are, or Argos writes explicit dead-time events — Hephaistos (argos owner),
  ruled by Pablo]
- **FR-5** The denominator shall be the cards with `done_at` in the window ("passed review in the
  window"), or, with `--planned`, the union of `cards:` of ruled records that carry `supervisor:` and
  whose `RuledAt` is in the window, plus any card that passed in the window outside that set
  (so the share never passes 100%). The line above the chart says which, with its count and the
  window: `Cumulative share of the 20 cards that passed review between 01:41 and 09:00.`
- **FR-6** Moves to `done/` shall be grouped into lines: a move more than `--gap` minutes (default 20)
  after the previous move starts a new line; a line is stamped with its last move's time and names its
  cards by slug, in move order, truncated to fit 60 characters with `+N`.
- **FR-7** Each progress line shall be `HH:MM  <bar>  <n card(s) (slugs)>  <pct>%`, the bar 34
  characters, `#` for `round(34 × done/denominator)` and `.` for the rest, the percentage rounded to
  an integer, columns aligned as in the chart rules' example.
- **FR-8** Each dead span shall be two lines drawn all in `x` (34 characters), stamped with its start
  and its end, the first naming the cause and its length (`usage limit, every seat stopped (about 3 h)`,
  `memory outage (about 20 min)`), placed in time order among the progress lines. The first line shall
  be `HH:MM  autonomous mode on` and the last `HH:MM  autonomous mode off` when the window came from
  the digest; with `--from`/`--to`, `window start` / `window end`. Times are the machine's local time.
- **FR-9** `organizer report progress <initiative> [--from <iso>] [--to <iso>] [--gap <min>]
  [--planned] [--json]` shall print the chart inside nothing (plain text, ready for a code block), or
  with `--json` the window, the dead spans, the denominator and its kind, and the lines.
- **FR-10** If the chart cannot be drawn (no window, or no card moved to `done/` in it), the command and
  the view shall print one line saying why (`No card moved to done/ between 01:41 and 09:00.`), exit 0,
  never an empty block.
- **FR-11** The app shall show the same text, verbatim, in mono, for the selected initiative, with a
  Copy button and the window's two times editable (defaulting per FR-3). [NEEDS CLARIFICATION: Q2 —
  which sub-view holds it — the organizer FSE with Aglaea]
- **FR-12** While the selected initiative is remote (from another machine's snapshot), the view shall
  draw from the synced `done_at` and records and say in one line above the chart `Dead time is read on
  <machine>; not drawn here.` [NEEDS CLARIFICATION: Q1 — which machine draws, and whether the factory
  state rides the snapshot — Pablo]

### Step 2: the deploy record (talos skill's format; card `deploy-record-read` on the Deltagos side)

The format, **a proposal for the talos skill's owner** (P14, P15). [NEEDS CLARIFICATION: Q4 — one
append-only file per initiative, or a field on the card — Hephaistos (talos skill), ruled by Pablo.]
The proposal: `<initiative root>/working-on/deploys.yaml`, of the initiative whose card or record asked
for the rollout; append-only, one YAML flow mapping per line, written by Talos after the smoke call
(talos skill, "The deploy loop", step 5, beside the bitácora line it already writes):

```yaml
# working-on/deploys.yaml: one line per rollout, append-only (talos skill). Never edited.
- {at: "2026-10-26T17:26-03:00", service: billing-api, env: qa, commit: a1b2c3d, build: "qa #12", result: success, smoke: pass, card: billing-qa, record: "0042", track: b}
- {at: "2026-10-26T21:41-03:00", service: orders-proxy, env: qa, commit: d4e5f6a, build: "qa #3", result: success, smoke: fail, record: "0043", note: "rolled back 22:05"}
```

| Field | Required | Values |
|---|---|---|
| `at` | yes | ISO 8601 with offset, the time the smoke call finished |
| `service` | yes | the deployed repo or service name, as the pipeline names it |
| `env` | yes | `dev`, `qa`, `stg`, `prod` |
| `commit` | yes | the short sha that runs (the merged commit, not the branch head) |
| `result` | yes | `success`, `failure` (the pipeline or rollout), `rolled-back` |
| `smoke` | yes | `pass`, `fail`, `none` (no smoke call made) |
| `card` or `record` | one of them | the card slug or the record number that asked |
| `build` | no | the pipeline's build id |
| `track` | no | the track id (step 3); else derived from `card` |
| `note` | no | one line |

Read-only actions (Talos's "read-only" bitácora entries) are not deploys and get no line. A
correction is a new line with `note: "corrects <at>"`, never an edit.

- **FR-13** The scan shall read `working-on/deploys.yaml` when present into `ScannedInitiative.Deploys`
  in file order. A line that does not parse, or lacks a required field, or has an `env`, `result` or
  `smoke` outside the closed sets, is one problem naming the line number, and the other lines are kept.
  No file is no deploys and no problem (the format is read like the roadmap: kept and reported, never a
  failed scan).
- **FR-14** `organizer deploys <initiative> [--json]` shall print the entries newest first: time,
  service, env, commit, result, smoke, card or record.
- **FR-15** For a (service or track, env) pair, "runs on" shall be the latest entry with `result:
  success` and `smoke: pass`, unless a later entry for the same pair is `rolled-back` or `failure`;
  then it is that later entry's state. One function, used by FR-20.

### Step 3: chart 2, where each track is (working-on skill's fields; card `charts-tracks`)

The fields, **a proposal for the working-on skill's owner** (format change: the working-on contract
sample is edited first, then the skill, P21). [NEEDS CLARIFICATION: Q5 — `track:` on cards and
records, and where a track's title and order live — Hephaistos (working-on skill), ruled by Pablo.]

```yaml
track: b                       # optional, like stage:; a kebab-case id; on a card or a task record
waits_on:                      # optional; external waits only (card-to-card stays depends_on)
  - {who: talos, what: billing-infra}
  - {who: operator, what: "0044 public scope"}
```

`who` is a role or a seat (`talos`, `operator`, `data-team`, `devops`, `business owner`), never a
person's name; `what` is a card, a record or a short noun. A scalar `waits_on: "<what>"` reads as one
item with an empty `who`.

- **FR-16** The scan shall read `track` and `waits_on` on cards, and `track` on decision records
  (P16). A card's track is its own `track:`, else the `track:` of a ruled record whose `cards:` lists
  it, else none.
- **FR-17** Track B builds on track A when an open or done card of B lists in `depends_on` a card of A
  (A ≠ B). The chart is drawn as a tree from the tracks nothing builds on, in the order of their first
  card's position in the board; a cycle is one problem and those tracks are drawn as roots.
- **FR-18** A track's `local` % shall be passed / (passed + open + to-cut): passed = its cards in
  `done/`; open = its cards not in `done/`; to-cut = slugs in `cards:` of a ruled record of that track
  that exist neither open nor done. Under the row: the fraction and up to three left slugs, then `+N`.
- **FR-19** The env columns `dev`, `qa`, `stg`, `prod` shall come from FR-15 over the deploy entries
  of the track (an entry's `track`, else its card's track): `ON QA <commit>` (or the record) when it
  runs there, `0%` when the initiative deploys to that env for some track but not this one, `-` when no
  entry of the initiative names that env; the line above the chart names the envs no track uses.
- **FR-20** On the right of a row: each `waits_on` of the track's open cards as `<- <what> (<who>)`,
  and each open `depends_on` target outside the track as `<- <card>`, each once.
- **FR-21** The line above the chart shall be `Local % = local cards passed review / local cards
  planned (open cards and cards still to cut counted).`; a card with no track is counted under one
  `[untracked]` row, last.
- **FR-22** `organizer report tracks <initiative> [--json]` and the view of FR-11 shall show chart 2;
  with no track on any card, one line: `No card carries track: yet.`

## Change on the map

No base map yet (`docs/architecture/` absent, P19); the FSE asks Daedalus for one before cutting the
step cards if it wants the diagram. In words: `scan` gains readers (done/ moves, `supervisor`,
`deploys.yaml`, `track`, `waits_on`); a new read-only reader of the factory state dir; a new
`internal/report` renderer used by `cli` and by `app.go` through `service`; one new view.

## Acceptance → gate

Gate rows of step 1 (card `charts-progress`):

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| S0 | — | The not-verified premises hold where the card is built | on the build machine: `git -C <a scanned root>/working-on log --diff-filter=A --oneline -- done/ \| head -1`; `ls ~/agent-slack/specs/contracts/working-on` | one line, or the builder stops with `decide:`; the contracts dir's presence noted for X0 |
| S1 | FR-1 | Given a temp initiative whose `working-on/` is its own repo and one whose root is the repo, when scanned, then each done card carries the time of the commit that added it; a non-repo carries none and no problem | `go test ./internal/scan -run DoneAt` | pass; fails on main |
| S2 | FR-2 | Given records with `supervisor: a`, `supervisor: a, b`, a list, and none, when scanned, then `Supervisor` is `[a]`, `[a b]`, the list, empty | `go test ./internal/scan -run Supervisor` | pass |
| S3 | FR-3, FR-4 | Given a synthetic factory state dir (`testdata/factory-state/`: a digest with two switch runs, one archived; a pulse history with two usage-limit spans 9 and 12 min apart inside; a ram set/cleared pair), when the window and dead time are read, then the latest completed run is the window, the spans are joined per FR-4 and the outage is one span | `go test ./internal/report -run Window` | pass |
| S4 | FR-5 to FR-8 | Given 20 synthetic done moves at P5's times, a window 01:41-09:00 and a dead span 02:36-05:58, when rendered, then the output equals the golden: lines at 02:29 30%, 06:20 50%, 06:44 60%, 08:23 90%, 08:58 100% (gap 20), two `x` lines at 02:36 and 05:58, `autonomous mode on/off` first and last, the denominator line first | `go test ./internal/report -run Progress` against `testdata/report/progress.golden` | pass |
| S5 | FR-5 | Given `--planned` and a ruled record with `supervisor:` listing 24 cards of which 20 passed, then the line reads `the 24 cards planned` and the last line 83% | same test, `-run Planned` | pass |
| S6 | FR-9, FR-10 | When `organizer report progress <fixture>` runs with and without `--json`, and with a window holding no move | `go test ./internal/cli -run ReportProgress` | text equals the golden; JSON has `window`, `dead`, `denominator`, `lines`; the empty case prints one line, exit 0 |
| S7 | FR-11, FR-12 | Given a local and a remote initiative, when the view shows, then the text is verbatim in a mono block with Copy and two editable times; the remote one carries the `Dead time is read on <machine>` line | `cd frontend && npm test -- <the view's test>` | pass |
| S8 | — | End to end, on odyssey: `organizer report progress <the example's initiative> --from 2026-10-26T01:41-03:00 --to 2026-10-26T09:00-03:00`, output saved to `~/.local/share/organizer/evidence/charts-progress-e2e.txt` (local, never committed: real card slugs) | the run, then read the file | `the 20 cards`; lines at 02:29 30%, 06:44 60%, 08:58 100%; one usage-limit span 02:36-05:58; the window lines 01:41 and 09:00 |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` (with `CONTRACTS_DIR=~/agent-slack/specs/contracts` where S0 found it), `wails build`, then `git status --porcelain` | the commands | pass; status empty |

Gate rows of step 2 (card `deploy-record-read`, after the talos skill adopts the format):

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| D0 | — | The talos skill names the adopted format, field for field | `grep -n 'deploys.yaml' ~/claudecode/ops/skills/talos/SKILL.md` | the format; differences from this spec amend this spec first (spec-craft step 7) |
| D1 | FR-13 | Given a temp `deploys.yaml` with 3 good lines, one unparsable, one with `env: preprod`, one missing `commit`, when scanned, then 3 deploys and 3 problems naming lines 4, 5, 6; no file is no problem | `go test ./internal/scan -run Deploys` | pass |
| D2 | FR-14 | `organizer deploys <fixture>` and `--json` | `go test ./internal/cli -run Deploys` | newest first; golden |
| D3 | FR-15 | success+pass, then a later rolled-back, for one pair; a smoke fail alone; a success with `smoke: none` | `go test ./internal/report -run RunsOn` | rolled-back; not running; not running |
| X0 | all | as in step 1 | | |

Gate rows of step 3 (card `charts-tracks`, after the working-on skill and its contract sample adopt the fields):

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| T0 | — | The working-on skill and the contract sample name `track` and `waits_on` | `grep -n 'waits_on' ~/.claude/skills/working-on/SKILL.md`; the sample's `expected.json` | both present; differences amend this spec first |
| T1 | FR-16 | Cards with `track`, without (listed by a ruled record with `track:`), without either; `waits_on` as a list and as a scalar | `go test ./internal/scan -run Track` | own, derived, none; items with `who`, the scalar with empty `who` |
| T2 | FR-17 | Tracks A, B (depends on A), C (depends on B and A), D and E depending on each other | `go test ./internal/report -run TrackTree` | tree A → B → C; one cycle problem; D, E as roots |
| T3 | FR-18 to FR-21 | A synthetic initiative shaped like the example's chart 2 (5 tracks, 7/11/3/3/2 cards, two qa deploys, waits on talos and operator) | `go test ./internal/report -run Tracks` against `testdata/report/tracks.golden` | the golden: fractions, `ON QA <commit>`, `-` for dev, `<- … (talos)`, the header line, `[untracked]` last |
| T4 | FR-22 | `organizer report tracks` with and without tracks; the view | `go test ./internal/cli -run ReportTracks`; the view's vitest | golden; `No card carries track: yet.` |
| T5 | — | End to end on the first initiative whose cards carry `track:` and whose Talos wrote `deploys.yaml`: `organizer report tracks <id>` beside the FSE's hand-drawn chart of the same hour | the FSE compares the two, row by row | same tracks, fractions and env cells; each difference explained by a card or a deploy line |
| X0 | all | as in step 1 | | |

## Pre-answered

- merge target: `main` of agent-organizer (github remote), through the supervisor's usual route.
- base: agent-organizer `origin/main` 21b5d5d5 for step 1; steps 2 and 3 branch from main after the
  previous step merged.
- tests: `internal/scan/*_test.go` (temp git repos, as `forecast_test.go:80` does), `internal/report/`
  (new package, goldens under `testdata/report/`), `internal/cli/*_test.go`; `go test ./...`; the
  view's test beside the component, `npm test` (vitest).
- evidence: synthetic runs under `docs/evidence/<card>/`; real-initiative runs (S8, T5) only under
  `~/.local/share/organizer/evidence/`, never committed (client card slugs must not reach a GitHub repo).
- short-sample fallback: a window with fewer than two moves draws what it has; none is FR-10's line.
- data shape: `done_at` empty or ISO with offset; `Supervisor` a list, never null; `Deploys` a list,
  never null; dead spans `{start, end, cause}`; the factory state dir missing means no dead lines and
  the line `No factory state on this machine; dead time not drawn.`
- retention: pulse history is kept 14 days (P9): a window older than that draws no usage-limit lines
  and says `Usage-limit history kept 14 days; not drawn.`; the digest's archive is kept as written.

## Boundary

- May touch (step 1): `internal/scan` (done/ moves, `supervisor`), `internal/model` (the new fields),
  `internal/report` (new), `internal/config` (`factory_state_dir`), `internal/cli` (the `report`
  subcommand and its help line), `internal/service` and `app.go` (one bound method), the new view's
  component, its test and its stylesheet's own selectors, `frontend/wailsjs` (regenerated),
  `testdata/factory-state/`, `testdata/report/`, `CLAUDE.md` (one Layout bullet).
- Step 2 adds: `internal/scan` (deploys reader), `internal/cli` (`deploys`). Step 3 adds:
  `internal/scan` (track, waits_on), `internal/report` (tracks).
- Must not touch: the talos skill, the working-on skill and its contract sample, the argos skill and
  `personal-cloude/scripts/factory/` (their owners adopt the formats), any initiative's cards or
  records, `~/.local/state/factory/` (read-only), `firestore.rules`.
- No-gos: no write to any file the scan reads; no person's name in fixtures, goldens or evidence
  committed; no fixture copied from a client initiative (synthetic data shaped like it, P5's times are
  fine: times, not names); no new card status.

## Rabbit holes

- Matching the hand-drawn grouping (P6): one rule, `--gap`, and the FSE can pass another value.
- Parsing Argos's prose beyond the two keys of FR-4: anything else is Q3's to rule.
- Reading Talos's bitácora deploy log (P14): prose in two styles; step 2 exists so nobody parses it.
- Pushing the factory state into Firestore before Q1: a machine-level document is a sync change.
- A graphical chart: the reports are text and the view is the text.
- Computing chart 2's goal line (Q6).

## Open questions

- **Q1** [NEEDS CLARIFICATION: Which machine draws the charts? Odyssey holds the client initiatives and
  the factory state, and runs Deltagos with `auth: false` (P13), so lodestar's Deltagos sees none of
  it. Options: (a) the charts are drawn on the machine that holds the initiative (the CLI there; the
  FSE builds and tests on lodestar with synthetic data); (b) odyssey turns sync on and the factory
  state's spans ride a machine-level snapshot field; (c) both, (a) now. — Pablo] Recommendation
  (Hephaistos): (a) now; FR-12 already says what a remote view shows.
- **Q2** [NEEDS CLARIFICATION: Where does the view live: a new sub-view (`Reports`), a section of
  Overview, or of Roadmap beside the waves? — the organizer FSE with Aglaea]
- **Q3** [NEEDS CLARIFICATION: Dead time: read `pulse-history.jsonl` and the `ram:critical` posts as
  they are (FR-4), or Argos writes one `kind: dead` digest line per span with `start`, `end`, `cause`?
  The first needs no factory change and ties Deltagos to two undocumented formats; the second is a
  small Argos change and one stable format. No source exists for a seat or machine outage (P10). —
  Hephaistos (argos), ruled by Pablo]
- **Q4** [NEEDS CLARIFICATION: Deploy record: `working-on/deploys.yaml` per initiative (proposed
  above), or a field on the card (`deployed: [{env, commit, at}]`)? A file keeps cards cheap and holds
  deploys no card asked for; a card field makes Talos edit cards it does not own. — Hephaistos (talos
  skill), ruled by Pablo]
- **Q5** [NEEDS CLARIFICATION: `track:` and `waits_on:` as proposed; and where a track's title and
  order live: ids only (the chart prints the id), or a `tracks:` list in `roadmap.yaml` (`{id, title}`)?
  — Hephaistos (working-on skill), ruled by Pablo]
- **Q6** [NEEDS CLARIFICATION: Chart 2's last line ("the shortest path to the goal") needs a goal
  Deltagos does not know: omit it from the drawn chart and let the FSE write it under the paste, or
  take a `--goal <track>` and print that track's waits? — the organizer FSE] Recommendation: omit.

Six blockers over three steps, at most three per step (step 1: Q1-Q3); the spec is three specs in one
file on purpose, so each step card can be cut on its own once its questions are ruled.

## Assumptions

- The moment a card "passed review" is the commit that added it under `done/` (the chart rules' data
  line). On the talos-lab merge route a pass waits for the merge sha before the move (working-on skill,
  Finishing), so such a card counts at the merge, not at the review: acceptable.
- Times print in the machine's local time zone, as the hand-drawn charts do.
- 10 minutes joins pulse-history rows into one span (Argos runs about every 3 min, P9).
- `--gap` defaults to 20 minutes.

## Alternatives considered

- Review-pass moments from run records' rounds (P20): richer, but older initiatives have no `waves:`
  block, and the chart rules name `done/` moves.
- `git log -S 'review: pass'` per card: one git call per card instead of one per initiative.

## Decisions cited

- Pablo, 2026-10-26, in a client initiative's FSE session: both charts are part of every report after an
  autonomous run (`~/.claude/skills/fse/references/autonomous-report-charts.md`).
- Pablo, 2026-10-27, Hephaistos session: the spec lives in the Deltagos repo, resolved on lodestar.
- organizer 0038 (ruled): scope `out: never writes cards`.
- No record yet rules Q1-Q6; the organizer FSE raises the proposed records.
- pre-accept check (Hephaistos, 2026-10-27): rows S1-S7, D1-D3, T1-T4 run on synthetic data inside the
  boundary; S8 and T5 need a real initiative on its own machine (needs-operator); FR-1 traced to
  `rulingCommitTime`'s pattern, FR-4 to `pulse.sh:152`/`away.sh:105`, FR-13 to no existing reader
  (new); gate-check and diagram-check results in the card's Done.

## Cards

| Card | Gate rows | Boundary | Depends on |
|---|---|---|---|
| `charts-progress` | S0-S8, X0 | step 1 | Q1-Q3 ruled |
| `deploy-record-read` | D0-D3, X0 | step 2 | Q4 ruled; talos skill adopted the format |
| `charts-tracks` | T0-T5, X0 | step 3 | `deploy-record-read`; Q5, Q6 ruled; working-on skill and contract sample adopted the fields |

Outside this repo (each its owner's card, not the organizer FSE's): the talos skill's deploy line
(Q4), the working-on skill's fields and contract sample (Q5), Argos's dead-time event if Q3 picks it.

## Appendix A: the proposal, verbatim (a client initiative's FSE, names replaced by placeholders)

"1. Chart 1 (progress along the run) as a Deltagos view now. All inputs are already in working-on git:
commits where a card's review turns pass or the card moves to done/, task records (supervisor:,
forecast:) for the window and the denominator, Argos's usage-limit and outage posts for dead time.
Pure view, no format change.
2. A machine-readable deploy record, written by Talos per rollout: service, env, commit, time, smoke
pass/fail, record or card. E.g. working-on/deploys.yaml (append-only) or a field on the card. Today
this lives only in Talos's thread posts and its bitácora; it is the input chart 2 depends on, so it
comes first.
3. Chart 2 (where each track is, what it waits on) after two card fields: track: <id> on cards (like
stage:), or derived from the record that launched the card; waits_on: [{who, what}] for external
waits (Talos, operator, a data team, DevOps); depends_on already covers card-to-card. Then the tree draws
itself: columns from the deploy record, local % from track (passed / passed+open+to-cut), the right
side from waits_on.
Cost is discipline more than code: Talos writes one deploy line per rollout; the FSE tags track: when
cutting. Owners as I read them: card format = working-on skill; the view = organizer initiative
(Deltagos); deploy record = talos skill."

Note on "Pure view, no format change": true of the files; Deltagos still learns two reads (FR-1,
FR-2) and the factory state dir (FR-3, FR-4), which is Q1 and Q3.

## Amendments

- none yet
