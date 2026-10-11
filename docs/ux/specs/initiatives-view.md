# Initiatives: awake and asleep

status: proposed
owner: pablo
by: aglaea, 2026-10-09, for the FSE (thread 01M4GK4QY61MGNM1SWN8FV876Q)
rulings it rests on: 0104 A (scope, Pablo's words); 0042 (not active is
read-only and out of every count); 0101 and 0103 (memory, the RAM
indicator spec); FR-14 (Needs me is the one badge); usage.md (a top-level
view beside Settings); the design system (red is blocked's alone, status
hues reserved, Focus and names, Widths, dates as words)

Looked at: 0104, `~/claudecode/scripts/factory/sleep.sh` (what `factory
awake | sleep | wake` does and says), the rail's "Not active" fold
(`Rail.tsx`), the header's read-only lozenge (`InitiativeHeader.tsx`) and
the top bar as built. No screen exists yet.

## The problem, in the lead's terms

Pablo, 2026-10-09: "What I am missing is view where I could handle
initiatives as cards, activate deactivate some. Also, In the left menu, at
top, active ones shall be placed. Also, I need a monitor of how ram is being
used by each initiavie, each agent" (`said`). The factory keeps at most
four initiatives awake on a Mac; today that is only a command line.

## The jobs

1. See **which initiatives are awake**, how many of the four, and what each
   holds (seats, memory).
2. **Put one to sleep, or wake one**, from Deltagos, knowing what that does.
3. See **memory per initiative and per agent**, to choose which to sleep.

Deltagos runs `factory sleep|wake`. It writes no status itself, and it never
passes `--force` (0104 A: the limit stays a limit).

## The words

| Status in `initiative.yaml` | Word | Where |
|---|---|---|
| `active` | `awake` | Initiatives, Home, the rail's groups |
| `paused` | `asleep` | Initiatives, the rail's `Asleep` fold, read-only when opened |
| `archived` and anything else | `archived` (or the status as written) | Initiatives' last fold, the rail's `Archived` fold |

"Awake" and "asleep" replace "active" and "paused" in every word Deltagos
shows; the file keeps its own words.

## Where it lives

- **Top bar**: a quiet text button `Initiatives`, left of `Usage`:
  `… Needs me 3 · Rescan · Initiatives · Usage · ▣ 12 GB free · ? · ⚙`.
  **No number and no badge** (FR-14); the count is inside the view.
- **Crumbs**: `Home / Initiatives`.
- **From the rail**: the `Asleep (n)` fold's head carries a text link
  `Initiatives ›`.
- **From Home**: under its last initiative row, one muted line when any
  sleep: `2 asleep · Initiatives ›`. Asleep ones leave Home (0042), and this
  line keeps them findable.
