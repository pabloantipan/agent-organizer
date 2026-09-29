# The UI reviews' leftovers, in one pass

status: proposed (0058)
owner: pablo
decisions: [0054 ruled, 0055 ruled, 0057 ruled, 0058 proposed, 0059 proposed, 0060 proposed]
roadmap: fixes across stage 2 (Home, Needs me) and stage 5 (the cell screens); appetite one wave

## Problem

Three waves' UI reviewers left severity 2–1 findings: home-rule-and-rows
U1–U8, cell-screens-fix U1–U4, conform-and-waiting C1–C6, and sup19's
notes. Aglaea triaged them against main at `cc4c974`
(`docs/ux/reviews/2026-09-29-triage-ui-leftovers.md`, "the triage"). She
merged them into 14 ranked rows and four verification gaps. In the same
commit (ec3ecbb) she wrote the design-system rules they break: "Focus and
names", and "said once per view" under Disabled actions. Every row is
heuristic. The triage has the evidence and the sources, and this spec
points at its rows by number. Only hr-U8 is already fixed.

**Appetite:** one wave, one card.

## Goals

- The lead rules from the Needs me box with the question and the
  recommendation in view, at every window size.
- A keyboard or screen-reader lead never loses their place, and hears which
  record each verb acts on.
- The accent marks only a commit, and a blocked reason is said once, where
  it applies.
- The fixture can show every row of Needs me, so a UI reviewer can see it.

## Non-goals

- Triage row 9 (Home at 1024: shorten the stage?) and row 13 ("you" or
  "pablo" in the waiting signal): they need Pablo's word, as 0059 and 0060.
  If either is ruled before launch, its FR is added here.
- V4 (WKWebView, VoiceOver, a real Open): stays not verified until someone
  runs the installed app.
- The parked first-look findings F4, F5, F6, F8, C9, C10.

## Requirements

Each FR is the triage row's "Direction" column, as written there.

- **FR-1** (row 1; amends lead-side-fixes FR-1) The rule box shall show the
  record's `## Question` and `## Recommendation`, each clamped at a block
  boundary with "more", and no `## Options`.
- **FR-2** (row 4) The rule box shall fit in the viewport below the top
  bar. The record scrolls inside it, and the options, words and buttons stay
  in view.
- **FR-3** (row 8) The rule box's "<NNNN> in Decisions" link shall call
  `openDecision`.
- **FR-4** (row 11) Home's open Rule shall use `--surface-selected` and keep
  `aria-expanded`.
- **FR-5** (row 2; Focus and names, bullets 1–4) The rule box shall open with
  focus on its title and the body as `aria-describedby`, and focus shall
  return to the opener on close. After Open, Launch, the roster link or
  Draft the cell, focus shall land on the thing named: the record's row, the
  blocked seat, or Bring crew up. Escape closes every confirm.
- **FR-6** (row 3; bullet 5) Every repeated row verb shall carry the row in
  its accessible name ("Rule init-a 0002", "Open onboarding-flow Step map",
  "Launch init-ready").
- **FR-7** (row 5) In Conversations, the row verbs (Discuss, Answer, Open)
  shall be default buttons. The People toggle is a disclosure
  (`aria-pressed`, `--surface-selected`), never the accent.
- **FR-8** (row 6) Without a token, Conversations shall say so once, in the
  chat-list line of lead-side-fixes FR-12. The composer is not drawn, and
  the header says "read only".
- **FR-9** (rows 7, 10) Wherever `IN_DEFINITION_WAITS` shows (the Crew
  header, the rail's hover), a missing persona file shall replace it. The
  reason says who writes the file: "designer_diego has no persona file; the
  drafting session writes it, or write it by the persona-agents skill".
- **FR-10** (row 12) A record with no owner shall read "no owner"
  everywhere.
- **FR-11** (row 14) The card back's hint shall not mention "Write about
  this card" when the initiative has no cell.
- **FR-12** (V1–V3) The fixture shall have:
  - a thread that asks the human;
  - a roster record in init-drafted shaped like `drafting.md` §5, with seat
    lines;
  - canned health that names the fixture's cell projects.

## Acceptance → gate

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| G1 | 1–4, 12 | Rule on init-drafted's roster record and on a plain record, at 1024×640 and 1440: Question and Recommendation shown and clamped at a block boundary, no Options, Rule and Cancel in view without scrolling Home; the link lands with the record expanded; the open Rule is on the selected surface | screenshots at both sizes; the DOM for `aria-expanded` | as stated |
| G2 | 5, 6 | Keyboard only: `document.activeElement` after opening and closing the rule box, after Open, Launch, the roster link, Draft the cell and Cancel, is the element FR-5 names; Escape closes each confirm; the accessible names of the Needs me verbs include their rows | a log of `activeElement` and accessible names per step | as stated |
| G3 | 7, 8, 12 | Conversations on the fixture thread that asks the human: no accent on row verbs or People; without a token, one reason line, no composer, "read only" in the header; Answer on Home opens that thread | screenshots; the DOM | as stated |
| G4 | 9, 10, 11 | init-define's Crew header and rail hover name the missing file and who writes it; "no owner" on the row and the signal; the card back without a cell has no "Write about this card" in its hint | screenshots | as stated |
| G5 | all | Nothing else broke | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; the redesign's G18 grep | pass |

## Boundary

- **ui-leftovers card:**
  - `frontend/src/components/`: `Home.tsx`, `RuleDecisionBox.tsx`,
    `Conversation.tsx`, `SlackView.tsx`, `AgentsView.tsx`, `Crew.tsx`,
    `Rail.tsx`, `CardDrawer.tsx`, `DecisionsView.tsx` (focus landing only);
  - `frontend/src/stores/board.store.ts` (focus targets only);
  - `frontend/src/lib/` and its tests; CSS;
  - `testdata/` and `scripts/fixture-home.sh` (FR-12 only).
- **Must not touch:**
  - Go code (none is needed);
  - `docs/design-system.md` (Aglaea's, 0054);
  - camp or any other initiative's files;
  - `~/.claude/skills`.

## Rabbit holes

- **A generic focus manager.** Only the transitions named in FR-5.
- **Rewriting the Markdown renderer** to clamp at block boundaries: clamp by
  rendered blocks, not by lines of source.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `ui-leftovers` | G1–G5 | — | true |

## Amendments

- none yet
