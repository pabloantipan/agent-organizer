# Deltagos design system

The rules every Deltagos screen follows. Deltagos is the app; the
initiative, the CLI and the repo keep the name organizer (0066). Values live in
`frontend/src/styles/tokens.css`; this file says what they are for, how the
components are built from them, and why. The redesign (`docs/specs/redesign.md`)
builds on it. When this file and the code disagree, fix one of them in the
same change.

Owner: Aglaea, the Product Designer seat (0054). She amends this file; the
code changes only through the FSE's cards; a change to a ruled brand choice
(below) needs Pablo's ruling as a record.

Brand, fixed by Pablo: **dark only**, a warm near-black with a purple cast, one
solid electric purple accent, magenta as a tone, red for blocked. No gradients,
no two-tone buttons, no white cards, no light theme. Manrope for the UI,
JetBrains Mono for data.

## Principles

1. **Structure is felt, not seen.** Spacing and surface steps separate things;
   borders are faint and few; a separator is the last resort (Linear, 2026 refresh).
2. **The content leads.** The rail is dimmer than the page; chrome recedes.
3. **One solid accent action per view.** Everything else is a quiet button.
   The accent marks the action that commits (Rule in its box, Send, Open in
   a confirm, Bring crew up). In a list, each row's verb is a default
   button: twenty accent buttons say nothing about which one matters.
4. **Never colour alone.** Every status carries a word, a shape or a position
   as well as a hue (Atlassian lozenges, WCAG 1.4.1).
5. **Summary before detail.** A card shows its title, next action and two or
   three facts; everything else is on the card back (Linear board).
6. **Data looks like data.** Ids, branches, counts, dates and tokens are mono
   and tabular; prose is Manrope.
7. **No invented values.** A missing date is an empty row or a dot, never a bar
   (Jira timeline); a missing goal says so.

## Colour

### Scales (tier 1: primitives, never used directly by components)

Two 12-step scales derived in OKLCH, stored as hex. Step roles follow Radix
Colors: 1–2 app backgrounds, 3–5 component states, 6–8 borders, 9–10 solid
fills, 11–12 text.

| step | plum (neutral, hue 300) | violet (accent, hue 295) |
|---|---|---|
| 1 | `#120e19` sunken | `#161125` |
| 2 | `#1a1523` **the ground** | `#1e1534` |
| 3 | `#201b2b` surface | `#2f1b55` selected |
| 4 | `#272033` raised | `#3b206c` |
| 5 | `#2e273c` overlay, hover | `#472581` |
| 6 | `#372f46` pressed | `#522d94` |
| 7 | `#463d56` | `#6137ab` |
| 8 | `#5e566e` disabled | `#7442cb` |
| 9 | `#6f677f` | `#8a3ffc` **the accent** |
| 10 | `#958ea2` subtle text | `#7f30ed` accent hover |
| 11 | `#b5afc3` muted text | `#c0abfe` accent text |
| 12 | `#eeebf4` text | `#e9e4fe` |

Plum 10 is lifted off the curve so subtle text passes 4.5:1 on overlays.
Violet 10 is darker than 9 so white stays readable on a hovered button.

### Roles (tier 2: what components use)

| role | token | notes |
|---|---|---|
| surfaces | `--bg-sunken` `--bg` `--surface` `--surface-raised` `--surface-overlay` | lighter as they rise; a shadow never marks elevation alone |
| states | `--surface-hover` `--surface-pressed` `--surface-selected` | selected is a violet tint, not a border |
| text | `--fg` `--fg-muted` `--fg-subtle` `--fg-disabled` `--fg-on-accent` | four steps (table below) |
| borders | `--border-subtle` `--border` `--border-strong` `--border-accent` `--focus-ring` | white at 5/9/16%; accent only for selection and focus |
| accent | `--accent` `--accent-hover` `--accent-muted` `--accent-fg` | fill, hover fill, tint, text |
| status | `--status-{now,blocked,next,done,review}` and `-bg` | hue for marks and text, tint for backgrounds |
| decisions | `--decision-waiting` `--decision-ruled` and `-bg`, `--decision-ruled-fg` | waiting fuchsia and dashed, ruled indigo |
| signals | `--tone` `--live` `--warning` `--danger` `--remote` and `-bg` | magenta tone, mint live, amber warning |

### Contrast (WCAG 2, measured)

