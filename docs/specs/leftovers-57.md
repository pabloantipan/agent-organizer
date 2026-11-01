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
  struct whose fields are the contract's (5d34115). `Service.ReportText` runs
  the same with `--text` and returns its bytes unchanged. Deltagos computes no
  count, percent, span or track of its own (AR15).
- **FR-2** With `factory` missing, or exiting non-zero, both return an error
  whose text is `factory report not found` or the command's first stderr line
  (AR16). An initiative that is not local (from another machine's snapshot)
  is refused with `drawn on <machine>` and runs nothing (AR17).
- **FR-3** `Service.ReportWindows(initiative)` lists the windows offered by
  the picker: `Running now` while autonomous mode is on, each autonomous
  window of the last 14 days in which the initiative has a move, newest
  first, then `Last 24 hours`. It reads them from `factory report`'s list of
  windows once Hephaistos adds it, pinned to that contract commit; until then
  the card does not launch (depends on it).
- **FR-4** `model.Round` gains `cause` (yaml and json), read as written; the
  scan reports a cause outside the 0042 enum as a problem on the run record,
  and an empty cause stays empty.
- **FR-5** `Service.ReportWaves(initiative, since, until)` joins the report's
  progress lines to the waves: a line's card belongs to the wave whose
  `cards:` lists it; a card in no wave, or in two, reads `no wave`, never a
  guess. Per line it gives the waves, and the rounds of those waves' cards
  that ended inside the window: their count, the failed ones by cause (empty
  cause reads `no cause given`), build minutes (build rounds' start to end),
  and tokens (the usage report's tokens of runs whose card is one of the
  line's cards, inside the window). Per wave in the window it gives its
  supervisor, cards, rounds and failures by cause. Tokens, never money
  (0020).
- **FR-6** All four are bound on `App` (`wails generate module`).

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
from a checkout of agent-mailbox-specs at 5d34115 (the local checkout is on
another branch: the builder makes a worktree at the pin and exports
`CONTRACTS_DIR` to it). Fake `factory` scripts in tests print the contract's
files; no gate row runs against the real home's away log.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| R1 | 1 | go test: a fake `factory` printing `expected.json`; decode, then re-encode with `root` ignored | equals `expected.json`; a test fails when the sample is missing, naming it |
| R2 | 1 | go test: `make-fixture.sh DIR`, then `Service.ReportText` over `case.json`'s window with the real `factory` | byte-equal to `expected.txt` |
| R3 | 2 | go test: `factory` off PATH; a fake exiting 2 with stderr `boom`; a remote initiative | `factory report not found`; `boom`; `drawn on <machine>` and no process started |
| R4 | 3 | go test against the windows contract (pinned when it lands) | presets in order, newest first, windows with no move left out |
| R5 | 4 | go test: run records with `cause: gate`, `cause: bogus`, none | `gate`; one problem naming `bogus`; empty |
| R6 | 5 | go test: a fixture of three waves over `expected.json`'s cards, one card in two waves, one in none, usage with tokens per card | lines carry their waves, `no wave` twice, rounds and failures by cause, build minutes and tokens inside the window only |
| W1 | 7, 12 | vitest over `expected.json`: rows, caption, dead rows, notes; a live report with the dead span still going; a custom window | rows as FR-7; `stopped now` only live; `window start`/`window end` |
| W2 | 8 | vitest: FR-5's join | wave column values, the disclosure's words, the footer lines, a footer press calls the WaveStrip navigation |
| W3 | 9 | vitest: `expected.json`'s tracks; a JSON with `drawn: false` | `Board as of`, the fold, `↓`, `No stage` last, `local` only; the no-tracks line |
| W4 | 10 | vitest: three rulings, modes `autonomous`, `away` and none; one refused `ruled_by`; an empty list | `while away` on the first two only; the refused one shows its note and no ruler; no subsection for the empty list |
| W5 | 11 | vitest with a mocked clipboard | the written text equals `ReportText`'s bytes; the polite region's words |
| W6 | 12 | vitest of the recent rule: seen and 23 h; seen and 25 h; unseen 8 days; live | heads; folds; folds; heads |
| W7 | 13, 14 | review build at 1024×640 and 1440×900 on the fixture home, seat, by seat-pointer: `shot --out` of Overview and Home | no sideways scroll; `waits on` under the row at 1024; Home's signal reads as FR-14 |
| W8 | 14 | vitest: Home rows with a recent, a live, an old and a remote run | `last run · 4 cards · 1 h 30 min stopped`; `running now · …`; none; none |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<pin>/contracts make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf57-report-go`: `internal/service/report.go` (new) and its test,
  `internal/model/wave.go`, `internal/scan/runs.go` (the cause check) and
  their tests, `app.go` (the four bindings), `frontend/wailsjs` (generated),
  `testdata/` for the run-record fixtures, CLAUDE.md (one Run report
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
| `lf57-report-go` | R1-R6, X0 | lf53-frontmatter, lf52-decisions-line, lf55-one-title on origin/main; Hephaistos's windows list (R4) | false |
| `lf57-run-report` | W1-W7, X0 | lf57-report-go | true |
| `lf57-home-signal` | W7, W8, X0 | lf57-run-report (`lib/runReport.ts`) | true |
