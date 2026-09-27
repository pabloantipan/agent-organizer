# The organizer, organized around the initiative

status: ruled (0023, 2026-09-26)
owner: pablo
decisions: [0013 ruled, 0014 ruled, 0015 ruled, 0016 ruled, 0017 ruled, 0018 ruled, 0019 ruled, 0020 ruled, 0021 ruled, 0022 ruled]
visual reference: `docs/specs/redesign-mockups.html` (bf0e085), pins H1–H3, O1–O5, W1–W4, R1–R2
design system: `docs/design-system.md` and `frontend/src/styles/tokens.css` (ac0d15a..ef1b980); the mockups show layout, the design system decides every value

## Problem

Pablo needs one app that says, per initiative, what it is for, where it
stands, what waits on him and who is building what, so that he opens the
organizer instead of asking a session "where was I" (0013).

Today the same data is cut into eight peer tabs (`board.store.ts:5`,
`TopBar.tsx:8-17`) and none of them answers those questions:

- The initiative has no goal. `model.Initiative` has no `goal`, `measure` or
  `specs` (`model.go:35-53`).
- Nothing reads `working-on/roadmap.yaml`.
- Nothing joins a live agent to a card. Agents are joined only to
  initiatives (`scan/agents.go:351-392`); the only card join is the run
  archive (`session.MatchCard`, `runs.go:147-196`).
- Nothing groups cards into waves.
- `organizer runs` is not bound to the UI.
- The decision queue is not part of Needs me (`queue.ts:19-27`).

**Appetite:** two waves. The first is the backend joins, with no UI. The
second is the views, ending at the mockup page. A third wave means the spec
was wrong; stop and amend it.

## Goals

- Home answers "what needs me, and where is every initiative" in one screen.
- Every initiative screen opens with its goal, its measure and its stage.
- Work shows who is on each card and what the wave is doing, in tokens (0020).
- Roadmap draws stages, with the decisions that gate them.
- Pablo rules a decision from Needs me, and his words land in the record (0019).

## Non-goals

- The organizer's own goal and roadmap. They wait on Pablo's intake; the
  fixtures carry examples.
- Cross-column drag, or any write to a card file.
- New card statuses. "In review" is a lane derived from `next`, not a status
  (the Conventions in `CLAUDE.md`).
- Dollars anywhere but `organizer runs` (0020).
- A light theme, frontend unit tests, and any change to the discuss API.

## Requirements

### Wave 1 — joins (Go, no views)

- **FR-1** The scan shall read `goal`, `measure` and `specs` from
  `initiative.yaml` and carry them on the board initiative.
- **FR-2** The scan shall read `working-on/roadmap.yaml` in the format the
  working-on skill defines (Roadmap). Each stage carries `id`, `title`,
  `outcome`, `exit` (a string, or `{text, met}`), `gates`, `appetite`,
  `target` and `done`.
- **FR-3** The current stage shall be the first stage without `done`. An
  initiative with no roadmap has no stages and no problem.
- **FR-4** Cards and decision records shall carry an optional `stage:`.
- **FR-5** If a roadmap is malformed, then the scan shall report a problem
  and never fail the scan. Malformed means:
  - a duplicate stage id;
  - a gate that names no record;
  - a card or record whose `stage:` names no stage;
  - a `target`, `met` or `done` date that is not a real date.
- **FR-6** The agents feed shall join each live agent to at most one open
  card of its initiative. The keys, in order:
  1. a cwd path element equal to the card's branch or slug;
  2. the checkout's branch equal to the card's `branch`;
  3. the card's `seat` equal to the agent's persona or session.

  Keys 1 and 2 are the ones `session.MatchCard` and `Service.branchOf`
  already use.
- **FR-7** If two cards answer to one agent, then the agent shall be joined
  to none. This is `MatchCard`'s rule: a wrong card is worse than no card.
- **FR-8** Each joined agent shall carry its state, context percentage,
  input tokens and start time.
- **FR-9** Cards whose `seat` matches `wave<N>-<name>` shall form wave N. For
  each wave the board shall carry:
  - its cards grouped as building (an agent joined), in review (`next`
    starts with `review:`), queued, and done;
  - its gate rows passed out of the total;
  - the input tokens of its cards;
  - its supervisor (Assumptions A1 to A3).
- **FR-10** The app shall expose runs for one initiative, with input tokens
  summed per card over archived and live sessions (0020). Dollars stay in
  the CLI.
