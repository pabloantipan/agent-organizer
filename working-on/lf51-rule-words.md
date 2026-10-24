---
title: "The rule box and the Decisions list speak a question record: chosen in full, per-answer floors, question words in the legend, what is missing, the right prompt"
status: next
repos: [organizer]
branch: lf51-rule-words
seat: l51-words
reviewer: l51-words-review, l51-words-ui
stage:
updated: 2026-10-24
next: "review: lf51-rule-words, W5-W8 (W6 fixed, W7 as amended) and X0 pass, 8e504fb"
review: pass
depends_on: [lf49-rule-questions]
boundary: ["docs/specs/leftovers-51.md Boundary, lf51-rule-words"]
spec: "docs/specs/leftovers-51.md (FR-7 to FR-11)"
gate: "docs/specs/leftovers-51.md#Acceptance → gate"
ui_review: true
---

## Goal
Pablo reads and rules a record with several questions as easily as a plain one.

## Gate
docs/specs/leftovers-51.md, rows W5-W8 and X0; the UI review checks rule-questions Q1 to Q5.

## Done
- 2026-10-24 l51-words: FR-7 to FR-11 on branch lf51-rule-words (7d08b05, f20840e, 61d9d41, rebased on main 48c77ac); W5-W8 fail on main (7 of 13), pass on the branch; X0 passes from a clean clone (vitest 83 files, 1129 tests; build; wails build; porcelain empty). Progress and reviewer commands: .wt-notes/l51-words/progress.md.
- 2026-10-24 l51-words, review round 1: W6 fixed (b7e3dc6, `questionWords` strips only paired emphasis and backticks; code-span text, in-word `_` and a lone `*` kept) and UW1 per Amendment 1 (8e504fb, the missing text is the foot's own first row); both new checks fail on the reviewed code and pass now; rebased on main 24938f9; X0 passes from a clean clone at 8e504fb (vitest 83 files, 1131 tests; build; wails build; porcelain empty).

## Declared changes
- modified `frontend/src/lib/decisions.ts`: added `chosenLines`, `chosenFloor`, `questionWords` (with `unmark`: paired emphasis and backticks only), `missingWords` (FR-7 to FR-10)
- modified `frontend/src/lib/decisions.test.ts`: tests of the four helpers
- modified `frontend/src/components/RuleDecisionBox.tsx:RuleDecisionBox`: legend `Q<n> · <words>`, foot's missing text as Rule's description, question placeholder (FR-9 to FR-11)
- modified `frontend/src/components/RuleDecisionBox.test.tsx`: W6 (with code span, in-word `_`, lone `*`), W7 (with the foot's row order and wrap rules), W8; `box` takes a body
- modified `frontend/src/styles/rule-box.css`: `.rb-question`, `.rb-missing` (the foot's full-width first row, Amendment 1), `.rb-foot` wraps, legend wraps
- modified `frontend/src/components/DecisionsView.tsx:DecisionsView`: opened ruled head shows Chosen; line floors per answer, drops its chosen while open (FR-7, FR-8)
- added `frontend/src/components/DecisionsView.test.tsx`: W5
Risky:
- `DecisionsView` line: a floored question chosen does not shrink (inline `flex: none`); past it `watchLine` drops it whole
Not changed, on purpose:
- `frontend/src/styles/decisions.css`: outside the boundary; the floor is computed text (first word, at most 8 characters), not a layout floor
- `frontend/src/lib/decisionsPage.ts:lineName`: the line's name keeps the full chosen, open or closed

## Notes
- The per-answer floor always shows on a question line, even with room; a layout floor needs decisions.css (progress.md, Found, not asked).


## Review
**Pass** at 8e504fb (l51-words-review, 2026-10-24). Unmet gate items: none. W5-W8, with W7 as amended (Amendment 1, 24938f9), and X0 are met. The earlier fail at 61d9d41 (W6, `questionWords`) is fixed by b7e3dc6. The branch was rebased on main f3cd3d8, and this review restarted on a fresh clean clone at 8e504fb.

**change-check** (`change-check organizer lf51-rule-words`, from the clean clone; base f3cd3d8):
```
- organizer/frontend/src/components/DecisionsView.test.tsx (added, test)
- organizer/frontend/src/components/DecisionsView.tsx (modified): DecisionsView
- organizer/frontend/src/components/RuleDecisionBox.test.tsx (modified, test)
- organizer/frontend/src/components/RuleDecisionBox.tsx (modified)
- organizer/frontend/src/lib/decisions.test.ts (modified, test)
- organizer/frontend/src/lib/decisions.ts (modified): chosenLines, chosenFloor, questionWords, unmark, missingWords
- organizer/frontend/src/styles/rule-box.css (modified)
| undeclared | organizer/frontend/src/components/RuleDecisionBox.tsx |  | modified |
| untested? | organizer/frontend/src/lib/decisions.ts | unmark | no test file names it |
| declared, not changed |  | frontend/src/components/RuleDecisionBox.tsx:RuleDecisionBox | no matching change |
3 flags: outside boundary 0, outside footprint 0, undeclared 1, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 1, could not read 0, boundary unreadable 0
```
- **undeclared** and **declared, not changed** are one change seen twice. change-check gave `RuleDecisionBox.tsx` no symbol, so the declared `RuleDecisionBox.tsx:RuleDecisionBox` matched nothing. Every hunk in the file falls inside `export function RuleDecisionBox`, which runs from line 45 to before line 239.
- **untested?** `unmark` is private. Its only caller is `questionWords`, and the questionWords test in `decisions.test.ts` covers it ("keeps code-span text, an in-word _ and a lone *"), as does W6's legend test.
- All 7 files are inside the Boundary, nothing is under `frontend/wailsjs/`, and no dependency changed (package.json and the lockfile are untouched).

**Rows.** I copied the three test files of 8e504fb onto a clone of main (b836de5): 13 of the 15 new tests fail there. The 2 that pass guard the plain record.
- **W5 met** (`DecisionsView.test.tsx`, unchanged since 61d9d41).
  - Closed, the line reads `“Q1 after…, Q2 record…”`, and aria-label and title carry the full chosen.
  - Open, the line has no chosen and the head reads `Chosen`, `Q1 after-graph-performs-start-now`, `Q2 record-page`. The plain record shows `Chosen`, `accept as written`.
  - On main: `Expected: "“Q1 after…, Q2 record…”" Received: "“Q1 after-graph-performs-start-now, Q2 record-page”"`, and open `expected '“accept as written”' to be null`.
- **W6 met.**
  - The legends are `Q1 · Where in the order?` and `Q2 · Where does the view live?`. Without the `**Q1.` line they are `Q1` and `Q2 · …`.
  - With my review's case they are `Q1 · Does tech_lead_nicolas keep his seat?` and `Q2 · Are 2*3 seats enough?`.
  - On main: `expected [ 'Q1', 'Q2' ] to deeply equal [ 'Q1 · Where in the order?', …(1) ]`.
- **W7 met, as amended.**
  - Rule's `aria-describedby` reads `Q2 not answered yet.` (Q1 picked, words typed) and `Your words are missing.` (both picked, no words). With nothing picked it reads `Q1 and Q2 not answered yet. Your words are missing.`, both sentences, as rule-questions U3 says. There is no `aria-live`, and the row is gone once Rule is enabled.
  - Amendment 1: in the foot's markup, `rb-missing` comes first, then `rb-sign`, Cancel and Rule. In `rule-box.css`, `.rb-foot` has `flex-wrap: wrap`, `.rb-missing` has `flex: 0 0 100%`, and `.rb-sign` keeps `flex: 1; min-width: 0`. A 100 % basis wraps the missing text onto its own first row at any width, and `.rb-sign`'s basis is 0, so the signature and the buttons stay on one row under it.
  - The rule is the same in the 354 px Decisions box and in Needs me's. The only context rules are `.rb > .rb-foot` (sticky, padding) and `.home.wide .home-needs .rb > .rb-foot` (background). Neither touches flex, and I grepped every `rb-foot`, `rb-sign` and `rb-missing` selector.
  - Vitest has no layout, so the no-overlap check is read from markup and CSS. The pixels are the UI reviewer's to see.
  - On main: `expected [ 'rb-sign', 'ghost', 'primary' ] to deeply equal [ 'rb-missing', 'rb-sign', …(2) ]`.
- **W8 met.** The placeholder reads `Why these answers, in your words. They go under ## Ruling.` on the fixture and `Why this option, in your words. They go under ## Ruling.` on a plain record. On main: `Expected: "Why these answers, …" Received: "Why this option, …"`.
- **X0 met.**
  - `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` was a **fresh** run, id `a75c3167-31494` (sha 8e504fb, rc 0): 19 Go packages ok; vitest 83 files and 1131 tests passed.
  - `test-lease run -- pnpm run build` exited 0, and `test-lease run -- wails build` exited 0.
  - `git status --porcelain` printed nothing.

**Own inputs** (`questionWords` through vitest in a scratch clone at 8e504fb, then deleted):
- A code span with underscores, `` `tech_lead_nicolas` ``, gives `tech_lead_nicolas`. Right.
- A lone `*` is kept in each case, all right:
  - `2*3` gives `2*3`.
  - `2 * 3 or 4 * 5` is unchanged.
  - `a*b and c*d` is unchanged.
  - `A lone * here?` is unchanged.
- `` `a*b*c` `` and `` `x__y__z` `` are kept verbatim. Right.
- Markdown is removed where it should be, all right:
  - Inner bold, `**bold**`, gives `bold`.
  - `*really* _so_` gives `really so`.
  - A link gives its text.
  - `**Q1.** Split label?` gives `Split label?`.
  - `__init__` gives `init`, which is how CommonMark renders it too.
- An unclosed backtick is kept as a literal. Right.
- When Q2 has no line between Q1 and Q3 lines, the result is `{Q1, Q3}`. Right.
- Three questions:
  - The lines are `Q1 a-b`, `Q2 fg-hi`, `Q3 long_alternative`, and the floor is `Q1 a…, Q2 fg…, Q3 long…`.
  - With nothing picked and words typed, it reads `Q1, Q2 and Q3 not answered yet.`.
  - With Q2 picked and no words, it reads `Q1 and Q3 not answered yet. Your words are missing.`.
- A plain record looks as it does on main except for FR-7 and FR-8 when open: no foot text, the same placeholder, and the same closed line.

**Notes (not blocking):**
- Note: `unmark` tests word boundaries with ASCII `\w`. An emphasis-shaped `_x_` with a non-ASCII letter directly on both sides is therefore stripped: `ñ_x_ñ` gives `ñxñ`, while CommonMark keeps that `_` as text. `Año_nuevo` is kept, and no record has such a line. Fix with `[\p{L}\p{N}]` and the `u` flag. To the FSE (next leftovers).
- Note: W7's row says `Q1 and Q2 not answered yet.` for "nothing picked, no words". Its source, rule-questions U3, adds `Your words are missing.` for that input, and the code follows U3. The gate row should quote U3. To the FSE.
- Note: FR-8's floor is the first word, up to 8 characters. Amendment 2's UW2 (whole answers while the line has room) is out of this card's boundary, and the spec's Amendment 1 assigns it to the next leftovers. To the FSE.

Reviewer: l51-words-review, 2026-10-24.

## UI review
l51-words-ui, 2026-10-24, re-review on **8e504fb** (rebased on main 24938f9), review build `Deltagos Review`, fixture `--review --canned-post`, auth off, discuss_state_dir under the temp dir. **Verdict: pass.** Checked against leftovers-51 FR-7 to FR-11 with Amendment 1 (FR-10 foot row) and rule-questions Q1-Q5 with Amendment 2's Q4; Q2 at 1024 as W5. UW2 (whole answers with room) and UW3 / Q6 (chosen said once while open) are out of this card per leftovers-51 Amendment 1 and were not judged.

Shared test run: **reused**, `test-lease: reused run a75c3167-31494 of 8e504fb51ba1 by organizer-probe-l51-words-review`: go test ok, vitest 83 files / 1131 tests pass.

Fixture: lf49's `0037-big-picture-stage.md` copied into the temp `init-a` as 0013 (proposed), 0014 (ruled, `chosen: "Q1 after-graph-performs-start-now, Q2 record-page"`, a `## Ruling`), 0015 (proposed, no `**Q1. …**` line); committed in the temp repo only (5f8fcfc). Nothing was ruled; root checkout unchanged.

### Findings
- **UW1 (was sev 3), fixed.** The missing text is the foot's first row, full width, left-aligned; `signed pablo · commits one file`, Cancel and Rule keep one row under it; nothing overlaps (AX frames below; shots `1024x640-Q4-box-empty-8e504fb.png`, `1440x900-Q4-box-empty-8e504fb.png`, `1024x640-Q4-needsme-box-empty-8e504fb.png`, `1440x900-Q4-needsme-box-empty-8e504fb.png`).
- No new sev 4 or 3. Held from the first pass by the FSE, not re-judged: UW2 (sev 2), UW3 (sev 1).

### Rows, how checked, words compared
| Row | State | How | Screen string vs spec |
|---|---|---|---|
| Q4 (amended) | Decisions box (354 px), 0013, nothing picked, 1024×640 | AXPress Rule, AX tree, Rule's AXCustomContent | row 1 `Q1 and Q2 not answered yet. Your words are missing.` @1593,684 287×17; row 2 `signed pablo · commits one file` @1593,714 on one line, Cancel and Rule @709 on that row; Rule's description = the missing text. Pass |
| Q4 | same, only Q1 picked, 1024 | AXPress radio | row 1 `Q2 not answered yet. Your words are missing.`, signature on one line under it. Pass |
| Q4 | Decisions box, 1440×900 | same | row 1 @2009,944, signature @974 one line, buttons @969. Pass |
| Q4 | Needs me box, 1024×640 and 1440×900 | Home › Show the other 8 › Rule init-a 0013 | row 1 @688 / @758, signature one line @718 / @788, buttons on its row; Rule's description = the missing text. Pass |
| Q4 | nothing missing (plain 0005, owner alejandro) | AX | no missing row; signature and buttons on one row, as on main |
| Q2 (W5) | 0014 closed, 1024×640 | AX name, shot `1024x640-Q2-ruled-line-closed-8e504fb.png` | `“Q1 after…, Q2 record…”`; name has the full `“Q1 after-graph-performs-start-now, Q2 record-page”`. Pass |
| Q1, Q3, Q5 | as in the first pass at 61d9d41 | first pass; 8e504fb changes only the foot's order and CSS, and question-words parsing (b7e3dc6, gated by W6) | 0013 legends `Q1 · Where in the order?`, `Q2 · Where does the view live?`; placeholder `Why these answers, …` seen again on 8e504fb at 1440 |

Shots under `.wt-notes/l51-words-ui/`, suffixed `-8e504fb`. Screen unlocked; AX and screencapture only on my own pid.

### Spec gaps (for the FSE)
- None new. Amendment 1 closes the narrow-box gap.

### For aglaea
- None new; A1 and A2 from the first pass are answered by rule-questions Amendment 2.

### Not verified in WKWebView
- The row going once Rule is enabled: needs words in the box, which AX value sets do not reach React without focus I may not take; rests on vitest W7 and the code (`missing` is empty when `ready`).
- Ruling in the review build (needs words).
- Q1 and Q3 were not re-shot on 8e504fb (unchanged code paths; Q3's parsing change is covered by W6).
