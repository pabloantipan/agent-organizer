# What the lead sees and presses works as it reads

status: accepted (0055, 2026-09-29); amendment 1 from 0056; amendment 2 proposed (0057)
owner: pablo
decisions: [0019 ruled, 0034 ruled, 0047 ruled, 0051 ruled, 0053 ruled, 0055 ruled, 0056 ruled]
roadmap: stage `discovery-in-a-cell` (its cell screens) and fixes to stage 2's Home; appetite one wave

## Problem

Aglaea's first two reviews found places where a screen reads one way and
behaves another. Both reviews are heuristic: nobody was watched.
`docs/ux/reviews/2026-09-29-first-look.md` (F) and
`docs/ux/reviews/2026-09-29-cell-screens.md` (C), with screenshots beside
them. The ones carried here, most severe first:

- **Rule without the record** (F2, C6, 3). The Needs me Rule box
  (`RuleAction` → `RuleDecisionBox`, `Home.tsx:138`) shows option ids and a
  text box. The question, what each option means and the recommendation are
  only on the Decisions tab (`DecisionsView.tsx:129`). A roster is accepted
  without its seats being shown, and every ruling is a commit.
- **Names lost at the minimum window** (F1, 3). At 1024×640 (`main.go:38`),
  Home's name column cuts to 4–5 characters. twenty-at-a-glance G9 was timed
  at 1440 only.
- **Launch to a dead end** (C1, 3). The Launch row (discovery-in-a-cell
  FR-7) says "waits on its first launch" when a seat has no persona file, and
  lands on a disabled Bring crew up.
- **A reason nobody reaches** (C2, 3). Bring crew up's disabled reason is a
  `title` on a wrapper span (discovery-in-a-cell FR-6 said "hover"), out of
  reach of the keyboard and screen readers. Draft the cell already shows its
  reason as text (`AgentsView.tsx:160`).
- **Draft twice** (C3, 3). After Open succeeds, Draft the cell comes back
  enabled, and a second press opens a second drafting session on the same
  root.
- **States not named** (C4, 2; my gap in discovery-in-a-cell amendment 1):
  checking, opened and error on Open.
- **Smaller** (2–1): the roster link opens Decisions with nothing expanded
  (C5); the Needs me subtitle lists kinds and misses cells (C7); `.tiny-btn:disabled`
  sits at `.6` (`global.css:477`), where `button:disabled` and the design
  system use `.45` (C8, F7); `retire --retirable` leaves "in definition" out
  of its reasons (sup16); the accept-record rule (slug `the-cell-roster`,
  proposed, highest number) is written twice, in `draft.go` and `Crew.tsx`
  (sup16).

**Appetite:** one wave, two cards in parallel.

## Goals

- A ruling from Needs me is made with the record in view.
- Every Home row names its initiative at the smallest window.
- Every action the lead can see either works or says, in visible text, why
  it does not.

## Non-goals

- F3's blocked half ("quiet" beside "1 blocked"): the state rule stays as
  ruled (0056); a blocked card does not say whom it waits on.
- F9 and the general rule for disabled actions went to the design system's
  owner (0054); Aglaea wrote them (7b6afd4), and amendment 2 carries the code.
- F4, F5, F6, F8, C9, C10: recorded in the reviews, not carried.
- A Go-side refusal of a second draft: nothing tells the service a drafting
  session is still running. The guard lives in the view (FR-5).

## Requirements

- **FR-1** (F2, C6) When the Needs me Rule box opens, it shall show the
  record's body (the Markdown under its frontmatter, rendered as on the
  Decisions tab) above the options, clamped to about eight lines with "show
  all", and a link to the record in Decisions. A `the-cell-roster` record
  shows its seat lines this way; no roster-specific view is added.
- **FR-2** (F1) At 1024×640 with the rail expanded, each Home row shall show
  its initiative's id in full. The goal, the next date and the phase give way
  first, down to wrapping onto the row's second line.
- **FR-3** (C1) If a cell in definition that is not a draft has a seat with
  no persona file, then its Needs me row shall name the first missing file
  ("designer_diego has no persona file") with the verb **Open**, which opens
  the Agents sub-view. **Launch** stays for a cell that can launch.
