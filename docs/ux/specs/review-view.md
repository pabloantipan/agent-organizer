# The Review view: walking an agent's change (aglaea, 2026-10-17)

For review-map v2 (thread 01M5657Q9HCVWS0Z4CHZ9TDCYG; `docs/specs/review-map.md`
Later steps; the viewer sketch in agent-slack
`docs/review/pipeline-starter.md` §6.6.4-6.6.5). v1 writes `revmap.json`
(`organizer review`). This spec is the screen. The FSE cuts cards from it;
Technical notes at the end are left for the FSE.

## 0. What the data looks like (read before choosing a form)

The map of c8e1773 (lf30-launch-go, 6 Go files) holds **75 nodes and 91
edges: 17 changed (11 added, 6 modified, 9 of them tests) and 58 affected**,
unchanged neighbours present only because they call or are called by a
changed one. `risk` is null on every node; `claim` is null; the only flag is
`untested` ×2. That is a small change, and already a graph no one can read
as a whole.

## 1. A list to work through, not a graph to look at

**The primary form is a worklist; the graph is cut from v2.**

- A review is a walk: open the next thing, read it, mark it, go on. A list
  has an order, a position ("4 of 8") and a next; a force- or ELK-laid
  graph of 75 nodes has none, and it lays out again whenever a filter
  changes, so the place is lost (the lesson of `map-and-roadmap.md`).
- What a graph would show, the 1-hop neighbourhood, is shown per symbol in
  the panel as two short lists, **Called by** and **Calls**. At 1 hop that
  is all a picture would say.
- The package picture belongs on the architecture map, not here: when the
  map lens lands (`map-and-roadmap.md`), the changed packages light up on
  the base map through the grounding table. The Review view then links to
  it (`Show on the map`). Not in v2.
- This also answers Q2: v2 needs neither React Flow nor ELK.

## 2. Where it opens

- **From the card back**: a `Review` section, beside Discuss, with one
  button, `Review the change`, when the card has a branch or a merge the
  organizer can name. With neither, the section is not drawn (a press that
  cannot act is not offered).
- It opens as **its own screen** over the initiative, not a seventh
  sub-view: a review belongs to one card and one head, and sub-views belong
  to the initiative. The crumb reads `<initiative> › <card title> ›
  Review`; `← Card` (and Esc when focus is not in a text field) returns to
  the card back, focus on `Review the change`.
- Not from Home or Work in v2. A card waiting for Pablo's review already
  reaches Needs me through its next action (`^pablo`), and that row's Open
  lands on the card back, one press from the button.
- The place (initiative, card, head, selected symbol) rides the store as
  every navigation does, so a link from odyssey lands on the symbol.

## 3. The screen

```
┌ organizer › Launch: one seat at a time › Review ─────────── ← Card ┐
│ c8e1773 ← 4d2a91b · 8 symbols changed, 9 tests                     │
│ Reviewed 3 of 8 · 1 must-visit left        [Next to review  N]     │
│ ⚠ Not checked against the card's declared changes: …  (if partial) │
├──────────────────────────┬─────────────────────────────────────────┤
│ Must visit               │ service.runLaunches   modified          │
│  ▸ shared.Upload  ⚠ not  │ internal/service/launch.go 40-118       │
│    declared              │ ┌ diff of the symbol's ranges ────────┐ │
│ internal/service  (3)    │ │ − old line                          │ │
│  ✓ runLaunches           │ │ + new line                          │ │
│  ? queueLaunch           │ └─────────────────────────────────────┘ │
│  · crewCmd  no direct    │ Flags   no direct test                  │
│    test                  │ Tests   (none that name it)             │
│ internal/cli  (2)        │ Called by  queueLaunch · CreateCrew     │
│ Tests changed  (9)       │ Calls      launchProbe                  │
│                          │ The builder says  (claim, when present) │
│                          │ ( ) Reviewed ( ) Question ( ) Blocked   │
│                          │ Note [                         ]        │
│                          │ [Reviewed, next]  [Save]                │
└──────────────────────────┴─────────────────────────────────────────┘
```

### 3.1 The header

- `head ← base` short shas, and the counts, said once: `8 symbols
  changed, 9 tests`.
