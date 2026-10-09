---
title: "The Initiatives view: cards awake, asleep and archived, Sleep and Wake, the rail's folds, memory on every Agents row"
status: now
repos: [organizer]
branch: initiatives-view
seat: iv-build
stage: one-window
updated: 2026-10-09
next: "review: initiatives-view, I1-I15 and X0 met (I12 keys headless, I7 live region Chromium only, under 0108), f28c5f9"
depends_on: [initiatives-sleep, ram-view]
boundary: ["new InitiativesView.tsx and css, the top bar and the store's screen", "Rail.tsx (folds), Home.tsx (one line), InitiativeHeader.tsx (asleep line), AgentsView.tsx, AgentList.tsx and Crew.tsx (Memory column)", "frontend/src/lib helpers and tests (readOnlyOf's word included), scripts/fixture-home.sh", "not: Go"]
spec: "docs/specs/initiatives-view.md (FR-5; docs/ux/specs/initiatives-view.md (e577d08))"
gate: "docs/specs/initiatives-view.md Acceptance, rows I1 to I13 and X0"
ui_review: true
review: pass
---

## Goal
0104: initiatives as cards, put to sleep and woken from Deltagos, awake
first, memory per initiative and per agent.

## Gate
docs/specs/initiatives-view.md, I1 to I13 and X0, plus:
- [x] I1-I13 in `make review-build` (Deltagos Review, WKWebView) on the fixture at 1024×640 and 1512×913, driven by AXPress on its own pid (no pointer, no keys, no desktop switch), and read-only on the real home — 292e9cc, then f28c5f9 for the one fix (a long client chip cut mid-word on the real home); shots `wk-<w>x<h>-<row>-<state>.png` in `.wt-notes/iv-build/`:
  - I1 `Initiatives` left of Usage, no number, crumbs `Home / Initiatives` (`wk-1024x640-I1-view`); I2 `10 of 11 awake`, `10 of 10 awake · the limit`, magenta `10 of 9 awake · over the limit` (`I2-under`, `-at`, `-over`); I3 cards, Awake/Asleep/Archived closed (`I3-view`, `wk-1512x913-I13-view`)
  - I4 confirm on init-a names 13 sessions and 5 decisions, 1 thread, 2 other rows; focus on Cancel, Cancel returns it to Sleep; init-c with nothing live sleeps at once (`I4-confirm`); I5 Wake init-asleep: the factory got `wake init-asleep` (no `--force`), card to Awake, `11 of 12 awake` (`I5-woken`); I6 at the limit Wake is `Wake init-asleep: ten are awake`, the factory is not called, focus moves to its note, the Asleep head names the ten with links (`I6-refused-at-limit`)
  - I7 `Waking…` with `thawing 1 session…`, focus on the card's id before and after the move (`I7-waking`); I8 refused (the factory's words + `Nothing changed.`), failed (`Wake failed.` + `Nothing changed.`), partial (`Sleep failed.`, `init-a is asleep, but 13 sessions still run: …`, Agents ›) (`I8-*`)
  - I9 factory missing (relaunched without it: `10 awake`, the line, no buttons), failing (`awake-fail`: the factory's reason, no buttons), factory-blind init-blind and archived without a button (`I9-*`, also I15's `I15-factory-missing`, `-failing` in WKWebView); I10 Agents rows' Memory, the group total, `—` with `not running` (`I10-agents-init-a`; real home: organizer `Memory 2 GB`, rows 0.2-0.6 GB, `real-I10-agents-organizer`)
  - I11 rail `Asleep (1)` with `Initiatives ›` and `Archived (1)` apart, strip count buttons, Home `1 asleep · Initiatives ›` opens the view, init-asleep's header `asleep: read-only` with `Wake in Initiatives ›` landing focus on Wake init-asleep (`I11-*`); I12 focus moves via AX as in I4, I6, I7 and I11; I13 two columns at 1024, four at 1512, no horizontal scroll bar, goals clamp with their hover; on the real home hestia's long client was cut mid-word, fixed in f28c5f9 (`real-I1-view` before, `real-I13-client-clamped` after)
  - Real home, read-only (no Sleep or Wake pressed): `4 of 4 awake · the limit`, camp factory-blind with its line, `None asleep.`, Home with no asleep line.
  - Not done in the Review window under 0108 (seat-pointer has no keys, and no key was posted otherwise): I12's Tab order and Escape, and I7's live region text (transient). Proven by the Chromium run (`flows.log`) plus a headless WKWebView check (`wkheadless`, offscreen, against `wails dev` on the fixture, `i12-headless.log`): tab order card id then its button for every card, Wake init-asleep reachable, Sleep focuses Cancel, Escape closes the confirm and focus returns to Sleep init-a, scrollWidth 1024 at 1024. I7's live region is proven by the Chromium run only (`flows.log`: `init-c is asleep` and `init-c is awake` announced); the headless check did not cover it.
