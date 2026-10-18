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