- **Coverage**: `Reviewed 3 of 8`, counting changed non-test symbols with
  any mark. When `risk` is filled (a later pipeline), it reads `Reviewed 3
  of 8 · high risk 2 of 2`. Then `· n must-visit left` while any
  `undeclared` node is unvisited (§6.6.5: every changed-not-declared node
  is visited before merge). A percentage is not shown: "3 of 8" says the
  same and the remainder too.
- **`Next to review`** (key `N`): the next unmarked symbol in the list's
  order (§3.2), wrapping to the top. `Shift+N` goes back.
- **Partial map, one line per reason**, in `--warning`, from the map's
  `problems` and summary: `Not checked against the card's declared
  changes: change-check not found.` A map with no reconciliation must not
  read as one with no undeclared change.

### 3.2 The worklist (left)

- **Groups, in this order**: `Must visit` (nodes flagged `undeclared`),
  then one group per package (`internal/service (3)`), packages ordered by
  how many changed symbols they hold, then `Declared, not changed`
  (mismatches with no node; each row is the card's declared line, nothing
  to diff), then `Tests changed (9)`, collapsed. Package is the group, the
  symbol is the row: there is no level toggle.
- **Inside a group**: flagged before unflagged, then risk high to low when
  present, then file order.
- **A row**: the review mark (none, ✓, ?, ✕), the symbol's short name, its
  change word (`added`, `modified`, `deleted`) and its flags as words.
- The 58 affected nodes are not rows. They appear only in a changed
  symbol's Called by and Calls.

### 3.3 The symbol (right)

- **Title**: the symbol, its change word, `file lines`, and `Open in
  editor` at the head line (secondary).
- **The diff**, scoped to the symbol: base range against head range, 3
  lines of context, head line numbers. Added lines on `--status-now-bg`
  with `+` in the gutter; removed lines on `--surface-pressed` with `−`,
  text `--fg-muted`. The sign carries it, not the colour: there is no
  green in the palette, and red is blocked's. An `added` symbol is all `+`,
  a `deleted` one all `−`. Code at `sm` mono; long lines scroll inside the
  diff, which is a scroll stop named `<symbol>, diff` (tab A3).
- **Flags**, as words:

  | flag | words | look |
  |---|---|---|
  | `undeclared` | `not in the card's declared changes` | amber lozenge |
  | `outside_footprint` | `outside the card's footprint` | amber lozenge |
  | `declared_not_changed` | `declared, not changed` | muted, dashed |
  | `untested` | **`no direct test`** (sup74: a test may still run it) | muted |

  Amber is "look at this, nothing has stopped". Red stays for Blocked.
- **Tests**: the tests that name it, each opening the test's own diff when
  it changed, else the editor. None: `none name it directly`.
- **Called by / Calls**: links. A changed symbol opens as itself; an
  affected one opens read-only in the same panel, with no diff and no mark:
  `unchanged · shown because it calls runLaunches`, and `← back to
  runLaunches`.
- **The builder says**: the node's `claim`, set in a quote block with the
  label above it, never in the facts' style (§6.6.5: claims are not
  facts). Absent when null.
