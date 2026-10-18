---
title: "The review's failure words, the thread link, marks in one column, and one list of Needs me verbs"
status: next
repos: [organizer]
branch: lf41-review-words
seat: lw-build
stage: review-map
updated: 2026-10-18
next: "review: lf41-review-words, gate met (W1-W6, X0), afbc2fb"
risk: low
footprint: [frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/styles/review.css, frontend/src/components/Conversation.tsx (aria-current), frontend/src/components/Home.tsx (verbs), frontend/src/lib/verbs.ts, frontend/src/lib/verbs.test.ts, frontend/src/components/Home.waits.test.tsx]
depends_on: []
boundary: ["docs/specs/leftovers-41.md Boundary, lf41-review-words"]
spec: "docs/specs/leftovers-41.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-41.md Acceptance, rows W1-W6 and X0"
ui_review: true
---

## Goal
Pablo reads why an ask failed and what to do, reaches the thread as a link, and reads marks in one column.

## Gate
docs/specs/leftovers-41.md, rows W1-W6 and X0.

## Declared changes
- modified `frontend/src/lib/review.ts:askFailedLine`: the failed ask by cause, home path as `~` (FR-1)
- added `frontend/src/lib/review.ts:askStage`: asked, and whether the note was edited since (FR-4)
- added `frontend/src/lib/review.ts:markControls`: the primary, whether it shows, the muted line (FR-4)
- modified `frontend/src/lib/review.ts:askLine`: the `again` line (FR-4)
- modified `frontend/src/lib/review.ts:primaryOf`: `Ask <seat> again` (FR-4)
- modified `frontend/src/components/ReviewSymbol.tsx:MarkForm`: reads markControls; hides an asking primary once asked; focus to Open the thread when the pressed button unmounts (FR-4)
- modified `frontend/src/components/ReviewSymbol.tsx:AskStatus`: Open the thread is an `<a>` (FR-2)
- modified `frontend/src/components/Review.tsx:Worklist`: `? asked` as one unit in the mark's place, `asked` row class (FR-3)
- modified `frontend/src/styles/review.css`: the unit, the asked row's padding, `.rs-thread` link and ring (FR-2, FR-3)
- modified `frontend/src/components/Conversation.tsx:Conversation`: `aria-current="true"` on the chat row shown (FR-5)
- added `frontend/src/lib/verbs.ts`: VERBS, VERB_LIST, ruleVerb (FR-6)
- modified `frontend/src/components/Home.tsx`: every row verb and label from VERBS; InboxRow exported for the test (FR-6)
- modified `frontend/src/lib/review.test.ts`: W1, W4
- modified `frontend/src/components/ReviewSymbol.test.tsx`: W2, W4; A4/A9 words follow FR-1
- modified `frontend/src/components/Review.test.tsx`: W3 markup and CSS
- added `frontend/src/components/Conversation.test.tsx`: W5
- added `frontend/src/lib/verbs.test.ts`: W6, the list
- modified `frontend/src/components/Home.waits.test.tsx`: W6, every row kind rendered
Risky:
- `MarkForm`: once asked with the note as asked, Question/Blocked has no primary; moving on is N or the list (Reviewed and Save stay)
- `askFailedLine`: matching is on error text; a new Go error wording falls to "anything else"
Not changed, on purpose:
- `Conversation.tsx` landing logic: the class and the new attribute already follow the chat shown in WK; only the attribute was added (boundary)
- any Go, `app.go`, `frontend/wailsjs/`, the store, `lib/queue.ts:launchVerb` (outside the boundary; Home compares it to `VERBS.open`)

## UI review
lw-ui, 2026-10-18, on afbc2fb373651439b7328bfa31ee81e63badabc3 for every row (the branch did not move). **Verdict: pass.** No finding of severity 4 or 3. Evidence: `.wt-notes/lw-ui/` (`out/h-1024x640.txt`, `out/h-1440x900.txt`, `out/wk-*.png`, `steps/`).

Shared test run: **reused** run `aadad5cb-19360` of afbc2fb37365 by organizer-probe-lw-review (exit 0; go ok, vitest 78 files / 970 tests; `.wt-notes/lw-ui/maketest.log`).

