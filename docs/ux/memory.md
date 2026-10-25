# What Aglaea knows about the organizer

Consulted by the FSE, supervisors and my next session before asking me. Each
line carries its source. Updated at the end of every session.

## The user and the job

- One user today: Pablo, "the developer leading the factory", handling up to
  20 initiatives, "around 4 to 6 in parallel … the other is secuentials"
  (`agents/people.md`, intake 2026-09-26).
- The app's job: tell him, per initiative, what it is for, where it stands,
  what waits on him and who is building what, "so that he opens the
  organizer instead of asking a session 'where was I'" (`docs/specs/redesign.md`,
  Problem; 0013).
- Second job: a developer new to the factory learns the flow and diagnoses
  the mailbox from the app; "Intuitiveness is a first here due we don't have
  too much time for introducing a dev in the work" (`agents/people.md`; 0029;
  `docs/specs/machine-explains-itself.md`).
- Business people do not log in yet (0038 scope out; stage 6, identity).
- Pablo works on two screens (0059, "1024 is real"; his words: "I have a
  wide monitor buy I also work at the laptop screen 14 inches"): a 3440×1440
  ultrawide (this machine's main display) and a 14-inch laptop (1512×982 by
  default, 1024 when something sits beside the app). Design spec
  `specs/responsive-home.md` (proposed): compact < 1440 (amendment 1; built as < 1280), regular, wide ≥ 1920;
  now the design system's Widths section.
- Context: a desktop app (Wails, WKWebView, Safari 15.0 floor), window
  1440×900 by default, **minimum 1024×640** (`main.go:36-39`). 400 px does not
  occur.

## Ruled design choices (do not reopen; raise findings against them)

- **The app is Deltagos** (0066): what a person sees and `Deltagos.app`. The
  initiative, the CLI (`organizer …`), repos and identifiers stay organizer.
  Product-name text in my docs says Deltagos; dated reviews stay as written.

- Dark only, one accent, magenta tone, red for blocked; no gradients, no
  light theme (CLAUDE.md, visual direction; `docs/design-system.md`).
- Initiative-first navigation: Home + one initiative with six sub-views
  (0013, redesign FR-14). The rail stays; never chips (CLAUDE.md).
- Blocked stays a column (0018). Mockups first, made by the session that
  reviewed the UI (0016, 0017).
- Tokens, not dollars, in the app (0020). Stages carry an appetite, never an
  invented date (0022).
- Needs me is the lead's queue only (0034); four Home states, first match:
  waits on you, executing, waits on business, quiet (twenty-at-a-glance FR-6;
  0035: any live agent on a card is executing).
- Non-active initiatives fold into one collapsed rail group and open
  read-only (0036, 0042).
- Header clamps goal and measure to two lines with "more"; body scrolls
  under a fixed header (0038).
- The Help is `how-we-build.md` rendered, never copied (0031).
- Anyone may rule a proposed record; the ruling notes who (0045).
- A cell accepted but never launched is a Launch row in Needs me, not a
  fifth state (0051).
- Aglaea sits beside the FSE, not in the cell (0053).
- **I own `docs/design-system.md` on the organizer** (0054, Pablo: "in this
  initative, as it's our new product, she owns"). The code changes only
  through the FSE's cards; a ruled brand choice still needs Pablo's record.
- Design system, amended by me 2026-09-29: principle 3 means the committing
  action; a list's row verbs are default buttons, never accent (F9). Disabled
  actions have four reasons (busy, incomplete, blocked, never here), one
  treatment each; a blocked reason is visible text, never hover only, said
  once per view, never raw errors or the danger role. Focus and names
  (2026-09-29, triage): focus into what opens, back on close, onto what a
  navigation names; row verbs carry their row in the accessible name;
  disclosure state marked the same everywhere.

## Open findings not yet carded

From `reviews/2026-09-29-first-look.md` (all `heuristic`):

- F1 (3) at 1024 wide, Home's name column truncates to 4–5 characters.
- F2 (3) the Rule box in Needs me shows option ids only, no question or
  recommendation.
- F3 (2) "quiet" beside "1 blocked" or "1 waiting" on the same Home row.
- F4–F9 (1–2) agent state words differ by view; rail counts unlabeled;
  Conversations' no-cell empty state has no action; disabled primary at 60%
  not 45%; stale words ("Slack", "Datastore"); accent button per Needs me row
  vs principle 3.

From `reviews/2026-09-29-cell-screens.md` (stage 5, for the FSE's thread
01M3PVQZ7JS5F40030Z09M2NMS):

- C1 (3) the Launch row promises a launch the cell cannot make (missing
  persona file) and only navigates.
- C2 (3) Bring crew up's disabled reason is hover only (FR-6 as written;
  spec gap). Pattern to keep: a disabled action shows its reason as text
  beside it, as Draft the cell does.
- C3 (3, from code) Draft the cell re-enables after Open: a second drafting
  session is one click away.
- C4 (2) the loading, opened and error states of Draft the cell (table in the
  review).
- C5–C10 (1–2): record link opens nothing; roster accepted blind (= F2);
  stale Needs me subtitle; disabled at .6 (= F7); small collapsed mark;
  "Retire…" on a never-run cell.
- Where they went (FSE, thread 01M3PW6Z2H9YV25E6GQG7CJWVE): F1, F2+C6,
  C1–C5, C7, C8/F7 are in `docs/specs/lead-side-fixes.md` (proposed, 0055),
  cards `home-rule-and-rows` and `cell-screens-fix`, both `ui_review: true`
  (my ui-review reviewer runs in that wave). F3 is record 0056. F9 and one
  pattern for disabled actions wait on 0054. F4–F6, F8, C9, C10 not carried
  for now.
- The design-system code items (F9 row verbs, the + hover-only reason,
  aria-describedby, Write about with no seat) are lead-side-fixes amendment 2
  (FR-11, FR-12, G9), card `conform-and-waiting`, `ui_review: true`, after
  sup18's two cards; record 0057 asks Pablo.

Triage of the three UI reviews' leftovers (2026-09-29,
`reviews/2026-09-29-triage-ui-leftovers.md`): 14 rows, 2 need Pablo (Home's
reading width at 1024; "you" or his name), fixture gaps V1–V3 (no thread
asks the human, so Answer was never seen).

