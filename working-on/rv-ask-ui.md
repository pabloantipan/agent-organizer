---
title: "Ask <seat> on a Question or Blocked mark, and the thread it opened"
status: now
repos: [organizer]
branch: rv-ask-ui
seat: au-build
stage: review-map
updated: 2026-10-18
next: "file finding: au-ui A1, A2 for aglaea (asked placement; pre-press line after an ask) and the Conversations chat list keeping channel highlighted; then move to done (both reviews pass at 8ba6d0d)"
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/stores/board.store.ts (openSlack thread, review place), frontend/src/components/SlackView.tsx (← Review), frontend/src/components/Conversation.tsx (threadId landing)]
depends_on: [rv-ask-data, rv-polish]
boundary: ["docs/specs/review-map.md v3 Boundary, rv-ask-ui"]
spec: "docs/specs/review-map.md (v3, FR-28, FR-29; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows A4, A5 and X0; v3 Amendment 1 rows A6, A7; Amendment 2 row A8; Amendment 4 row A9; Amendment 5 rows A10, A11"
ui_review: true
review: pass
---

## Goal
From the mark Pablo asks the card's supervisor and lands on the thread it opened.

## Gate
docs/specs/review-map.md v3, rows A4, A5 and X0.
- [x] A4: vitest "A4 (FR-28, FR-29)" in `lib/review.test.ts`, `components/ReviewSymbol.test.tsx`, `components/Review.test.tsx`, `components/SlackView.review.test.tsx` (run: .wt-notes/au-build/x0-make-test.txt)
- [x] A5: harness 1024x640, .wt-notes/au-build/out/h-a5-1024x640.txt (`a5_after`), .wt-notes/au-build/out/a5-state.json, .wt-notes/au-build/out/a5-after.png
- [x] X0: clean clone at 60f74c3: .wt-notes/au-build/x0-make-test.txt, x0-pnpm-build.txt, x0-wails-build.txt, x0-porcelain.txt (empty), x0-head.txt
- [x] A6: vitest "A6 (FR-38)" in the three review test files; also in WK, .wt-notes/au-build/out/h-a-rows-1024x640.txt (`a6_after`)
- [x] A7: harness 1024x640, .wt-notes/au-build/out/h-a5-1024x640.txt (`a7_row`: name 58, muted flag text 58), .wt-notes/au-build/out/a7-flags.png
- [x] A8: vitest "A8 (FR-40)" in `lib/review.test.ts`, `components/ReviewSymbol.test.tsx`, `components/Review.test.tsx`
- [x] A9: harness 1024x640, real failing ask (empty discuss dir), .wt-notes/au-build/out/h-b2-1024x640.txt (`a9_formatName`, `a9_retry`, `a9_last`: failure 576-624 inside panel 169/161-624, focus on the button, `aria-describedby` to the line, live region the failure line once, not `Reviewed 2 of 2` on Greet), b2-a9-formatName.png, b2-a9-last.png; vitest "A9" in `lib/review.test.ts`, `components/ReviewSymbol.test.tsx`
- [x] A10: harness 1024x640, AskReview/GetAgents/GetCellThread stubbed in the page only, .wt-notes/au-build/out/h-b2-1024x640.txt (`a10_land`: activeElement the thread's divider, via `← Review` while unlisted; `a10_tab`: one Tab → `← Review`; `back_in_review`), b2-a10-landed.png, b2-a10-tab.png; vitest "A10 (FR-41)" in `components/Conversation.review.test.tsx`
- [x] A11: harness, .wt-notes/au-build/out/h-b2-1024x640.txt (`a11`: `asked` rgb(181,175,195) = --fg-muted on the current Greet row and on formatName; glyphs ? --tone, ✕ --danger), b2-a11-rows.png; vitest "A11 (FR-42)" in `components/ReviewSymbol.test.tsx`
- [x] A4-A8 still: A5, A7 rerun on a fresh fixture, .wt-notes/au-build/out/h-a5-r2-1024x640.txt; vitest in the X0 run
- [x] X0 round 2: clean clone at 8ba6d0d: .wt-notes/au-build/x0r2-make-test.txt (933 vitest, go ok), x0r2-pnpm-build.txt, x0r2-wails-build.txt, x0r2-porcelain.txt (empty), x0r2-head.txt

## Declared changes
- modified `frontend/src/lib/review.ts`: `askLine`, `askedLine`, `askFailedLine`, `firstLine`, `saidAfter`, `lastToReview`, `Addressee`, `Via`; `primaryOf` asks and drops `, next` on the last; `affectedLine` takes the list; `Row.asked`, `marksOf`, `rowName`; WORDS.v3 replaced
- modified `frontend/src/components/ReviewSymbol.tsx`: the ask (`AskReview`), `markPress`, `AskStatus`, links say their list
- modified `frontend/src/components/Review.tsx`: `ReviewAddressee`, the asked row, the live region (`saidAfter`), `via`, `last`, Open the thread, focus on return
- modified `frontend/src/stores/board.store.ts`: `openSlack` with a thread, `reviewBack`, `backToReview`, `leaveReview` drops `reviewBack`
- modified `frontend/src/components/SlackView.tsx`: `ReviewBack` (`← Review`) in the toolbar
- modified `frontend/src/styles/review.css`: `.rv-asked`, `.rs-ask-line`, `.rs-asked`, `.rv-flag.muted` padding
- modified `frontend/src/lib/review.test.ts`, `frontend/src/components/ReviewSymbol.test.tsx`, `frontend/src/components/Review.test.tsx`: A4, A6, A7, A8
- added `frontend/src/components/SlackView.review.test.tsx`: the store round trip and `← Review` (A4)
- modified `frontend/src/components/ReviewSymbol.tsx:FailedLine`: the failure line scrolls into view (nearest), named by the primary and Try again (A9)
- modified `frontend/src/components/Review.tsx:Review`: onAsked hands a failed ask's line to the live region (A9)
- modified `frontend/src/lib/review.ts:saidAfter`: a failed ask says its line alone (A9)
- modified `frontend/src/components/Conversation.tsx`: `landDivider`, `reviewBackOf`, the `slackDraft.threadId` landing waits for an unlisted thread (A10)
- added `frontend/src/components/Conversation.review.test.tsx`: A10
- modified `frontend/src/components/SlackView.tsx:ReviewBack`: `data-review-back`, found by the landing (A10)
- modified `frontend/src/styles/review.css`: `.rv-asked` in --fg-muted (A11)
Risky:
- `leaveReview`: every navigation naming a screen now also drops `reviewBack`
- `openSlack`: a thread not yet in the 10 s feed lands Conversations on the archive until the feed lists it (asked at once), then on the thread
- `landDivider`: the next Tab from the landed divider is redirected once to `← Review` (above it in the page)
Not changed, on purpose:
- any Go, `app.go`, `frontend/wailsjs/`: the bindings sufficed

## Notes
- Harness runs set `discuss_state_dir: <an empty mktemp -d>` in the fixture's config from my own `run-dev.sh` (sup82, thread 01M57TR1): the `--review` fixture names none, so the app used the real token registry. With it every post fails before connecting (`open …/tokens.json: no such file or directory`), which is the spec's "no mailbox". Confirmed by the FSE as review-map v3 Amendment 3.
- Before that, A5's premise ("fixture health, no mailbox") was false: the `--review` config names `canned_health` but no `discuss_state_dir`, so `discussStateDir` (internal/service/factory.go:119) uses the real `~/.local/state/discuss`, which has a token for `organizer-fixture/pablo`. My A5 run posted one ask: project `organizer-fixture`, to `fse`, thread `01M57TKJC6HSEGBS46PQQV10YY`, message `01M57TKJC6HSEGBS46PT5VTACG`. Nothing reached the `organizer` project. Detail: `.wt-notes/au-build/progress.md`.
- Thread 01M57TKJC6HSEGBS46PQQV10YY (organizer-fixture, to fse, from the first A5 run) is left as it is, as sup82 asked; sup82 reports it and the fixture gap to the FSE.

## Review
Verdict: **pass** at 60f74c309524c62bfbf58333e5228258d9fb6eca (branch did not move during the review). Unmet gate items: none. Reviewer au-review, 2026-10-18.

- A4: met. `lib/review.test.ts`, `ReviewSymbol.test.tsx`, `Review.test.tsx`, `SlackView.review.test.tsx` compared string by string with FR-28/29 and review-view §3.3, Amendments 3, 4: `Ask sup81, next`, `Save`, `… in this review's thread. Wakes sup81.`, `Save question, next`, `No one to ask here: no cell. Kept in Deltagos.`, `? asked`/`✕ asked`, `Asked sup81` (saidAfter once), `Asked sup81 · Open the thread` → `openSlack(…, thread)` → `slackDraft {threadId}`, `← Review` → same place, `Saved here; couldn't ask sup81: …` + `Try again`, `Asking…`. All match.
- A5: met, my own harness run at 1024×640 on `fixture-home.sh --review` + `discuss_state_dir: <empty mktemp -d>` (checked: one such line in the config), auth off: before `Ask fse, next` / `Save` / `Saves the mark and asks fse (the initiative's FSE) in this review's thread. Wakes fse.`; after `Saved here; couldn't ask fse: open …/tokens.json: no such file or directory Try again`, focus on `Ask fse, next`, row `…, question` with no `asked`; on disk `state.json` has the mark `question`, no `asked`, no `thread` (`.wt-notes/au-review/out/h-run-1024x640.txt`, `out/a5-state.json`). No press reached discuss.
- A6: met. vitest four labels without `, next`, `Reviewed 2 of 2`; also in WK: `Reviewed` pressed, focus on `BUTTON Reviewed`, live region `Reviewed 2 of 2` once.
- A7: met in WK at 1024×640: `no direct test` text left 58 = name text left 58, padding 0, no border/fill; the amber flag keeps 7px.
- A8: met (vitest both directions with mutual edges, and the links pass their list).
- X0: met. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **reused** run `c8492051-21087` of 60f74c309524 (au-ui, 12:47:20), exit 0, go ok, 922 vitest passed. `test-lease run -- pnpm run build` 0, `test-lease run -- wails build` 0 (and again after the harness), `git status --porcelain` empty.
- Busy rule: with AskReview slowed 1.5 s in the page, three presses of `Ask fse` → one call (`Asking…`, aria-disabled, focus held); two of `Try again` → one (`out/h-busy.txt`). No call before any press (counter on `window.go.main.App`); `Save` after a failed ask called MarkReview only. One AskReview call site (`ReviewSymbol.tsx:43`), reached only from a press.
- No-gos: no post as a persona, no network beyond the binding, no new dependency, no absolute tool path; nothing outside the boundary (no Go, `app.go`, `wailsjs/`, `Conversation.tsx`, Needs me, Home, `scripts/`).

change-check (clean clone):
```
change-check: working-on/rv-ask-ui.md
risk: medium
repo organizer: base 26aad169d (default main) ... head rv-ask-ui 60f74c309; 10 files

## Changed

- organizer/frontend/src/components/Review.test.tsx (modified, test)
- organizer/frontend/src/components/Review.tsx (modified): Review, ReviewViewProps, PanelProps, ReviewView, Worklist, SymbolPane
- organizer/frontend/src/components/ReviewSymbol.test.tsx (modified, test)
- organizer/frontend/src/components/ReviewSymbol.tsx (modified): MarkState, Addressee, ReviewSymbol, ReviewSymbolViewProps, ReviewSymbolView, MarkForm, Failed, markPress, AskStatus
- organizer/frontend/src/components/SlackView.review.test.tsx (added, test)
- organizer/frontend/src/components/SlackView.tsx (modified): SlackView, ReviewBack
- organizer/frontend/src/lib/review.test.ts (modified, test)
- organizer/frontend/src/lib/review.ts (modified): Addressee, askLine, askedLine, askFailedLine, firstLine, saidAfter, Row, marksOf, worklist, rowName, Via, affectedLine, primaryOf, lastToReview
- organizer/frontend/src/stores/board.store.ts (modified): State, leaveReview
- organizer/frontend/src/styles/review.css (modified)

## Tests touched

- organizer/frontend/src/components/Review.test.tsx
- organizer/frontend/src/components/ReviewSymbol.test.tsx
- organizer/frontend/src/components/SlackView.review.test.tsx
- organizer/frontend/src/lib/review.test.ts

## Risky (declared)

- `leaveReview`: every navigation naming a screen now also drops `reviewBack`
- `openSlack`: a thread not yet in the 10 s feed lands Conversations on the archive (Conversation.tsx's draft handler, unchanged)

## Not changed, on purpose (declared)

- any Go, `app.go`, `frontend/wailsjs/`: the bindings sufficed
- `Conversation.tsx`: the existing `slackDraft.threadId` landing is used as is

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v3 Boundary' | boundary entry |
| outside boundary | organizer/frontend/src/components/Review.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/Review.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/SlackView.review.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/SlackView.tsx |  | modified |
| outside boundary | organizer/frontend/src/lib/review.test.ts |  | modified |
| outside boundary | organizer/frontend/src/lib/review.ts |  | modified |
| outside boundary | organizer/frontend/src/stores/board.store.ts |  | modified |
| outside boundary | organizer/frontend/src/styles/review.css |  | modified |
| outside footprint | organizer/frontend/src/components/SlackView.review.test.tsx |  | added |
| undeclared | organizer/frontend/src/components/Review.test.tsx |  | modified |
| undeclared | organizer/frontend/src/components/ReviewSymbol.test.tsx |  | modified |
| untested? | organizer/frontend/src/components/Review.tsx | Worklist | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | SymbolPane | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | marksOf | no test file names it |
| untested? | organizer/frontend/src/stores/board.store.ts | leaveReview | no test file names it |

18 flags: outside boundary 10, outside footprint 1, undeclared 2, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 4, could not read 0, boundary unreadable 1
```
Explained:
- `boundary unreadable`: the entry is prose (known false flag). Checked by hand against v3 Boundary, rv-ask-ui, plus Amendment 2.
- `outside boundary` ×10: follows from the unreadable entry; every path is in the bullet (ReviewSymbol.tsx and test, Review.tsx, lib/review.ts and test, review.css, board.store.ts, SlackView.tsx and its test) or in Amendment 2 (Review.test.tsx). board.store.ts holds only `openSlack` with a thread, `reviewBack`/`backToReview` and `leaveReview` dropping `reviewBack` (the review place). SlackView.tsx holds only `ReviewBack` in the toolbar.
- `outside footprint` SlackView.review.test.tsx: the footprint omits it; the boundary's "SlackView.tsx … and its test" allows it.
- `undeclared` Review.test.tsx, ReviewSymbol.test.tsx: declared, in one bullet that names three files; change-check reads only the first.
- `untested?` Worklist, SymbolPane: rendered by Review.test.tsx through ReviewView (asked row, panel); marksOf: through `worklist` in review.test.ts (asked row); leaveReview: SlackView.review.test.tsx (`openInitiative` drops `reviewBack`).

Notes (not findings):
- Note: Review.tsx's boundary says "(the row's `asked`)", but FR-29's live region and Open the thread, FR-38's last, FR-40's list and focus on return all live in the screen, so the diff there is wider than the parenthetical. Each hunk serves a gate FR. The FSE could widen the wording.
- Note: gate gap: A4's "live region says `Asked sup81` once" is vitest of the pure `saidAfter` plus markup, not the Review effect, and no harness row can make a successful ask without a test mailbox. A6's "focus on the button" in vitest is a source-string check (WK confirms it).
- Note: `Try again` resends the note as it is now, not the failed one; an emptied note is refused by the binding with its error line.