| pair | ratio | use |
|---|---|---|
| `--fg` on raised | 13.3 | all primary text |
| `--fg-muted` on raised | 7.4 | secondary text, next actions |
| `--fg-subtle` on overlay | 4.5 | timestamps, meta, placeholders |
| `--fg-disabled` on ground | 2.6 | **never readable text**: disabled and decoration only |
| `--accent` (#8a3ffc) on ground | 3.6 | **fills, focus rings, icons only — never text** |
| `--accent-fg` on ground | 8.9 | accent-coloured text and links |
| white on `--accent` | 5.0 | primary button label |
| white on `--accent-hover` | 5.9 | hovered primary button |
| now / blocked / next on raised | 4.8 / 4.8 / 6.8 | status words |
| waiting / ruled-fg on raised | 6.4 / — | decision words; ruled is a fill (3.3), its word uses `--decision-ruled-fg` |

The waiting/ruled pair passed the dataviz colour-vision validator
(protan ΔE 12.7, normal ΔE 21.8).

## Type

Seven sizes; nothing else. UI text is 13px, reading text 14px.

| token | size / line | for |
|---|---|---|
| `xs` | 11 / 16 | labels, badges — sparingly |
| `sm` | 12 / 16 | meta, mono data, timestamps |
| `md` | 13 / 20 | **UI default**: rows, cards, buttons |
| `lg` | 14 / 20 | reading: card backs, messages, records |
| `xl` | 16 / 22 | section titles |
| `2xl` | 20 / 26 | page titles |
| `3xl` | 24 / 30 | hero numbers |

Weights: 400 prose, 500 controls, 600 titles and emphasis, 700 hero numbers.
Uppercase labels only at `xs` with `--tracking-label`. Manrope's digits are
proportional by default: every count, rank, date, token figure and column of
numbers gets `font-variant-numeric: tabular-nums` (Manrope ships `tnum`; it has
no `zero` or stylistic sets).

## Space, radius, size

- **Space**: a 4px grid — 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48
  (`--space-0-5` … `--space-12`). Siblings are laid out with `gap`, not margins.
- **Radius**: 4 badges and small marks, 6 buttons, inputs, rail and menu items,
  8 cards and object rows, 12 columns, panels and dialogs, full for dots and
  pills. A focus ring adds 2 to the element's radius.
- **Controls**: 24 / 28 (default) / 32 high. Icons 16, chevrons 12, stroke 1.5.
  Every control's target is at least 24×24 px, icon-only ones included (the
  rail toggle, a divider's icon buttons); WCAG 2.5.8.

## Elevation and motion

- Raised: a 1px dark drop. Overlay: a 1px light hairline at 8% **plus** a dark
  drop (Atlassian); dragging adds the accent hairline.
- Hover and press 100ms, panels and the card back 200ms, nothing over 300ms;
  `--ease-out` in, `--ease-exit` out. Under `prefers-reduced-motion` nothing
  moves.

## CSS rules

- **The floor is macOS 12's Safari 15.0** (the app renders in WKWebView). So:
  no `oklch()`, no `color-mix()`, no relative colours, no native nesting, no
  `@layer`, no container queries without a fallback. Every colour is a hex step
  from `tokens.css`; hover and pressed are explicit steps, never derived.
- Components use tier-2 tokens. A tier-3 component token (`--button-bg`) exists
  only where a component diverges. A raw hex or rgba in a component rule is a bug.
- The legacy names at the bottom of `tokens.css` (`--panel`, `--muted`, `--dim`,
  `--r` …) are aliases for migration. New code uses the role names; a component
  touched by the redesign drops its aliases.
- `:focus-visible` is a 2px `--focus-ring` outline, never removed. On an
  element already drawn in the accent (a selected tile or row), the ring sits
  at a 2px offset so it reads as a second edge, not as the same border.

## Components

Each entry: anatomy, states, the rule that makes it good, and the reference it
comes from.

### Button
Height 28, radius 6, `sm`–`md` text at weight 500, icon 16 left. Variants:
**primary** (accent fill, white label — one per view), **default** (raised
surface, faint border), **ghost** (text only, hover fills). Disabled at 45%
opacity for every size and variant, `.tiny-btn` included; the rest of
disabling is under *Disabled actions*. Never a pill, never two-tone.
*Primer, Geist.*

### Badge (lozenge)
`xs` text, weight 600, padding 1×7, radius 4, **no border**; a neutral tint by
default, a status tint with its hue for meaning. Sentence case, one to three
words, truncate past 200px. Mono only for data (machine, branch, thread, card
id). Never the only carrier of meaning. *Atlassian Lozenge.*

### Rail item
Sunken rail, 6px radius item, rank in mono `sm` subtle, name, a status line or
counts in tabular mono. Hover: `--surface`. Selected: `--surface-selected` plus
a 2px accent inset on the left. A dot means "something changed"; a count means
"needs you" — one per signal, never both. Collapses to a strip of ranks.
*Linear sidebar, VS Code activity bar.*

### Board column and card
Column: `--surface`, radius 12, no border, header = status dot + name + count
(tabular). Card: `--surface-raised`, radius 8, faint border, padding 12; title
`md` 600; next action `md` muted, clamped to three lines, prefixed with a tone
arrow; foot of two or three facts (branch, age, agent) in `sm` subtle. **No
coloured side bar**; status is the column. The machine badge appears only when
more than one machine exists or the card is remote. Blocked keeps its own
column (0018); "In review" is a lane for `next: review:…`, not a status. Soft
WIP: a count, never a block. *Linear board, GitHub Projects, Trello badges.*

### Inbox row (Needs me)
One row per thing asked of the human: a **reason** lozenge (decision, question,
card, deaf seat, cell), the subject with one line of context, the age, and
one verb on the row (Rule, Answer, Open, Launch) as a **default** button,
never the accent (principle 3). The accent belongs to the commit inside what
the verb opens: Rule in the rule box. Oldest first. Solved rows stay
reachable. A row whose flow ended replaces its buttons with a one-line record
of the outcome. *Linear Inbox and Triage, GitHub notifications, Slack Block Kit.*

### Timeline (Roadmap, Decisions)
One shared axis component: label column 240, ticks weekly under 90 days else
monthly, today as a 2px accent line with a label and a "today" control.
Bars radius 4; open-ended work runs to today; planned work is dashed; no date
is a dot or an empty row, never an invented bar. Decisions are diamonds:
hollow fuchsia waiting, solid indigo ruled. Every mark has a hover title.
The axis sticks under its section's heading while the rows scroll. **No axis
text is ever cut**: a tick label, a mark's title, the today label or the
undated label that would not fit is moved inside the lane (the today label
flips to the line's other side) or left to its hover title, never clipped
by the label column, the frame or a scrollbar. **Tick** labels that would
overlap skip, one in two, until they do not, and a tick label gives way to
a mark's title. A mark's title (milestone, target) is content and is never
skipped: titles that would collide stagger to the next label row, as
same-day marks already do; only the frame's edge moves one inward. When
three rows of titles are not enough, the axis grows a row rather than
overlap; past three rows, the rest of a crowd fold into "+N" at that date,
listed in its hover and name. Tick labels keep **at least 12 px** between
them. The today line passes **under** title text, never over it. The today
label sits **in the axis**, never at the frame's foot, and at Days and Hours
it carries the date (`today · Sat 3`), so the day is named even when its
tick gives way. The sticky context label names the month (or day) of the
first whole unit in view (leftovers-6).
*Jira timeline, Linear milestones, GitHub roadmap.*

### Stage stepper
Only for three or more stages. Each stage: number and state, title, exit in
one line. States: done (ruled), current (lilac, tinted), planned (outline).
Current is also named in words, and the word is **now** wherever a stage is
drawn (stepper, header, Roadmap rows), never "current" in one place and "now"
in another. A run of stages of one phase takes width by its number of
stages, so a one-stage run never takes half the strip. Every tile and the
folded bar's stage are buttons and look it: `cursor: pointer`, the hover
surface, and a chevron on hover and focus. *Carbon progress indicator.*

### Decision record
Number (mono), title, status lozenge (waiting / ruled / superseded /
withdrawn), owner and age or ruler and date. Expanded: options, the question,
recommendation, ruling in the owner's words, consequences, linked cards and
threads, supersedes chain. Superseded records stay, dimmed, linked forward. Dimmed means the
`--fg-muted` text token, **never opacity**: a row at .7 opacity took its
lozenge to 1.5:1 (leftovers-4). The superseded and withdrawn lozenges are
the **neutral** badge (`--fg-muted` text, 6.7:1): out of the flow, named by
their word, not by a hue. `--done` on its tint is 2.05:1 and is never a
lozenge's text (markdown-and-labels, L9). A record's body never widens its view: code
blocks and tables scroll inside themselves.
*Nygard ADRs, MADR, GitHub Discussions answers.*

### Agent row
State (working with a live dot, idle, exited — the word, not only the dot),
name, card or branch, context bar (amber past 50%, red past 65%), tokens used,
age, and actions: Message (steer) apart from Kill (stop). A finished run shows
its outcome. Capped and deaf are named states with their fix. *GitHub Copilot
agent sessions, Codex tasks, Claude Code statusline.*

### Thread message
Question and answer as bubbles headed by the sender; claim, yield, status and
done as one-line events; replies indented; long bodies clamp with "show all";
the latest decision pinned. Messages addressed to the human are outlined in
red with "→ you". *Slack threads, Linear comments.*

### Stat tile
Only when the number is the point: value `2xl`–`3xl` tabular, label `sm`
muted, at most four in a row, no sparkline without data. *dataviz skill.*

### Empty state
One line of what is missing, one line of how to get it, one action. Errors say
what went wrong and how to fix it; never "there was a problem", never playful.
*Primer Blankslate.*

### Disabled actions
An action is unavailable for one of four reasons, and each has one treatment.
Look is the same for all: the control at 45% opacity, `cursor: default`,
same variant and colour as when enabled (a disabled primary stays a primary
shape; it never turns grey or changes hue).

| why | treatment | examples |
|---|---|---|
| **busy**: the action is running | disabled, its label becomes the gerund with an ellipsis ("Opening…", "Ruling…"); nothing else | Open, Rule, Save |
| **incomplete**: the form lacks what the action needs | submit disabled; the fields say what they need in their labels or placeholders. No reason text: the missing input is in view | Rule until an option and words; Send until a body |
| **blocked**: something outside the form stops it (a file, a record, a token, a precondition) | disabled, and **the reason as visible text** beside or under the control, `sm` `--fg-muted`: what is missing, and who or what fixes it ("no agents/people.md; the FSE's intake writes it"). Linked with `aria-describedby` to the control. **Never only a hover**: a disabled button takes no focus and no WebKit mouse events, so a title reaches nobody but a guessing mouse | Draft the cell, Bring crew up, the + for a new thread without a token |
| **never here**: the action cannot apply in this context at all | not drawn. The context says why once, not per control ("archived: read-only" in the header) | archived initiatives (0042) |

A blocked action that the human can fix in the app names that place ("waits
on 0001 the-cell-roster" as a link). A reason that goes stale (the world
changed) is refreshed on the next scan, not on click. A blocked reason is
said **once per view**, nearest the action it blocks; the other controls it
blocks point there or are not drawn. Never a raw error, a path or the danger
role for it: danger is for something that failed, not for something missing.
*WCAG 1.3.1, 2.1.1, 4.1.2.*

### Focus and names
Where the keyboard goes decides whether a keyboard or screen-reader user
keeps their place.

- **Opening inline** (a box, a confirm): focus moves into it. A box that
  shows a record puts focus on its title, with the body tied to the box by
  `aria-describedby`; a confirm puts focus on its commit.
- **Closing** (Cancel, Escape, the commit done): focus returns to the control
  that opened it, or to what replaced it. Escape closes every inline box and
  confirm, **the topmost one only**: Escape on Help or a card drawer over an
  open rule box closes the drawer, and the box stays with what was typed
  (leftovers-5).
- **Navigating** (a row verb, a link to a record): focus lands on the thing
  named: the record's row, the blocked seat, Bring crew up. Never on the
  page body.
- **A control that unmounts on press** hands focus to what took its place.
- **A control that disables itself on press** moves focus first, then
  disables, so WebKit keeps the focus ring on the new target (leftovers-4).
- **Names**: a verb repeated on every row carries its row in its accessible
  name ("Rule init-a 0002", "Open onboarding-flow Step map"), through
  `aria-label` or `aria-describedby` on the row's subject.
- **Disclosure state**: a control that opens something stays marked while it
  is open (`aria-expanded` or `aria-pressed`, and `--surface-selected`), the
  same way everywhere. Hover never takes the mark away. A box never covers
  its own opener: where it cannot fit beside or below it, it opens below the
  opener's row (leftovers-5).
- **The ring is for the keyboard**: after a pointer landing, the target shows
  its selected state, and the focus ring shows only under `:focus-visible`,
  as the engine decides (leftovers-5, hf3-U2).
- **An open box keeps the keyboard** (a rule box, a sheet, a dialog): Tab
  and Shift+Tab loop inside it until Escape, Cancel or its commit closes
  it. One box at a time; a box that covers content has a scrim. What was
  typed in a box survives it closing for another one, and only Cancel
  discards it.

- **Checked in WKWebView**, the app's engine, not only Chromium. In
  WKWebView, macOS's Keyboard navigation setting (System Settings ›
  Keyboard) decides whether Tab reaches buttons; it is off by default. A
  keyboard gate row says which setting it ran under (leftovers-4).

*WCAG 2.4.3, 2.4.4, 2.4.6, 2.4.7, 3.2.1.*

### Widths
Deltagos is used on a 14-inch laptop (1512 wide at full screen, down to the
window's 1024×640 minimum) and on a 3440×1440 ultrawide (0059). Three
classes, set by the **window** width. What gives way comes back as soon as
the row has room for it again: a class hides a column because it does not
fit, never because of the class name alone.

| class | window | layout rules |
|---|---|---|
| **compact** | < 1440 | the rail starts as the strip (the lead's own choice wins and is remembered); rows are one line, and what gives way goes into the row's detail, hover and accessible name, never away; the goal column stays while it can show about 30 characters; a box over content is a sheet with a scrim, capped at the window |
| **regular** | 1440–2199 | the rail expanded; content capped at 1,480 px; a box over other rows' controls has a scrim over them |
| **wide** | ≥ 2200 | two regions where a screen has a list and a queue (Home: the list, then Needs me on the right, in its own scroll); text held to about 90 characters a line; nothing stretches past about 2,200 px; content left-aligned from the rail (0062), so nothing moves when the window is resized |

In **every** class, signals never wrap: one line and a "+N", the rest in the
hover and the accessible name. A lozenge that cannot fit is cut with an
ellipsis on its text, never clipped mid-word by its cell. Wide starts at
2200, not 1920: at 1920 with the rail expanded the list keeps about 1,150 px
beside Needs me and goals fall to 22 characters (responsive-home-2, R1).
Wide's start is **measured on the row, not fixed**: a window of 2200 or more
is wide only while the list beside Needs me keeps about 70 characters of
goal; with the rail expanded that may be later (leftovers-3, W1). The 2200
is the floor.

**What gives way first.** A column that is empty on every row (all "—")
gives way before any column with content. Signals fold into "+N" from the
least urgent: waits on you, blocked and waiting stay in view; problems, now
and live fold first, in that order (live, now, problems), and the cell's state folds last of the foldable ones
(it is not in the never-fold set; a cell that waits on him is already a
Needs me row) (leftovers-3, W2; home-widths-4, 0076). Whether something
folds is decided against what stays **at its floor** (waiting with its
names cut), not at its natural width, so the cell shows wherever it fits
beside a cut waiting (leftovers-5).

**A region that scrolls inside a view shows it does**: each edge with
content hidden past it carries a 1 px `--fg-subtle` line (4.5:1, not
`--border-strong`, which measured 1.6:1, leftovers-5), gone when nothing
is hidden past that edge. A code block or table that scrolls
inside a body carries the same edge (leftovers-6). Overlay scrollbars on macOS do not count, since they
hide until scrolled (leftovers-3, U1).

**The document never scrolls**; only a view's own scroller does. Anything
positioned, visually hidden text included, sits inside a positioned
ancestor within its scroller, so it cannot stretch the page (leftovers-5,
hw4-U8: five `sr-only` spans let the whole app scroll away in WKWebView).
**Measure with classic scrollbars too**: with a mouse attached, or System
Settings › Appearance › Show scroll bars: Always, WKWebView draws ~15 px
bars that overlay scrollbars do not take. A width gate passes with both.

Every screen is checked at 1024×640, 1512×945, 1920×1080 and 3440×1440.
These are **window** sizes. The built app's content is the window less its
title bar (about 31–33 px: 1024×640 gives 609 of content), and Chromium's
viewport is content. A gate row says which one it means, and the rail's
state (expanded or strip), which is remembered per machine and changes
every width below it (leftovers-4). Tab order
follows priority, not position: in wide, Needs me before the list.
*responsive-home, amendment 1.*

## Anti-patterns

Coloured side bars on rounded cards; pill buttons; outlined badges in a
different colour each; accent-coloured small text; descriptions on cards;
colour-only status; hard WIP blocking; invented dates; a stepper for fewer
than three steps; stale buttons on a resolved message; gradients of any kind;
an accent button on every row of a list; a disabled control whose reason is
only in a hover; a disabled look that differs by button size.

## Sources

Radix Colors (scale roles, mauve and purple dark); Linear, "How we redesigned
the Linear UI" and the 2026 refresh; Vercel Geist colours and materials; GitHub
Primer primitives and sizes; Atlassian Design System (tokens, elevation, radius,
motion, lozenge, typography, spacing); Carbon progress indicator; Primer
Blankslate; Linear docs (board, inbox, triage, timeline, milestones, updates);
GitHub Projects board and roadmap; Jira timeline; Trello badges; Slack Block
Kit; GitHub Copilot agent sessions; Codex cloud; Claude Code statusline; Nygard
and MADR; Evil Martians, "OKLCH in CSS"; caniuse (Safari support); APCA;
DTCG format 2025.10.
