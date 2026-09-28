# The machine explains itself

status: proposed
owner: pablo
decisions: [0029 ruled, 0031 ruled, 0032 ruled]
roadmap: stage `machine-explains-itself` (appetite: one wave)

## Problem

A developer new to the factory must learn the flow and diagnose the mailbox
from the app, "because we don't have too much time for introducing a dev in
the work" (Pablo, 0029). Today (read 2026-09-28):

- **No Help.** The screens are Home, the initiative's six sub-views and
  Settings. The business flow lives in `~/agent-slack/docs/how-we-build.md`:
  237 lines, four plain-text diagram blocks and a glossary, written for
  business readers and named by Hephaistos as the Help's source (0031).
- **Health words without reasons.** They show only on roster seats
  (`crew.go:122-135`) as tooltips on `WatcherBadge`
  (`ContextBar.tsx:23-34`). Supervisors and builders are not roster seats,
  so their health is fetched but never shown. A non-roster agent with a
  persona is filtered out of the Agents tab entirely
  (`AgentsView.tsx:58`).
- **Nothing says what to run, except a remedy that is now wrong.** "Capped"
  still says "restart its session with probe -r" and "wait for a new
  session" (`ContextBar.tsx`, `Home.tsx:102-104`, `crew.go:168-175`,
  `CLAUDE.md`). Since agent-slack 8991640 the drain ceiling counts per stop
  cycle, and the next prompt delivers the mail.
- **This weekend's faults were found by digging.** sup2 ran with no
  mailbox identity (watcher "never", mail piling up); nothing in the UI
  showed it.

**Appetite:** one wave.

## Goals

- The Help shows how we follow the flow, from `how-we-build.md`, and never
  drifts from it.
- Every agent that has a mailbox identity shows its health, with why and
  what to do.
- A session running without the mailbox identity it is being written to
  says so.

## Non-goals

- Detecting macOS permissions (Accessibility, Screen Recording). The fix is
  a manual grant; one line in the Help's troubleshooting is enough, and it
  belongs in `how-we-build.md` if anywhere.
- Writing the Help's content. Hephaistos owns `how-we-build.md`, and a
  missing diagram is asked of Hephaistos, not added here.
- Actions from the Help (buttons that run probe). The Help says what to run.

## Requirements

- **FR-1** The app shall read the Help from a file whose path is the config
  key `help_doc`, default `~/agent-slack/docs/how-we-build.md`, at the time
  the Help opens. It never copies or caches the file.
- **FR-2** A Help entry in the top bar shall open the Help:
  - the file rendered as markdown, with a list of its sections;
  - its fenced blocks shown as monospace diagrams that scroll sideways
    rather than wrap.
- **FR-3** If the file is missing or unreadable, then the Help shall say
  so, and name the path it tried and the config key that sets it.
- **FR-4** One table (`frontend/src/lib/health.ts`) shall give, for each
  health state, a one-line "why" and a one-line "what to do". The states:
  never, stale, deaf, capped, and no identity. Every place that shows a
  health word uses that table.
- **FR-5** "Capped" shall say the mail waits for the seat's next prompt: the
  watcher's wake, or anything typed into its pane. It shall not say
  "restart" or "new session". The same fix goes into `crew.go`'s blocker
  reasons and CLAUDE.md's Slack paragraph.
- **FR-6** Every live agent whose name has discuss health shall show that
  health on its Agents row: persona seats, supervisors and builders. That
  includes capped, which agent rows lack today. An agent with a persona
  outside the roster shall be listed, not filtered out.
- **FR-7** If discuss health has an agent with watcher `never` and
  undelivered mail, and a live session's short name matches it (as
  `organizer-probe-sup2` matches `sup2`) while that session's process
  carries no `AGENT_NAME`, then that row shall show "no identity". Its what
  to do: relaunch with an identity prelude (the fse skill's
  `references/standing-up.md`).