### Round 2 (au-review, 2026-10-18)
Verdict: **pass** at 8ba6d0dd764685f930d1d4659c28588ed7a50f68 (restarted in a fresh clean clone, as sup82 asked; the round 1 verdict above was at 60f74c3). Unmet gate items: none (A4, A5, A6, A7, A8, A9, A10, A11, X0).

- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run `ae6a7c37-38486` at 8ba6d0d (au-ui reused it), exit 0, go ok, 76 files and 933 vitest tests passed. `pnpm run build` 0, `wails build` 0 (and again after the harness), porcelain empty.
- A9: met in my own harness at 1024×640, no mailbox (one `discuss_state_dir: <empty mktemp -d>` line checked), auth off. Builder's `b2.txt` read and run unchanged except the shot paths (`.wt-notes/au-review/out/r2-h-b2.txt`). formatName: failure line 576–624 inside the panel's 169–624, focus on `Ask fse, next`, `aria-describedby` → `Saved here; couldn't ask fse: open …/tokens.json: no such file or directory`, live region recorded once with those words. Try again: the same, focus on `Try again`. Last symbol (Greet, Blocked): line in view, focus on `Ask fse`, live region the failure once, never `Reviewed 2 of 2`.
- A10: met (AskReview, GetAgents, GetCellThread stubbed in the harness page only; nothing posts). Open the thread → `document.activeElement` is `#thread-01STUBTHREAD .tl-divider`, not the body. One real Tab key → `← Review`, Return → Review with focus on `svc.Greet`'s h2.
- A11: met. `asked` computed `rgb(181, 175, 195)` = `--fg-muted` on the current row (Greet, ✕ in `--danger`) and on the other row (formatName, ? in `--tone`).
- A4, A6, A8: vitest green in the fresh run; words unchanged from round 1. A5, A7 rerun on 8ba6d0d with my round-1 steps (`out/r2-h-run.txt`, `out/r2-a5-state.json`): A5 as round 1 (on disk `question`, no `asked`, no `thread`; focus on the button), and the live region now also says the failure. A7: 58 = 58. A6 in WK: focus on `Reviewed`, `Reviewed 2 of 2` once.
- Busy rule again with AskReview slowed 1.5 s (`out/r2-h-busy.txt`): three presses → one call, two Try again → one. No call before a press; Save → MarkReview only.
- Boundary: the diff against main is the round 1 files plus `Conversation.tsx` and `Conversation.review.test.tsx` (Amendment 5). Conversation.tsx changes only the `slackDraft.threadId` landing: an unlisted thread asks the feed (`api.getAgents`, an existing binding) and waits through `sentWatch`, focus parks on `← Review`, and the landing focuses the divider through `landDivider`. No Go, `app.go`, `wailsjs/`, Needs me, Home, `scripts/`.

