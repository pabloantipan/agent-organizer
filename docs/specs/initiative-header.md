# The initiative header folds, and says what its parts are: the build spec

status: accepted (0063, 2026-09-29); 0064 ruled file only
owner: pablo
decisions: [0038 ruled, 0061 ruled, 0063 ruled, 0064 ruled, 0068 ruled]
design: `docs/ux/specs/initiative-header.md` (Aglaea, 6c93a49), "the design"
roadmap: stage 2 (twenty at a glance), the header; appetite one wave

## Problem

Pablo's six findings on the header from the installed app are in
`working-on/header-review-2.md`, in his words ("I can't colapse the goal and
the scope. And gain, too much space."; "On the chip 2 decisions waiting click
does nothing"; the stage strip has no label; the phase chip reads as a status;
a stage tile opens nothing; editing goal and scope). ui-leftovers' UI reviewer
added UI1: at 1024×640, Answer lands on Conversations with an 8 px timeline.
The design measured the cause on `4c3c78d`: the header is 378 px at every
width, 59% of the window at 1024×640.

**Appetite:** one wave, two cards in parallel, after responsive-home (it
adds the width class these cards read, and it owns the rule box).

## Goals

The design's acceptance H1 to H11.

## Non-goals

As the design's "Out of scope": Home, the rule box's placement and the rail
(responsive-home); Roadmap's Cards and Calendar. Editing goal and scope in the
app: 0064 ruled file only.

## Requirements

Each FR is the design's section of the same subject.

- **FR-1** (§1, the fold) The header shall have two states:
  - **folded**, one bar: id, stage, waiting chip, target, the goal on one
    line, and Details;
  - **open**, today's block, with scope clamped like goal and two columns in
    the wide class.

  Folded is the default, and the state is remembered per machine. Every
  landing folds it: Answer, Open, `openDecision`, `openNeedsMe`,
  `openSlack`, a stage tile. Opening Details by hand stays open across
  initiatives until the lead folds it.
- **FR-2** (§2; amendment 2, 0068) The waiting chip shall read "N decisions
  waiting", or "N decisions waiting on you" when the lead owns them (one
  decision: "1 decision waiting"), and is not drawn at zero. It opens Decisions on the first waiting
  record, expanded and focused (`openDecision`), from any sub-view,
  including Decisions itself.
- **FR-3** (§3, §4) The stage strip shall carry a label with an icon:
  "Roadmap · stage n of m". When every stage has the same phase, the phase
  sits once in the label ("Roadmap · building · stage 5 of 6"). Otherwise it
  is a word over each run of stages, with a divider where it changes. No tile
  carries a phase chip.
- **FR-4** (§5) A stage tile shall be a button. It opens Roadmap → Stages
  with that stage expanded (outcome, exit items with their dates, gates, its
  cards) and focused. The expanded stage row in `StageRoadmap` is new.
- **FR-5** (§6) Conversations, Agents and Decisions shall drop their title
  row repeating the initiative's id (`SlackView.tsx:68`, `:82`;
  `DecisionsView.tsx:80` when an initiative is selected; Agents' equivalent).
- **FR-6** (§7) At 1024×640, Conversations shall give the timeline at least
  half the sub-view's height. Answer lands with focus on the thread's
  divider, and the asked message and the composer both on screen.