Initiative header (2026-09-29, `specs/initiative-header.md`, proposed, from
header-review-2 and ui-leftovers UI1): the header is 378 px at every width
(59% of 1024×640; Answer landed on an 8 px timeline). Design: folded to one
line by default, remembered per machine, a landing folds it; chip goes to the
first waiting record; strip labelled "Roadmap · stage N of M"; phase once per
run; a tile opens its stage expanded on Roadmap; sub-views stop repeating the
id. Editing goal/scope in app: options a/b/c for Pablo, I recommend a (file
only, shown honestly with an "edited, not committed" mark).

responsive-home-2 (merged d5abf1f) left, not carded, to rank with the
header-fold leftovers when that lands (FSE, thread 01M3RCXDRAHWDQSD34QPZ97Y3X;
details in `working-on/done/responsive-home-2.md` ## UI review and
`runs/2026-09-30-responsive-home-2.md`):
- R1 (2) wide at 1920 with the rail open: goals cut ~22 chars, first signal
  clipped mid-name ("goals whole" was gated only at 3440).
- R2 1280–1439 compact hides goals with ~480 px empty.
- R3 at 1440 regular, signals wrap again.
- R4 the regular rule box covers other rows' verbs.
- R5 the rail toggle is 20 px (WCAG 2.5.8 wants 24).

Ranked 2026-09-30 (`reviews/2026-09-30-rank-header-fold-responsive-2.md`):
header-fold hf-U1–U10 and responsive-home-2 R1–R5 into 15 rows + 1 fixture
gap; none needs Pablo. Widths amended: wide from 2200 (was 1920), signals
never wrap in any class, a column gives way only when it doesn't fit, scrim
in regular; 24 px targets; focus ring offset on accent; stage word "now".