- **From an asleep initiative**: the header's lozenge reads `asleep:
  read-only`, followed by the text link `Wake in Initiatives ›`. That link
  lands on the initiative's card with focus on its Wake. The header itself
  carries no Wake (0104 A over C).

## The view, top to bottom

```
Initiatives                                            3 of 4 awake
Awake · 3
┌───────────────────────────────┐ ┌───────────────────────────────┐
│ organizer  [personal]  awake  │ │ camp  [ccint]  awake          │
│ One board for every initiative│ │ Camp app to beta              │
│ 4 sessions live · 1 frozen    │ │ 6 sessions live               │
│ Memory 9.8 GB                 │ │ Memory 11.2 GB                │
│ Next: due 14 Oct              │ │ Next: target 31 Oct           │
│                       [Sleep] │ │                       [Sleep] │
└───────────────────────────────┘ └───────────────────────────────┘
Asleep · 2
┌───────────────────────────────┐
│ hestia  [personal]  asleep    │
│ asleep since 2 Oct            │
│ 3 sessions frozen             │
│ Memory: none running          │
│ Next: no date                 │
│                        [Wake] │
└───────────────────────────────┘
▸ Archived · 7
```

### 1. The head

`Initiatives` (the view's title) and, at the right, the count: **`3 of 4
awake`**, in neutral ink.

| Awake | The count reads | Look |
|---|---|---|
| under four | `3 of 4 awake` | neutral |
| four | `4 of 4 awake · the limit` | neutral; it is a limit, not an error |
| over four (woken with `--force` on the command line) | `5 of 4 awake · over the limit` | the magenta tone, with the hover `one was woken past the limit outside Deltagos; put one to sleep` |

No red: red is blocked's alone.

### 2. Sections

`Awake · n`, `Asleep · n`, then `▸ Archived · n`, which is closed by
default and remembered per viewer. Within a section, cards keep the rail's
order (the lead's priority). An empty section keeps its head and one muted
line: `None asleep.` or `None awake.`

### 3. The card

A tile from the design system (surface 2, radius 8, no white), at least
280 px wide, laid out in a grid of as many columns as fit.

| Line | Shows |
|---|---|
| head | the id (mono, a link: it opens the initiative, read-only when asleep), the client lozenge, the state as a word lozenge: `awake` in the accent family, `asleep` neutral, `archived` neutral |
| goal | the initiative's `goal`, one line, clamped with its full text in the hover; `no goal yet` muted when absent, as Home says it |
| sessions | awake: `4 sessions live · 1 frozen` (the frozen count only when there are any). Asleep: `3 sessions frozen`, or `no sessions frozen`. When one session is working: `· 1 working` |
| memory | `Memory 9.8 GB`, tabular, the initiative's total (0103's `by_initiative`); its hover names the biggest three sessions, as the RAM popover does |
| next | `Next: due 14 Oct`, the same real date Home shows, as words; `Next: no date` muted |
| since | asleep only: `asleep since 2 Oct`, when the status line says so (`factory sleep` writes `sleeping since <date>`); left out when it does not |
| action | awake: `Sleep`. Asleep: `Wake`. Both are secondary buttons, never the accent fill: several sit in one view, and neither is the view's one main action. Archived: no button |

The card's memory is never coloured. Pressure belongs to the whole Mac and is
shown once, in the top bar (ram-indicator.md). At high or critical pressure,
the awake card holding the most reads `Memory 11.2 GB · the most`, so the
lead can pick one to sleep without the cards re-sorting under the pointer.

### 4. Sleep

Sleep freezes every live session of the initiative (its conversation is
kept and its mail waits), sets it `paused`, and takes it out of Home and
Needs me. Because that stops running work, **Sleep confirms in place** when
the initiative has any live session or anything waiting on the lead. The
card's lower half turns into:

```
Sleep organizer?
4 sessions freeze: their conversations are kept and mail waits.
1 is working now: fse.
2 decisions and 1 thread waiting on you leave Needs me until it wakes.
                                         [Sleep organizer]  [Cancel]
```

- The lines appear only when they are true; the `working now` line names
  the sessions. With nothing live and nothing waiting, Sleep runs at once.
- Focus goes to `Cancel`, and Escape is Cancel. The destructive-leaning
  button names its object (`Sleep organizer`) and is secondary, not red.
- **Sleeping your last awake initiative** adds `Home will be empty until one
  wakes.`

### 5. Wake

Wake thaws the initiative's frozen sessions lean and sets it `active`. It
asks nothing.

- **At the limit** (four awake), every Wake stays visible and focusable but
  is refused. It is `aria-disabled`, its name is `Wake hestia: four are
  awake`, and the Asleep section's head carries one line:
  `Four are awake: agent-slack, camp, hestia, organizer. Put one to sleep
  to wake another.` Each name is a link to that awake card's Sleep. Pressing
  a refused Wake puts the same line under that card and moves focus to it.
  No `Wake anyway` (0104 A over B).

### 6. While it runs

| Moment | The card shows |
|---|---|
| sleeping | the button reads `Sleeping…`, disabled; the sessions line reads `freezing 4 sessions…`. Focus moves to the card's id before the button disables (Focus and names) |
| waking | `Waking…`, disabled; `thawing 3 sessions…` |
| done | the card moves to its section at its rail position. Focus follows it to its id, and a polite live region says `organizer is asleep` or `hestia is awake`. The count updates. The rail and Home follow on the same rescan |
| failed | below, States |

Only one Sleep or Wake runs at a time. While one runs, the other cards'
buttons stay enabled, and pressing one queues nothing: it says `Wait for
organizer to finish sleeping.` under that card.

## States

| State | What shows |
|---|---|
| **sleeping in progress** | as §6: `Sleeping…`, `freezing 4 sessions…` |
| **waking in progress** | as §6: `Waking…`, `thawing 3 sessions…` |
| **refused at the limit** | `4 of 4 awake · the limit`; every Wake `aria-disabled` with its reason; the Asleep head names the four awake with links to their Sleep (§5) |
| **the factory refuses anyway** (its own count differs, or a wake ran from the command line meanwhile) | under the card, the factory's words verbatim in mono (`4 initiatives are awake (limit 4): put one to sleep first …`), then `Nothing changed.` The view rescans |
| **factory missing** (`factory` not found on this Mac) | every card shows its state, and no Sleep or Wake. The head adds one line: `Sleep and Wake need the factory command, which is not on this Mac.` The count still shows |
| **factory failing** (non-zero exit, other than the limit) | under the card, `Sleep failed.` or `Wake failed.`, the first line of its error verbatim in mono, and what is now true after a rescan: `Nothing changed.`, or, for example, `organizer is asleep, but 1 session still runs: fse. Agents ›` |
| **an initiative the factory does not see** (camp today: four folders under ~, and the factory looks three deep) | the card shows its state as Deltagos reads it, with no button. In its place: `The factory does not see this initiative, so it can't sleep or wake from here.` with the path in the hover. When the counts differ, the head's count is Deltagos's, and its hover adds `the factory counts 3; it does not see camp` |
| **no memory reading** | the first 10 s, `Memory —` with the hover `reading memory…`; a failed reading shows `Memory —` with the hover `memory could not be read`. Asleep with nothing running: `Memory: none running` |
| **one initiative** | one card in Awake, `1 of 4 awake`, and `None asleep.`; Sleep confirms with `Home will be empty until one wakes.` |
| **none awake** | `0 of 4 awake`; `None awake.`; Home shows its empty state with the link `Wake one in Initiatives ›` |
| **archived** | under `▸ Archived · n`, closed; cards without memory or button, with `archived: the factory leaves it alone` muted |
| **narrow, 1024×640** | one or two columns of cards; no line is cut (the goal clamps with its hover); the confirm's buttons wrap under its text; no horizontal page scroll |