## Acceptance → gate

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| G1 | 1, 3 | The Help reads the configured file at open; a missing file yields a message naming the path and `help_doc` | a test in `internal/service` (or `internal/config`) with a temp file and a missing one | pass |
| G2 | 2 | The Help shows the file's sections and its four diagrams as monospace blocks that scroll sideways, not wrap | screenshot, `wails dev`, `help_doc` set to the real file | as stated |
| G3 | 4, 5 | Every health word shown comes from `lib/health.ts`; "capped" says the next prompt delivers it, and no UI string or `crew.go` reason says "restart" or "new session" for capped | the table; `grep -rn -i -E "new session\|probe -r" frontend/src internal/service/crew.go` shows none for capped; `make test` | as stated |
| G4 | 6 | Given canned health for a roster seat, a supervisor and a builder (one capped), each Agents row shows its badge with why and what to do; a persona outside the roster is listed | a test on the health join (Go); screenshot on the fixture (A3) | as stated |
| G5 | 7 | Given canned health `sup9: never, 3 undelivered` and a live session `<family>-probe-sup9` with no `AGENT_NAME`, its row says "no identity" and what to do; with `AGENT_NAME=sup9` it does not | a test; screenshot on the fixture (A3) | as stated |
| G6 | 1–7 | Nothing else broke | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; the redesign's G18 grep (no raw colour or font size) | pass |
| G7 | — | End to end: `wails build`, run on the fixture. A reviewer who did not build it answers from the app alone, timed: for three fixture seats (deaf, capped, no identity), why is it not hearing and what do I do; and from the Help, who decides what in an initiative's discovery | screenshots and the reviewer's timed answers | all right |

## Boundary

- **help card:**
  - `internal/config/config.go` (`help_doc`);
  - a new `internal/service/help.go` and its test;
  - `app.go` (one Help method) and the regenerated `frontend/wailsjs/`;
  - a new `frontend/src/components/HelpView.tsx`;
  - `TopBar.tsx` (the entry);
  - their CSS.
- **health-words card:**
  - a new `frontend/src/lib/health.ts`;
  - `ContextBar.tsx`, `Home.tsx` (the health rows only), `SlackView.tsx`
    (the health counts' words only);
  - `internal/service/crew.go` (the blocker reasons only);
  - `CLAUDE.md` (the Slack paragraph's capped sentence).
- **health-all-agents card:**
  - `internal/service/crew.go` (stamping health on non-roster agents, and
    capped); keep off the blocker reasons, which the health-words card
    owns;
  - `internal/model/model.go` (Agent: capped, identity);
  - `internal/scan/agents.go` (read-only use of the env it already reads);
  - `AgentsView.tsx`, `AgentList.tsx`;
  - the fixture's canned health (A3);
  - its tests.
- **Must not touch:**
  - `~/agent-slack` (the doc and the API);
  - any real initiative's `working-on/`;
  - `agents/`;
  - `~/.claude/skills`.
- **No-gos:**
  - copying `how-we-build.md` into the repo;
  - a button that runs probe;
  - colour alone for a health state.

## Rabbit holes

- **A markdown framework.** `marked` is already in the bundle and trusted
  for local files (`CardDrawer.tsx`, `DecisionsView.tsx`). Reuse it.
- **Inferring why a watcher is "never" beyond FR-7.** Name the case the
  weekend produced; leave the rest to "never".
- **Detecting macOS permissions.** It is a non-goal.

## Open questions

- none

## Assumptions

- **A1** The Help renders the file live and never copies it, as Hephaistos
  proposed (thread 01M3HTFVT8VXSMXQDV9N7NBP6H). On a machine without
  `~/agent-slack`, FR-3's message is the Help.
- **A2** The Help sits in the top bar next to ⚙, not per initiative. The
  flow is the factory's, not one initiative's.
- **A3** Discuss health cannot be made deaf or capped on demand. The fixture
  therefore carries a canned health source: a file its config points at,
  read in place of the API only when that key is set. It is a test seam
  inside the health-all-agents card's boundary.

## Cards

| Card | Gate rows | Depends on |
|---|---|---|
| `explain-help` | G1, G2, G6 | — |
| `explain-health-words` | G3, G6 | — |
| `explain-health-all-agents` | G4, G5, G6, G7 | explain-health-words |

## Amendments

- none yet
