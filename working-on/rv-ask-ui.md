---
title: "Ask <seat> on a Question or Blocked mark, and the thread it opened"
status: now
repos: [organizer]
branch: rv-ask-ui
seat: au-build
stage: review-map
updated: 2026-10-18
next: "fix UI review U1 (sev 3): at 1024x640 a failed ask's line is below the panel's fold and nothing else says it failed; scroll it into view and announce it (code review passed, au-review)"
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/stores/board.store.ts (openSlack thread, review place), frontend/src/components/SlackView.tsx (← Review)]
depends_on: [rv-ask-data, rv-polish]
boundary: ["docs/specs/review-map.md v3 Boundary, rv-ask-ui"]
spec: "docs/specs/review-map.md (v3, FR-28, FR-29; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows A4, A5 and X0; v3 Amendment 1 rows A6, A7; Amendment 2 row A8; Amendment 4 row A9"
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

## Declared changes
- modified `frontend/src/lib/review.ts`: `askLine`, `askedLine`, `askFailedLine`, `firstLine`, `saidAfter`, `lastToReview`, `Addressee`, `Via`; `primaryOf` asks and drops `, next` on the last; `affectedLine` takes the list; `Row.asked`, `marksOf`, `rowName`; WORDS.v3 replaced
- modified `frontend/src/components/ReviewSymbol.tsx`: the ask (`AskReview`), `markPress`, `AskStatus`, links say their list
- modified `frontend/src/components/Review.tsx`: `ReviewAddressee`, the asked row, the live region (`saidAfter`), `via`, `last`, Open the thread, focus on return
- modified `frontend/src/stores/board.store.ts`: `openSlack` with a thread, `reviewBack`, `backToReview`, `leaveReview` drops `reviewBack`
- modified `frontend/src/components/SlackView.tsx`: `ReviewBack` (`← Review`) in the toolbar
- modified `frontend/src/styles/review.css`: `.rv-asked`, `.rs-ask-line`, `.rs-asked`, `.rv-flag.muted` padding
- modified `frontend/src/lib/review.test.ts`, `frontend/src/components/ReviewSymbol.test.tsx`, `frontend/src/components/Review.test.tsx`: A4, A6, A7, A8
- added `frontend/src/components/SlackView.review.test.tsx`: the store round trip and `← Review` (A4)
Risky:
- `leaveReview`: every navigation naming a screen now also drops `reviewBack`
- `openSlack`: a thread not yet in the 10 s feed lands Conversations on the archive (Conversation.tsx's draft handler, unchanged)
Not changed, on purpose:
- any Go, `app.go`, `frontend/wailsjs/`: the bindings sufficed
- `Conversation.tsx`: the existing `slackDraft.threadId` landing is used as is

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

## Done
- 2026-10-18 au-build: FR-28, FR-29, FR-38, FR-40 (e0dc71a) and FR-39 (60f74c3) on rv-ask-ui; gate A4, A5, X0, A6, A7, A8 met; notes `.wt-notes/au-build/progress.md`.
