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
- Context: a desktop app (Wails, WKWebView, Safari 15.0 floor), window
  1440×900 by default, **minimum 1024×640** (`main.go:36-39`). 400 px does not
  occur.

## Ruled design choices (do not reopen; raise findings against them)

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

## Open questions

- Whether I own `docs/design-system.md` or only review against it: open with
  the FSE (0053 Consequences). Until settled, I propose, never edit.

## How I look at it

- `eval "$(scripts/fixture-home.sh --twenty)"` (twenty initiatives) or
  without `--twenty` (init-a … and the cell fixtures), then
  `wails dev -devserver localhost:34115`; drive with chrome-devtools in an
  isolated context (Playwright's browser may be held by another session).
  `wails dev` flips the mode of `frontend/wailsjs/runtime/*`; restore with
  `git checkout -- frontend/wailsjs/runtime` after, never commit it.

## Studies and lessons

- none yet.

## Participants in use

- none yet (`docs/ux/participants/` when built).
