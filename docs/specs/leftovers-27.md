# Leftovers 27: seats show their start, a person's waiting mail is said, scroll stops pad their text, the harness scrolls: the build spec

status: proposed (0123)
by: the FSE, 2026-10-14, on main at 089a90d
sources: Aglaea's `docs/ux/specs/launch-progress.md` (91cf067, rows L1-L7),
asked after sup63's close (`runs/2026-10-14-sup63-leftovers-23.md`: a seat
start blocks 30-60 s with nothing on screen); `tab-reaches-links.md` A3 §1
and §2 as extended 2026-10-14 (T22 padding, T23 waiting count, from
lf26-scroll-stops U2 and lf26-words U1); leftovers-26 Amendment 3 (the
harness's scheduling policy); sup63's found-not-asked (dead
`openInTerminal`, a stale comment). Gate rows follow 0095 and 0108: no row
drives Pablo's desktops, focus or input, and no row starts a real seat.

## Requirements, card `lf27-launch-state` (Go)

- **FR-1** The service keeps every seat start it is running or has just
  run (`Service.launches`, per initiative): one entry per seat with its
  state, `queued`, `starting` (with `started_at`), `retrying` (with
  `started_at`), `running`, `failed` (with `reason` in words, `exit`, the
  probe output and the seat's `launchLine`) or `skipped`, plus `seen`
  (false until the lead has seen a failure). It rides the agents feed
  (`AgentsView.launches`), and the app emits the existing `agents` event on
  every change, so the view moves without waiting for the 10 s tick and no
  new event exists.
- **FR-2** From the app, `CreateCrew` and `CreateAgent` return as soon as
  the entries are queued and start the seats one after another in the
  background (sequence, not parallel: launch-progress, Out of scope). The
  CLI (`organizer crew`, `organizer run`) stays blocking and prints each
  seat's state as a line.
- **FR-3** Bound methods: `StopStarting(initiative)` marks the queued seats
  `skipped` and lets the one in flight finish; `RetrySeat(initiative,
  seat)` starts that one seat again; `SeenLaunch(initiative)` sets `seen`.
  Entries of a start whose seats all run are dropped 5 s after the last
  one runs; a start with a failure stays until it is seen or retried.
- **FR-4** A probe stub for gates and the fixture: `ORGANIZER_PROBE_BIN`
  replaces `probeBin` when set (as `ORGANIZER_MEMORY_FAKE` does for
  memory); `scripts/probe-stub.sh` sleeps a few seconds and exits 0, or 3
  for a seat whose name the env `PROBE_STUB_FAIL` lists, printing two pane
  lines. Documented in `scripts/fixture-home.sh`.
- **FR-5** `openInTerminal` (`service.go:433`, no caller since lf23) goes,
  and the comment at `app.go:386-387` says the seats start detached.

## Requirements, card `lf27-launch-view` (frontend), after `lf27-launch-state`

- **FR-6** Aglaea's `launch-progress.md` as written for Bring crew up and
  New agent: the crew block becomes the seat list in place, headed
  `Starting crew · n of m running`, with `Stop starting`; each seat a word
  and a shape (waiting; starting · n s; trying again · n s; running;
  didn't start); seconds counted up in the frontend from `started_at`,
  `aria-hidden`, nothing animated; focus to the heading; one polite live
  region saying each result once and the total; the list closes 5 s after
  all run and stays on a failure; a failed seat shows the reason, `Try
  again` and `Copy the command`, the full output in the hover. New agent's
  button reads `Starting · n s`, then `Trying again`, then focus goes to
  the new row, or to `Try again` on one danger line under it.
- **FR-7** A failure not yet seen is one Needs me row `Crew of <id>: n
  seat(s) didn't start`, verb Agents (`needsMeRows` in `lib/queue.ts`); it
  goes when the list is shown (`SeenLaunch`) or the seat is retried.
- **FR-8** Run card has no button in the app (only `organizer run`), so
  launch-progress's Run card part does not apply here.

## Requirements, card `lf27-polish` (frontend, scripts)

- **FR-9** (T23) A person's description says the waiting count right after
  the mail word whenever the badge draws one: `session off, mail stale, 1
  message waiting, owes 2 messages, context 42%`; deaf and capped too;
  nothing when none waits.
- **FR-10** (T22 extended) Every scroll stop of leftovers-26 pads its
  content at least 4 px on each side under its inset ring
  (`outline-offset: -2px`); regions with more padding already are
  unchanged. The rule box's record and the header's open area are the two
  ss-ui U2 found.
- **FR-11** The Tab harness sets `WKPreferences.inactiveSchedulingPolicy =
  .none`, so animated scrolls run in its hidden window (leftovers-26
  Amendment 3).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| P1 | 1, 2, 3 | Go test with the stub as `probeBin`: a crew of three, the second failing twice; read the entries after each step; `StopStarting` while the second starts; `RetrySeat`; `SeenLaunch`; a fake clock for the 5 s drop | queued → starting → running / retrying → failed with reason, exit 3 and output; the third `skipped` after Stop; retry restarts one seat; entries dropped 5 s after all run, kept on failure until seen |
| P2 | 2 | Go test: `App.CreateCrew` returns before the stub's sleep ends; `organizer crew <fixture> ` with the stub prints one line per seat state | returns in < 1 s; lines in order |
| P3 | 4, 5 | `ORGANIZER_PROBE_BIN=scripts/probe-stub.sh PROBE_STUB_FAIL=b` on a fixture cell, `organizer crew --print` then a real run; `grep -n openInTerminal` in Go; `sed -n 386,387p app.go` | stub used, b fails twice, no claude started, no iTerm window (window count unchanged); no match; the comment says detached |
| V1 | 6 | harness on the review build with the stub, a fixture cell of 3+ seats, one failing: press Bring crew up; read the list each second for 10 s; AX of the list; screenshot | L1, L5: every seat listed with its word; the starting seat's seconds grow; the failed one reads `didn't start` with the reason, `Try again`, `Copy the command` |
| V2 | 6 | the same run: the live region's text over time; `document.activeElement` after the press; Stop starting during the second seat | L2, L3, L4: one announcement per result and the total, none per second; focus on the heading; the waiting seats read `off` |
| V3 | 6 | harness: New agent with the stub, once succeeding, once failing | L3: `Starting · n s`, focus to the new row; on failure the danger line and focus on `Try again` |
| V4 | 7 | harness: start the crew, open Home before the failure, wait; return to Agents | L6, L7: a Needs me row `Crew of <id>: 1 seat didn't start` with Agents; back on Agents the current list, not the button; the row gone after |
| W1 | 9 | vitest of the description with 0, 1, 2 waiting under alive, stale, deaf, capped; AX of one person row | FR-9's form, `message`/`messages` right, nothing when 0 |
| W2 | 10 | harness at 1024×640: focus each scroll stop, computed padding and a screenshot of the ring against the first line | padding ≥ 4px each side; the ring clears the text |
| W3 | 11 | the harness's source; a harness run pressing Down ×3 in an overflowing card body | the setting present; `scrollTop` > 0 |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf27-launch-state`: `internal/service` (`crew.go`, `run.go`,
  `service.go`, a new `launch.go`, their tests), `app.go` (the bound
  methods, the emit, the comment), `internal/cli` (the crew and run
  lines), `scripts/probe-stub.sh`, `scripts/fixture-home.sh` (the stub's
  note only), `frontend/wailsjs` regenerated. Not: any component or
  stylesheet.
- `lf27-launch-view`: `Crew.tsx`, `AgentsView.tsx` (`NewAgent`),
  `lib/queue.ts` and the Home row it feeds (`Home.tsx` only for the row's
  verb if needed), the store only for the launch list, a new
  `styles/launch.css` (tier-2 tokens), their tests. Not: `SlackView.tsx`,
  the scroll-stop stylesheets, Go.
- `lf27-polish`: `SlackView.tsx` (the person description) and its test;
  the padding rules of the scroll stops in `styles/global.css`
  (`.modal-body*`, `.markdown pre*`, `.markdown table*`),
  `styles/rule-box.css`, `styles/shell.css` (the header's open area),
  `styles/roles.css` (`.rd-*`), `styles/help.css`, and `styles/float.css`
  (`.fl-body` only); `scripts/tab-harness/`. Not: the files of
  the other two cards.

## No-gos

- No seats started in parallel (launch-progress, Out of scope).
- No pane output shown live.
- No real claude session in any gate row: the stub only.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf27-launch-state` | P1, P2, P3, X0 | — | false |
| `lf27-launch-view` | V1, V2, V3, V4, X0 | `lf27-launch-state` | true |
| `lf27-polish` | W1, W2, W3, X0 | — | true |