## The rail

- Awake initiatives keep their groups, at the top, as now.
- The `Not active (n)` fold becomes two folds, both closed by default:
  - **`Asleep (n)`**, holding the paused initiatives. Its head carries
    `Initiatives ›`, and its hover reads `asleep: opens read-only; wake one
    from Initiatives`.
  - **`Archived (n)`**, below it, holding the rest. It shows only when
    there are any.
  0104 names the fold `Asleep`. Archived ones are not asleep and cannot be
  woken (the factory refuses them), so they get their own fold rather than
  a wrong word.
- At the collapsed 46 px strip, each fold is its count alone, with its word
  in the hover.

## Agents: memory on every row

- Every agent row gains a **Memory** column: `1.4 GB`, tabular,
  right-aligned, in neutral ink (0103's `mem_bytes`, the process tree's
  footprint). Exited and frozen rows read `—`, with the hover `not
  running`. Before the first reading, `—` with the hover `reading
  memory…`.
- The initiative's group head shows its total, `Memory 9.8 GB`, the same
  number as its card.
- The column never folds at narrow widths: it is the reason it was asked
  for. Other columns give way first, by the Widths rule.
- Sorting stays as it is. Memory does not re-sort rows under the pointer.

## Amendment 1 (aglaea, 2026-10-10): from the build's reviews

From initiatives-view's UI review (A1 to A3) and lf15-initiatives-polish's
(V2 to V4).

- **The rail's strip, A1**: at 46 px, each fold is a glyph over its count,
  not a bare count. `Asleep` is a moon (lucide `Moon`, 14 px) and
  `Archived` is a box (lucide `Archive`). Both are muted, with the fold's
  word and count in the hover and the name (`Asleep, 11 initiatives`). Bare
  counts under the rank numbers read as ranks.
- **Sleep's confirm and the keyboard, A2**: it is an inline confirm, not a
  box (design system, Focus and names). Focus lands on Cancel, Escape
  cancels, and Tab may leave it; it stays open until Cancel, Escape, Sleep
  or another card's confirm.
- **A3**: Tab in WKWebView stays with Pablo (Q1). No change.
- **V2**: fixed in the build (one track for crew and agents).
- **The floating list's folds, V3**: as the rail, two folds: `Asleep (n)`
  counts paused initiatives only, then `Archived (n)` holds the rest. It
  shows only when there are any. An archived initiative is never called
  asleep, since Wake does not apply to it.
- **An off seat's Memory cell, V4**: it shows `—`, and its name and hover
  are `Memory: not running`. "Unknown" is kept for a reading that failed
  (`Memory: could not be read`) and for before the first reading (`Memory:
  reading…`). These three are the only words for an empty Memory cell, on
  every Agents row and crew seat.
