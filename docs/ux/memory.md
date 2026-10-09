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

## Open questions

- Q1 (Pablo, via the FSE, leftovers-4): does he use Tab in the app? In
  WKWebView, Tab reaches buttons only with macOS Keyboard navigation on.

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

- **A count needs its noun.** "3 waiting" failed header-fold's blind reader;
  0068 made it "3 decisions waiting". Shortening a label past its noun saves
  width and costs meaning.
- **Measure every width you name.** In responsive-home I set regular at 1280
  and called it "as built" without measuring below 1440; the UI review found
  a cliff at 1280 (U3). My A8 also asked all twenty rows in one 1024
  screenshot, against my own A1 (0065 fixed it). Check the acceptance rows
  against each other before sending.

## Participants in use

- none yet (`docs/ux/participants/` when built).
