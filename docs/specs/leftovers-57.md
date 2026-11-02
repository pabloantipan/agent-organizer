# Leftovers 57: the run report on Overview, with its waves, and the Home signal: the build spec

status: proposed (0169)
by: the FSE, 2026-10-27, on main at 5a0e280
sources: Pablo, 2026-10-27: "to be able to generate in Deltagos dynamically
that kind of report"; 2026-10-27 (Aglaea's session, after the design canvas):
"send these to fse for exectuting", then in the FSE session "excecute please";
records 0167 (Q1 roadmap mode, Q2 seen plus 24 h, Q3 no percent) and 0168
(Q1 B now A later, Q2 waves block), 0020 (tokens, not dollars); Aglaea's
`docs/ux/specs/run-report.md` (331ae1f, Amendment 1 8d2141a, Amendment 2
d9c7a54), rows AR1-AR21, and `docs/ux/specs/progress-and-waves.md` (a2fb63a),
option B, rows PW1-PW5; Pablo's rulings of 2026-10-27 (agent-slack
`docs/decisions.md`): one computation, the window is the user's, each factory
draws its own charts, environment columns only where a factory uses them.

What this builds: §3 of run-report (Overview's `While you were away`) as
Amendments 1 and 2 amend it, with option B's wave column, disclosure and
footer, and §5 (the Home signal). Out: §4 Roadmap › History (0167 Q1 places
it there; it is option A, a later card after the 0042 facts ledger), and the
waves block in `factory report`'s text (0168 Q2, Hephaistos's command).

## Premises (read 2026-10-27 at 5a0e280)