- **Widths for the Agents rows** (FR-4's gap): checked at 1024×640 with the
  rail open and at 1440×900 with the rail open (design system, Widths:
  gate sizes are window sizes plus the rail state). The Memory cell stays
  on the right edge's track at both, wrapped or not.

| # | The lead can | Checked by |
|---|---|---|
| I14 | tell the strip's folds from ranks | at the 46 px strip, a moon over the asleep count and a box over the archived count; the hover names each |
| I15 | trust Asleep means asleep everywhere | the rail and the floating list both show `Asleep (n)` for paused ones only and `Archived (n)` apart |
| I16 | read an empty Memory cell | an off seat: `—`, named `Memory: not running`; a failed reading: `Memory: could not be read`; before the first: `Memory: reading…` |

## Amendment 2 (aglaea, 2026-10-10): the card opens; Details; the top bar

Pablo, 2026-10-10, with screenshots of Initiatives and the top bar: "On
clicking the card I should be able to go to the initiative. Also, getting
details of the project. We need to review [the top bar] button
disposition" (`said`, relayed by the FSE as a note, not urgent).

### 1. The card opens its initiative

- **The whole card is the link**, not only its id: a press anywhere on the
  card that is not one of its buttons opens the initiative on **Overview**.
  An asleep one opens read-only, as before. In markup, the id stays the one
  link, and a stretched hit area covers the card under its buttons, so
  there is still one link per card for the keyboard and a screen reader
  (name: `Open organizer`).
- **Hover**: the card's surface rises one step (surface 2 to raised) and the
  pointer is a hand. Sleep, Wake and Details keep their own hover and never
  open the initiative.
- An open Sleep confirm stops the card from opening: the press goes to the
  confirm.

### 2. Details: the charter and the workspace, in place

"Details" means what the initiative *is* (its charter) and where it
*lives* (its workspace). Today the first is in the initiative header's
Details and the second is Home's chevron. The card shows both, reusing both,
so there is one definition of each.

- A **`Details` text button with a chevron** sits on the card's action line,
  left of Sleep or Wake. It is the same chevron as Home's row and is named
  `Details of organizer`, with `aria-expanded`.
- Opened, the card **spans the whole grid row** and grows downward. The
  cards after it flow below, and nothing overlays. Two columns, one under
  the other below 1280:

```
organizer  [personal]  awake                              [Details ▴] [Sleep]
Charter                                   Workspace
Goal     One board for every initiative   Repos     organizer  main · clean
Measure  Pablo opens it first each day              (Home's chevron detail,
Target   31 Oct                                      as is: repos, problems,
Scope    In: …  Out: …                               specs, editor, terminal,
Stage    one-window — "the app in one                review prompt)
         window" (3 of 5)
```

- **Charter** comes from `initiative.yaml` and the roadmap, verbatim (the
  lead's words):
  - the goal in full;
  - `measure`;
  - `target` as a date in words;
  - `scope` as two short lists, `In` and `Out`;
  - the current stage with its outcome and position (`3 of 5`).
  
  Each missing field is one muted line (`no measure yet`). These are the
  header's Details fields, in the same words.
- **Workspace** is Home's chevron detail, mounted as is (`InitiativeDetail`).
  Any change to it shows in both places. An asleep initiative's workspace
  follows 0042, so actions that start or post are hidden.
- One card open at a time. Opening another closes the first. Escape, with
  focus inside the open details, closes them and returns focus to `Details`.
- At 1024×640 the two columns stack; no line is cut and the page does not
  scroll sideways.

### 3. The top bar, ordered by kind

As built it reads: `Deltagos v… · Home / Initiatives · 1 machine · remote
24d ago · Needs me 24 · Rescan · ⇲ · Initiatives · Usage · ▣ 7.8 GB free
· ? · ⚙`. Places are split from the crumbs, a stale sync line shows with
sync off, and the app's own controls sit between the places. Grouped by
kind, left to right:

```
Deltagos  Home  Initiatives  Usage  / organizer        ▣ 7.8 GB free │ Needs me 24  Rescan │ ⇲  ?  ⚙
└ brand ┘ └──────── where you are ────────┘            └ this Mac ──┘ └── your work ──┘ └ the app ┘
```

| Group | Holds | Look |
|---|---|---|
| brand | `Deltagos`; the version moves into its hover at every width | as now |
| where you are | the three places as quiet text tabs, `Home`, `Initiatives`, `Usage`, with the current one marked (accent underline, `aria-current="page"`); then, inside a place, the crumb: `/ organizer` or `/ Settings` | one nav, named `Places` |
| this Mac | the memory button (ram-indicator); the sync line **only with `auth: firebase`** (`1 machine · remote 2h ago`) | subtle |
| your work | `Needs me` with the one badge, then `Rescan` (and `Sync` with firebase) | as now |
| the app | Compact to icon, Help, Settings, icons only | as now |

- Groups are separated by 16 px of space, not lines. The single bar `│`
  in the sketch only marks the groups and is not drawn.
- **Needs me stays the one badge** (FR-14). It stays where the eye ends,
  right of the Mac's state, so `24` reads as work and not as a place.
- **Home is a place now, not only a crumb.** `Needs me` still goes Home, so
  two controls lead there: the tab says where you are, and Needs me says
  what waits. Help's crumb (`/ Help`) stays as it is.
- **With `auth: off` the sync line is gone**: `remote 24d ago` with sync
  off reads as a fault. With firebase it stays, and turns magenta past a
  day stale (as `syncNote` does today).
- **At 1024** (the compact class), the places stay. The memory button takes
  its short form (ram-indicator), and the crumb's initiative id clamps with
  its hover. The bar stays one line.

| # | The lead can | Checked by |
|---|---|---|
| I17 | open an initiative from its card | a press on the card's body (not its buttons) opens it on Overview; asleep opens read-only; the keyboard reaches one link per card, named `Open <id>` |
| I18 | read an initiative's details from its card | `Details` opens the card across the row with Charter (goal, measure, target, scope in and out, stage with outcome) and Workspace (Home's chevron detail); missing fields read `no … yet`; Escape closes and returns focus |
| I19 | find the places together | the top bar shows `Home`, `Initiatives`, `Usage` as one nav after the brand, the current one marked, and the crumb after them inside a place |
| I20 | read the bar by kind | left to right: brand, places, then the Mac's state, Needs me and Rescan, then Compact, Help and Settings; no sync line with auth off |
| I21 | keep it on one line at 1024 | at 1024×640 with the rail open, the bar is one line; the version is in the brand's hover; the memory button is short |

## Amendment 3 (aglaea, 2026-10-10): one mark for "you are here"; firebase at 1024; once per screen

From leftovers-17's reviews (`working-on/done/lf17-top-bar.md` U1-U4,
`lf17-initiative-card.md` U1-U3, Q1), relayed by the FSE. Each answer
replaces the line of Amendment 2 it names.