- [x] X0 from a clean clone at f28c5f9 through test-lease: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, 0 FAIL, 400 vitest; `npm run build` exit 0; `wails build` exit 0 (`x0.txt`, `x0-make.txt`)
- [x] I14 every read-only word says `asleep` for a paused initiative, never `paused` or `not active` (header lozenge hover, CardDrawer, Conversation): `readOnlyOf` returns the sleepy word; vitest — 2012d81; `lib/queue.test.ts` readOnlyOf (asleep, archived, as written, null)
- [x] I15 factory missing or failing: the head shows the count with no limit and no `over the limit`, plus the factory line (the fixture shows `10 awake`, not `10 of 4 awake · over the limit`); vitest and a Chromium shot — eeb875b; `lib/initiatives.test.ts`; `.wt-notes/iv-build/chromium-1024x609-I15-factory-missing.png`, `-failing.png`, `flows.log`

## Done
- 2026-10-09: view, top-bar button, rail folds, Home line, asleep header, Agents Memory column, fixture and fake factory on `initiatives-view` (f39d0d0); every state run in Chromium at 1024 and 1512 (`.wt-notes/iv-build/flows.log`, `chromium-*.png`); X0 pass from a clean clone at eeb875b, after I14 and I15 (`.wt-notes/iv-build/x0.txt`, `x0-make.txt`); crew seat rows show Memory too.