- **The mark**: a radio group, `Reviewed`, `Question`, `Blocked`, and a
  Note field. A note is required for Question and Blocked (the button is
  incomplete-disabled until there is one; design system). Two buttons:
  **`Reviewed, next`** (primary: marks Reviewed with the note if any and
  moves to the next to review) and `Save` (keeps the chosen mark, stays).
  Marks: ✓ Reviewed in `--fg-muted`, ? Question in `--tone`, ✕ Blocked in
  `--danger` (blocked's own red).
- **Room for v3**: a Question or Blocked will post to the card's supervisor
  (or the FSE). In v2 the note is kept here and the panel says so in one
  muted line, `Kept in Deltagos; asking the supervisor comes later.` v3
  replaces `Save` with `Ask <seat>` on those two marks.

### 3.4 Widths

- 1440 and wider: list 300 px | the symbol, its facts beside the diff (diff
  flex, facts 360 px).
- Under 1440, down to 1024: list 280 px | the symbol, with the facts under
  the diff in one scroll.
- The page never scrolls sideways; code scrolls in its frame.

## 4. States

| state | what shows |
|---|---|
| no map for this head | the list area: `No review map for this change yet.` and `Make the map` (primary) |
| making the map | `Making the map · 2 s`, a counter, no spinner; `Stop`; focus stays on the busy button (busy rule) |
| failed | the reason (the command's first error line), `Try again`, `Copy the command` |
| partial | the map shown, plus §3.1's line per missing reason |
| the branch moved | the map shown, plus `The branch moved since this map (4d2a91b → 9e0f3c1).` and `Make it again`; marks stay on the old head until then |
| new map, same symbol | a mark carries over when the symbol's head text is unchanged; otherwise the row reads `changed since you reviewed` and has no mark |
| no changed symbol (docs-only change) | `Nothing to review at symbol level: the change touches no Go or TS definition.` and the file list |
| all reviewed | the header reads `Reviewed 8 of 8`; `Next to review` is gone (never-acting); the live region says it once |

## 5. Keyboard and reading order

Tab order: `← Card` → the header (`Next to review`, any `Make it again`) →
the worklist, **one stop** (roving: ↑ ↓ move, ← → fold a group, Enter
opens; tab-reaches-links A1) → the diff (a scroll stop) → the facts' links
→ the mark (radio group, one stop) → Note → `Reviewed, next` → `Save`.

- `N` / `Shift+N` work whenever focus is not in a text field.
- Opening a symbol moves focus to its title (an `h2`, `tabindex=-1`), and
  the live region says nothing: the title is read.
- `Reviewed, next` moves focus to the next symbol's title, and the
  worklist's row for it scrolls into view (`nearest`).
- Row names: `runLaunches, modified, no direct test, reviewed`; the group
  head: `internal/service, 3 symbols, 1 reviewed`.

## 6. What v2 cuts

- The graph (React Flow, ELK). Revisit only with a reviewer's session that
  shows the lists failing.
- Monaco. The diff is ours: a symbol's ranges, sign gutters, no editing.
  Syntax colour is not in v2.
- Package level as a view, and the static HTML build for CI (§6.6.4's
  fallback): not for a one-person review on two Macs.
- Mutants, findings and fitness badges: the fields exist in the schema;
  nothing fills them yet. The flag table takes a row when they do.

## Acceptance

| # | Pablo can | Checked by |
|---|---|---|
| R1 | open a review from the card | a card with a branch shows `Review the change` on its back; one without shows no Review section; Esc in the view returns to the card back with focus on the button |
| R2 | see what is left | the header reads `Reviewed n of m` over changed non-test symbols, `· k must-visit left` while an undeclared node is unmarked |
| R3 | walk it in order | `N` from the top visits Must visit, then packages by size, flagged first; `Shift+N` goes back |
| R4 | read one symbol's change | the diff shows only the symbol's base and head ranges with 3 lines of context and `+` / `−` gutters |
| R5 | trust the flag words | `untested` reads `no direct test`; `undeclared` reads `not in the card's declared changes` in amber |
| R6 | follow a caller and come back | Called by opens an affected symbol read-only with `unchanged · shown because it calls …`; `← back` returns to the changed symbol |
| R7 | tell a claim from a fact | a node with a claim shows it under `The builder says` in a quote block |
| R8 | mark and move on | `Reviewed, next` marks the symbol, the count rises by one, and focus is on the next symbol's title; Question and Blocked need a note |
| R9 | not mistake a partial map for a clean one | with change-check off the PATH, the header shows `Not checked against the card's declared changes: …` |
| R10 | keep marks across a remap | after `Make it again` on a moved branch, a symbol with unchanged head text keeps its mark; a changed one reads `changed since you reviewed` |
| R11 | work at 1024 | at 1024×640 the list and the symbol share the width, the facts sit under the diff, no page scrolls sideways |
| R12 | stay light | the build adds no React Flow, ELK or Monaco to the bundle |

## Technical notes (left for the FSE)

- Marks persist in the organizer's data dir beside the map
  (`review/<initiative>/<head>/state.json`), not in the repo and not in
  Firestore in v2; carrying a mark over (R10) compares a hash of the
  symbol's head text.
- The diff needs file text at both shas for a range: a bound call over
  `git show <sha>:<file>`, read only.
- `Make the map` runs `organizer review <initiative> <card> --json` through
  the service, with the launch view's progress pattern.
- Where Needs me might later carry a "review waiting" row is a separate
  question for after v3.

## Amendment 1 (aglaea, 2026-10-18): from rv-list's UI review

From rl-ui on rv-list (62d9133, `working-on/rv-list.md`, ## UI review).

- **A1: the TS qualifier is the file stem**, the module's own name, as the
  package is Go's: `format.formatName`. Two exceptions, because a stem
  alone can say nothing:
  - a stem of `index` takes its folder's name instead (`lib/index.ts` →
    `lib.formatName`);
  - when two rows in one group would read the same, both add their parent
    folder (`lib/format.formatName`, `components/format.formatName`).
  The row's accessible description carries the full path either way.
- **A2: no flash.** The busy rule already covers the press: the button turns
  `Making the map…` at once, keeps focus and ignores presses. The progress
  line (`Making the map · n s` and `Stop`) appears only after 1 s; a make
  that ends sooner goes straight to the map. Focus does not move to Stop
  when it appears.
- **The FSE's additions to rv-symbol (review-map v2 Amendment 2) are
  right**: on open, focus goes to the worklist's stop, else `Make the
  map`, else `← Card`; the crumb's card title shrinks first, never under 20
  characters at 1024, with the full title in its name.

| # | Pablo can | Checked by |
|---|---|---|
| R13 | tell TS symbols apart | an `index.ts` symbol reads `<folder>.<name>`; two same-stem symbols in one group both carry their parent folder |
| R14 | not see a flash | a make that ends under 1 s shows only `Making the map…` on the button, never the counter or Stop |

## Amendment 2 (aglaea, 2026-10-18): from rv-symbol's UI review

From rs-ui on rv-symbol (3155162, `working-on/rv-symbol.md`, ## UI review).

- **A1: one pair of words, by direction.** An affected symbol opened from
  `Called by` reads `unchanged · calls runLaunches`; one opened from
  `Calls` reads `unchanged · called by runLaunches`. This replaces §3.3's
  `shown because it calls …`: shorter, and the two read as a pair.
- **A2: the primary saves what was chosen; it never overrides.** Its label
  follows the radio: none or Reviewed → `Reviewed, next`; Question →
  `Save question, next`; Blocked → `Save block, next`. Each saves the
  chosen mark with its note (still required for Question and Blocked) and
  moves on. No confirm dialog: the label already says what the press does.
  `Save` (stay) is unchanged.
- **A3: keep the row, say `none found`.** That nothing calls a changed
  symbol, or that it calls nothing, is a fact worth reading (an entry
  point, or dead code). `none found` rather than `none`, because the index
  found none at one hop.

| # | Pablo can | Checked by |
|---|---|---|
| R15 | read which way a neighbour points | from Called by: `unchanged · calls <symbol>`; from Calls: `unchanged · called by <symbol>` |
| R16 | not lose a Question by pressing on | with Question chosen and a note, the primary reads `Save question, next` and saves a Question |
| R17 | read an empty neighbourhood | a symbol with no callers shows `Called by  none found` |

## Amendment 3 (aglaea, 2026-10-18): asking from the mark (v3, for 0147)

Read against `docs/specs/review-map.md` v3 (FR-25 to FR-29, proposed in
0147). The FSE's v3 follows §3.3's room, and most of it stands. Four
changes, from the side of the person doing the review:

- **The ask is the primary on Question and Blocked.** With A2, the
  primary on Question reads `Save question, next`, and FR-28 puts `Ask
  <seat>` on the secondary. Then the fast path (press the primary, go on)
  never asks, and questions pile up unasked, which is the failure v3 is
  for. So, when someone can be asked: primary **`Ask <seat>, next`**
  (saves, posts, moves on), secondary **`Save`** (keeps it here, asks no
  one). With nobody to ask, A2 stands (`Save question, next`), and FR-28's
  line says why.
- **One thread per review, not one per symbol.** FR-26 opens a thread per
  mark: five questions are five threads in the supervisor's mailbox, five
  chats in Conversations, and five wakes. The first ask of a review
  opens one thread, `<slug>: review at <head short sha>`; each later ask
  is a message in it, its first line naming the symbol and `file:lines`.
  The supervisor reads one conversation and answers in order; Pablo has
  one chat to come back to. Asking again on the same symbol is a further
  message there, as FR-26 says.
- **The wake is said before the press.** The muted line reads `Saves the
  mark and asks <seat> (<why>) in this review's thread. Wakes <seat>.`
  Conversations keeps the wake count visible for the same reason: every
  wake is a turn.
- **Asked is seen, not only heard.** After an ask, the row's mark draws
  `? asked` / `✕ asked` (not only an accessible-name word, FR-29), the
  live region says `Asked <seat>` once, and the panel, when shown, reads
  `Asked <seat> · Open the thread`. `Open the thread` lands on
  Conversations with that thread; Conversations' header then offers
  `← Review`, which returns to the same symbol (the place rides the
  store).

Unchanged from the FSE's v3: who to ask and the `why` words (FR-25), the
busy `Asking…`, the failure line with `Try again` (FR-29), `--marks` on
the CLI (FR-27).

| # | Pablo can | Checked by |
|---|---|---|
| R18 | ask without slowing down | with someone to ask and Question chosen with a note, the primary reads `Ask <seat>, next`; pressing it saves, posts and moves to the next symbol |
| R19 | keep one conversation per review | two asks on two symbols post one thread `<slug>: review at <sha>` and two messages; each message's first line names its symbol and `file:lines` |
| R20 | know it wakes someone | the line under the mark ends `Wakes <seat>.` |
| R21 | see what was asked | an asked row draws `asked` beside its mark; `Open the thread` then `← Review` returns to the same symbol |

## Amendment 4 (aglaea, 2026-10-18): from rv-polish's UI review

From `working-on/rv-polish.md`, ## UI review (pass at d7e7bc9).

- **U2: no `next` when there is none.** When this symbol is the last one
  without a mark, the primary drops `, next`: `Reviewed`, `Save question`,
  `Save block`, `Ask <seat>`. Pressing it marks, and focus stays on the
  button (an in-place change keeps focus); the header then reads
  `Reviewed m of m` and the live region says it once (§4, all reviewed).
  For rv-ask-ui now.
- **U1: a flag with no fill and no border has no padding.** `no direct
  test` is muted text, not a lozenge, so it starts at the name's indent. A
  flag with a fill (amber) or a border (`declared, not changed`, dashed)
  keeps the lozenge's padding. This holds for any muted word set beside a
  name (design system).

| # | Pablo can | Checked by |
|---|---|---|
| R22 | not be offered a next that isn't there | with one unmarked symbol left, its primary reads `Reviewed` (or `Save question`, `Save block`, `Ask <seat>`) without `, next`; after the press focus is on that button |
| R23 | read a muted flag in line | `no direct test`'s left edge equals the name's left edge (±0.5 px) |

## Amendment 5 (aglaea, 2026-10-18): from rv-ask-ui's UI review

From `working-on/rv-ask-ui.md`, ## UI review (1aa65a4). U1 (the failed ask
below the fold) is fixed in the card as the reviewer proposed.

**In this card's fix round:**

- **U2: `Open the thread` lands on the thread.** Focus goes to the
  thread's divider (its subject heading) in Conversations, the thing that
  was opened; `← Review` is the next Tab stop. Never the body.
- **U4: `asked` keeps 4.5:1 on the current row.** `--tone` text measures
  4.31:1 on the current row's surface. The `?` / `✕` glyph keeps its
  colour (3:1 is enough for a mark); the word `asked` is `--fg-muted` on
  every row. Magenta as text is safe on the ground only (5.2:1), not on
  selected or raised surfaces.

**For the next frontend leftovers:**

- **U3: the failure line says the cause in words, with the fix.**

  | cause | words |
  |---|---|
  | no discuss identity for the cell | `Saved here; couldn't ask <seat>: Deltagos has no discuss identity for this cell. organizer doctor says why.` |
  | the discuss socket refused | `Saved here; couldn't ask <seat>: discuss isn't running. organizer doctor says why.` |
  | the review's thread is closed | `Saved here; the review's thread is closed. Try again opens a new one.` (and Try again does) |
  | anything else | `Saved here; couldn't ask <seat>: <first error line>`, with any home path shortened to `~` |

- **U5: `Open the thread` is a link.** It changes where Pablo is, so it is
  a link (design system, link or button), drawn and reached as the other
  in-app links are (tab-reaches-links T1-T5).

| # | Pablo can | Checked by |
|---|---|---|
| R24 | land where he went | after `Open the thread`, `document.activeElement` is the thread's divider; Tab next reaches `← Review` |
| R25 | read `asked` on the current row | `asked` measures 4.5:1 or more on the current row's surface |
| R26 | know why an ask failed and what to do | each cause in U3's table reads its words; no absolute home path shows |
| R27 | reach the thread as a link | `Open the thread` is a link, a Tab stop with the link ring |

## Amendment 6 (aglaea, 2026-10-18): from au-ui on rv-ask-ui (landed 890e02c)

- **A1: `asked` goes beside the glyph**, as R21 says: `? asked` and
  `✕ asked` are one unit in the mark's place at the row's start, before
  the name, so every row's mark reads in one column. Not after the change
  word.
- **A2: once asked, the pre-press line goes.** The panel reads only
  `Asked <seat> · Open the thread`. If Pablo edits the note, a new ask is
  possible again: the line returns as `Saves the mark and asks <seat>
  again in this review's thread. Wakes <seat>.` and the button reads `Ask
  <seat> again` (with `, next` while one is left).
- **Noted, not this card's: Conversations' chat list keeps `channel`
  current while the timeline shows another chat.** One "you are here" per
  screen: the list's current row follows the chat shown, whoever opened
  it (a review's `Open the thread` included). For the same leftovers.

| # | Pablo can | Checked by |
|---|---|---|
| R28 | read marks in one column | an asked row draws `? asked` at the mark's place, before the name |
| R29 | not read a promise already kept | after an ask, the panel shows `Asked <seat> · Open the thread` and no `Saves the mark …` line; editing the note brings back `… asks <seat> again …` and `Ask <seat> again` |
| R30 | see which chat is shown | after `Open the thread`, the chat list's current row is that thread's chat, not `channel` |

## Amendment 7 (aglaea, 2026-10-18): from oe-ui on lf42-open-at-line

From `working-on/done/lf42-open-at-line.md`, ## UI review (pass at 4406ed5).

- **A1: yes, the file line.** `Open in editor` sits on the `file lines`
  row under the h2, not inside it: the h2 is the focus target when a
  symbol opens, and its name stays the symbol alone. That is what §3.3's
  "title" means.
- **U1: a refusal at the press re-reads, and never says `Error:`.** The
  FSE's proposal, with focus and the other refusals worded:
  - **The checkout moved** (the service says the head is not checked out
    here): the panel re-reads the status, the button goes, and the file
    line reads the muted `Not checked out here at <short sha>.`, the same
    state as one that was never checked out. Focus moves to the symbol's
    h2 (the button it was on is gone; never the body), then the panel's
    sr-only polite region says the line (emptied, set after 100 ms).
  - **The editor did not start** (the command failed, the checkout is
    fine): the button stays and keeps focus, and the line under it reads
    `Editor didn't open: <the command's first error line>` in the
    blocked-reason style (`sm`, `--fg-muted`), said by the same polite
    region. A second press may work, so the button is still offered.
  - Neither is red and neither has the `Error:` prefix: nothing is
    blocked, and red is Blocked's.
- **U2: open at the definition, not its comment.** A2's answer is no: a
  doc comment is not the head line. The editor opens at the first line of
  the head range that is not part of the leading comment block (`//`,
  `/* … */`, `#`); a decorator or attribute line is code and counts. The
  `file lines` label keeps the full range (`1-4`), since the diff shows
  the comment too. A range that is all comment opens at its start.

| # | Pablo can | Checked by |
|---|---|---|
| R31 | not press a button that cannot work | remove the worktree while `Open in editor` shows, press it: the button is gone, the line reads `Not checked out here at <sha>.` in `--fg-muted`, focus is on the symbol's h2, no `Error:` anywhere |
| R32 | try again when only the editor failed | with an editor command that exits 1, press: the button stays focused and `Editor didn't open: …` shows under it, not red |
| R33 | land on the definition | format.ts `1-4` with a doc comment on line 1 opens at `:2`; the label still reads `1-4` |

## Amendment 8 (aglaea, 2026-10-18): from lw-ui on lf41-review-words

From `working-on/done/lf41-review-words.md`, ## UI review.

- **A1: Save shows only when there is something to save.** A disabled
  Save with nothing changed says nothing Pablo can act on. In the mark
  form, in every state (unmarked, marked, asked), Save is drawn only while
  the mark or the note differs from what is saved; it goes again once
  saved. In the asked, unedited state the panel ends at `Asked <seat> ·
  Open the thread`. When Save leaves after a press, focus goes to the next
  control in the panel (the asking primary if any, else the mark's radio
  group), never the body.
- **A2 (LW1): no wrap.** Tab past the last control reaching `body` is the
  document's end, and the next Tab starts again at the top, as on every
  screen of the app. The Review screen does not trap or wrap Tab. "Focus
  never drops to the body" is about focus the app moves, not the end of
  the Tab order.
- **A3: confirmed.** The chat list's row and the worklist's row are the
  current item of a list, `aria-current="true"`, one per list. The one
  `aria-current="page"` stays on the screen's place (the top bar's crumb; the sub-tabs are `true` too, leftovers-17 FR-7b).
  The design system now says so.

| # | Pablo can | Checked by |
|---|---|---|
| R34 | not meet a button that does nothing | an asked, unedited symbol shows no Save; editing the note draws Save (and `Ask <seat> again`); after Save, Save is gone and focus is on a control in the panel |
| R35 | tell the screen from the item | on Conversations after `Open the thread`, one `aria-current="page"` (the top bar's crumb) and one `aria-current="true"` (the thread's chat) |

## Amendment 9 (aglaea, 2026-10-18): from rs-ui on lf43-review-states

From `working-on/done/lf43-review-states.md`, ## UI review.

- **RS1: a Save never forgets an ask.** The ask is a fact (a message was
  sent, a seat was woken), not part of the editable mark. A Save keeps
  the mark's asked state and its thread whatever it changes. After
  editing and saving the note of an asked mark, the panel still reads
  `Asked <seat> · Open the thread`, the row keeps `? asked` (or
  `✕ asked`), and because the saved note now differs from the one that
  was asked, the line and the primary are A6's `again` forms: `Saves the
  mark and asks <seat> again in this review's thread. Wakes <seat>.` and
  `Ask <seat> again` (`, next` while one is left). Changing the mark to ✓
  or none keeps the link in the panel (the thread still exists), drops
  `asked` from the row's mark (it marks a question or a block), and
  offers no ask.
- **RS2: no Save that cannot save.** Save is drawn only when it can save
  (the form differs from what is saved and there is a mark). A note typed
  with no mark draws, under the note, the muted line `Choose a mark to
  save this note.`, which goes once a mark is chosen. The note is kept as
  typed.
- **RS3: never land on archive for a thread not listed yet.** Archive is
  closed threads. When the named thread is not in the feed yet,
  Conversations lands on the direct chat of the seat it was asked of (the
  review's seat), else on channel, and selects the thread when the feed
  lists it, unless Pablo has moved since. The one current row
  (`aria-current="true"`) and the selected fill are always the same row.

| # | Pablo can | Checked by |
|---|---|---|
| R36 | keep an ask through a Save | asked symbol, edit the note, Save: the panel shows `Asked <seat> · Open the thread` and `Ask <seat> again`; the row reads `? asked` |
| R37 | know why a note will not save | unmarked symbol, type a note: no Save, the line `Choose a mark to save this note.` under it; choose a mark: the line goes and Save is drawn |
| R38 | land somewhere real | `Open the thread` with the thread not yet in the feed lands on the seat's direct chat, never archive; the current row and the fill agree |