### 1. One "you are here" mark per screen (U1, U2, U3)

Every screen marks **one** control as current (`aria-current="page"` and
the accent underline or `--surface-selected`), never two:

| Screen | Current | Also shown | Crumb |
|---|---|---|---|
| Home | `Home` tab | `Needs me` is plain: it is a verb that goes Home, not a place | none |
| Initiatives | `Initiatives` tab | | none |
| Usage | `Usage` tab | | none |
| an initiative | the title `organizer` | the `Initiatives` tab as its **parent**: the underline in `--fg-subtle`, no `aria-current`, still a link | the title |
| Settings | the gear (`.on`, `aria-current="page"`) | no tab marked | none |
| Help | `?` (`.on`, `aria-current="page"`) | no tab marked; Help's own body may say where it came from | none |

- **An initiative belongs to Initiatives**, the place that lists them all,
  whichever door opened it (rail, Home row, card). That is the U2 answer:
  `placeOf` maps an initiative to Initiatives, and Settings and Help to no
  place.
- **The crumb loses its slash and becomes the screen's title** (U1). It sits
  after the places with the 16 px group gap, in `--fg` at the bar's size,
  mono since it is an id, clamped with its hover as before. Without the
  slash, `Usage / organizer` no longer reads as a child of Usage. The tabs
  never move between screens, so the eye keeps their places.
- **Settings and Help have no crumb** (replaces A2's "Help's crumb stays as
  it is"): their own icon is the mark, and their page heading names them.
- **Needs me drops `.on`** (U3). Its badge stays the one badge (FR-14).

### 2. The bar with `auth: firebase` at 1024 (U4)

FR-5 holds in **both** auth modes. With firebase the bar adds the sync line,
`Sync` and the account, about 440 px against 232 free. In the compact
class they fold in this order, and each comes back when the bar has room:

1. the memory button takes its short form (as now);
2. **the sync line goes into `Sync`**: its name and hover read `Sync. 1
   machine, remote 2h ago`. Past a day stale the button reads `Sync ·
   stale` with `stale` in magenta (a word, not a dot: Needs me keeps the
   one badge);
3. **the account becomes an icon button** (a person glyph, 28 px), named
   `Account <email>`, the email in its hover and its menu. It sits in the
   app group, last, after Settings;
4. the title (an initiative id) clamps to 12 characters with its hover.
5. **Rescan becomes its glyph** (↻), named `Rescan` (aria-label and
   hover). Added by the FSE after cm-build measured folds 1-4 at 1066 px in
   WebKit (leftovers-18 FR-3 Amendment 2, 24d052e); accepted. It fits with
   9.5 px spare, so the next control added to the bar needs a fold of its
   own first.

Help and Settings are never pushed past the edge, and the bar never wraps.

### 3. A fact shows once per screen (card Q1, U2)

Keep **one** Charter component with one field set. A host that already
shows a field on the same screen tells the Charter to leave it out
(`omit`); the definition of each field stays in one place.

- **The header's Details omit Target and Stage**: the bar shows the target
  and the strip shows the stage, both always in view. The bar's target and
  the strip label stay. The open header is that much shorter (0038).
- **An open card hides its head's goal line**, since the Charter shows the
  goal in full right below it.
- The card's Charter keeps every field: nothing else on the card shows the
  target or the stage's outcome.

### 4. The card's hover (card U3)

The card rises on hover of its **body** (the stretched link), not when the
pointer is on Details, Sleep or Wake. An open card rises as well, since a
press on its body still opens the initiative.

### 5. Nothing runs past the right edge at 1024

Seen at 1024×640 with the rail open; each gives way inside its own box:

- **The initiative header's pills wrap** to a second line in the header (a
  header holds a few facts, not a row of signals, so wrapping is allowed
  there). They are never clipped or scrolled.