change-check round 2 (flags; Changed lists the same 10 files plus the two Conversation ones):
```
## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v3 Boundary' | boundary entry |
| outside boundary | organizer/frontend/src/components/Conversation.review.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/Conversation.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/Review.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/Review.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/SlackView.review.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/SlackView.tsx |  | modified |
| outside boundary | organizer/frontend/src/lib/review.test.ts |  | modified |
| outside boundary | organizer/frontend/src/lib/review.ts |  | modified |
| outside boundary | organizer/frontend/src/stores/board.store.ts |  | modified |
| outside boundary | organizer/frontend/src/styles/review.css |  | modified |
| outside footprint | organizer/frontend/src/components/Conversation.review.test.tsx |  | added |
| outside footprint | organizer/frontend/src/components/SlackView.review.test.tsx |  | added |
| undeclared | organizer/frontend/src/components/Review.test.tsx |  | modified |
| undeclared | organizer/frontend/src/components/ReviewSymbol.test.tsx |  | modified |
| untested? | organizer/frontend/src/components/Review.tsx | Worklist | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | SymbolPane | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | marksOf | no test file names it |
| untested? | organizer/frontend/src/stores/board.store.ts | leaveReview | no test file names it |

21 flags: outside boundary 12, outside footprint 2, undeclared 2, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 4, could not read 0, boundary unreadable 1
```
Explained as in round 1, plus: `outside boundary` Conversation.tsx and Conversation.review.test.tsx are in Amendment 5's boundary. `outside footprint` Conversation.review.test.tsx and SlackView.review.test.tsx: the footprint omits the tests that the boundary allows.