| Premise | Shown by |
|---|---|
| `factory report <init> [--window last\|current \| --since T --until T] [--text\|--json]` is installed on lodestar and computes the progress lines, the dead spans, the tracks and the rulings | `~/bin/factory`; `~/claudecode/scripts/factory/report.py` (bd66232, personal-cloude #4 4ee1f71) |
| its contract is agent-mailbox-specs main 5d34115, `contracts/factory-report/`: `make-fixture.sh DIR`, `case.json` (window 2026-10-20 00:00-09:00, `ignore_fields: [root]`), `expected.json`, `expected.txt` (byte-equal), `factory-report.schema.json`; top-level keys `initiative, root, generated, why, window, progress, tracks, rulings`; times epoch ints with `*_iso` | Hephaistos, thread 01M603675S5Q3J8DEZC0E28W73; `git -C ~/agent-slack/specs ls-tree 5d34115 contracts/factory-report/` |
| the command has no list of windows: `--window last` and `current` only | `report.py:9-14, 582-589`; asked of Hephaistos 2026-10-27 (`--windows --json`) |
| a wave's rounds carry no cause in Deltagos: `model.Round` is card, kind, start, end, result, reviewer, reason; the contract's sample run record carries `cause:` (hestia 0042 enum approach, execution, gate, environment, unclear) | `internal/model/wave.go:35-43`; agent-mailbox-specs `contracts/working-on/sample/docs/runs/2026-10-22-sample-run.md` |
| tokens per session are in the usage report, and runs carry their card | `internal/usage/report.go:29-102`; `internal/session/runs.go` (`Run.Card`, `InputTokens`) |
| the service shells out to programs by name; Overview and Home exist, Home's signals come from `signalFacts` | `internal/service/retire.go:229`; `frontend/src/components/Overview.tsx`, `Home.tsx:435` |
| origin/main is 21b5d5d: lf52-decisions-line, the three lf53 cards and lf55-one-title are not merged | `git log origin/main -1` |

## Requirements

Card `lf57-report-go` (Go):

- **FR-1** `Service.Report(initiative, since, until)` runs `factory report
  <root> --since <since> --until <until> --json` and decodes it into a typed
  struct whose fields are the contract's (8474386). `Service.ReportText` runs
  the same with `--text` and returns its bytes unchanged. Deltagos computes no
  count, percent, span or track of its own (AR15).
- **FR-2** With `factory` missing, or exiting non-zero, both return an error
  whose text is `factory report not found` or the command's first stderr line
  (AR16). An initiative that is not local (from another machine's snapshot)
  is refused with `drawn on <machine>` and runs nothing (AR17).
- **FR-3** `Service.ReportWindows(initiative)` runs `factory report <root>
  --windows --days 14 --json` and returns its windows as given (newest
  first, `kind` autonomous or current, `moved`, `moves`). The picker's
  presets are `Running now` for a `current` window, each window with
  `moved` true, then `Last 24 hours`; a picked window is drawn with
  `--since @<since> --until @<until>`.
- **FR-4** (withdrawn, Amendment 1: the report's `waves` block carries each
  round's `cause`; Deltagos's run record reader is unchanged.)
- **FR-5** `Report` carries the JSON's `waves` block as given:
  `waves.lines[]` (matched to `progress.lines[]` by `t`, each card with its
  `waves[]` and `label`, `no wave` when no run record lists it) and
  `waves.waves[]` (key, supervisor, cards, rounds with `cause`,
  `failed_by_cause`, `build_minutes`). The one number Deltagos adds is
  tokens, which the report does not carry yet: per line, the usage
  report's tokens of runs whose card is one of the line's cards, inside the
  window (0020, never money). When the report gains tokens, Deltagos reads
  those instead.
- **FR-6** `Report`, `ReportText` and `ReportWindows` are bound on `App` (`wails generate module`).

Card `lf57-run-report` (frontend, `ui_review: true`):

- **FR-7** Overview gets `While you were away` (run-report §3 with
  Amendments 1 and 2): the window control (FR-3's presets, then `Custom…`
  with From and To applied on change, `From must come before To.` keeping the
  last good window), the caption naming the denominator and the window, one
  row per `progress.lines` item (time, bar from `pct`, cards as links to
  their backs, percent), dead rows hatched and neutral, `stopped now` in the
  blocked treatment only while live and still going, mode rows at the ends
  (`window start` / `window end` for a custom window), `progress.notes` under
  the table.
- **FR-8** Option B (progress-and-waves, PW1-PW5): a wave column before the
  bar (`1`, `1 2`, `·` for mode and dead rows, `–` for no wave), a disclosure
  under each row with FR-5's rounds, failures by cause, build time and
  tokens, and a footer `Waves in this window`, one line per wave, each
  opening Work with that WaveStrip in view.
- **FR-9** Tracks as Amendment 2 draws them: `Board as of <rev> · <time>`,
  done tracks folded into `N tracks done · Show`, chains in one column with
  `↓`, branches indented, `No stage` last, `local` and only the JSON's
  `envs` as columns, `waits on` with the owner as a role, the goal line as
  given; `No tracks to draw: no roadmap stages, and no card names a track.`
  when there are none.
- **FR-10** `Ruled while you were away` from the JSON's `rulings`: one
  decision record line each (lf52's line) with who ruled it, the time and
  `while away` for a ruling whose `mode` is `autonomous` or `away` (the old
  name, still valid; factory ruling 2026-11-01); opening it opens the
  record; absent when the list is empty. A refused `ruled_by` (empty, mode
  null, a note `ruled_by '<v>' refused`) shows the record line with no ruler
  and the note under it in `sm` `--fg-muted`, never a guessed name.
- **FR-11** Copy as text writes `ReportText` for the window shown, byte for
  byte; the polite region says `Copied the report as text.` (AR9).
- **FR-12** States: live (heading `Running now · since <t>`, last row `now
  <t>`, re-read every 60 s while shown, no live announcement); recent (heads
  Overview until opened once on this machine and 24 h past the window's end,
  7 days at most, 0167 Q2, then folded at the end as `Last run · <date>`);
  never (absent); no card passed (`No card passed review in this run.`);
  not drawn (`Report not drawn: <FR-2's reason>`, no chart); remote (`Run
  reports are drawn on <machine>.`). The recent rule is one function in
  `lib/runReport.ts`, read by FR-13 too.
- **FR-13** Every chart row and track row has an accessible name in words;
  bars, hatching and connectors are `aria-hidden` (AR11). At 1024×640
  nothing in the section scrolls sideways and `waits on` moves under its row
  (AR14).

Card `lf57-home-signal` (frontend, `ui_review: true`):

- **FR-14** Home's initiative row shows `last run · <n> cards · <dead>
  stopped` (no dead time: `last run · <n> cards`), or `running now · <n>
  cards so far`, under FR-12's recent rule; it links to Overview scrolled to
  the section; no percent (0167 Q3); it folds first at narrow widths; a
  remote initiative has none (AR13, AR17).

## Acceptance → gate

Contract rows read `${CONTRACTS_DIR:-~/agent-slack/specs/contracts}/factory-report/`
from a checkout of agent-mailbox-specs at 8474386 (the local checkout is on
another branch: the builder makes a worktree at the pin and exports
`CONTRACTS_DIR` to it). Fake `factory` scripts in tests print the contract's
files; no gate row runs against the real home's away log.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| R1 | 1 | go test: a fake `factory` printing `expected.json`; decode, then re-encode with `root` ignored | equals `expected.json`; a test fails when the sample is missing, naming it |
| R2 | 1 | go test: `make-fixture.sh DIR`, then `Service.ReportText` over `case.json`'s window with the real `factory` | byte-equal to `expected.txt` |
| R3 | 2 | go test: `factory` off PATH; a fake exiting 2 with stderr `boom`; a remote initiative | `factory report not found`; `boom`; `drawn on <machine>` and no process started |
| R4 | 3 | go test: a fake `factory` printing `expected-windows.json` | windows as given, newest first; `--since @<since> --until @<until>` passed for a picked one |
| R6 | 5 | go test over `expected.json`'s `waves` and a usage fixture with tokens per card, some outside the window | `waves` re-encodes equal to the sample; each line's tokens count only its cards' runs inside the window |
| W1 | 7, 12 | vitest over `expected.json`: rows, caption, dead rows, notes; a live report with the dead span still going; a custom window | rows as FR-7; `stopped now` only live; `window start`/`window end` |
| W2 | 8 | vitest over `expected.json`'s `waves` | wave column values, the disclosure's words, the footer lines, a footer press calls the WaveStrip navigation |
| W3 | 9 | vitest: `expected.json`'s tracks; a JSON with `drawn: false` | `Board as of`, the fold, `↓`, `No stage` last, `local` only; the no-tracks line |
| W4 | 10 | vitest: three rulings, modes `autonomous`, `away` and none; one refused `ruled_by`; an empty list | `while away` on the first two only; the refused one shows its note and no ruler; no subsection for the empty list |
| W5 | 11 | vitest with a mocked clipboard | the written text equals `ReportText`'s bytes; the polite region's words |
| W6 | 12 | vitest of the recent rule: seen and 23 h; seen and 25 h; unseen 8 days; live | heads; folds; folds; heads |
| W7 | 13, 14 | review build at 1024×640 and 1440×900 on the fixture home, seat, by seat-pointer: `shot --out` of Overview and Home | no sideways scroll; `waits on` under the row at 1024; Home's signal reads as FR-14 |
| W8 | 14 | vitest: Home rows with a recent, a live, an old and a remote run | `last run · 4 cards · 1 h 30 min stopped`; `running now · …`; none; none |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<pin>/contracts make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf57-report-go`: `internal/service/report.go` (new) and its test,
  `app.go` (the three bindings), `frontend/wailsjs` (generated),
  `testdata/` for the usage fixture, CLAUDE.md (one Run report
  paragraph).
- `lf57-run-report`: `frontend/src/components/RunReport.tsx`,
  `RunTracks.tsx` (new) and their tests, `components/Overview.tsx` (the
  mount only), `lib/runReport.ts` (new) and its test, `styles/runreport.css`
  (new), `stores/board.store.ts` (the WaveStrip focus) only if needed.
- `lf57-home-signal`: `components/Home.tsx` (the signal only) and its tests,
  `lib/width.ts` (the fold order) and its test.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf57-report-go` | R1-R4, R6, X0 | lf53-frontmatter, lf52-decisions-line, lf55-one-title on origin/main | false |
| `lf57-run-report` | W1-W7, X0 | lf57-report-go | true |
| `lf57-home-signal` | W7, W8, X0 | lf57-run-report (`lib/runReport.ts`) | true |

## Amendment 1 (FSE, 2026-11-01): the report carries the waves and the windows

Hephaistos merged both asks (agent-mailbox-specs 8474386, claudecode
c3be84f): `factory report --json` has a `waves` block (0168 Q2) and
`--windows --json` lists the windows. The pin moves from 5d34115 to
8474386. FR-3 reads the list; FR-4 and R5 are withdrawn; FR-5 reads the
waves block and adds only tokens, which the report lacks; R4 and R6 follow.
lf57-report-go no longer waits on Hephaistos.

## Amendment 2 (FSE, 2026-11-01): launch without lf55, home signal after lf61

lf52, the three lf53 cards and the waves block are on origin/main (PRs
#5-#8). lf55-one-title is still unmerged (its H3 waits on a Dock window on
Pablo's display); its only overlap with this task is `CLAUDE.md`, so
`lf57-report-go` no longer depends on it: whichever lands second merges
the CLAUDE.md lines. `lf57-home-signal` touches `Home.tsx`, as
`lf61-decision-states-ui` (sup100, running) does: it starts after lf61 is
on origin/main. X0 for every card runs with `CONTRACTS_DIR` at a checkout
of agent-mailbox-specs 54cf10d (it holds factory-report 8474386).

## Amendment 3 (FSE, 2026-11-01, on l57-ui's gap at 2f7dccb)

FR-8's "opening Work with that WaveStrip in view" holds only for a running
wave: Work draws a WaveStrip for running waves alone (`Board.tsx`,
`WaveStrip.tsx`, outside this boundary), and the report's waves are mostly
finished. For `lf57-run-report`, a wave's footer opens Work and scrolls to
its strip when one is drawn; for a finished wave it opens Work. W2 checks
the navigation call. What a finished wave's footer should show instead is
asked of Aglaea, for a later card.

## Amendment 4 (FSE, 2026-11-01): a finished wave's footer opens its run record (PW7)

Aglaea, `docs/ux/specs/progress-and-waves.md` Amendment 1 (754615b), PW4
amended and PW7, closing the gap of Amendment 3. Card `lf57-wave-footer`,
within 0169:

- **FR-15** A finished wave's footer opens its run record (the `runs/*.md`
  its wave came from) in the spec reader drawer over the report; Back
  returns to the report where it was. A running wave's footer keeps Work
  scrolled to its strip.
- **FR-16** The link's accessible name and hover say where it goes:
  `open sup95's run record`, `show sup96 on Work`.
- **FR-17** A run record the scan reported unread goes to Needs me's
  unread row, never a dead press.

Gate: **W9** vitest of the footer's target and name for a finished, a
running and an unread wave; **W10** review build (in the worktree, never
auth: firebase, launched by its own path, pid saved, AX of that pid,
`screencapture -l`): pressing a finished wave's footer by AX opens its run
record in the drawer, and Back returns to the report at the same scroll;
X0. Boundary: `frontend/src/components/RunReport.tsx`,
`frontend/src/lib/runReport.ts`, `frontend/src/lib/specReader.ts`,
`frontend/src/components/SpecReader.tsx` (opening a run record, if it does
not already), and their tests. ui_review true.

Amendment 4, addendum (FSE, 2026-11-01, on sup101's precondition check):
the drawer reads files only through `App.ReadSpec`, and
`Service.ReadSpec` (`internal/service/spec.go:32-50`) refuses any path
that is not one of the initiative's specs. **FR-18** `ReadSpec` also
allows exactly the run record files the scan read for this initiative's
waves (under its `runs/` and `docs/runs/`), and nothing else; the footer
opens them as kind `spec`. The footer keys on the report's
`waves[].record` (the path the factory read), matched to the scan's files.
**W11** go test: a wave's run record reads; a path outside those files,
a `../` path and another initiative's run record are refused as today.
The boundary adds `internal/service/spec.go` and its test.

## Amendment 5 (FSE, 2026-11-01, on l57-home's measure at 57a04e9)

Home's signal cap (`.lz` max-width 200px, `styles/shell.css`) cuts FR-14's
words (`last run · 4 cards · 1 h 30 min stopped` is 205 px). The run signal
is exempt from that cap by one rule in `frontend/src/styles/home.css`
(`.home .p-sig .lz.run { max-width: none; }`); `lib/width.ts` still folds it
first when the row is tight. `lf57-home-signal`'s boundary adds that one
rule.

## Amendment 6 (FSE, 2026-11-01, on lf57-wave-footer's review at 957cc37)

FR-17 for an initiative that is not active: Needs me has no rows for it
(`lib/queue.ts:154`), so the unread row cannot be the target. There, the
footer opens the run record in the drawer as text (ReadSpec already allows
it, FR-18), with the scan's unread reason as the drawer's error line; an
active initiative keeps Needs me's unread row. W9 adds the non-active case.

## Amendment 7 (FSE, 2026-11-02): read dead_minutes, sum nothing (AR15's debt)

Hephaistos built `progress.dead_minutes` (the window total) and
`progress.lines[].dead_minutes` into `factory report --json` (specs
`feat/report-dead-minutes` 54369d3, both required; claudecode d423577),
from our ask. Card `lf57-dead-minutes`, within 0169:

- **FR-19** `Progress` and `Line` (`internal/service/report.go:54-90`) gain
  `DeadMinutes` (json `dead_minutes`); Home's run signal reads
  `progress.dead_minutes` instead of summing `p.dead[].minutes`
  (`Home.tsx:821`), so Deltagos computes nothing from the report.
- **FR-20** `report_test.go`'s contract test reads `CONTRACTS_DIR`, not the
  unpinned `~/agent-slack/specs` checkout its comment calls pinned
  (`report_test.go:23-29`).

Gate: **W12** `go test` of `TestReportDecodesContract` with CONTRACTS_DIR
at a worktree of specs `feat/report-dead-minutes` (fails on main);
**W13** vitest of Home's signal over a fixture whose `dead_minutes` is 90
and whose spans would sum to something else: reads 1 h 30 min; the run
report fixtures refreshed; X0 with CONTRACTS_DIR at that worktree.
Boundary: `internal/service/report.go`, `report_test.go`,
`frontend/src/components/Home.tsx` (the signal's line only),
`frontend/src/lib/runReport.ts`, `frontend/src/components/runreport.fixtures/`,
`frontend/wailsjs` (regenerated). Merge: a joint merge through talos-lab,
in order specs, claudecode, docs, then this branch.