- **FR-11** The board shall carry the FSE's activity for an initiative:
  - the HAND-OFF section of `docs/bitacora/fse_bitacora.md`;
  - the last 10 commits under the initiative root with a
    `Committed-by: FSE` trailer (time and subject);
  - the FSE's open threads.

  Without a bitácora there is no activity and no problem.
- **FR-12** (built in wave 2, `redesign-overview`) The FSE panel shall also list what the FSE waits on from the
  owner, up to five items, derived and never stored:
  - the initiative's `proposed` records raised by the FSE and owned by the
    human;
  - threads the FSE opened to the human that still ask the human
    (`CellThread.AskedOfMe`).

  Each item links to its Needs me row. The panel header shows the count,
  "waiting on you: N", so it reads when the list is collapsed (0021).
- **FR-13** When the owner rules a `proposed` record from the app with a
  chosen option and their words, the service shall:
  - set `status: ruled`, `ruled` (today), `ruled_by` and `chosen`;
  - write the words under `## Ruling`, with where they were said;
  - leave every other byte of the file as it was;
  - commit that one file.

  It shall refuse:
  - a record that is not `proposed`;
  - a `chosen` value not in `options`;
  - empty words.

  `organizer rule <initiative> <NNNN> --chosen <option> --words <text>` is
  the same path (0019).

### Wave 2 — views

- **FR-23** Every view in this wave shall be built from the design system
  (`docs/design-system.md`):
  - tier-2 role tokens only (surfaces, text, borders, accent, status,
    decisions, signals), never a raw hex, rgba or legacy alias
    (`--panel`, `--muted`, `--dim`, `--r`, …) in a component touched here;
  - the seven type sizes (`--font-size-xs` … `--font-size-3xl`) and nothing
    else, with tabular numerals on every count, date and token figure;
  - the component anatomy of its Components section for the rail item,
    board column and card, inbox row, stage stepper, timeline, decision
    record and agent row;
  - its CSS rules: the Safari 15.0 floor (no `oklch()`, `color-mix()`,
    relative colours, native nesting or `@layer`) and a `:focus-visible`
    ring that is never removed.
  Where the mockup page and the design system disagree on a value, the
  design system wins.

- **FR-14** Navigation shall be Home, plus one initiative with six sub-views
  under one header: Overview, Work, Roadmap, Decisions, Conversations,
  Agents.
  - Calendar moves into Roadmap.
  - Initiatives moves into Home.
  - Settings moves behind ⚙.
  - The Slack tab is renamed Conversations; its content is unchanged.
  - The rail stays.
- **FR-15** There shall be one Needs me badge: `queueOf` plus the decisions
  waiting on a ruling, in one list, oldest first, with the action on each
  row (Rule, Answer, Open, Agents). It replaces the Slack and Decisions
  badges (H1, H2).
- **FR-16** Home shall list initiatives by priority, each with its goal
  (or "no goal yet"), a stage stepper, its signals, and its next real date
  (H3).
- **FR-17** The initiative header shall show the goal, the measure, the
  target, the count of waiting decisions, and the stages with the current
  one marked (O1, O2).
- **FR-18** Overview shall list the current stage's gates (records, shown as
  diamonds, waiting or ruled) and its exit items (checked or not). It shall
  also show a work summary in tokens and the FSE panel from FR-11 (O4, O5).
- **FR-19** Work shall have:
  - the columns Next · Now · Blocked · In review · Done (0018); In review is
    a lane holding the cards whose `next` starts with `review:`;
  - a wave strip per running wave, with a tile per card;
  - on each card, who is on it (agent, context, time, tokens) or "nobody on
    it" (W1–W4).
- **FR-20** Roadmap shall draw one row per stage, with its gates as diamonds
  placed at the date raised and, once ruled, at the date ruled. It shall
  switch to Cards (today's Gantt) and Calendar (today's month grid) (R1).
- **FR-21** A stage without a `target` shall draw as a dashed bar sized by
  order only, labelled with its `appetite`. A `target` stays a date, and no
  date is ever computed from an appetite (R2, 0022).
- **FR-22** From a decision row in Needs me, a box shall take the chosen
  option and the owner's words and call FR-13. The row shall then leave the
  queue (0019).

## Acceptance → gate