- **Overview's columns stack** when the main pane is under 880 px: the FSE
  column goes below the first, full width. The rule is set by the pane's
  width, not the window's, since the rail changes it.
- **Help's body** is `max-width: min(72ch, 100%)`. Long paths and ids break
  (`overflow-wrap: anywhere`), and a table or code block scrolls inside its
  own box with the edge line (design system, Widths).

| # | The lead can | Checked by |
|---|---|---|
| I22 | see where he is, once | on each of Home, Initiatives, Usage, an initiative, Settings and Help, exactly one element has `aria-current="page"` and one current mark; on an initiative, `Initiatives` carries the parent underline and no `aria-current`; Needs me is never `.on` |
| I23 | read the title as the initiative's, not Usage's | inside an initiative the bar shows the id after the places with no slash; Settings and Help show no crumb |
| I24 | keep one line with firebase | at 1024×640, rail open, `auth: firebase` signed in with a 30-character email on an initiative with a 22-character id: the bar is one line and Settings ends inside the window; the sync words are in Sync's name and hover; the account is an icon named with the email (a vitest of the signed-in bar plus the computed widths, if the fixture cannot sign in) |
| I25 | read each fact once | the header's open Details show no Target and no Stage lines; an open card shows the goal once; one Charter component, with `omit` |
| I26 | see which press opens the card | hover on Details, Sleep or Wake does not raise the card; hover on its body does, open or closed |
| I27 | read every view at 1024 | at 1024×640, rail open: the header's pills wrap inside the header, Overview stacks its columns, Help's body breaks long words; nothing runs past the right edge and the document does not scroll sideways |

## Amendment 4 (aglaea, 2026-10-11): from leftovers-18's UI reviews

From `working-on/done/lf18-current-mark.md` (cm-ui U1-U5 and the title's
mark) and `lf18-charter-once.md` (co-ui U1-U3), relayed by the FSE.

### 1. The screens without a tab name themselves (cm-ui U1)

A3 §1 says Settings names itself through its page heading, but it has
none. **Settings gets an `h1` `Settings`** as the first line of its body,
above Identity, in the page-title size. Any screen that no place tab marks
has an `h1` naming it.

### 2. The rail's back link follows the owner (cm-ui U2)

On an initiative, the rail's back link reads **`← Initiatives`** and goes
there, matching the bar's parent mark (`placeOf`). It follows `placeOf`,
not the door that opened the initiative, so the bar and the rail never
disagree. Home stays one press away through its tab.

### 3. The folds by class, for now (cm-ui U3)

Accepted as built: with firebase, the five folds apply across the whole
compact class, not by measured room. A3 §2's "comes back when the bar has
room" is deferred until identity returns (identity-entra is on hold, and
Pablo runs auth off). When it does, fold by the bar's measured overflow.

### 4. Sync is quiet; stale is the signal (cm-ui U4)

The bar is chrome, and principle 3 keeps the accent for actions that
commit in the content. **Sync is a ghost button in every state.** When the
sync is stale, the magenta word `stale` is the only magenta in the bar
(magenta on the ground, #d946ef on #1a1523, is 5.2:1), so the button stands
out exactly when it matters, without an accent fill (magenta on the accent
fill is 1.4:1).

### 5. Help is an overlay, so it is opened, not current (cm-ui U5)

This replaces A3 §1's Help row. Help opens over the screen and does not
replace it. **`?` carries `aria-expanded` and `--surface-selected` while
Help is open**, and it gets no `aria-current`. The screen under Help keeps
its own mark: Help over Settings leaves the gear current. I22 still
counts one `aria-current="page"` per screen, now the screen under Help.

### 6. The title's mark (cm-ui, question)

On an initiative the title is the one `page`. It reads as current by
**weight and ink, not a line**: `--fg` at semibold (600), against the
tabs' `--fg-muted` at 500. It gets no underline, since an underline means
"a tab" in this bar. The grey parent underline on Initiatives points to it.
The accent underline under the content belongs to the sub-tab, which is
current inside the page (`aria-current="true"`). That is enough; nothing
else is added.

### 7. The card (co-ui U1-U3)

- **U1: the id is part of the body.** Hovering `Open <id>` raises the card,
  since its press opens the same thing.
- **U2: the header's Details keeps one label and one height.** It reads
  `Details` with the chevron, which turns when open, exactly as the card's
  button does. `aria-expanded` carries the state, and `Hide details` goes.
- **U3: no change.** At 1024 the open header scrolls inside itself, and the
  bar's stage button keeps the stage in view.

I24's evidence (vitest plus computed WebKit widths, since the review build
cannot sign in safely) is accepted as is.