- **FR-4** (C2; amends discovery-in-a-cell FR-6) When Bring crew up is
  disabled, its reason shall show as text beside the button, the way Draft
  the cell does: the missing files, or "draft roster: nothing launches until
  <NNNN> is ruled". The `title` may stay.
- **FR-5** (C3, C4) Draft the cell shall show these states:

  | state | shows |
  |---|---|
  | checking (preflight in flight) | the button disabled, no reason text |
  | ready | as built |
  | confirm, opening | as built |
  | opened | "Drafting in a Terminal: the draft shows here as *in definition*, and its accept record in Needs me." The button reads "Drafting…" and stays disabled until `agents/cell.json` appears or the app reloads |
  | error on Open | in the danger role, without the "Error:" prefix: "The Terminal did not open: <reason>. Run `organizer draft-cell <id>` in a terminal at the root." The confirm stays, for a retry |
  | refused (no goal, no people.md, a cell) | as built |

- **FR-6** (C5) The "waits on <NNNN> the-cell-roster" link shall open
  Decisions with that record expanded and highlighted, as a Needs me key
  lands on Home.
- **FR-7** (C7) The Needs me subtitle shall read "everything waiting on you,
  oldest first", and the top bar's badge title "everything waiting on you".
- **FR-8** (C8, F7) `.tiny-btn:disabled` shall use the design system's
  disabled opacity, `.45`, like `button:disabled`.
- **FR-9** (sup16) `service` shall compute a cell's accept record once and
  send it on `model.Cell` (`accept_record`: number and slug, empty when none).
  `Crew.tsx` reads it instead of repeating the rule. `retire --retirable` on
  a cell in definition shall give "the cell is in definition" as its reason.

- **FR-10** (0056: waiting says whose; amendment 1) Home's "N waiting"
  signal shall name the owners of the initiative's proposed records, distinct,
  in the order their oldest record was raised, joined with ", " after a " · "
  ("1 waiting · fse", "3 waiting · pablo, ana"). A record with no owner reads
  "no owner". The count and the four states do not change. The initiative
  header's "N decisions waiting" (`InitiativeHeader.tsx:146`) is left as it
  is.

- **FR-11** (F9; design system principle 3 and Inbox row, 7b6afd4;
  amendment 2) Every row verb in Needs me shall be a default button, not
  `act primary`: Answer, Launch/Open and Rule on Home, and the Rule toggle
  of Conversations' needs-me worklist. An open Rule toggle is marked with
  `aria-pressed` and `--surface-selected`, never the accent. The accent stays
  on the action that commits, inside the Rule box.
- **FR-12** (design system "Disabled actions", amendment 2) A blocked
  action's reason shall be visible text tied to the control with
  `aria-describedby`, never a hover alone:
  - Draft the cell and Bring crew up (with FR-4);
  - Conversations' + for a new thread when there is no token to post with:
    one line of text in the chat list, not per control;
  - Write about this card on the card back: hidden when the initiative has
    no cell (never here); "no seat to write to" as text when the cell has no
    seats (blocked).

