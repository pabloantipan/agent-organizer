# The initiative header: fold it, and make every part of it do something

status: proposed
owner: pablo
by: aglaea, 2026-09-29, for the FSE (thread 01M3R14N3KAYTGQFH09AMBK73W)
covers: `working-on/header-review-2.md` (Pablo's six findings on the header,
from the installed app v0.2.0-348), ui-leftovers UI1 and UI3, and the rest
of ui-leftovers UI2–UI7 as a short list at the end
rulings it rests on: 0038 (the header and tabs stay put, the body scrolls;
goal and measure clamp to two lines); 0059 and responsive-home (the width
classes); 0014 and 0030 (stages and phases); 0054 (the design system is
mine)

## The problem, in the lead's terms

Pablo, 2026-09-28, in the installed app (`said`, quoted in
`header-review-2.md`):

1. "I can't colapse the goal and the scope. And gain, too much space."
2. "On the chip 2 decisions waiting click does nothing."
3. "cinta of waves makes sense? I mean, A label of waht is with an icon?"
4. "If I want to update goal by hand? And am I saving goals/scope updates?"
5. "why chip says buildgin and marked as done also?"
6. "If I click I have no deatil of the wave."

Measured on main `4c3c78d`, `scripts/fixture-home.sh`, on init-a, which has a
long goal, scope, measure and four stages (screenshots in `header-shots/`):

- **The header is 378 px tall at every width.** At 1024×640 that is 59% of
  the window. With the top bar, it leaves **217 px** for the sub-view. At
  1512×945 it leaves 522 px. The two-line clamps (0038) cap each field, but
  nothing folds the block. The scope does not clamp at all.
- **UI1 (severity 3):** at 1024×640, Answer lands on Conversations with an
  **8 px** timeline. The question the lead pressed Answer for never shows
  (`conversations-init-a-1024.png`; ui-leftovers `answer-landing-1024x640.png`).
  UI3: focus drops to the page body there.
- **The sub-views repeat the initiative.** Conversations opens with
  "init-a · Initiative A · acme", and Agents and Decisions with "init-a" and
  a meta line, each about 50 px, all under a header that already says it.
- **At 3440 the goal runs 3,004 px on one line** (`agents-init-a-3440.png`):
  far past a readable line length.
- **The chip "does nothing":** it calls `openInitiative(id, "decisions")`
  (`InitiativeHeader.tsx:165-171`). On the Decisions tab nothing changes;
  from another tab it switches tabs, with nothing focused and no waiting
  record picked out.
- **The phase chip on every tile:** all six organizer stages are
  `phase: building` (`working-on/roadmap.yaml`), so "building" shows six
  times. The tile's own state, "1 · done", has the same visual weight as the
  phase, and the pair reads as two statuses.
- **The tiles are `<li>`s with a title and no action**
  (`InitiativeHeader.tsx:84-98`). "Wave" in Pablo's words: he reads the
  strip as waves, and nothing says it is the roadmap's stages.

## The design

### 1. The header folds to one line, and folded is the default

**Folded** (default): one bar above the tabs, about 44 px tall. In order,
and in this order of giving way as the width shrinks:

1. the id, client lozenge and read-only mark: never cut;
2. **the stage**: roadmap icon, "Stage 5 of 6 · Discovery has a shape…",
   the title cut to fit. It is a button that opens that stage (§5);
3. **the waiting chip**, only when there is at least one (§2);
4. the target, when there is one: "target 2026-10-01";
5. the goal, on one line, cut, in `--fg-muted`: it gives way first;
6. **Details**: a chevron button (`aria-expanded`) at the right end.

**Open** (Details pressed): today's block, with §3–§5 applied, and:

- the goal and the measure clamp to two lines, as 0038 ruled; the scope's
  in and out clamp to two lines too, with the same "more";