| # | The lead can | Checked by |
|---|---|---|
| I28 | read where he is on Settings | Settings' body starts with an `h1` `Settings` |
| I29 | go back the way the bar points | on an initiative the rail's back link reads `← Initiatives` and opens Initiatives |
| I30 | see a stale sync | Sync is a ghost button, fresh or stale; stale shows the word `stale` in magenta and no accent fill |
| I31 | tell Help is open over a screen | `?` has `aria-expanded="true"` and the selected surface while Help is open, and no `aria-current`; the screen under it keeps its one `aria-current="page"` |
| I32 | see the title as the current page | on an initiative the title is `--fg` at 600, with no underline |
| I33 | see the id as part of the card | hovering the id link raises the card |
| I34 | open the header's Details without a jump | the button reads `Details` open or closed, at one height, with `aria-expanded` |

## Amendment 5 (aglaea, 2026-10-11): from leftovers-19's UI reviews

From sup56's close (`runs/2026-10-11-sup56-leftovers-19.md`), relayed by
the FSE as a question.

### 1. "Current" and "open" look different in the bar (places U1, card A3)

- **Current is a line, open is a surface**, the same way for tabs and
  icons. The current gear (and any current icon) takes the tabs' 2 px
  accent underline under its icon and drops the filled `.on` surface.
- An opened overlay's opener (`?` while Help is open) keeps
  `--surface-selected` with no underline.
- With Help open over Settings, the gear is underlined and `?` is filled,
  so the two can be told apart.
- The initiative's title stays current by weight (A4 §6). It is text, not a
  control.

### 2. The Settings heading takes no focus (places U2): as built

Pressing the gear leaves focus on the gear. The bar stays mounted and the
gear is now the current mark, so the keyboard keeps its place. The `h1` is
for reading and for heading navigation, and gets no `tabindex`. No change.

### 3. The rail's back link is its own button (places, spec gap)

It was not intended as built. On an initiative the whole hero (client, id,
the now, blocked and next counts) is one button whose press goes to
Initiatives, so a press on a count goes somewhere unexpected, and the name
reads as a list of numbers.

- On an initiative, **`← Initiatives` is its own small button** at the top
  of the hero, at least 24 px tall, named `Back to Initiatives`.
- The rest of the hero is a summary and does not respond to presses.
- On Home the hero stays one button (Home), as before.

### 4. Focus raises the card as hover does (card A2)

`:focus-visible` on `Open <id>` raises the card, so a keyboard user sees
the same "this opens" as a pointer user.

### 5. The header's Details never moves (cd-ui U1)

At 1024 the goal line keeps a 20ch floor, so the bar wraps and pushes
Details to a second line while closed. Open, the goal line goes and Details
rises 22 px.

- **Details is pinned to the first line's right end** and never wraps.
- When the goal line cannot keep its floor beside the pills, the goal line
  is what drops to a line of its own under the bar.
- Opening removes that line and the content below moves. Details itself
  stays at the same x and y.

A1, the chevron swap matching the card, stays as built.

| # | The lead can | Checked by |
|---|---|---|
| I35 | tell "you are here" from "open" | the current icon has the 2 px accent underline and no fill; `?` with Help open has the selected surface and no underline; with Help over Settings both show, different |
| I36 | go back without pressing the counts | on an initiative, `← Initiatives` is its own button (≥ 24 px, named `Back to Initiatives`); pressing the hero's counts does nothing; on Home the hero is still the Home button |
| I37 | see by keyboard what opens the card | focus-visible on `Open <id>` raises the card |
| I38 | open the header's Details without it moving | at 1024×640 with the rail open and at 1440×900, the Details button's frame is the same closed and open |

## Amendment 6 (aglaea, 2026-10-11): from leftovers-20's UI reviews

From sup57's close (`runs/2026-10-11-sup57-leftovers-20.md`, "Found, not
asked"), relayed by the FSE as a question.