## Acceptance → gate

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| G1 | 1 | On the fixture, Rule on a Needs me decision row shows the record's body above the options, clamped, with "show all" and a link to Decisions; Rule on init-drafted's roster record shows its body | screenshots at 1440, clamped and expanded | as stated |
| G2 | 2 | `--twenty` fixture at 1024×640, rail expanded: every Home row's id reads in full | screenshots at 1024 and 1440 | no id cut |
| G3 | 3, 7 | init-define (a seat without its file): its Needs me row names the file, with the verb Open, which lands on Agents; a fixture cell in definition with every file shows Launch; the subtitle and badge title read as FR-7 | a test in `frontend/src/lib` for the row; screenshots | as stated |
| G4 | 4, 6, 8 | init-define and init-drafted: Bring crew up disabled with its reason as visible text; the roster link lands with the record expanded; a disabled tiny button at `.45` | screenshots; the computed opacity from the DOM | as stated |
| G5 | 5 | Draft the cell's six states. Checking and refused are screenshots on the fixture. Opened and error come from a test double for the Open call, not a real session | screenshots per state | as the table |
| G6 | 9 | `accept_record` on the fixture's drafted cell, a test in `internal/service`; `organizer retire init-define --retirable` prints "the cell is in definition" | test output; command output | as stated |
| G8 | 10 | On `--twenty`, email-digest's row reads "1 waiting · fse"; a fixture initiative with records of two owners names both, oldest first; one with no owner reads "no owner" | a test in `frontend/src/lib` for the owner list; a screenshot of Home | as stated |
| G9 | 11, 12 | Needs me rows on `--twenty` show no accent button; the open Rule toggle in Conversations is marked by `aria-pressed` and the selected surface; each blocked control of FR-12 has its reason as visible text and an `aria-describedby` pointing at it; Write about this card is absent without a cell and says "no seat to write to" with an empty roster | screenshots; the DOM attributes | as stated |
| G7 | all | Nothing else broke | `XDG_DATA_HOME=$(mktemp -d) make test` (it runs `npm test` once frontend-tests lands); `cd frontend && npm run build`; the redesign's G18 grep | pass |

## Boundary

- **home-rule-and-rows card:**
  - `Home.tsx` (RuleAction, RuleDecisionBox, the row layout, the Launch/Open
    row, the subtitle);
  - `lib/queue.ts` (the row's kind, verb and words);
  - `TopBar.tsx` (the badge title only);
  - `styles/shell.css` and the Home and rule-box CSS;
  - a `lib` test; fixtures.
- **cell-screens-fix card:**
  - `AgentsView.tsx` (Draft the cell's states);
  - `Crew.tsx` (the visible reason, the roster link);
  - `DecisionsView.tsx` and `board.store.ts` (landing on a record expanded);
  - `global.css` (`.tiny-btn:disabled` only);
  - `internal/model/model.go` (Cell: `accept_record`), `internal/service/`
    (`draft.go`, `crew.go`, `retire.go`), `frontend/wailsjs` (generated);
  - tests, fixtures.
- **conform-and-waiting card** (amendments 1 and 2), after both cards above:
  - `Home.tsx` (the waiting signal; the row verbs' class);
  - `InitiativeHeader.tsx` (`waitingDecisions` may move to `lib`, same
    count);
  - `Conversation.tsx` (the worklist's Rule toggle; the chat list's
    no-token line);
  - `CardDrawer.tsx` (Write about this card);
  - `AgentsView.tsx`, `Crew.tsx` (`aria-describedby` only);
  - a `lib` function and its test; CSS; fixtures.
- **Must not touch:**
  - `docs/design-system.md` (0054);
  - camp or any other initiative's files;
  - `~/.claude/skills`;
  - the discuss API.

## Rabbit holes

- **A roster view in the Rule box.** The record's body already lists the
  seats (drafting.md §5).
- **Solving the disabled pattern everywhere.** Only the two buttons named
  here; the rule itself is the design system's (0054).
- **Pressing Open in a gate.** It starts a real session; G5 uses a test
  double.

## Assumptions

- **A1** The record body is already on the board (`model.Decision.Body`,
  `model.go:238`); FR-1 needs no new binding.
- **A2** "Until the app reloads" is enough of a bound for FR-5's opened
  state. A crashed drafting session is cleared by a reload.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `home-rule-and-rows` | G1, G2, G3, G7 | — | true |
| `cell-screens-fix` | G4, G5, G6, G7 | — | true |
| `conform-and-waiting` | G8, G9, G7 | home-rule-and-rows, cell-screens-fix (it touches their files) | true |

## Amendments

- **1, 2026-09-29, from 0056** ("waiting says whose", ruled after the wave
  of 0055 launched): FR-10, G8, card `waiting-says-whose`, after
  home-rule-and-rows.
- **2, 2026-09-29, proposed (0057):** Aglaea's design-system rewrite
  (7b6afd4, 0054) made F9 and the disabled-action rule; FR-11, FR-12, G9.
  FR-10 and amendment 2 are one card, `conform-and-waiting`, replacing
  `waiting-says-whose`, after both first cards, with a UI reviewer.
