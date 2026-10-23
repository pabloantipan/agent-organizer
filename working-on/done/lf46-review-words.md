---
title: "The review panel's last loose words: no false hint, the asked seat's chat at once, unique ids, the not-here line kept"
status: done
repos: [organizer]
branch: lf46-review-words
seat: rw-build
reviewer: rw-review, rw-ui
stage: review-map
updated: 2026-10-23
next: "merge lf46-review-words (5e8510c): review pass (rw-review), UI review pass (rw-ui)"
risk: low
footprint: [frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/styles/review.css, frontend/src/components/Conversation.tsx (landing), frontend/src/stores/board.store.ts (openSlack seat)]
depends_on: []
boundary: ["docs/specs/leftovers-46.md Boundary, lf46-review-words"]
spec: "docs/specs/leftovers-46.md (FR-4 to FR-8)"
gate: "docs/specs/leftovers-46.md Acceptance, rows W1-W4 and X0"
ui_review: true
review: pass
---

## Goal
The review panel never says something untrue, and Open the thread lands where the question went.

## Gate
docs/specs/leftovers-46.md, rows W1-W4 and X0.

## Declared changes
- modified `frontend/src/lib/review.ts:WORDS`: `chooseMark` removed (FR-4)
- deleted `frontend/src/lib/review.ts:noteHint`: the hint was untrue, the primary saves an unmarked note ✓ (FR-4, AS1)
- modified `frontend/src/lib/review.ts:domId`: escapes every unsafe character, `_` included, as `_<hex>_`, so ids are injective (FR-6)
- added `frontend/src/lib/review.ts:editorShown`: keeps the refused place not-here while re-reading and when the re-read is for another map_head (FR-7)
- modified `frontend/src/lib/review.ts:askOf`: `asked_note` empty falls back to the note (FR-8)
- modified `frontend/src/components/ReviewSymbol.tsx:ReviewSymbol`: keeps the refused place (`left`, `rereading`) and draws through `editorShown` (FR-7)
- modified `frontend/src/components/ReviewSymbol.tsx:MarkForm`: the hint line, its id and aria-describedby removed (FR-4)
- modified `frontend/src/styles/review.css`: `.rs-note-hint` rule and its comment removed (FR-4)
- added `frontend/src/components/Review.tsx:openThread`: Open the thread passes the asked seat to openSlack (FR-5)
- modified `frontend/src/components/Review.tsx:Review`: onOpenThread uses `openThread` (FR-5)
- modified `frontend/src/components/Conversation.tsx:unlistedLanding`: `start(id, seat)` starts on the seat's chat, channel only with none; `asked` with the same seat does not show again (FR-5, AS3)
- modified `frontend/src/components/Conversation.tsx:Conversation`: the unlisted landing starts with `focus` (FR-5)
- modified `frontend/src/lib/review.test.ts`, `frontend/src/components/ReviewSymbol.test.tsx`, `frontend/src/components/Review.test.tsx`, `frontend/src/components/Conversation.test.tsx`, `frontend/src/components/Conversation.review.test.tsx`: gate rows W1-W4; old rows pinning the hint, the old domId and `unlisted.start(id)` updated
Risky:
- `domId`: ids change shape (`a b/c.ts` → `a_20_b_2f_c_2e_ts`); every user builds both ends with it, nothing stores them
- `unlistedLanding.start`: with a seat, Conversations never shows channel; a review whose addressee is not the seat the thread was asked of moves once `asked` answers, as before
Not changed, on purpose:
- `frontend/src/stores/board.store.ts:openSlack`: already sets `slackFocus` from its second argument
- `frontend/src/lib/review.ts:editorAt`: a first status read for another head still draws nothing (E3)

## Done
- 2026-10-23 rw-build: FR-4 to FR-8 on `lf46-review-words` (105c9aa, 5e8510c); W1-W4 fail on main, pass on the branch; X0 passes from a clean clone (`.wt-notes/rw-build/progress.md`)

## Notes
- FR-8's frontend fallback alone does not survive a Save of an old asked mark until lf46-runs-seat's FR-3 (SetMark keeps the previous note as AskedNote) merges; the two cards close it together.

## Review

**Verdict: pass.** Unmet gate items: none. Reviewed `lf46-review-words` at 5e8510c from a clean clone; reviewer `rw-review`, 2026-10-23.

### change-check