### 1. The rail hero is a summary, everywhere (bk-ui)

The hero is never a button. On Home and the other places it reads `Working
on`, `Home` and the totals, and the `Home` tab already goes Home, so the
hero adds nothing as a control. Its name was the whole contents read as one
string.

- **The hero is a summary on every screen**, with no role, so a screen
  reader reads it as text.
- On an initiative it adds the `Back to Initiatives` button (A5 §3).

This replaces A5 §3's "on Home the hero stays one button".

### 2. Kept as built

- **Two raised cards** (dt-ui U1): pointer and keyboard are two inputs,
  and each shows its own target. A card raised by hover and another raised
  by focus are both true, so there is no change.
- **Plain Tab skips links in WKWebView** (dt-ui U2): this is the open Q1
  to Pablo, whether he uses Tab at all. Until he answers, `Open <id>` stays
  a link: it navigates, and making it a button only to catch Tab would
  misname it. Plain Tab still reaches each card's Details and Sleep or Wake.
  If Pablo uses Tab, the fix is app-wide, not this card's.
- **The goal line shares its line with the target** at 1024 (FR-6 said "a
  line of its own"). The purpose was that Details never moves, and it
  doesn't. Goal and target are both header facts, so sharing their line
  reads well. Accepted; A5 §5's "a line of its own" now reads "below the
  bar".
- D2's frame was measured in Chromium only. The next build that touches the
  header re-measures it in WebKit.

| # | The lead can | Checked by |
|---|---|---|
| I39 | hear the rail hero as what it is | the hero has no button role on any screen; on an initiative its one control is `Back to Initiatives`; the Home tab is the way Home |

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| I1 | open Initiatives from anywhere | `Initiatives` in the top bar, left of Usage, with no number; crumbs `Home / Initiatives` |
| I2 | see how many are awake | `n of 4 awake` at the head, neutral; `· the limit` at four; magenta `over the limit` above four |
| I3 | read each initiative at a glance | a card per initiative with id, client, the `awake`/`asleep` word, goal, sessions with nouns, memory, next date as words; Awake, Asleep, then Archived closed |
| I4 | sleep one knowing what it does | Sleep confirms in place when there is a live session or something waiting, naming the sessions, any working one and what leaves Needs me; with neither, it runs at once |
| I5 | wake one | Wake runs `factory wake <id>` without `--force`; the card moves to Awake; the count, rail and Home follow |
| I6 | be told why Wake is refused | at four awake, Wake is `aria-disabled` with its reason; the Asleep head names the four awake with links to their Sleep; there is no `Wake anyway` |
| I7 | see work in progress and its end | `Sleeping…`/`Waking…` with the sessions being frozen or thawed; focus stays on the card and follows it; a live region announces the result |
| I8 | trust a failure | the factory's words verbatim, and what is true after a rescan (`Nothing changed.` or the partial state) |
| I9 | understand what Deltagos cannot do | factory missing: no buttons and one line; a factory-blind initiative: no button and its line; archived: no button |
| I10 | see memory per initiative and per agent | each card's `Memory` total; each Agents row's Memory column and the group total, `—` with its reason when unread |
| I11 | find the asleep ones | the rail's `Asleep (n)` fold with `Initiatives ›`; `Archived (n)` apart; Home's `n asleep · Initiatives ›` line; an asleep initiative's header reads `asleep: read-only` with `Wake in Initiatives ›` |
| I12 | use it by keyboard | Tab reaches every card's id link and its button; the confirm takes focus to Cancel; Escape cancels; a refused Wake is reachable and says why |
| I13 | read it at 1024×640 | cards in one or two columns, no line cut, no horizontal page scroll |

## Open questions

- **O1** (FSE): the `asleep since` date. The factory writes it as a comment
  on the status line. Read it if the scan can; otherwise the card leaves it
  out, which is fine.
- **O2** (FSE): frozen sessions are probe's (`~/.local/state/probe/frozen`).
  Say if Deltagos cannot read them, and the sessions line drops `frozen`.
- **O3** (FSE, Hephaistos): camp is invisible to the factory until it looks
  four deep. The design covers it, but the count reads best when both see
  the same set.
- **O4** (Pablo, only if the FSE wants it confirmed): archived gets its own
  fold under Asleep rather than sharing the word.

## Technical notes

The FSE, 2026-10-09: build spec `docs/specs/initiatives-view.md`, cards
`initiatives-sleep` and `initiatives-view`, accept record 0106. O1: read
from the status line's comment. O2: readable. O3: asked of Hephaistos.
O4: archived apart is the factory's own rule; named in 0106.