Time zoom on every Gantt-style axis (Cards, Stages, Decisions; not Calendar) (2026-10-03, `specs/roadmap-time-zoom.md`, proposed, for
the FSE, thread 01M416RZH3E5VPJC9D5H8PK73F; Pablo: "month … days and then to
hours with mins"; widened: "each graph that implicates time as gantt style"): Fit (as built) → Days (40 px/day) → Hours (64 px/h,
quarter-hour grid); − level + Today Fit; pinch/⌘-wheel/keys/double-click
one level each, pointer-anchored; Hours only where a mark has a time; day-precision dates fill their whole day;
edge pointers for marks out of view; level not remembered. **0070**: commit
times (`%cI`) in the same card; no timestamp → no Hours (Pablo: "component
shall detect it and avoid showing hours"). Card after header-fold-2.

Decisions view (2026-10-03, review `reviews/2026-10-03-decisions-view.md`
D1–D7, spec `specs/decisions-view.md` proposed, thread
01M417NHHRR2WP7XPY69XM438N). Pablo: the operator "spend mayor time in this
view". D1 (4): every record is listed twice (Timeline + Ruled), ≈ 6,500 px.
D2 (3): the tiles and the median (always 0d) answer nothing. D3 (3): there is
no way to find a ruling. Design: a find field; a summary line of words; To
rule / Ruled / Timeline as sticky 16 px disclosure headings remembered per
machine; Timeline last and closed; Ruled shows the newest ten; one-line
Timeline rows. O1 for Pablo: confirm the four jobs.

Leftovers-3 (2026-10-03, `reviews/2026-10-03-rank-leftovers-3.md`, thread
01M41B2BRFY6W55KSBC307ZWY5): sup25's U1–U3 and W1–W5 plus gaps, 11 rows and
5 gate/fixture rows, none needs Pablo. decisions-view absorbs U2 (sticky
record head under the sticky section heading; 0069's note meant "stays") and
U3 as its Amendment 1 (B12–B14). DS Widths amended: wide measured on the row
(2200 floor); an all-empty column gives way first; signals fold least urgent
first; a scrolling region shows its edge.

time-zoom merged 2c0292f (shared `TimeZoom.tsx`, `lib/axis.ts`). Its
leftovers ranked as roadmap-time-zoom Amendment 1 (2026-10-03, thread
01M41BMCN93DZYWK5SZFNEBEVM): the control always rendered (focus to the
opposite button), a bordered band with a pinned dot, pointer reveal shows the
whole mark, A8 wins over the window rule, the builder's note words accepted,
times after a timed bar at Hours, A15–A23.

Leftovers-4 (2026-10-03, `reviews/2026-10-03-rank-leftovers-4.md`, thread
01M41EBN13XE2GAPG9M7R2T5BW): 16 rows from decisions-view and time-zoom-2.
Design calls: a find opens every section with a hit while it is on; a landing
opens for the visit only; "Nothing ruled yet."; the Timeline count names its
hidden. DS amended: gate sizes are window sizes (the built app's content is
~32 px shorter) plus the rail state; disable-on-press moves focus first;
keyboard checked in WKWebView with the Keyboard navigation setting named; no
axis text cut and the axis sticks; dimmed means a token, never opacity; a
body never widens its view.

Leftovers-5 (2026-10-03, `reviews/2026-10-03-rank-leftovers-5.md`, thread
01M41YCPTBFVQDFS9CQW76DQ14): 15 rows from header-fold-3 and home-widths-4.
Top: the document scrolls away in WKWebView (sr-only spans out of their
scroller; the outer bar costs ~15 px and likely causes the 1280 goal drop
and the one-letter signals). DS amended: the document never scrolls; classic
scrollbars in gates; fold order live, now, problems, cell; fold against
floors; scroll edge in --fg-subtle; Escape closes the topmost box only;
hover keeps the selected mark; a box never covers its opener; the ring is
for the keyboard. 0076 (ruled): the cell folds last.

Leftovers-6 (2026-10-03, `reviews/2026-10-03-rank-leftovers-6.md`, thread
01M4234H29HX9P9J0WJFQYYA9F): 13 rows from zoom-decisions-polish and
markdown-and-labels. Top: Days does not name today; ruling with Ruled closed
drops focus; "Show the other" leaves focus out of view. DS Timeline amended:
title rows grow then "+N"; 12 px tick gap; today line under titles; today
label in the axis with its date; context label = first whole unit. Superseded
and withdrawn lozenges are neutral (59b4dcb).

Leftovers-7 (2026-10-04, `reviews/2026-10-04-rank-leftovers-7.md`, thread
01M43Q8CBZ9HX2JD0K2A1QWRCR): 10 rows from rule-box-and-stages, home-signals-5
and review-build. Top: the card back paints under the rule box (sev 3,
pre-existing). DS: one layer order from z-index tokens; closing the top of a
stack puts focus back into the box below; the scrim stops below the top bar
(3424695); within the never-fold set, waiting gives way before blocked
(857949c). Reviews now run in `Deltagos Review.app` (own bundle id).

Leftovers-8 (2026-10-04, `reviews/2026-10-04-rank-leftovers-8.md`, thread
01M43Z4MM70GV0TH1NAJC2D28A): 7 rows from layers-focus-and-words plus my
A1–A3 (80ab772). DS Principles amended: dates read as words wherever a
person reads them; the lead's words are kept verbatim (no autocorrect in
WKWebView).

Transversal roles (2026-10-04, `specs/transversal-roles.md`, proposed, thread
01M4432DTFCSXJN9F715G84FYS; 0082). A Roles section on Home between Needs me
and the initiatives, and a Roles group at the top of the rail. Rows show
live and context, the HAND-OFF's date and first line, messages waiting, and
the initiatives touched. A drawer holds the detail. Show only. Talos and
Hermione are one muted line. Roles are configured, not hard-coded; O1 asks
about Daedalus.

Floating icon (2026-10-05, `specs/floating-icon.md`, proposed, thread
01M46K870W9YST0YV90F1S8GSE; 0088): a 56 px app-mark icon whose three bars
breathe (Core Animation, decorative, still under Reduce motion); a two-layer
shadow and a lift on hover and drag; its place remembered per display; a
360 px list panel with search, a Home row, and the rail's order with signals;
a top-bar `Compact to icon`. O1: should the icon show Needs me's count?

Roadmap as a plan (2026-10-06, `specs/roadmap-as-a-plan.md`, proposed, thread
01M48N0AYS5SC7N243336DDARW; 0093): an outline over the shared axis (stage →
wave → one Rounds row of segments + cards); decisions are diamonds on the
stage row (raised hollow, ruled solid, joined by a line); a failed round is
the only magenta outline with a `✕`; the switch steps are Current stage /
All stages / + Waves / + Rounds and cards, opening on 1; zoom and step are
independent; `Outside any stage` row if 0094 is not accepted.

Usage (2026-10-06, `specs/usage.md`, proposed, thread
01M492E4X6K04P266W8BVYAKCZ; 0098): a top-level Usage view (a quiet top-bar
text button, no badge); a week picker; three tiles (money with its change in
words, tokens with the four kinds as words, sessions); one chart (money per
week, one hue); one table with four cuts (initiative, role, task, model) and
`Not attributed` always last; a Sessions list. Money only in Usage, tokens
elsewhere (0020 narrowed by 0098).

The Deltagos mark (2026-10-09, floating-icon Amendment 4; drawing at
`docs/ux/inputs/deltagos-mark/deltagos-mark-drawn.html`). Pablo's D with
travelling gaps and two gears, recoloured: the D in the accent, the big gear
magenta, the small gear periwinkle (option A; B is plum, C his ember and
amber, for him to rule). Cuts: 32 px is the D and gears, still; 16 px is
the D alone. No splash; the app icon is the still frame. Natively, the
gears turn and the gaps travel at constant speed (the points and notches
need per-frame work).

Memory on this Mac (2026-10-09, `specs/ram-indicator.md`, proposed, thread
01M4CK6VQ11WY8YJW9YWQ4C63T; 0101). The OS's pressure levels, worded normal,
high and critical, in magenta and never red. In the top bar, `▣ 12 GB free`
in subtle text, high in magenta, critical as a chip; a click popover with
the five biggest sessions (process trees) and `Agents ›`. On the icon, a
ring at high, breathing at critical. One notification per entry into
critical (10 min out of critical, 30 min floor); clicking it opens the
popover. It never stops a session.
The FSE took it as written (dd657fd, cards ram-sample then ram-view,
`ui_review`). Per-session memory is the footprint summed over the process
tree. O2 (magenta, not red) is in accept record 0103 for Pablo.
0102 ruled A (magenta and periwinkle gears); 0103 accepted as written.

Initiatives, awake and asleep (2026-10-09, `specs/initiatives-view.md`,
proposed, thread 01M4GK4QY61MGNM1SWN8FV876Q; 0104 A). A top-level view
(`Initiatives` left of Usage, no number), cards in Awake, Asleep, then a
closed Archived fold, in the rail's order. The head reads `n of 4 awake`,
neutral, with `the limit` at four and magenta over it. Sleep confirms in
place when anything is live or waiting; Wake asks nothing and is
aria-disabled at four, naming the four awake. Deltagos never passes
`--force`. The factory's own words are shown verbatim on failure, then what
is true. The rail's `Not active` splits into `Asleep (n)` and `Archived (n)`:
archived ones are not asleep, and the factory refuses them. Agents rows get
a Memory column that never folds. Words: awake/asleep replace active/paused
on screen.
The FSE took it as written (build spec docs/specs/initiatives-view.md,
accept 0106). The asleep-since date is read from the status comment; frozen
sessions are read from probe's frozen dir; archived apart needs no ruling.
2026-10-10, Amendment 1 (b3295f2): the strip's folds are a moon and a box over
their counts; FloatList splits Asleep and Archived as the rail does; an
empty Memory cell has three words only: not running, could not be read,
reading…. An inline confirm is part of the page and does not hold the
keyboard (design-system rule).
Amendment 2 (9b9f8e6): the whole card opens its initiative (stretched link);
Details = charter (header's fields) + workspace (Home's InitiativeDetail),
in place across the row. The top bar is grouped by kind: brand, places
(Home, Initiatives, Usage as tabs) and the crumb, then the Mac's state,
your work (Needs me, Rescan), the app (Compact, Help, Settings); no sync
line with auth off.
ram-view's review: white on --tone at 13 px is 3.5:1. The chip text became
--fg-on-tone (the ground's ink, 5.2:1), a design-system row (229506e). The
memory button sits after Usage, before Help, as built (b23bf10).

Input, not now (Pablo, 2026-10-09, via the FSE, thread
01M4HB027RH19CF9627T1F1PXP): "the border pink brilliant arround the icon
helped me a lot to find the app quickly ... keeping it and maybe using an
orange tone when ram spikes up". The ring doubles as a findability aid. A
later design note: a ring always (the tone, quiet), with memory pressure
moved to a second hue. Orange is close to `--amber-9` (#ffb020), already
the warning hue (context past 50%), so pressure would join warning, not
take a new colour; red stays blocked's. Measure the ring against
wallpapers, and keep the word in the icon's name. Write it when asked.
Written the same evening as ram-indicator Amendment 2 (7bb03f4): the tone
ring always on, amber at high and critical everywhere, a 1 px ground keyline.
The app icon is exported (floating-icon Amendment 5, `inputs/deltagos-mark/
app-icon/`, export.sh regenerates it); a builder copies, never redraws.

## Open questions

- Map and roadmap (2026-10-18, asked Pablo in a question with options): Map as a Roadmap mode, who writes `touches:`, is a place link enough on odyssey.
- (Answered: Q1, Tab. 0117, "I use Tab, make links reachable app-wide next".)

## How I look at it

- A native panel (the floating icon) in `Deltagos Review.app` from a
  detached worktree: `osascript` System Events, `AXPress` on the icon's
  button, `keystroke`, window sizes from `every window`, then
  `screencapture -R` into /tmp. CGEvent clicks from `swift` did nothing here.
  Clean up in the same shell: `$FIXTURE_AGENT_PIDS` does not survive
  between Bash calls, so end with `pkill -f <fixture dir>` and remove it.

- `eval "$(scripts/fixture-home.sh --twenty)"` (twenty initiatives) or
  without `--twenty` (init-a … and the cell fixtures), then
  `wails dev -devserver localhost:34115`; drive with chrome-devtools in an
  isolated context (Playwright's browser may be held by another session).
  `wails dev` flips the mode of `frontend/wailsjs/runtime/*`; restore with
  `git checkout -- frontend/wailsjs/runtime` after, never commit it.

## Studies and lessons

- **A design-shaped fail should come to me first.** home-widths-4's G19 went
  back to the builder twice ("never fold") before reaching me; one line
  settled it (0076).

- **Chromium is not the app.** WKWebView found the wave's only sev 3
  (the rule box spilling at 1024×640, because the content is 609 px and a
  code block added a scrollbar) and the focus ring lost on a disabling
  button. Ask for WKWebView shots on every UI review.

- **A control that hides or disables itself must say where focus goes.**
  time-zoom's Fit unmounted on press and dropped focus (U1). Say it in the
  spec whenever a button can disable itself.

- **Check the data's precision before designing a scale.** Pablo asked for
  hours and minutes; nothing the Gantt draws has a time of day.

- Pressing an action that starts a real session (Draft the cell's Open,
  Bring crew up) is out of a review's reach; read the code path and say so.

- **Hand a builder files, not a drawing.** A page that animates the mark
  is not an icon: an export script with the cuts, slots and grid is what
  ends the guessing.
- **Icon Composer's renderer drops SVG masks.** Layers of a `.icon` are
  rasterised PNGs (rsvg), and the first group in `icon.json` is the top.
  Check a `.icon` by compiling it with actool into a throwaway bundle and
  drawing it with IconServices (`.wt-notes/dm-build/iconservices.swift`).
- **A byte-for-byte gate must name its authority.** iconutil re-encodes
  the 16 and 32 px slots (ARGB), so an icns never decodes back to its
  iconset exactly. Gate the shipped file, not the inputs.
- **Measure every fill's text before naming it.** I wrote "white text" on
  the magenta tone without measuring; it is 3.5:1. Any new fill gets its ink
  measured and a contrast row in the design system in the same commit.
- **A count needs its noun.** "3 waiting" failed header-fold's blind reader;
  0068 made it "3 decisions waiting". Shortening a label past its noun saves
  width and costs meaning.
- **Measure every width you name.** In responsive-home I set regular at 1280
  and called it "as built" without measuring below 1440; the UI review found
  a cliff at 1280 (U3). My A8 also asked all twenty rows in one 1024
  screenshot, against my own A1 (0065 fixed it). Check the acceptance rows
  against each other before sending.

- 2026-10-10, initiatives-view A3 (237db96): a crumb placed right after a
  tab row reads as the last tab's child, so a slashless title with a gap is
  safer than a crumb; give every screen one `aria-current`, and name the
  owning place for screens reached from many doors (an initiative belongs to
  Initiatives; Settings and Help to none). A width gate must name its auth
  mode: firebase adds ~440 px to the bar. A shared component takes `omit`
  rather than a second field set (a fact once per screen).

- 2026-10-10: my firebase folds were estimated, not measured, and fell 42 px short in WebKit; a fold list needs a measured bar, worst case (long id, long email, two-digit badge, stale), before it is handed over.

- 2026-10-11, A4: before leaning on "its heading names it", check the screen has one (Settings had none). An overlay is not a page: its opener is expanded, not current. Chrome buttons stay ghost; let a coloured word carry urgency instead of an accent fill.

- 2026-10-11, A5: two states drawn the same (current and open) read as one; give each its own channel (a line for current, a surface for open). When a spec names a link inside a composite, say how big the hit area is, or the builder makes the whole thing the button (the rail hero).

- 2026-10-11, A6: a summary block that doubles as a button gets a name made of its numbers; when another control already does the job (the Home tab), make the summary inert rather than splitting it. WKWebView's plain Tab skips links (Safari's default), so focus-only affordances on links reach almost no one until Pablo's Q1 is answered.

- 2026-10-11, tab-reaches-links: before designing markup workarounds for a WebKit default, check whether the shell exposes the preference (Wails v2.15 has `Mac.Preferences.TabFocusesLinks`). Pablo uses Tab (0117), so keyboard paths are real, not hypothetical.

- 2026-10-13, tab-reaches-links A1: with macOS Keyboard navigation off, WKWebView skips buttons too, not only links; verify a platform premise in the built app before writing it as the problem. A roving set is cheap to extend (strip, roles); a composite head with four controls wants a menu.

- 2026-10-13, tab A2: writing an `aria-label` form for a rich row silently dropped facts the row draws; give names as verb + subject and route the rest through describedby. Specify outcomes (ring clears the neighbour by 2 px), not means (2 px padding). Walk order = drawn order, always.

- 2026-10-13, tab A3: once Tab is the lead's path, a scroll region without links is a dead end; make it a stop while it overflows. Spoken descriptions need nouns per value; words come from the one table the screen uses.

- 2026-10-13: a blanket ARIA role in a rule can overwrite native ones (listbox, table); write "a role only where there is none".

- 2026-10-14, launch-progress: a long blocking action needs a visible state per item in place of the button, a live region per result (not per tick), a counter instead of a spinner (2.2.2), a stop, and a Needs me row for a failure the lead walked away from.

- 2026-10-14, task-rows: late is not stuck; keep red for blocked and rank lateness with amber or tone. Put the fact before the title in any one-line row that ellipsizes. A verb must land on the thing named, or change verb.
- A view-kept scroll (nearest) needs a scroll-margin, or the ring is clipped at the edge; an element that closes itself hands focus to the control that opened it, only if focus was inside (launch-progress A3).
- A button whose press can no longer act is removed, not left as a silent press; when a backend change makes a label a no-op (Reattach all after lf30-launch-go), re-check every focus target that named it (launch-progress A4).
- Every focus target needs a fallback chain ending on a control that always exists; a polled view must let a press's fresher answer override the stale feed; live regions clear before repeating (launch-progress A5).
- Live-region re-say: 100 ms setTimeout, never rAF (hidden windows skip it). An optimistic row reads the state the press reported, and the press should return what the row needs (session name) so it is usable at once (launch-progress A6).
- Before saying 'as X does', read the code's word for X (stateWord: alive-not-working is idle). A pressed control stays focusable while busy (aria-disabled). Focus first, then polite words (launch-progress A7).
- Opacity on an element dims its outline too: any rule that lets a dimmed control hold focus must say the ring stays full strength (launch-progress A8).
- A contrast fault found on one control: measure the same pair on every surface before answering. The accent ring failed on overlay/pressed/selected app-wide; the ring is violet-11 now (launch-progress A9).
- Re-sweep Gantt tick labels when the font or its size changes: tickLabelExtent estimates width by character count (time-zoom-2, dropped from leftovers-35 on 0 cuts). A sent message whose thread lags the feed reads 'Sent', never failed, after two feeds (U5).
- Check a record's 'today it shows X' against the code before designing: 0134 said others' records read like the lead's on Needs me; ownedByLead keeps them off. Others' long waits get a 'Waiting on others' group outside the badge, verb Open (needs-me-waits).
- Map and roadmap (note, 2026-10-15): the base map is drawn once and every lens (stage, spec, record option, node) only recolours it; layout never changes, or place is lost. Map is a Roadmap mode; specs and records open in a drawer over it. Amber is not 'current' (map-and-roadmap.md).
- Before placing a fact in a row, list the row's existing columns: needs-me-waits put the age in a lozenge beside an age column (said twice) and displaced the kind lozenge. Kind stays in the reason column; emphasis goes on the existing column (A1).
- Diagrams in the app (2026-10-15): dark-mapped change classes (glyph and shape constant across themes, hue may differ; removed is not red), SVG cached by block hash in the organizer's data dir, never committed; source shown with a reason when not drawn; a text line of the classes under every figure; specs read in a drawer (diagrams-in-app.md). Measured on --surface: lilac 5.1, amber 9.2, plum-10 5.3.
- An accessible name with a suffix is one aria-label string, never a visible text plus an sr-only span (VoiceOver joins runs with a space: 'map , start here'). A fixed verb column must fit every label a row can draw, compound ones too ('Rule · draft').
- Review view (2026-10-17): a worklist, not a graph (75 nodes / 91 edges for a 6-file change; a graph has no order, no 'next', relays out); the 1-hop neighbourhood is two lists; no React Flow, ELK or Monaco; flags as words ('no direct test'); claims in a quote block apart from facts; a partial map says it is partial (review-view.md).
- Magenta (--tone) as text passes on the ground only (5.2:1); on selected/current rows it fails (4.31). Colour the glyph, set the word in --fg-muted (review-view A5).

- A press that the service refuses re-reads the state before it words anything: if the refusal means the action can no longer work, the button goes and the screen shows the same state as one that never could (focus to the nearest heading); if it may work again, the button stays and the reason shows under it in the blocked-reason style. Never a raw `Error:` prefix, never red for a non-block (review-view A7).
- "Open at the line" means the definition, not its doc comment: the label keeps the full range, the jump skips the leading comment block (review-view A7).

- A form's Save is drawn only while something differs from what is saved; a lone disabled Save is noise (review-view A8).
- `aria-current="page"` is the screen's place, one per screen; the current item of a list inside it is `aria-current="true"`, one per list (design system, review-view A8). The end of the Tab order reaching body is not a dropped focus.

- A sent message is a fact, not form state: a Save keeps the ask and its thread; only a new ask replaces them (review-view A9).
- A button that cannot act is not drawn; when the reason is not obvious, a muted line says what would make it act (review-view A9).
- A landing whose target is not loaded yet goes to its likeliest home (the seat's chat), never to an archive, and moves to the target when it arrives unless the person moved (review-view A9).

- Before wording a missing-action hint, check every press on the panel: if another control already does the act (the primary saves the note), the hint is false (review-view A10).

- "Only when there is something to do" applies to the primary as much as to Save: a marked, unedited item draws no primary; the screen's own Next carries the way on (review-view A11).
- A state read made for one part of a screen (the editor line) updates every part that shows the same fact (the header's map head); a screen must never show two heads at once (review-view A11).

- A list that a landing can point into must be able to draw the target's row: when a target falls outside the list's source (the roster), add a bounded group for it (`Others`) rather than landing on no row (review-view A12).

- A landing into a scrolling list scrolls its current row into view (nearest, instant); a click in the list does not need it (review-view A13).
- State marks never transition: a mark eased by a global button transition can lag a frame-starved window and show the wrong row (design system, review-view A13).

- When a rule removes the control that a focus row names, amend that row the same day: name the new target (the checked radio, the closest control saying what was just done) (review-view A14).
- "A press that changes nothing" is judged by every effect, not only the save: an ask posts and wakes, so it stays even when the mark is saved (review-view A14).

- Choices that list the same people must come from one function: two composers listing one name in two ways is a fact said twice (review-view A15).
- A scroll-into-view must never cut a list's own head; keep heads with controls outside the scroller (review-view A15).
- Put a transition on the base rule, never on :hover only, or the exit snaps (design system, review-view A15).

- A floor applied to a compound value (several answers) must floor per part, or the second part is never read; and the open record itself must show what was ruled (rule-questions A1).
- A radio group's name is its question, not its number: `Q1 · <words>` (rule-questions A1).
- "Incomplete needs no reason text" holds only while the missing input is in view; in a scrolling box the foot names it (design system, rule-questions A1).

- A line of words added to a foot gets its own row at every width, not "beside" something: the narrowest box decides, and a fixed place beats one that moves at a breakpoint (rule-questions A2).
- A floor is for when there is no room; with room, show the value whole (rule-questions A2).
- What a line drops visually while its record is open, its accessible name drops too (rule-questions A2).

- "No transition while marked" cannot hold on the way out when hover and mark share a property: CSS takes the transition from the new style. Put the state fill on its own untransitioned layer (::before or inset shadow) and let hover ease the base background (design system, review-view A16). Write such rules with both directions in mind before amending.

- A refactor of how a mark is painted must reproduce main pixel for pixel: border box, ring spread, hover under an opaque mark. List those three before cutting it (review-view A18).
- Reduced motion is one global guard, never per control; per-control guards get lost in refactors (review-view A18).

- The window's chrome and the macOS menu bar are part of the screen for "a fact shows once": with the window in front, the menu bar already names the app, so the window draws its name nowhere; the window title stays for the system (Dock, Cmd-Tab, VoiceOver, seat-pointer). Count the width a fix costs at 1024 before keeping a brand (one-title).
- Answer the whole ask, not the two options offered: "a proper approach" meant the top edge as a whole; my first reply picked between the FSE's options and had to be replaced (one-title).

## Participants in use

- none yet (`docs/ux/participants/` when built).