```text
  change-check: working-on/lf46-review-words.md
  risk: low
  repo organizer: base 61ae1903f (default origin/main) ... head lf46-review-words (clone HEAD 5e8510cf2, on detached) 5e8510cf2; 10 files, 8 flags; read in /Users/pabloantipan/organizer/.wt-notes/rw-review/clean

  ## Changed

  - organizer/frontend/src/components/Conversation.review.test.tsx (modified, test)
  - organizer/frontend/src/components/Conversation.test.tsx (modified, test)
  - organizer/frontend/src/components/Conversation.tsx (modified): Conversation, unlistedLanding
  - organizer/frontend/src/components/Review.test.tsx (modified, test)
  - organizer/frontend/src/components/Review.tsx (modified): Review, openThread
  - organizer/frontend/src/components/ReviewSymbol.test.tsx (modified, test)
  - organizer/frontend/src/components/ReviewSymbol.tsx (modified)
  - organizer/frontend/src/lib/review.test.ts (modified, test)
  - organizer/frontend/src/lib/review.ts (modified): askOf, editorShown, noteHint, domId
  - organizer/frontend/src/styles/review.css (modified)

  ## Tests touched

  - organizer/frontend/src/components/Conversation.review.test.tsx
  - organizer/frontend/src/components/Conversation.test.tsx
  - organizer/frontend/src/components/Review.test.tsx
  - organizer/frontend/src/components/ReviewSymbol.test.tsx
  - organizer/frontend/src/lib/review.test.ts

  ## Risky (declared)

  - `domId`: ids change shape (`a b/c.ts` → `a_20_b_2f_c_2e_ts`); every user builds both ends with it, nothing stores them
  - `unlistedLanding.start`: with a seat, Conversations never shows channel; a review whose addressee is not the seat the thread was asked of moves once `asked` answers, as before

  ## Not changed, on purpose (declared)

  - `frontend/src/stores/board.store.ts:openSlack`: already sets `slackFocus` from its second argument
  - `frontend/src/lib/review.ts:editorAt`: a first status read for another head still draws nothing (E3)

  ## Flags

  | flag | where | symbol | detail |
  |---|---|---|---|
  | outside boundary | organizer/frontend/src/components/Conversation.review.test.tsx |  | modified |
  | outside footprint | organizer/frontend/src/components/Conversation.review.test.tsx |  | modified |
  | outside footprint | organizer/frontend/src/components/Conversation.test.tsx |  | modified |
  | undeclared | organizer/frontend/src/components/Conversation.review.test.tsx |  | modified |
  | undeclared | organizer/frontend/src/components/Conversation.test.tsx |  | modified |
  | undeclared | organizer/frontend/src/components/Review.test.tsx |  | modified |
  | undeclared | organizer/frontend/src/components/ReviewSymbol.test.tsx |  | modified |
  | undeclared | organizer/frontend/src/components/ReviewSymbol.tsx |  | modified |
  | declared, not changed |  | frontend/src/lib/review.ts:WORDS | no matching change |
  | declared, not changed |  | frontend/src/components/ReviewSymbol.tsx:ReviewSymbol | no matching change |
  | declared, not changed |  | frontend/src/components/ReviewSymbol.tsx:MarkForm | no matching change |

  11 flags: outside boundary 1, outside footprint 2, undeclared 5, declared, not changed 3, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```

Every flag explained:
- `outside boundary` and `outside footprint` on `Conversation.review.test.tsx`, `outside footprint` on `Conversation.test.tsx`: the spec's Boundary (lf46-review-words) allows `components/Conversation.tsx` "and its tests"; both are its tests and the changes are the landing's source-string assertion (`unlisted.start(id, focus);`) plus the W2 block. The card's `footprint:` omits them; the boundary is the authority.
- `undeclared` on the four test files: they are declared in one bullet with five paths; change-check reads only the first.
- `undeclared` on `ReviewSymbol.tsx` and `declared, not changed` on `ReviewSymbol.tsx:ReviewSymbol` and `:MarkForm`: change-check named no symbols for this file; the diff's hunks are inside `ReviewSymbol` (`left`/`rereading`, `editorShown`, lines 51-70) and `MarkForm` (the hint, its id and `aria-describedby` removed, 338-356). Declared and changed.
- `declared, not changed` on `review.ts:WORDS`: the diff removes `chooseMark` from the `WORDS` object; change-check does not attribute a const object's member.
- Outside the boundary: nothing. `board.store.ts`, Go code, `frontend/wailsjs/`, `package.json`, the lockfile and `go.mod` are untouched; no new dependency (`new dependency 0`).

### Fails on main

