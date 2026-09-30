# The initiative header folds, and says what its parts are: the build spec

status: accepted (0063, 2026-09-29); 0064 ruled file only
owner: pablo
decisions: [0038 ruled, 0061 ruled, 0063 ruled, 0064 ruled, 0068 ruled, 0069 proposed]
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

Amendment 3 (proposed, 0069; Aglaea's ranking
`docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md`, rows cited
as "row n"; the design system as amended in 3f3df2f):

- **FR-10** (row 1, hf-U4) While the class is compact, the open header
  shall take at most 40% of the window's height and scroll inside itself.
  Its two clamps and the stage strip stay as they are.
- **FR-11** (row 2, hf-U2; changes FR-1's technical note) When a landing
  folds the header, the app shall store "folded" as the lead's choice, so
  the next tab he presses keeps it folded. Only opening Details stores
  "open" again.
- **FR-12** (row 11, hf-U1) When the folded bar is short of room, the goal
  shall give way first (cut with an ellipsis), and the target only after
  it, as the design's §1 says.
- **FR-13** (row 10, hf-U5) While one initiative is selected, Agents' crew
  group head shall not repeat the initiative's id and client; its counts and
  New agent move to the sub-view's toolbar line. The all-initiatives view
  keeps the group head as it is.
- **FR-14** (rows 3, 14, 15; the Stage stepper as amended) The folded bar's
  stage and every stage tile shall look like buttons: `cursor: pointer`,
  the hover surface, and a chevron on hover and focus. On an element
  already drawn in the accent, the focus ring sits at a 2px offset. The
  stage word is "now" wherever a stage is drawn (bar, strip, Roadmap rows).
  A run of stages of one phase takes width by its number of stages.
- **FR-15** (row 15) The clamps' "more" buttons shall be named by what they
  open ("Goal, more", "Measure, more", "Scope in, more", "Scope out,
  more"); Open in editor shall read "Open initiative.yaml in editor";
  Decisions' `dec-line` carries `aria-expanded`.
- **FR-16** (V1, the fixture) The fixture shall have an initiative with two
  or more proposed records all owned by its lead, so FR-2's longest words
  ("2 decisions waiting on you") can be checked.

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
| G12 | FR-10 | 1024×640, Details open, on Work, Decisions and Conversations | screenshots; the header's height ≤ 256 px and it scrolls inside; the strip shown |
| G13 | FR-11 | Open on a Needs me card row (a landing), then press another tab, then reload; then open Details and switch initiative | screenshots: folded, folded, folded; then open across the switch |
| G14 | FR-12 | 1024×640, folded, on the fixture initiative with the longest goal and a target | screenshot and DOM: the target whole, the goal cut with an ellipsis |
| G15 | FR-13 | Agents with one initiative selected, and with none | screenshots: no id or client under the tabs; counts and New agent on the toolbar line; the all view unchanged |
| G16 | FR-14 | hover and keyboard focus on the bar's stage and on a tile; the current tile focused; Roadmap → Stages; the strip at 1024×640 on the fixture roadmap with a one-stage run | screenshots; computed `cursor` and `outline-offset` (2px on the accent tile); no visible "current" in stage text; each run's width in proportion to its stage count |
| G17 | FR-15, FR-16 | the header's accessible names; `dec-line` before and after expanding; the chip on the FR-16 initiative | a names log (`aria-expanded` false then true); a screenshot of "N decisions waiting on you", N ≥ 2; at 1024×640 the chip's landing shows the record's head with Rule on screen |
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
- **header-fold-2 card** (amendment 3: FR-10 to FR-16):
  - `InitiativeHeader.tsx` and its CSS;
  - `board.store.ts` (the landings store "folded", FR-11 only);
  - `AgentsView.tsx` (the group head and toolbar line, FR-13 only);
  - `RoadmapView.tsx`, `Roadmap.tsx` (the stage word and the row, FR-14
    only);
  - `DecisionsView.tsx` (`aria-expanded` on `dec-line` only);
  - `styles/shell.css` (the header's and the stepper's rules only);
  - `lib/` and its tests;
  - `testdata/fixture-overlay/` (FR-16) and the fixture script, if it
    lists records.
- **Must not touch:**
  - `Home.tsx`, `Rail.tsx` (responsive-home); for header-fold-2 also
    `lib/width.ts`, `home.css`, `rule-box.css`, `Overview.tsx`,
    `CardDrawer.tsx`, `Conversation.tsx` (widths-and-focus);
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

- **Amendment 3, FR-11** replaces the first technical note: a landing
  writes the stored choice "folded" too. It is one line in each landing
  action, or one helper they share.
- **Amendment 3, FR-16:** init-drafted's only record is its cell roster,
  and the draft cell waits on it; add the second record there only if no
  test counts init-drafted's records, else give another overlay initiative
  two records owned by its lead. Either way the fixture's README says so.
- **Amendment 3, the tall record** (UI review 2's gap 1; Aglaea's call,
  thread 01M3RCXDRAHWDQSD34QPZ97Y3X): when an expanded record is taller
  than the view, its head stays at the top: number, title, "Waiting on a
  ruling" and Rule, so the lead can rule without scrolling back; the rest
  of the body scrolls. Main already does it since U8 (UI review 3 at
  1024×640); header-fold-2's `dec-line` change must keep it (G17).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `header-fold` | G1–G8, G10, G11 | responsive-home | true |
| `rule-box-finish` | G9, G11 | responsive-home | true |
| `header-fold-2` | G12–G17, G11 | — (parallel with widths-and-focus) | true |

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
- **3, 2026-09-30, proposed (0069):** Aglaea's ranking of header-fold's UI
  leftovers (rows 1–3, 10, 11, 14, 15 and V1; 3f3df2f): FR-10 to FR-16,
  G12 to G17, card `header-fold-2`. FR-11 reverses the fold's technical
  note, as the design always had it.