- 2026-10-09: WKWebView pass in Deltagos Review on the fixture and the real home (read-only), every row by AXPress on its own pid; one fix from the real home (a long client chip cut mid-word, f28c5f9); X0 again from a clean clone at f28c5f9.
## Notes
- 2026-10-09: supervisor sup51 (window 8385), spawned by the FSE.
- 2026-10-09 iv-build: boundary widened by sup51: `frontend/src/components/Crew.tsx`, SeatRow only, renders the MemoryCell from AgentList.tsx after ContextBar (fbc0992).
- 2026-10-09 iv-build: the WKWebView rows wait on lodestar's locked screen, and must not overlap ffs-build's S2 (a second Deltagos Review in front spoils its frontmost-app log).
- 2026-10-09 iv-build: CardDrawer and Conversation still say `paused: read-only` (`readOnlyOf` in `lib/queue.ts`, outside the boundary).
- 2026-10-09 iv-build: at 1024 the top bar wrapped on Initiatives and Usage once the button was added; the idle machines line now folds into the brand's hover at compact (for Aglaea's look).
- 2026-10-09 iv-build: under 0108's rule (sup51, ~19:05): no desktop switching, seat-pointer only into the Deltagos Review window with --wait and never a lower --idle. The WKWebView pass runs first in `.wt-notes/iv-build/wkheadless` (a real WKWebView, offscreen, activation policy prohibited: never frontmost, no Space, no input events; DOM events and focus read by JS) against the fixture, with shots `wk-<w>x<h>-<row>-<state>.png`. Rows that still need the Review window are done through seat-pointer only if that works within the rule; any that can't are listed here, proven by the Chromium run plus wkheadless. It still waits for sup51's go.
- 2026-10-09 iv-build: from ~19:36 a second Deltagos Review (deltagos-mark's worktree) ran beside mine; `seat-pointer shot` picks the largest window of that name, so my later shots are `screencapture -l` by my own pid's window id. Kill only by saved pid (sup51, after the 19:11 wipe).
- 2026-10-09 the FSE: boundary widened by Crew.tsx (Memory column on crew seat rows only), spec Amendment 2 (0108).

## Review
- Verdict: pass (code review; the WKWebView and real-home legs of I1-I13 are iv-ui's).
- Commit reviewed: fbc0992 on `initiatives-view` (branch head at review time).
- Unmet gate items: none.
- X0, run by the reviewer from a clean clone at fbc0992 through `test-lease`: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (396 vitest), `npm install && npm test && npm run build` exit 0, `wails build` exit 0.
- Boundary: every changed path is inside it; no Go change; `Crew.tsx` touches `SeatRow` only (MemoryCell after ContextBar).
- Code: Sleep and Wake call only `App.Sleep`/`App.Wake` with the id (no `--force`, no `Wake anyway`, no status written by the frontend); top-bar `Initiatives` sits left of Usage with no number or badge, crumbs `Home / Initiatives`; no red in the view, over the limit is `--tone` (magenta); Sleep, Wake and the confirm's commit are default (secondary) buttons; confirm lines from `needsMeRows` and the agents feed, Cancel focused, Escape cancels; a refused Wake is `aria-disabled`, focusable, named `Wake <id>: <n> are awake`, and a press moves focus to its note; Memory cell `flex: 0 0 auto`, rows not re-sorted; tier-2 tokens all defined, no oklch, color-mix, nesting or @layer; localStorage reads and writes in try/catch.
- Evidence: `.wt-notes/iv-build/flows.log` and `chromium-*.png` (Chromium, wails dev, fixture) cover I1-I13 at 1024 and 1512; I10's crew-seat rows were recorded without a Memory cell before fbc0992, and are met by the code at fbc0992, not by a recorded run.
- Findings (none blocks): (1) the header lozenge's hover still says "not active: …", and CardDrawer and Conversation still say `paused: read-only` (outside the boundary; `readOnlyOf` returning `sleepyWord` fixes all); the design says awake/asleep in every word. (2) Wake is refused at Deltagos's count, which includes factory-blind awake ones, so on the real home (camp blind) Deltagos can refuse a Wake the factory would allow; the builder's stated choice, consistent with "the head's count is Deltagos's". (3) The Asleep head's limit line links blind initiatives "to their Sleep", which they lack; focus falls back to the id. (4) A sole awake initiative with nothing live or waiting sleeps at once without "Home will be empty until one wakes." (I4 allows it; the States row "one initiative" reads as a confirm). (5) With the factory missing or failing the limit falls back to 4, so the fixture shows `10 of 4 awake · over the limit` in magenta with a hover blaming the command line.
- Gate gaps: I11 checks the header's word only, not every place that says `paused`; no row runs the real home outside WKWebView.
- Reviewer: iv-review, 2026-10-09.
- 2026-10-09 the FSE: I14-I15 from the code review's findings 1 and 5 (0108). Findings 2 (Wake refused at Deltagos's count, camp included: kept, Deltagos's count is the true one; the factory's depth fix is Hephaistos's), 3 and 4 go to leftovers.

### Re-review (I14, I15)
- 2026-10-09. Verdict: pass. Commit reviewed: eeb875b on `initiatives-view`.
- Unmet gate items: none.
- Since fbc0992: the branch was rebased onto main (31cf2e2); `git range-diff` shows its nine commits identical to fbc0992's, and the tree at e187b1e differs from fbc0992 only by main's card and bitácora. New are 2012d81 and eeb875b, frontend only (`lib/queue.ts`, `lib/initiatives.ts`, their tests, `InitiativeHeader.tsx`, `AgentsView.tsx`, `InitiativesView.tsx`), all inside the boundary; no Go change.
- I14: `readOnlyOf` returns `sleepyWord(status)`; the header lozenge's text and hover, CardDrawer (Discuss and Comments), Conversation and AgentsView all print it unchanged, so a paused initiative reads `asleep: read-only` everywhere; the Wake link checks `readOnly === "asleep"`. Vitest `queue.test.ts` covers asleep, archived, an unknown status as written, and null. No user-visible `paused: read-only` or `not active:` left in the frontend.
- I15: `limit` is null unless the factory is found and answers; `countWords(n, null)` gives `n awake`, never over, no hover; `atLimit` is false, so no limit line and no refused Wake. Vitest in `initiatives.test.ts`; the builder's Chromium shots at 1024 (missing, failing) show `10 awake` and the factory line, matching `flows.log` lines 85-86.
- X0 from a clean clone at eeb875b, through `test-lease`: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (400 vitest), `npm install && npm test && npm run build` exit 0.
- Findings (none blocks): FloatList's group label still says `Not active (n)`; it is a group name, not a read-only word, and outside I14's places.
- Reviewer: iv-rereview, 2026-10-09.

## UI review
- 2026-10-09, iv-ui. Commit run: f28c5f9 (detached worktree, `test-lease run -- make review-build`, `Deltagos Review.app`, WKWebView), every row on that commit. Fixture (`scripts/fixture-home.sh`, its fake factory) and the real home read-only (real config, a throwaway `XDG_DATA_HOME`; no Sleep or Wake pressed). Driven by AXPress and AX focus on the app's own pid, keys posted to that pid only (`postToPid`: no activation, no HID tap, no desktop switch); window 1024×640 (609 content) unless named, rail as remembered. Shots and scripts in `.wt-notes/iv-ui/`.
- Verdict: **pass**. No severity 4 or 3.
- Keyboard setting: macOS Keyboard navigation off (`AppleKeyboardUIMode` unset, the default). Plain Tab reaches no button anywhere in the app under it; I12 ran with Option-Tab, WebKit's all-controls key under that setting.

| # | How checked | Result |
|---|---|---|
| I1 | shot `wk-1024x640-I1-view`; AX: `Initiatives` toggle between Rescan/compact and Usage, no number; crumbs `Home / Initiatives` | met |
| I2 | fake limit 11/10/9 + Rescan; AX text and shots `I2-limit11/10/9`: `10 of 11 awake`, `10 of 10 awake · the limit` (neutral), `10 of 9 awake · over the limit` (magenta, no red) | met |
| I3 | shots `I1-view`, `I3-asleep-archived`, `wk-1512x945-I13-view`; AX article per card: id, client, word, goal (clamped, title), sessions with nouns, memory, `Next: …` as words; Awake, Asleep, Archived fold (aria-expanded toggles) | met |
| I4 | AXPress/space Sleep init-a: confirm names 13 sessions and `5 decisions, 1 thread and 2 other rows … leave Needs me`, focus on Cancel (`I4-confirm`); init-c (nothing live or waiting) went straight to `Sleeping…` | met |
| I5 | Wake init-asleep: calls.log `wake init-asleep` (no `--force`), card to Awake, `11 of 12 awake`, rail and Needs me follow (`I5-woken`) | met |
| I6 | limit 10: Wake reached by Option-Tab, named `Wake init-asleep: ten are awake`, aria-disabled; space → focus to its note, factory not called (calls.log); Asleep head names the ten as links, init-c's lands on `Sleep init-c` (`I6-refused-at-limit`) | met |
| I7 | `Waking…` + `thawing 1 session…` with focus on the card's id before the disable, then on the moved card's id; the status region read through AX in WKWebView: `init-asleep is awake`, `init-c is asleep` (`I7-waking`) | met (the builder's Chromium-only leg now seen in WKWebView; spoken output not heard) |
| I8 | fake `refuse`, `fail`, `partial`: the factory's words in mono + `Nothing changed.`; `Sleep failed.` + `seat-freeze: zellij did not answer …` + `Nothing changed.`; partial: `init-a is asleep, but 25 sessions still run: …` + `Agents ›`; focus on each note (`I8-*`) | met |
| I9 | relaunched without the factory: `10 awake`, the line, no Sleep/Wake (`I9-factory-missing`); `awake-fail`: head line with the factory's reason, no buttons (`I9-factory-failing`); init-blind and real camp: no button, the line; archived: no button | met |
| I10 | init-a Agents (`I10-agents-init-a`) and real organizer (`real-I10-agents-organizer`: rows 0.2–0.6 GB, total `Memory 2.6 GB` = its card); `—` named `not running` on the exited row; memory `fail` → `—` named `memory could not be read` (`I10-agents-memfail`) | met (U1, U2) |
| I11 | rail `Asleep (1)` with `Initiatives ›`, `Archived (1)` apart (`I11-rail-folds`); strip counts open Initiatives (`I11-strip`); Home `1 asleep · Initiatives ›` opens the view (`I11-home-line`); init-asleep header `asleep: read-only` + `Wake in Initiatives ›` landing focus on `Wake init-asleep` (`I11-asleep-header`, `I11-wake-landing`) | met (U3, U4) |
| I12 | keys to the pid (`i12-opttab.log`): Option-Tab goes id, Sleep, id, Sleep … for all 22 controls, blind card id only, then Wake init-asleep, Archived; space on Sleep → Cancel; Escape → back to Sleep init-a; refused Wake reachable and named | met under Option-Tab (see setting above) |
| I13 | AX at 1024×640: no horizontal scroll bar on the page's scroll area (classic scroll bars showing) and the widest element's right edge = the window's (2024) in the view, with the confirm open, with the factory missing and on the real home; two columns at 1024, four at 1512×945; confirm's buttons under its text (`I13-confirm`) | met; `scrollWidth === clientWidth` not read by JS in the window (no inspector), the builder's headless WKWebView read 1024 vs 1024 (`iv-build/i12-headless.log`) |

- States checked: sleeping in progress (`Sleeping…`, `putting it to sleep…`; the `freezing n sessions…` wording not caught live), waking in progress, refused at the limit, the factory refuses anyway, factory missing, factory failing (sleep: `fail`; awake: `awake-fail`), factory-blind (fixture and camp), no memory reading (`fail` level: `Memory —`), one initiative (`1 of 12 awake`, confirm adds `Home will be empty until one wakes.`, `States-one-confirm`), none awake (`0 of 12 awake`, `None awake.`, Home's empty state with `Wake one in Initiatives ›`, `States-none-*`), archived, narrow 1024×640, memory high (`Memory < 0.1 GB · the most`, `States-memory-high-the-most`). Real home: `4 of 4 awake · the limit`, camp blind with its line, hestia's long client cut with an ellipsis, `None asleep.`, no Home line.

Findings (none 4 or 3):
- **U1 (2)** The lead cannot run an eye down the Memory column to compare seats. Where: Agents rows (`I10-agents-init-a`, `real-I10-agents-organizer`). Evidence: the memory cell's x differs on every row (fixture 1286–1661, real 1324–1524), since it follows each row's variable cells; the design says a column, right-aligned, and the CSS comment says "the figures line up row under row". Proposal: give the cell a fixed track (grid column, or the cell pushed to a fixed slot before the actions) so figures align.
- **U2 (2)** With memory unreadable, a screen-reader user hears a number the screen does not show. Where: Agents rows under `--memory fail` (`I10-agents-memfail`). Evidence: row name `organizer-fixture-probe-aglaea, idle, < 0.1 GB memory` while its cell is `—`, `memory could not be read`; the group total drops out instead of reading `Memory —`. Proposal: build the row name from the same `agentMemory` words; show `Memory —` in the head when unread.
- **U3 (2)** A keyboard user who follows Home's `Initiatives ›` (and the rail's) lands nowhere: AX shows no focused element after the view opens. Where: Home line, rail fold link. Evidence: AX focus empty after the press. Proposal: focus the view's title (Focus and names: navigation lands on the thing named).
- **U4 (1)** `asleep since 9 Oct` on the day it fell asleep; the design system says `today`. Where: asleep card (`I11-wake-landing`). Proposal: `dateWords` with today.
- **U5 (1)** `1 decision waiting on you leave Needs me` (verb agreement). Where: Sleep init-b's confirm. Proposal: `leaves` for a count of one.
- **U6 (1)** The rail folds' chevrons are named `expand`/`collapse` only. Where: rail (AX). Proposal: `Expand Asleep`/`Collapse Archived` (names carry their row).

For aglaea (design questions, not fails):
- **A1** At the strip, the folds are bare counts (`11`, `1`) under the rank numbers, told apart by a border and a separator (`I11-strip`, `States-none-home`): as designed, but they read as ranks.
- **A2** Sleep's in-place confirm does not hold the keyboard (Option-Tab from Cancel goes to the next card); the design system's "an open box keeps the keyboard" names boxes, sheets and dialogs, not inline confirms. Which applies?
- **A3** Plain Tab reaches no button with macOS Keyboard navigation off (the default here): Q1 still open.

Spec gaps (for the FSE): the `factory awake` failing head line (`Sleep and Wake need the factory, which did not answer: …`) is the builder's wording, its error not in mono; "one initiative" with others asleep (the table's row assumes one in all); the folds' "closed by default" cannot be shown in a review bundle whose storage persists across reviews (it was remembered open).

Not verified: hovers by pointer (titles read from AX or the code: count hover, rail and strip fold hovers, memory's biggest three); the spoken live region (AX text only); `Memory —` with `reading memory…` in the first 10 s (the first sample arrived within ~3 s); `Wait for … to finish` while another runs; `freezing n sessions…` live; Archived on the real home (none on this machine's roots).