- at **wide** (≥ 1920, responsive-home's class) the open block has two
  columns: goal and measure on the left, scope in and out on the right,
  each held to a readable measure of about 90 characters; the roadmap strip
  runs under both;
- the chevron reads "Hide details".

**Which state:**

- The lead's choice is remembered **per machine, not per initiative**. He
  folds it once and it stays folded as he moves between twenty
  initiatives.
- **A landing folds it.** When a Needs me verb or a link lands inside a
  sub-view on a named thing (Answer, Open, the Decisions link, a stage
  tile), the header folds, so the thing named is on screen (Focus and names:
  "focus lands on the thing named"). The lead's choice becomes folded until
  he opens it again.
- The bar and the tabs stay fixed while the sub-view scrolls, as 0038 ruled.

This is also where the initiative's charter is read. On Overview, the open
header is the charter, so opening Details there is the one extra press; I
chose that over carrying a second copy of goal and scope in Overview's body.

### 2. The waiting chip goes where the waiting records are

- It reads "**3 decisions waiting on you**" when the lead owns them, else
  "3 decisions waiting" (0068, which supersedes this section's first words,
  "3 waiting": a reader who never saw the app could only guess what they led
  to; build spec FR-2, amendment 2). The same count as `waitingDecisions`. It uses the design system's
  decision waiting colours: fuchsia, dashed.
- Pressing it opens **Decisions**, scrolled to "Waiting on a ruling", with
  focus on the first waiting record's line, expanded. On Decisions itself
  it does the same. A press always visibly does something.
- At zero it is not drawn in the folded bar. The open header says "no
  decision waiting" as text, not as a button.

### 3. The strip says what it is

- The strip gets a label on its left: the roadmap icon and "**Roadmap ·
  stage 5 of 6**". "Roadmap" is a link to the Roadmap tab.
- The tiles keep their state word ("done", "now") and their number. Done
  tiles use `--fg-subtle`, the current tile `--surface-selected`, and
  planned tiles are outlined, as the design system's Stage stepper already
  says.

### 4. The phase shows once, where it holds

- No tile carries a phase chip.
- **One phase for every stage** (the organizer: all building): the label
  says it once, "Roadmap · building · stage 5 of 6".
- **Phases change** (init-a: discovery, then building): a thin divider
  between the last discovery tile and the first building tile. The word
  sits above each run, "discovery" over its tiles and "building" over its
  own, `xs` uppercase `--fg-subtle`: a position and a word, never a colour
  alone (principle 4).
- A stage with no phase sits in its neighbours' run, with no word.

### 5. A stage opens its detail

- Pressing a tile (or Enter on it; each tile is a button) opens **Roadmap →
  Stages** with that stage's row expanded and focus on it. The header folds
  (§1, a landing).
- **The expanded stage row** is new on the Roadmap tab, and follows the
  design system's Decision record expanded state:
  - the outcome;
  - the exit items, each checked with its `met` date or open;
  - the gates as record links, waiting or ruled;
  - the cards that carry `stage:` this stage, as links to their card backs;
  - the appetite, and the target when there is one.
- Overview's current-stage block stays as it is. The current tile opens the
  same Roadmap row as the others, so every tile does one thing.

### 6. The sub-views stop repeating the initiative

Conversations, Agents and Decisions drop their title row with the id (and
the client, and Initiative A's name). What was on that row and is not the
id moves into the sub-view's own toolbar line: "sampled just now · every
10s" and Clean exited on Agents, the People toggle on Conversations, the
records' source on Decisions. About 50 px each.

### 7. Room for the thread after Answer (UI1, UI3)

With §1 and §6, at 1024×640 the sub-view gets about 515 px instead of 217.
On top of that:

- Conversations' timeline keeps **at least half** of what is left under the
  chat head. The docked composer and the People panel give way first: the
  composer collapses to its one-line box; People closes at compact.
- Answer lands with the asked message in view, and focus on the thread's
  divider (UI3; Focus and names).

### Widths, consistent with responsive-home

| class | header |
|---|---|
| compact (< 1280) | folded bar: the goal gives way first, then the target. The strip, when open, shows numbers with only the current stage's title ("1 2 3 4 [5 · Discovery has a shape] 6"), with titles in the tiles' hover and in their names |
| regular | as designed above |
| wide (≥ 1920) | the open header in two columns, text held to about 90 characters; the strip up to 1,600 px |

## Acceptance, in the lead's terms

| # | Given / when | Then |
|---|---|---|
| H1 (UI1, UI3) | 1024×640, Home, Answer on init-a's thread that asks the lead | The asked message and the composer are both on screen without scrolling. Focus is on the thread's divider |
| H2 | any sub-view, any width, header folded | The bar and the tabs together are at most 90 px under the top bar; the id is never cut |
| H3 | the lead opens Details, then switches initiative, then reopens the app | Details stays open everywhere until he folds it. Goal, measure and both scope lists clamp at two lines, each with "more" |
| H4 | open Details, then Open on a Needs me card row | The landing folds the header; the card row is on screen with focus on it |
| H5 | the waiting chip, from Work, and again on Decisions | Both times Decisions shows "Waiting on a ruling" with the first waiting record expanded and focused. With no waiting record, no chip in the bar |
| H6 | the organizer's own header (six building stages) | "building" appears once, in the strip's label; the label reads "Roadmap · building · stage 5 of 6" |
| H7 | init-a (discovery, then building) | A divider and the two words, once each, over their runs; no tile carries a phase chip |
| H8 | a click or Enter on stage 2's tile | Roadmap → Stages opens with stage 2 expanded (outcome, exits with dates, gates, its cards), focus on it, header folded |
| H9 | 3440×1380, Details open | Two columns; no text line in the header runs past about 100 characters |
| H10 | Conversations, Agents, Decisions | None repeats the initiative's id as a title under the tabs |
| H11 | a reviewer who never saw the app is shown the folded bar and the open strip at 1512×945 | They can say what the tiles are ("the roadmap's stages") and what the chip leads to |

## Pablo's fourth question: editing goal and scope in the app

This is a write path, not a design; Pablo's to rule (the FSE raises it). The
facts: the app never writes `initiative.yaml`. Edits by hand are saved when
the file is saved, and have history only once committed; the organizer repo
tracks `working-on/`.

| option | what it is | for | against |
|---|---|---|---|
| **a. File only, shown honestly** | Details shows "from working-on/initiative.yaml" with Open in editor (the action Home's row detail already has), and an "edited, not committed" mark when git reports the file modified. Read-only | no new write path; answers "am I saving?" where he asks it; a goal change stays deliberate | editing leaves the app |
| b. Edit in the app, write the file | an edit box per field; the app writes the YAML, keeping every other byte, no commit | quick | a second writer of the charter; history only if he commits |
| c. Edit in the app, write and commit | as b, plus a commit of that one file, as 0019 does for a ruling | history kept | a goal is the owner's words and a roadmap-level change (the roadmapping skill proposes such changes as records); this path bypasses the record |

**My recommendation: a.** It is also what the design above assumes. Revisit
c at stage 6, when business owners who do not open files use the app.

## The rest of ui-leftovers, not about the header

| # | Finding | Sev | Kind | Direction |
|---|---|---|---|---|
| UI2 | Tab from the rule box's Cancel leaves the box, to a row it covers; a second box can open over the first | 2 | DS (Focus and names) | While the box is open, Tab and Shift+Tab loop inside it, and one box at a time. It is a `dialog`, so this settles the spec gap "Tab leaving the box" |
| UI4 | A roster record at 1024: the Recommendation shows one line, cut | 2 | Design | When the record area is shorter than both clamps, the Question clamps to three lines, so the Recommendation's first two lines and "more" show. The spec's goal ("the recommendation in view") wins over FR-2's scroll |
| UI5 | Decisions still says "owner —" | 1 | DS (one word per state) | `ownerPhrase` on DecisionsView. The boundary widens; FR-10 said "everywhere" |
| UI6 | The rule box's head shows the number, not the initiative | 1 | DS (Names) | "init-drafted 0001" in the head and in the dialog's name |
| UI7 | The People toggle's name does not say People | 1 | DS (Names) | `aria-label="People, 3 seats, 2 live, 1 deaf"` |

ui-leftovers' five spec gaps, answered: Answer's landing is H1 here; Tab
leaving the rule box is UI2 above; FR-10 "everywhere" means the boundary
widens (UI5); Conversations at 1024 is §7 and H1; for a long record at 1024,
the recommendation wins (UI4).

## Out of scope

Home, the rule box's placement, the rail (responsive-home); the Roadmap tab's
Cards and Calendar; any edit of the charter in the app, unless the ruling
on the fourth question chooses b or c.

## Technical notes

(left for the FSE)