All Go checks run from the repo root. "A test that …" means a named test in
the package's `_test.go` with testdata under `testdata/home`.

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| G1 | 1 | Given a fixture initiative with goal, measure and specs, when scanned, then all three reach the board | a test in `internal/scan` and one in `internal/merge` | pass |
| G2 | 2,3 | Given a roadmap with stage 1 done and stage 2 not, the current stage is 2; with no roadmap there are no stages and no problem | a test in `internal/scan` | pass |
| G3 | 4,5 | Given a duplicate stage id, an unknown gate, an unknown `stage:` on a card, and a bad date, each is one problem and the rest of the board scans | a test in `internal/scan` | 4 problems, board intact |
| G4 | 6,7,8 | Given agents in `.wt/<slug>`, on a branch, and by seat, each is joined to its card with context and tokens; an agent matching two cards is joined to none | a test in `internal/service` or `internal/scan` | pass |
| G5 | 9 | Given cards seated `wave1-a` (joined agent), `wave1-b` (`next: review: …`) and `wave1-c` (no agent), wave 1 has 1 building, 1 in review and 1 queued, the gate rows counted, and tokens summed | a test | pass |
| G6 | 10 | Given runs.jsonl with two archived runs and one live session on a card, the binding returns the card's summed input tokens | a test in `internal/service` | pass |
| G7 | 11 | Given a fixture bitácora and a fixture git repo with two `Committed-by: FSE` commits, the activity has the hand-off and both commits, newest first; with no bitácora it is empty and there is no problem | a test | pass |
| G8 | 13 | Given a proposed fixture record in a temp git repo, ruling it writes the four fields and the Ruling, `git diff` shows only those lines, and there is one commit touching one file; ruling it again, a bad option, or empty words each refuse and write nothing | a test in `internal/service`; `organizer rule --help` | pass |
| G9 | 1–13 | Nothing else broke | `make test`; `UPDATE_GOLDEN=1` only for new fields in `status.golden`, with that diff shown | pass |
| G10 | 14 | The app opens on Home; selecting an initiative shows the header over six sub-views; Calendar is reached from Roadmap and Settings from ⚙ | screenshot, `wails dev`, fixture config (G16) | matches mockup Home, Overview |
| G11 | 15 | Needs me shows the fixture's waiting decision and queue rows in one list with one badge; the Slack and Decisions badges are gone | screenshot | one badge, count = rows |
| G12 | 16,17,18 | Home rows, the header and Overview show the fixture goal, stepper, gates and exits; an initiative with no goal says "no goal yet" | screenshots | matches H3, O1, O2, O4 |
| G13 | 19 | Work shows five columns, a wave strip for the fixture wave, and each card's agent line or "nobody on it" | screenshot | matches W1–W4 |
| G19 | 12 | Given the fixture initiative with two FSE-raised proposed records and one FSE thread asking the human, the FSE panel lists three items linking to Needs me, and its header reads "waiting on you: 3" when collapsed | screenshot | matches O5 plus the count |
| G14 | 20,21 | Roadmap shows one row per fixture stage, gate diamonds, and a dashed bar for a stage with no target; Cards and Calendar switch | screenshot | matches R1, R2 |
| G15 | 22 | Ruling the fixture record from Needs me writes it (G8's checks on the temp copy) and the row leaves the queue | screenshot and `git -C <tmp> log -1 --stat` | one file, one commit |
| G17 | — | Wave 1 changes no stylesheet | `git diff --name-only main...<branch> -- '*.css'` | empty |
| G18 | 23 | Wave 2 adds no raw colour or font size outside `tokens.css` | `git diff main...<branch> -- 'frontend/src/**/*.css' 'frontend/src/**/*.tsx' ':!frontend/src/styles/tokens.css' \| grep -E '^\+.*(#[0-9a-fA-F]{3,8}\b\|rgba?\(\|font-size:[[:space:]]*[0-9])'` | empty |
| G16 | — | End to end: `wails build`; run the app with `ORGANIZER_CONFIG` set to a temp config whose roots are a temp copy of `testdata/home` (a git repo); walk Home → init-a → Overview → Work → Roadmap → rule the fixture record | screenshots of each, plus `cd frontend && npm run build` | every screen renders, the record is ruled, no console errors |

## Boundary

- **Wave 1 may touch:**
  - `internal/model`, `internal/scan`, `internal/merge`, `internal/service`
    and `internal/cli` (the new `rule` command, and status fields);
  - `app.go`, only for the Runs and Rule bindings, plus the regenerated
    `frontend/wailsjs`;
  - `testdata/home`, `CLAUDE.md` (the Layout bullets for what changed; line
    37 changes per 0019).

  Each card's boundary narrows this.
- **Wave 2 may touch:** `frontend/src` only, plus `CLAUDE.md` Layout
  bullets for the navigation.
- **Must not touch:**
  - any real initiative's `working-on/`;
  - `agents/`;
  - the discuss API;
  - `~/.claude/skills`;
  - `firestore.rules`;
  - `internal/sync`.
- **No-gos:**
  - writing to a card file;
  - the app writing anything to a record but FR-13's fields;
  - inventing a date or a stage for a real initiative;
  - a new card status.

## Rabbit holes

- **Parsing `progress.md` phases.** Its format is the build seat's, and not
  fixed. Phases are shown only under A3; do not design a format.
- **A git library for FR-11 or FR-13.** Shell out to `git` as retire does
  (`retire.go:314-329`).
- **Rebuilding Board and Roadmap from scratch.** Board, Roadmap, Calendar and
  Portfolio exist. Reuse them inside the new shell, and change only what the
  FRs name.
- **Supervisor liveness beyond the session name.** A1 is enough.
- **Session names on this initiative.** Since `longer-session-names`
  (done, 2026-09-27) a probe session name may be 68 characters
  (`maxSessionName`, `internal/service/crew.go:46`), so a builder's session
  can be its slug. The card's `seat:` is `wave<N>-<name>` (FR-9 groups by
  seat, not session).