No mailbox: both dev runs and the review build had `discuss_state_dir: <empty mktemp -d>` appended right after `fixture-home.sh --review`, checked once each (`out/nodiscuss-check.txt`, `out/rb-config-check.txt`), auth off. The one real ask per run failed before connecting (identity words); each dir was still empty afterwards. Nothing of mine reached discuss.

How each state was checked:
- **Review build** (`make review-build` in my detached worktree, pid saved): it started, but AX returned no window (resize -25205, the tree only the application) and `screencapture -o -l <its window>` said "could not create image from window". That is the locked-screen case, so no review-build shots. I quit it by its pid. Everything below rests on offscreen WebKit.
- **Tab harness** (au-ui's copy, the same as lw-build's, read). It ran against my own `wails dev -devserver localhost:34263` from a clean clone of afbc2fb, under `harness.lock`, offscreen, `isKey: true`, with a fresh fixture at each size. The steps are lw-build's `w.txt`, read and reused, plus my own: Tab order in the asked state, `Ask fse again, next` while Greet is unmarked, R24's landing and Tab, the asked unit's colours, and Home's verbs. After the real failed ask, AskReview, GetAgents and GetCellThread were stubbed in my page only.
- vitest (the shared run): W1, W4, W5, W6, and the W2/W3 markup.

Rows, both sizes equal unless said:
- **R26 / W1**: a real failed ask in WK reads `Saved here; couldn't ask fse: Deltagos has no discuss identity for this cell. organizer doctor says why.`, with no `/Users/`, and focus stays on `Ask fse, next`. The other three causes are vitest only (`review.test.ts` W1: the socket text, `409`/`closed`, `open /Users/x/y: denied` → `open ~/y: denied`).
- **R27 / W2**: `Open the thread` is `A href="#"`. One Tab from Save reaches it, with `:focus-visible`, `solid 2px rgb(192,171,254)` and text `--accent-fg` (8.9:1 on the ground). Return opens Conversations. It is drawn like `.rd-init`.
- **R24 (still holds)**: after the landing, focus is on the divider `Thread rv-fixture: review at stub, open, 1 of 12`. One Tab reaches `← Review`, and Return goes back to formatName's h2.
- **R28 / W3**: glyph left edge 41 on `? asked` formatName = 41 on `✓` Greet. `asked` spans 56.84–88.84, before the name at 93.97. The wrapped flag starts at 93.97, the same as the name. Accessible name `…, question, asked`. On the current row, `asked` is rgb(181,175,195) on #2f1b55 (7.0:1); the glyph is `--tone` (`wk-*-w3-rows.png`, `wk-*-R28-rows-back.png`).
- **R29 / W4**: after an ask, the buttons are `[Save]` (disabled), with no ask line, the text `Asked fse · Open the thread`, and focus on the link. Editing the note while Greet is unmarked gives `Ask fse again, next`; after Greet is marked it gives `Ask fse again`. The line then reads `Saves the mark and asks fse again in this review's thread. Wakes fse.`, and pressing the button asks again (stub call 2) (`wk-*-R29-asked.png`, `wk-*-R29-again-next.png`, `wk-*-w4-edited.png`).
- **R30 / W5**: after Open the thread, the title is `fse`, `aria-current="true"` is on fse only, channel has none, and the `.active` class agrees (`wk-*-w5-chats.png`). I did not see au-ui's mismatch (title archive with channel lit). Both the class and the attribute derive from the same `focus`/`view` state (`chatKey`).
- **FR-6 / W6**: on Home, the fixture's Needs me rows read `Rule` (aria `Rule init-a 0002` …). Waiting on others reads `Open` (aria `Open init-a 0005`). Before this card both were the same strings. The other kinds (Answer, Agents, Launch, Show, `Rule · draft`) are vitest only (`Home.waits.test.tsx` W6).
- **Conversations**: the diff adds only `aria-current` on the seven chat rows and one comment. **Home**: the diff changes only where the verb strings come from (`Hide` stays a literal).
- **Rest of Review**, as in rv-ask-ui round 2: the failure line in view with focus on the button, `Reviewed 1 of 2`, the h2 on N, the last symbol's `Reviewed` without `, next`, and no horizontal scroll at 1024.

