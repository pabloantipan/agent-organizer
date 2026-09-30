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
  `specs/responsive-home.md` (proposed): compact < 1280, regular, wide ≥ 1920.
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

## Open questions

- none open.

## How I look at it

- `eval "$(scripts/fixture-home.sh --twenty)"` (twenty initiatives) or
  without `--twenty` (init-a … and the cell fixtures), then
  `wails dev -devserver localhost:34115`; drive with chrome-devtools in an
  isolated context (Playwright's browser may be held by another session).
  `wails dev` flips the mode of `frontend/wailsjs/runtime/*`; restore with
  `git checkout -- frontend/wailsjs/runtime` after, never commit it.

## Studies and lessons

- Pressing an action that starts a real session (Draft the cell's Open,
  Bring crew up) is out of a review's reach; read the code path and say so.

## Participants in use

- none yet (`docs/ux/participants/` when built).