## Open questions

- none; 0021 and 0022 were ruled 2026-09-27

## Assumptions

- **A1** Wave N's supervisor is the live session `<family>-probe-sup<N>`
  (the fse skill's naming). If there is none, the strip says "no
  supervisor".
- **A2** Gate rows are the checkboxes under the card body's `## Gate`
  heading: `- [x]` passed, `- [ ]` open. A card without that heading shows
  "gate —".
- **A3** A builder's phases are the checkboxes in `progress.md` at the card's
  launch directory. Without the file, no phases are shown.
- **A4** `ruled_by` is the record's `owner`, because on auth off the
  organizer has no identity and is run by its owner. The Ruling line says
  "in the organizer on <machine>".

## Alternatives considered

- **Fix each of the eight tabs in place:** rejected by 0013.
- **Bind agents to cards in the frontend:** the join needs cwd and branch,
  which only the service has.
- **Waves from a separate `waves.yaml`:** a second source of truth. The
  `seat:` field already exists (`model.go`) and supervise uses it.

## Cards

Wave 1 runs in two steps: the three with no dependencies first, then the
three that depend on them. Wave 2 starts once wave 1's review passes.

| Card | Gate rows | Depends on |
|---|---|---|
| `redesign-goal-stages` | G1, G2, G3, G9, G17 | — |
| `redesign-agent-card` | G4, G9, G17 | — |
| `redesign-runs-binding` | G6, G9, G17 | — |
| `redesign-waves` | G5, G9, G17 | goal-stages, agent-card |
| `redesign-fse-activity` | G7, G9, G17 | goal-stages |
| `redesign-rule-record` | G8, G9, G17 | runs-binding |
| `redesign-shell-home` | G10, G11, G12 (Home, header), G18 | wave 1 |
| `redesign-overview` | G12 (Overview), G19, G18 | shell-home |
| `redesign-work` | G13, G18 | shell-home |
| `redesign-roadmap` | G14, G18 | shell-home |
| `redesign-rule-box` | G15, G16, G18 | overview, work, roadmap |

## Amendments

- 2026-09-26: FR-23 and gate rows G17, G18 added at Pablo's request (thread 01M3G4W66JB0YXBG0TW795WQ6W): the views build on the design system (ac0d15a..ef1b980). Before acceptance; 0023 accepted this version.
- 2026-09-27: 0021 and 0022 ruled. FR-12 is now a requirement (in `redesign-overview`, gate G19); FR-21 always labels the appetite. The build proved nothing wrong; the open questions closed.
- 2026-09-27: the session-name rabbit hole now states the 68-character ceiling from `longer-session-names`.
- 2026-09-27, after wave 1 (all six passed review): as built, a wave's token count (FR-9) sums its joined agents' live statusline tokens, not the archive; archived tokens reach Work per card through the runs binding (FR-10). FR-11 as built reports FSE-signed commits even where there is no bitácora (only the hand-off is empty). Both are what wave 2 renders; the gate rows stand (see `done/redesign-waves.md`, `done/redesign-fse-activity.md`).