Design words compared to the screen (WK = harness; vt = vitest only):
- `Saved here; couldn't ask fse: Deltagos has no discuss identity for this cell. organizer doctor says why.`: same, WK.
- `… discuss isn't running. organizer doctor says why.`: vt. `Saved here; the review's thread is closed. Try again opens a new one.`: vt. `… <first line, ~>`: vt.
- `Asked fse · Open the thread`: same, WK.
- `Saves the mark and asks fse again in this review's thread. Wakes fse.`: same, WK.
- `Ask fse again, next` and `Ask fse again`: same, WK.
- `? asked`: same, WK. `✕ asked`: vt.
- `Rule`, `Open`: same, WK. `Rule · draft`, `Answer`, `Agents`, `Launch`, `Show`: vt.

Findings (none 4 or 3):
- **LW1 (1) Tab past `Open the thread` in the asked state lands on `body`.**
  - What Pablo cannot do: keep his place with Tab once the panel ends.
  - Where: formatName, asked, at both sizes (`out/h-*.txt`, `ui_tab3`). The order is radios → Note → `Open the thread` → BODY.
  - Evidence: the link is now the last focusable on the page. Before, the last stop was `Try again`/`Save`. This is the document's end, so it is likely not new; I did not run it on main.
  - Proposal: none for this card. For aglaea, whether the Review screen's last stop should wrap.
- **LW2 (1) Any `/Users/<other>` becomes `~`.** `read /Users/pablo/a and /Users/ana/b` reads `~/a and ~/b` (vitest), which shows another user's home as yours. It is built as FR-1 says. Proposal: shorten only `$HOME`.
- **LW3 (1) `closed` anywhere in the line reads as a closed thread.** A socket error such as `use of closed network connection` that does not name `discuss.sock` would read "the review's thread is closed". It is built as FR-1 says (the match is on the error text). Proposal: match the Go error's own text for a closed thread.

Spec gaps (for the FSE):
- S1: FR-4 does not say what the asked panel offers to move on: with the primary hidden, only N / Next to review moves on. The builder's reading. I find it fine.
- S2: FR-1's `/Users/<name>` covers every user, not only the reader (LW2).

For aglaea:
- A1: in the asked, unedited state the panel has a lone disabled `Save` above `Asked fse · Open the thread` (`wk-1024x640-R29-asked.png`). Keep Save there, or hide it until something changes?
- A2: LW1, the Tab stop after the last panel control.
- A3: the chat list's `aria-current="true"` (as FR-5 says) beside the design system's "exactly one `aria-current="page"` per screen". I read list-level `true` as outside that rule, the same as the Review worklist. Confirm.

Not verified in WKWebView: the review build itself (screen locked: no AX window, no screencapture). The success path (`? asked`, `Asked fse · Open the thread`, `again`, the chat list after Open the thread) was seen with stubbed bindings only, by the no-mailbox rule; a real ask waits on lf41-fixture-launch's `canned_post`. Also not verified: the socket, closed-thread and other-error words (vitest); `✕ asked`; Answer, Agents, Launch, Show and `Rule · draft` rows (the fixture has none; vitest); a pointer press on anything (no pointer, by rule).

## Done
- 2026-10-18 lw-build: FR-1 to FR-6 on branch lf41-review-words (9b36a71, f87b25b, 1425e0a, afbc2fb), rebased on main ad4a3c2. Gate met: W1, W4-W6 vitest; W2, W3 vitest and Tab harness at 1024x640 and 1440x900 (W1, W4 also in WK); X0 from a clean clone at afbc2fb (make test 0, pnpm run build 0, wails build 0, porcelain empty). Not merged. Evidence and how to reach each state: `.wt-notes/lw-build/progress.md`.

## Notes
- FR-4's "editing the note" is read as the note only: choosing Blocked over an asked Question with the same note asks nothing (no primary) until the note changes; Save saves it without asking.
- The harness found an asked row's wrapped flags left at the old indent after the first cut of FR-3; fixed in afbc2fb (FR-36 holds: flag 93.97 = name 93.97).