The branch's five test files copied onto a main clone (644c47b, the merge base, same code as 61ae190), `npx vitest run` on them: `Tests  14 failed | 180 passed (194)`. Per row:
- W1: `review.test.ts > W1 (FR-4)`: `expected [ …(39) ] to not include 'Choose a mark to save this note.'`; `W1 (FR-8)`: `expected { asked: true, askedNote: '' } to deeply equal { asked: true, askedNote: 'q' }`; `ReviewSymbol.test.tsx > W1 … an old asked mark (asked_note empty)`: `expected ' … Ask sup87 again, next … ' not to contain 'Ask sup87'` (main offers an ask on the saved, already asked mark); `… an unmarked symbol with a note`: `expected '…' not to contain 'noteHint'`.
- W2: `Conversation.test.tsx > W2 … the landing starts on the seat it was opened with`: `expected 'channel' to be 'seat:sup87'`; `Review.test.tsx > W2`: `TypeError: openThread is not a function`.
- W3: `review.test.ts > W3 (FR-6)`: `expected 1 to be 4` (all four raws share one id on main).
- W4: `review.test.ts > W4 (FR-7)` and `ReviewSymbol.test.tsx > W4`: `TypeError: editorShown is not a function`.

### Rows

- W1 (FR-4, FR-8): met. The rendered panel of an unmarked symbol with `to` set has no `Choose a mark`, no `rs-note-hint`, no `>Save<`, and shows `Reviewed, next`; `markPress` with the primary saves `["reviewed", "why the comma?"]`. The old asked mark (`asked` set, `asked_note: ""`) renders `Asked sup87 · Open the thread` with no ask, and edited offers `Ask sup87 again, next`. `askOf` is now `asked_note || note`.
- W2 (FR-5): met. `openThread` passes `to.seat` (null for `""` or no addressee); the store sets `slackFocus` and `slackDraft` in one `set`, and `SlackView` passes `slackFocus` as `focus`, so the first render (`renderToStaticMarkup`, no effects) has the seat's row current and channel not; `unlistedLanding.start(id, seat)` shows that seat, `asked` with the same seat does not show it again, and `feed` lands the thread. With no seat: `show channel`, then `land` (A9 RS3).
- W3 (FR-6): met. Every character outside `[A-Za-z0-9-]`, `_` included, becomes `_<hex>_`, with the `u` flag so an astral character is one escape. The escape is decodable left to right (a `_` always opens an escape, the next `_` closes it), so the map is injective per prefix; the test covers `a_20_b`, `a_5f_b`, `_`, `_5f_`, `_20_`, `é`, `😀` and `""`, all distinct and all matching `^[A-Za-z][A-Za-z0-9_-]*$`. Every caller builds both ends of a pair with the same call: `noteId` (label `htmlFor` and textarea `id`), `failedId` (`aria-describedby` and the failed line's `id`), `editorFailedId` (`EditorAction` `describedBy` and `EditorFailed` `id`); nothing selects these ids by a literal string outside the tests.
- W4 (FR-7): met. `editorShown(at, left, rereading)` keeps `{...left, dir: ""}` while re-reading and whenever the re-read gives `null` (another `map_head`); the panel drawn with it shows `<span class="meta rs-not-here">Not checked out here at c176574.</span>` and no `Open in editor`. A re-read for this head gives what it says (the button back with a dir, the line without one). `left` resets when the initiative, card or head changes.
- Words: `Not checked out here at <short sha>.` (`notCheckedOut`, unchanged), `Ask <seat> again, next` and `Asked <seat> · Open the thread` match the spec and Amendment 10; `Choose a mark to save this note.` is gone from WORDS, the component and review.css.
- X0: met. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` from the clean clone was **fresh**, run `4c406a27-81063` at 5e8510c (rw-ui reused it): go tests ok, vitest `Test Files 78 passed (78)`, `Tests 1024 passed (1024)`, exit 0. `test-lease run -- pnpm run build`: exit 0. `test-lease run -- wails build`: exit 0, `Built '…/Deltagos.app/Contents/MacOS/organizer'`; `frontend/wailsjs/runtime` untouched. `git status --porcelain`: empty.

### Notes (not blocking)

- Note: the W2 render test (`focus="fse"`) passes on main by itself; it shows that a seat given to Conversations is current on the first render. What fails on main is the chain above it (`openThread`, `unlistedLanding.start` with a seat). The proof is the chain, not that one render. To the FSE, as a note on how R38-style rows are tested.
- Note: in this initiative the cell roster is only `fse`, so the addressee is often a supervisor (`sup87`) that has no row in the chat list. Rendered on the branch with `focus="sup87"`: the title reads `sup87`, channel is not current, and **no row is current** (R30's "the current row is the chat shown" cannot hold for a seat that has no row). This was already true on main once the landing reached that seat; it is not this card's. To the FSE, for rw-ui's view.
- Note: `domId` is injective per prefix only (`domId("a", "b-c")` equals `domId("a-b", "c")`), as the builder recorded; today's prefixes `rs-note`, `rs-failed` and `rs-editor-failed` cannot collide that way. To the FSE if a prefix is ever added.
- Note: FR-8 survives a Save only together with lf46-runs-seat FR-3 (as the card's Notes say). Goes to card `lf46-runs-seat`.

## UI review

rw-ui, 2026-10-23. Every row checked on 5e8510c (the branch did not move while I worked). **Verdict: pass.** No finding of severity 4 or 3 against leftovers-46 FR-4 to FR-8 or review-view Amendment 10 (AS1, AS3, R37 and R38 amended). Evidence is in `.wt-notes/rw-ui/`: harness logs `out/h-1024x640.txt` and `out/h-1440x900.txt`, the shell steps in `out/driver.log`, shots `out/wk-*.png` and `out/rb-*.png`, AX dumps `out/rb-ax-*.txt`, and `out/killed.txt`.

Shared test run: **reused**. The run was `4c406a27-81063` of 5e8510cf2948, run by rw-review: exit 0, go ok, vitest 78 files / 1024 tests (`x0-make-test.txt`).

No mailbox, no editor. Each fixture was `--review --canned-post` and `auth: off`, with exactly one `discuss_state_dir:` under its own temp dir (`out/dev-config-check.txt`, `out/rb-config-check.txt`). The probe was stubbed and `editor:` was a stub that logs its arguments. The one `Open in editor` press (W4) was refused before any editor ran, and `out/editor-calls.txt` was never written. The asks went only to the fixture's `posts.jsonl`.

How each state was checked:
- **WKWebView, Tab harness.** I used as-ui's `tabharness.swift` (read first, unchanged, rebuilt), offscreen with `isKey: true`, under `harness.lock`. It ran against my own `wails dev -devserver localhost:34265` from a clean clone of 5e8510c, with a fresh fixture at 1024×640 and again at 1440×900. Shell steps came from `driver.sh`, which watches for markers and touches only the fixture's temp copy and state.json. The two sizes read the same.
  - **W1 / R37 amended**, on format.formatName, unmarked, with `why this?` typed:
    - The only button is `Reviewed, next`. There is no Save and no hint line. `Choose a mark` is nowhere in the body text. The note has no `aria-describedby`.
    - Reading order: the radios, `Note`, the textarea, `Reviewed, next`.
    - Tab from the note reaches `Reviewed, next` (2px ring rgb(192,171,254), offset 2), then body.
    - The press saves `reviewed` with note `why this?` (in `driver.log`'s state.json) and moves focus to the next symbol's h2. The row reads `✓`.
  - **W1 / FR-8.** The asked Greet mark was seeded with `asked_note` removed and note `q`.
    - Unedited, the panel reads `Asked fse · Open the thread` alone: no Save, no `again`.
    - Typing `2` brings `Ask fse again`, `Save` and `Saves the mark and asks fse again in this review's thread. Wakes fse.`.
  - **W2 / R38 amended.** I asked from Greet (canned, so the thread `canned-1` is never in the feed) and pressed `Open the thread`.
    - A MutationObserver and rAF recorder logged every commit for 4 s. It recorded one state only, from the first commit of Conversations (t≈870 ms): `sub: conversations`, `slackFocus: fse`, title `fse`, `aria-current="true"` and `.chat.active` both on the `fse` row. Channel was never current.
    - The fill is rgba(138,63,252,.18) on that row alone.
    - The one `aria-current="page"` is the crumb. Focus is on `← Review`.
    - At 1440, the People panel also marks fse `true` in its own list (one per list, A8 A3).
  - **W3**: the note's id is `rs-note-ts_3a_web_2f_src_2f_format_2e_ts_23_formatName`. `querySelector('#'+id)` finds it, and it matches `^[A-Za-z][A-Za-z0-9_-]*$`. The four collision inputs are vitest W3's (fresh in the reused run).
  - **W4 / FR-7**:
    - I checked out rv-fixture in the fixture's init-a, and the button `Open in editor` showed.
    - I moved the branch to `review-second` and made a map at the new head with the review build's `organizer review`, then pressed the button.
    - The button is gone and the file line reads `web/src/format.ts 1-4  Not checked out here at f1b8102.` in 12px rgb(181,175,195) (`--fg-muted`, sm). It still reads so at 6 s.
    - Focus is on the h2, and there is no `Error:` on screen.
  - No horizontal scroll (1024/1024, 1440/1440).
- **Review build** (`make review-build` in my detached worktree). I saved its pid, used AX and AXPress on that pid only, and shot its window (51444) with `screencapture -o -l` at 1440×900 and 1024×640. The screen was unlocked.
  - Unmarked formatName: `Reviewed, next` only, no line under the note (`rb-1024x640-W1-unmarked.png`). AXPress saved `reviewed`.
  - The seeded old asked Greet mark: the AX row reads `Greet, modified, question, asked`, and the panel reads `Asked fse` + AXLink `Open the thread`, with no Save.
  - AXPress `Open the thread`: the `fse 1` row is `.chat.active`, the title is `@ fse`, and AX focus is on `← Review` (`rb-1024x640-W2-landing-0s.png`, taken right after the press; `rb-1440x900-W2-landing.png`).
  - W4 as in the harness: `Open in editor`, then after the move and the press `Not checked out here at 17ab3cb.` and focus on the h2 (`rb-1440x900-W4-not-here.png`, `rb-1024x640-W4-not-here.png`).
- **Rest of the panel against lf44's UI review**, unchanged at both sizes:
  - the header `<head> ← <base> · 2 symbols changed, 0 tests` and `Reviewed n of 2 · 1 must-visit left`;
  - the h2 focused when a symbol opens;
  - the file line with `Not checked out here at <sha>.`;
  - `? asked` at the mark's place before the name;
  - `Open the thread` a link;
  - the 2px ring;
  - at 1440 the facts sit beside the diff, at 1024 under it.

Words, design vs screen:
- `Reviewed, next` / `Reviewed` read `Reviewed, next` / `Reviewed`. Same.
- `Ask <seat>` (last symbol) reads `Ask fse`. Same.
- `Ask <seat> again` reads `Ask fse again`. Same.
- `Saves the mark and asks <seat> again in this review's thread. Wakes <seat>.` reads `Saves the mark and asks fse again in this review's thread. Wakes fse.`. Same.
- `Asked <seat> · Open the thread` reads `Asked fse · Open the thread`. Same.
- `Not checked out here at <short sha>.` reads `Not checked out here at 17ab3cb.`. Same.
- `? asked` and `← Review`: same.
- `Choose a mark to save this note.`: absent, as AS1 retires it.

Findings (none of severity 4 or 3):
- **UW1 (2), for aglaea**:
  - What the person cannot do: know that a newer map exists while the Review screen is open. After the branch moved and a map was made at the new head, the screen keeps the old map's header (`17ab3cb ← 9bbdc53`) with no `The branch moved …` line, because the header's status is read when the screen opens. Only the editor line re-reads.
  - Where: `rb-1440x900-W4-not-here.png`.
  - Evidence: the W4 state, both engines.
  - Severity: 2. Not this card's (FR-7 asks only for the line), and the move was made outside the app.
  - Proposal: when the panel's re-read answers for another map_head, the header could take §4's moved line.
- **UW2 (1), for aglaea**:
  - What the person cannot do: nothing is lost. A reviewed, unedited symbol still draws the primary `Reviewed` (`Reviewed, next` while one is left), which saves the same mark again. A8 A1's "only when there is something to save" covers Save, not the primary.
  - Where: `rb-1024x640-W4-not-here.png`.
  - Evidence: AX and the harness `W1_formatName_reopened` show `Reviewed, next` on a ✓ symbol.
  - Severity: 1. It was already there before this card.
  - Proposal: aglaea decides whether a marked, unedited symbol's primary is just `Next to review` or stays.

Spec gaps (for the FSE):
- FR-7 says what the editor line shows after a re-read for another head, but not what the header says then (UW1).

For aglaea: UW1, UW2.

Not verified in WKWebView:
- The W3 collision set (`a b`, `a_b`, `a.b`, `a/b`): the fixture has no such paths. vitest W3 covers it in the reused run; one real id was checked in the DOM.
- The FR-8 edited state typed in the review build: AX cannot type, so that state was typed in the harness. The review build showed the seeded unedited state.
- A live mailbox where `asked` names a seat other than the review's: no mailbox by rule (vitest W2/K4).