Notes (not findings):
- Note: `landDivider` now runs for every landing in Conversations (a search hit, a ruling, Answer), not only Open the thread. It redirects Tab only while `← Review` is shown, which is when Conversations was opened from the review.
- Note: A10 is only seen with a page-level stub, since no canned post exists (au-ui's G4 stands).

Where the card's findings went (au-review, after au-ui's round 2 pass):
- UI U1, U2, U4: fixed on this card (review-map v3 Amendments 4, 5; A9, A10, A11).
- UI U3, U5: review-view Amendment 5 R26, R27; fse bitácora 2026-10-18 ~11:53, "Held for the next frontend leftovers".
- UI G1: Amendment 4 (A9). G2: Amendment 5 (FR-41). G3: R26. G4 (canned AskReview): fse bitácora, same "Held for the next frontend leftovers" line.
- Builder's "found, not asked" (the `--review` fixture names no `discuss_state_dir`): review-map v3 Amendment 3, and fse bitácora 2026-10-18 ~11:53 (follow-up: `fixture-home.sh` default config sets `discuss_state_dir`). Thread 01M57TKJ left in organizer-fixture by sup82's word.
- My Notes are not findings.
- **Nowhere yet:** au-ui's A1 for aglaea (`asked` after the change word vs R21's "beside its mark"), A2 for aglaea (the pre-press line stays after an ask on a symbol you stay on), and the round 2 observation (Conversations' chat list keeps `channel` highlighted while another chat is shown). So the card stays open.

## UI review
au-ui, 2026-10-18, on 60f74c309524c62bfbf58333e5228258d9fb6eca (every row; the branch did not move). **Verdict: fail**, one severity 3 (U1) against FR-29 at 1024×640. Evidence: `.wt-notes/au-ui/` (`out/` shots and harness logs, `steps/`).

Shared test run: **fresh**, run `c8492051-21087` of 60f74c3 by organizer-probe-au-ui (exit 0; go ok, vitest 75 files / 922 tests; `.wt-notes/au-ui/maketest.log`); au-review reused it.

No mailbox: every run had `discuss_state_dir: <empty mktemp -d>` appended right after `fixture-home.sh --review` (checked each time: `out/dev-config-check.txt`, `out/rb-config-check.txt`, auth off). Every real ask failed before connecting (`open …/tokens.json: no such file or directory`). Nothing of mine reached discuss.

How each state was checked:
- Review build (`make review-build` in my detached worktree). I launched it myself (pid saved), navigated by AXPress on that pid only (init-a → Work → the card → Review the change → Make the map → format.formatName → Question), resized it by AX and shot its window with `screencapture -o -l`. Seen live: `Ask fse, next` (disabled, no note) and `Save`, and the line `Saves the mark and asks fse (the initiative's FSE) in this review's thread. Wakes fse.`, at 1440 (`wk-1440x900-A4-question-nonote-rb.png`) and 1024 (`wk-1024x640-A4-question-nonote-rb.png`). A note cannot be typed by AX (React ignores an AX value), so every state after a press was checked in the harness.
- Tab harness (au-build's copy, read; my own steps `steps/au-ui.txt`, `au-ui-1440.txt`, `fold.txt`), against my own `wails dev -devserver localhost:34259` from a clean clone of 60f74c3, under `harness.lock`. Window offscreen, `isKey: true`, never shown. Logs `out/h-1024x640.txt`, `out/h-1440x900.txt`, `out/h-fold.txt`.
  - A failed ask (real binding, no mailbox) at 1024: the row reads `…, question` with no `asked`, `Reviewed 1 of 2`, focus stays on `Ask fse, next`. Then `Try again`, which reads `Asking…` while it posts and keeps focus when it fails again. Tab order: radios (one stop) → Note → primary → `Save` (when enabled) → `Try again`.
  - The last unmarked symbol (Greet): the primary reads `Reviewed`, then `Ask fse` on Question. A failed press keeps focus on `Ask fse`, the header reads `Reviewed 2 of 2`, `Next to review` is gone, and the live region says `Reviewed 2 of 2` once.
  - The success path was seen with **a stubbed `AskReview` in my harness page only**. The stub calls the real `MarkReview` and returns `asked`/`thread`; no post is attempted. At 1440:
    - `Ask fse, next` marks, moves to Greet's h2, and the live region says `Asked fse`.
    - The row draws `? asked` in `--tone`, with accessible name `…, question, asked`.
    - On Greet, Blocked fails once; `Try again` then succeeds. Focus lands on `Open the thread`, because React reuses the button, so focus does not drop. The panel reads `Asked fse · Open the thread`, the row reads `✕ asked` in `--danger`, and the live region says `Asked fse`.
    - `Open the thread` goes to Conversations with `← Review` first in its toolbar. The stub's thread does not exist, so it lands on the archive. `← Review` goes back to Review with focus on `svc.Greet`'s h2, the same symbol (`wk-1440x900-A4-*.png`).
- vitest (shared run): A4 in the four files (the nobody case `No one to ask here: no cell. Kept in Deltagos.`, the busy `Asking…` on the primary, the store round trip), A6, A8.
- Still holds from rv-polish's UI review, seen again: the §3.4 layouts at 1440 and 1024, the flags (the muted flag's text at the name's indent, 58 = 58), `none found`, the h2 focus on N, `Reviewed n of m`, and Next to review gone when all are marked. Conversations shows nothing new but `← Review` (the diff adds only `ReviewBack` to the toolbar).

Design words against the screen (§3.3 room, Amendments 3 and 4, FR-28, FR-29, FR-38):
- `Ask fse, next` and `Save`: the same, live. `Ask fse`, `Reviewed` (the last): the same, harness. `Save question` and `Save block` (last, nobody to ask): vitest only.
- `Saves the mark and asks fse (the initiative's FSE) in this review's thread. Wakes fse.`: the same, live.
- `No one to ask here: <why>. Kept in Deltagos.`: vitest only (the fixture card's cell has an FSE).
- `Saved here; couldn't ask fse: <first error line>` and `Try again`: the same, harness (see U1 for where it sits).
- `Asking…`: the same on `Try again`, harness. On the primary: vitest only, because the real failure returns in under 40 ms.
- `? asked` / `✕ asked`, `Asked fse` (live region), `Asked fse · Open the thread`, `← Review`: the same, harness with the stubbed binding.

Findings:
- **U1 (3) At 1024×640 a failed ask is not visible: the failure line is below the panel's fold, and nothing else says it failed.**
  - What the person cannot do: tell that the question was not asked. On the last symbol, a failed `Ask fse` looks like a success (the button stays, the header reads `Reviewed 2 of 2`, and the live region says so). That is the "questions pile up unasked" failure v3 is for. Pablo works at 1024 (0059).
  - Where: format.formatName and svc.Greet at 1024×640 (`wk-1024x640-A5-failed.png`, `wk-1024x640-A6-last-failed.png`; the builder's `a5-after.png` shows the same).
  - Evidence (`out/h-fold.txt`): the panel spans 169–624 with scrollTop 0. The failure line spans 630–678. Focus stays on `Ask fse, next` at 566–594. The live region is empty (on Greet it says `Reviewed 2 of 2`). At 1440 the line is in view (522–590).
  - Proposal: scroll the failure line into view (`nearest`) when it appears, keeping focus on the button. Tie it to the button with `aria-describedby`, or say it once in the review's live region. Optionally put it above the ask line, next to the buttons.
- **U2 (2) `Open the thread` lands with focus on the page body.** Design system, Focus and names: navigating lands on the thing named, never the body. After the press, `← Review` is many Tabs away. The landing is Conversation.tsx's existing `slackDraft.threadId` handler, which this card did not change (`out/h-1440x900.txt`, `in-conversations`). Proposal: focus the thread's divider, or `← Review` when the thread is not in the feed yet.
- **U3 (2) The failure line shows a raw error with a path** (`open /var/folders/…/tokens.json: no such file or directory`; a down mailbox reads `dial unix …discuss.sock: connect: …`). FR-29 says "first error line", so this is built as specified. The design system's Empty state says errors say what went wrong and how to fix it. Proposal: map the known causes (no token, socket refused, thread closed) to words with a fix, and keep the raw line in the log.
- **U4 (2) `asked` in `--tone` on the current row is 4.31:1** (11 px semibold, #d946ef on #2f1b55). On the list ground it is 4.85; `--danger` there is 4.61. The `?` glyph had the same pair before this card. Proposal: on `.rv-row.on`, set `asked` in `--fg` with the glyph alone carrying the hue, or use a lighter tone step.
- **U5 (1) `Open the thread` is a `<button class="link">`, but it changes where you are.** Design system: a link changes the place. Proposal: role link, or an `<a>`.

Spec gaps (for the FSE):
- G1: FR-29 says where the failure words read, not that they are in view at 1024 or announced (U1).
- G2: where focus lands in Conversations after `Open the thread` (U2).
- G3: the failure line's words for known causes (U3).
- G4: no fixture or test mailbox lets a real successful ask be seen; I used a page-level stub of the binding. A canned `AskReview` (like `canned_health`) would let a UI review see `? asked` without discuss.

For aglaea:
- A1: R21 says `asked` sits "beside its mark". It is built after the change word (`? format.formatName modified asked`), so the name keeps its indent (`.rv-asked` comment). Is that the reading you meant?
- A2: after a successful ask on a symbol you stay on (the last one, or `Try again`), the panel shows both the pre-press line (`Saves the mark and asks fse … Wakes fse.`) and `Asked fse · Open the thread`. Should the pre-press line go once the mark is asked?

Not verified in WKWebView (vitest, DOM, or the stubbed binding only): a real successful ask and its thread (`? asked`, `Asked fse · Open the thread`, landing on that thread in Conversations: stub only, by the no-mailbox rule); `Asking…` on the primary (too fast); nobody to ask, `Save question` and `Save block` without `, next` (vitest); the closed-thread replacement (FR-26, au-review's); another machine's card; a pointer press on anything (no pointer, by rule).

### Round 2
au-ui (a fresh session), 2026-10-18, on 8ba6d0dd764685f930d1d4659c28588ed7a50f68 for every row; the branch did not move. **Verdict: pass.** No new finding of severity 3 or 4. Evidence is in `.wt-notes/au-ui/r2/`: `out/` holds the harness logs `h-1024x640.txt`, `h-1440x900.txt` and `h-reg-1024x640.txt`, plus the shots; the steps are `steps-*.txt`.

Shared test run: **reused** run `ae6a7c37-38486` of 8ba6d0dd7646 by organizer-probe-au-review. Exit 0, go ok, vitest 76 files / 933 tests (`r2/maketest.log`).

No mailbox: each of my three dev runs and the review build had `discuss_state_dir: <empty mktemp -d>` appended right after `fixture-home.sh --review`, with auth off (`out/*config-check.txt`). Every real ask failed with `open …/tokens.json: no such file or directory`, and every such dir is still empty. Nothing of mine reached discuss.

How each state was checked:
- **Review build** (`make review-build`, detached worktree, my pid, AXPress on that pid only). Seen at 1024×640 and 1440×900 on formatName, with Question and no note: `Ask fse, next`, `Save`, and `Saves the mark and asks fse (the initiative's FSE) in this review's thread. Wakes fse.` Shots: `wk-*-R2-question-nonote-rb.png`. The same as round 1.
- **Tab harness** (my round-1 copy). It ran against my own `wails dev` on :34259 from a clean clone of 8ba6d0d, under `harness.lock`, offscreen, `isKey: true`. Each size used a fresh fixture. The steps are au-build's `b2.txt`, read and reused, plus a contrast check and focus sampling every 20 ms from the press of `Open the thread` until it lands.

Round 1's findings:
- **U1 (3): fixed (A9)**, at 1024×640 and also at 1440×900.
  - formatName at 1024: the failure line is at 576–624, inside the panel's 169–624 (the panel scrolled 54). Focus stays on `Ask fse, next`. `aria-describedby` names the line. The live region says `Saved here; couldn't ask fse: …` once.
  - `Try again`: same place, focus on `Try again`, said once again.
  - The last symbol (Greet, Blocked, `Ask fse`): the line is at 576–624, inside 161–624. Focus is on `Ask fse`. The header reads `Reviewed 2 of 2`. The live region says only the failure line, never `Reviewed 2 of 2` (`wk-1024x640-A9-last-failed.png`).
- **U2 (2): fixed (A10)**, with AskReview, GetAgents and GetCellThread stubbed in my page only; nothing posts.
  - After `Open the thread`, focus went button → `← Review` (parked about 18 ms while the thread was unlisted) → the thread's divider (`Thread rv-fixture: review at stub, open, 1 of 12`). The 20 ms sampler never saw the body after the press.
  - One Tab reaches `← Review`. Return goes back to Review with focus on `svc.Greet`'s h2. The same at both sizes (`wk-*-A10-landed.png`, `wk-*-A10-tab.png`).
- **U4 (2): fixed (A11).** `asked` is rgb(181,175,195), which is `--fg-muted`, on both rows: 7.02:1 on the current row (#2f1b55) and 7.89:1 on the list. The glyphs keep their hue: `?` in `--tone` at 4.85:1, `✕` in `--danger` at 4.61:1, at 11 px semibold (`wk-*-A11-asked-rows.png`).
- **U3 (2) and U5 (1):** unchanged, held by the FSE for the next leftovers (R26, R27). No new verdict. The raw tmp path still shows in the failure line.

Regression: round 1's 1024 steps ran again on a fresh fixture (`h-reg-1024x640.txt`). The same result as round 1:
- Tab order: radios → Note → primary → `Save` → `Try again`.
- The h2 takes focus on N.
- On the last symbol the primary reads `Reviewed`, or `Ask fse` without `, next`; focus stays; the header reads `Reviewed 2 of 2`; `Next to review` is gone.
- The muted flag sits at 58 = name 58 with padding 0. The amber flag keeps 7 px.
- No horizontal scroll at 1024.
- Two differences, neither a finding:
  - Round 1 caught `Asking…` on `Try again` and this run did not (timing; vitest covers it).
  - After N away from a failed symbol, the live region's text stays the old failure line. It is not re-announced, since nothing changed.

Conversations: the round-2 diff adds only `data-review-back` and the `slackDraft.threadId` landing (`landDivider`, which is a plain divider focus when there is no `← Review`, as before; vitest "without ← Review"). Both are in Amendment 5's boundary.

Design words compared to the screen, round 2 only:
- `Saved here; couldn't ask fse: <first error line>` and `Try again`: the same, in view at 1024.
- `asked`: the word is the same; the colour is muted.
- `← Review`: the same. It is the next Tab stop from the divider.
Everything else is as in round 1.

Observation (not this card's): in Conversations the chat list keeps `channel` highlighted while the timeline shows another chat. Round 1's archive landing showed the same, so it predates this card. For the FSE, to look at with the chat list.

Not verified in WKWebView: a real successful ask, `? asked`, `Asked fse · Open the thread`, and landing on a real thread. These were seen only with stubbed bindings in my page, by the no-mailbox rule.

## Done
- 2026-10-18 au-build round 2: A9 (0ae14ff), A11 (4513957), A10 (8ba6d0d) on rv-ask-ui rebased on aba9e8e; gate A4-A11, X0 met; notes `.wt-notes/au-build/progress.md`.
- 2026-10-18 au-build: FR-28, FR-29, FR-38, FR-40 (e0dc71a) and FR-39 (60f74c3) on rv-ask-ui; gate A4, A5, X0, A6, A7, A8 met; notes `.wt-notes/au-build/progress.md`.