- **FR-7** (the design's "the rest", UI2, UI4–UI7):
  - Tab and Shift+Tab loop inside the open rule box, and one box is open at
    a time.
  - When the record area is shorter than both clamps, the Question clamps
    to three lines.
  - `ownerPhrase` on DecisionsView.
  - The rule box's head and its dialog name carry the initiative
    ("init-drafted 0001").
  - The People toggle's `aria-label` names People and its counts.
- **FR-8** (redesign FR-17 changes) The goal, the measure and the stages
  show on the folded bar (goal on one line, the stage) and in Details (the
  whole). 0038's clamps and fixed header stand.
- **FR-9** (0064: file only, shown honestly) Details shall say where goal,
  measure and scope are written ("from working-on/initiative.yaml"), offer
  Open in editor (the action Home's row detail already has), and show
  "edited, not committed" when git reports the file modified. The app writes
  nothing to the file. (Amendment 1: the scan supplies that fact; see the
  boundary and the technical notes.)

## Acceptance → gate

| # | Design | Check | Expected |
|---|---|---|---|
| G1 | H1 | 1024×640, Answer on init-a's asking thread (the ui-leftovers fixture) | screenshot and `activeElement`: as H1 |
| G2 | H2, H10 | every sub-view at 1024, 1512 and 3440, folded | screenshots; bar plus tabs ≤ 90 px; no repeated id row |
| G3 | H3, H4 | open Details, switch initiative, reload; then Open on a Needs me card row | screenshots; as H3, H4 |
| G4 | H5 | the chip from Work and from Decisions; an initiative with no waiting record | screenshots and `activeElement`: as H5 |
| G5 | H6, H7 | the organizer's header on the real home (read only), init-a on the fixture | screenshots: as H6, H7 |
| G6 | H8 | click and Enter on stage 2's tile | screenshot and `activeElement`: as H8 |
| G7 | H9 | 3440×1380, Details open | screenshot: as H9 |
| G8 | H11 | a reviewer who never saw the app, shown the folded bar and the strip at 1512×945 | their answers: as H11 |
| G9 | FR-7 | the rule box: Tab loop, one box, Question at three lines on the roster record at 1024, the head's name; Decisions' owner phrase; People's name | a log of focus and accessible names; screenshots |
| G10 | FR-9 | Details on the fixture with `initiative.yaml` clean, then modified and uncommitted | screenshots: the source line and Open in editor; then the "edited, not committed" mark |
| G11 | all | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; the redesign's G18 grep | pass |

## Boundary

- **header-fold card** (FR-1 to FR-6, FR-8, FR-9):
  - `InitiativeHeader.tsx`;
  - `RoadmapView.tsx`, `Roadmap.tsx` (the expanded stage row only);
  - `SlackView.tsx`, `Conversation.tsx` (the title row, the timeline's
    height, Answer's focus);
  - `AgentsView.tsx`, `DecisionsView.tsx` (the title row only);
  - `board.store.ts` (the fold state; landings fold);
  - `styles/shell.css`, header CSS; `lib/` and its tests;
  - amendment 1, for FR-9 only: `internal/scan/git.go` (a function that runs
    `git status --porcelain -- working-on/initiative.yaml` at the initiative
    root, with the scan's timeout); `internal/scan` where the initiative is
    assembled (one call); `internal/model/model.go` (`Initiative`:
    `charter_modified bool`); `frontend/wailsjs` (generated); a test in
    `internal/scan` on a temp git repo (clean, modified, not a repo).
- **rule-box-finish card** (FR-7):
  - `RuleDecisionBox.tsx`, `rule-box.css`;
  - `DecisionsView.tsx` (`ownerPhrase` only);
  - `Conversation.tsx` (the People toggle's label only);
  - `lib/` tests.
- **Must not touch:**
  - `Home.tsx`, `Rail.tsx` (responsive-home);
  - Go code, except amendment 1's FR-9 lines;
  - `docs/design-system.md` (Aglaea's);
  - `~/.claude/skills`.

## Technical notes

- **Fold state:** a store field remembered in localStorage, like
  `rail.collapsed.strip` (`board.store.ts:117`). It is a key of its own,
  written only by the lead's Details toggle. The landing actions (`openSlack`,
  `openNeedsMe`, `openDecision`, and the stage-tile action) set the in-memory
  field to folded and do not write the stored choice. That is how "a landing
  folds it" and "Details stays open" coexist: the stored choice applies on
  the next navigation the lead makes by hand.
- **The chip** today calls `openInitiative(id, "decisions")`, which does
  nothing on Decisions. Use `openDecision(id, first waiting number)`.
- **The stage tile** needs a store target like `decisionFocus`, named
  `stageFocus: <initiative>/<stage id>`, which `StageRoadmap` reads, expands
  and focuses, then clears.
- **Width class:** read responsive-home's FR-1 field; do not add another
  listener.
- **FR-9's mark** (amendment 1): the scan knows only a dirty count per listed
  repo, and the organizer lists `repos: []`, so nothing reports
  `initiative.yaml`. Reuse `git()` in `internal/scan/git.go`. The call is
  empty output → false. A root that is not a git repo, or git failing, is
  false with no problem reported: the mark is a hint, never an error.
- **Parallel cards:** both touch `DecisionsView.tsx` and `Conversation.tsx`
  in different lines. The second to merge rebases.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `header-fold` | G1–G8, G10, G11 | responsive-home | true |
| `rule-box-finish` | G9, G11 | responsive-home | true |

## Amendments

- **1, 2026-09-29, the build proved the spec wrong:** FR-9's "edited, not
  committed" mark (chosen in 0064) has no data source, and the spec's "No Go
  change" was the FSE's unchecked assumption (hdr-fold's `decide:`,
  046c69e). The boundary widens by one narrow Go fact, `charter_modified`,
  for header-fold only. FR-9's words and G10 are unchanged. G11 covers the
  Go test.
- **2, 2026-09-30, 0068 ("N decisions waiting"):** FR-2's words, after G8's
  blind reader could only guess what "3 waiting" leads to (830672b). G8
  reruns with a reader launched outside the initiative root.
