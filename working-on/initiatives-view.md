---
title: "The Initiatives view: cards awake, asleep and archived, Sleep and Wake, the rail's folds, memory on every Agents row"
status: now
repos: [organizer]
branch: initiatives-view
seat: iv-build
stage: one-window
updated: 2026-10-09
next: "iv-build: the WKWebView pass of I1-I13 after sup50's S2 and S3 free the screen"
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
- [x] I14 every read-only word says `asleep` for a paused initiative, never `paused` or `not active` (header lozenge hover, CardDrawer, Conversation): `readOnlyOf` returns the sleepy word; vitest — 2012d81; `lib/queue.test.ts` readOnlyOf (asleep, archived, as written, null)
- [x] I15 factory missing or failing: the head shows the count with no limit and no `over the limit`, plus the factory line (the fixture shows `10 awake`, not `10 of 4 awake · over the limit`); vitest and a Chromium shot — eeb875b; `lib/initiatives.test.ts`; `.wt-notes/iv-build/chromium-1024x609-I15-factory-missing.png`, `-failing.png`, `flows.log`

## Done
- 2026-10-09: view, top-bar button, rail folds, Home line, asleep header, Agents Memory column, fixture and fake factory on `initiatives-view` (f39d0d0); every state run in Chromium at 1024 and 1512 (`.wt-notes/iv-build/flows.log`, `chromium-*.png`); X0 pass from a clean clone at eeb875b, after I14 and I15 (`.wt-notes/iv-build/x0.txt`, `x0-make.txt`); crew seat rows show Memory too.

## Notes
- 2026-10-09: supervisor sup51 (window 8385), spawned by the FSE.
- 2026-10-09 iv-build: boundary widened by sup51: `frontend/src/components/Crew.tsx`, SeatRow only, renders the MemoryCell from AgentList.tsx after ContextBar (fbc0992).
- 2026-10-09 iv-build: the WKWebView rows wait on lodestar's locked screen, and must not overlap ffs-build's S2 (a second Deltagos Review in front spoils its frontmost-app log).
- 2026-10-09 iv-build: CardDrawer and Conversation still say `paused: read-only` (`readOnlyOf` in `lib/queue.ts`, outside the boundary).
- 2026-10-09 iv-build: at 1024 the top bar wrapped on Initiatives and Usage once the button was added; the idle machines line now folds into the brand's hover at compact (for Aglaea's look).
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
