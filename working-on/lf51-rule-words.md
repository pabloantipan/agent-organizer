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
review: fail
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
**Fail** at 61d9d41 (l51-words-review, 2026-10-24). Unmet: W6, by one proved finding against FR-9; W5, W7, W8 and X0 are met.

**Finding (blocking, W6 / FR-9).** `questionWords` (`frontend/src/lib/decisions.ts`) drops every `_`, `*` and `` ` `` in the line, not the markdown markers. FR-9 asks for "the record's `**Q<n>. …**` line without markdown". Run through vitest in a scratch clone of 61d9d41:
```
questionWords("## Question\n\n**Q2. Does `tech_lead_nicolas` keep his seat?**\n\n**Q5. 2*3 seats or 4?**")
→ {"Q2":"Does techleadnicolas keep his seat?","Q5":"23 seats or 4?"}
```
The legend renders that value as it is (`RuleDecisionBox.tsx:189`), so it would read `Q2 · Does techleadnicolas keep his seat?`. Seat names in this factory carry underscores. No real record has such a `**Q` line today (8 `**Q<n>.` lines across the decision dirs, none with `_` or `*`), so it does not hurt yet. The fix is small: drop paired `**`/`*`/`_` emphasis markers and backticks, keep the text inside code spans and any `_` inside a word, and add the case to the W6 or helper test.

**change-check** (`change-check organizer lf51-rule-words`, from the clean clone):
```
## Changed
- organizer/frontend/src/components/DecisionsView.test.tsx (added, test)
- organizer/frontend/src/components/DecisionsView.tsx (modified): DecisionsView
- organizer/frontend/src/components/RuleDecisionBox.test.tsx (modified, test)
- organizer/frontend/src/components/RuleDecisionBox.tsx (modified)
- organizer/frontend/src/lib/decisions.test.ts (modified, test)
- organizer/frontend/src/lib/decisions.ts (modified): chosenLines, chosenFloor, questionWords, missingWords
- organizer/frontend/src/styles/rule-box.css (modified)
| undeclared | organizer/frontend/src/components/RuleDecisionBox.tsx |  | modified |
| declared, not changed |  | frontend/src/components/RuleDecisionBox.tsx:RuleDecisionBox | no matching change |
2 flags: outside boundary 0, outside footprint 0, undeclared 1, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```
The two flags are one change seen twice. change-check gave RuleDecisionBox.tsx no symbol, so the declared `RuleDecisionBox.tsx:RuleDecisionBox` matched nothing, and the file read as undeclared. Every hunk (lines 83-233) falls inside `export function RuleDecisionBox`, which runs from line 45 to before line 239. So the declaration is true; the tool did not attribute the lines to the symbol. All 7 files are inside the Boundary, nothing under `frontend/wailsjs/`, and there is no new dependency (package.json and pnpm-lock.yaml unchanged; change-check: new dependency 0).

**Rows** (the new tests were copied onto a clone of main b5f844d; 11 of 13 new tests fail there, and the 2 that pass guard the plain record):
- W5 met. `DecisionsView.test.tsx` uses the fixture's options, ruled `Q1 after-graph-performs-start-now, Q2 record-page`, plus a plain ruled record.
  - Closed, the line reads `“Q1 after…, Q2 record…”`, and aria-label and title carry the full chosen.
  - Open, the line has no chosen and the head reads `Chosen`, `Q1 after-graph-performs-start-now`, `Q2 record-page`. The plain record shows `Chosen`, `accept as written`.
  - On main: `Expected: "“Q1 after…, Q2 record…”" Received: "“Q1 after-graph-performs-start-now, Q2 record-page”"`, and open `expected '“Q1 after-graph-performs-start-now, Q…' to be null`, `expected '“accept as written”' to be null`.
- W6 is unmet, by the finding above. The test itself asserts the row: legends `["Q1 · Where in the order?", "Q2 · Where does the view live?"]`, and `Q1` alone once the `**Q1.` line is removed. On main: `expected [ 'Q1', 'Q2' ] to deeply equal [ 'Q1 · Where in the order?', …(1) ]`.
- W7 met.
  - With Q1 picked and words typed, Rule's aria-describedby resolves to `Q2 not answered yet.`. With both picked and no words, it reads `Your words are missing.`. With everything filled, there is no description and no `rb-missing`. There is no `aria-live`.
  - With nothing picked, the foot reads `Q1 and Q2 not answered yet. Your words are missing.`. The gate row says `Q1 and Q2 not answered yet.` for that input, but Aglaea's rule-questions Amendment 1 U3 says that when both are missing, both sentences show, and the code follows U3. The gate's expected text is short of its own source (to the FSE). Note: when nothing is picked, the order follows U3's "in reading order".
  - On main: `expected null to be 'Q1 and Q2 not answered yet. Your word…'`.
- W8 met. The placeholders match word for word: `Why these answers, in your words. They go under ## Ruling.` on the fixture and `Why this option, in your words. They go under ## Ruling.` on a plain record. On main: `Expected: "Why these answers, …" Received: "Why this option, …"`.
- X0 met.
  - `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` was a **fresh** run, id `ef3e4ff5-16196` (sha 61d9d41, rc 0): all Go packages ok; vitest 83 files and 1129 tests passed.
  - `test-lease run -- pnpm run build` exited 0, and `test-lease run -- wails build` exited 0.
  - `git status --porcelain` printed nothing (wails did not touch `frontend/wailsjs/runtime`).

**Own inputs** (vitest in a scratch clone):
- A three-question record gives chosenLines `["Q1 a-b","Q2 fg-hi","Q3 long_alternative"]` and floor `Q1 a…, Q2 fg…, Q3 long…`. With Q2 open and no words, missing reads `Q1 and Q3 not answered yet. Your words are missing.`. Right.
- When the `**Q1.**` line is missing beside a present Q2, the legends are `Q1` and `Q2 · Where does the view live?`. Right (the builder's W6 test).
- Markdown in the line:
  - Bold inside, `**Q1. Is it **bold** here?**`, gives `Is it bold here?`. Right.
  - A link gives `Read the spec first?`. Right.
  - `**Q4.** Split label?` gives `Split label?`. Right.
  - Code with underscores and a literal `*` are wrong (the finding).
  - A `**Q1.` line outside `## Question` is ignored. Right.
- A plain record looks as it did on main: no foot text, the same placeholder and the same closed line (`“accept as written”`, `dec-opt floored`). The one change is that, when the record is open, the line drops its chosen and the head shows `Chosen` (FR-7 and FR-8).
- Note: FR-8 floors each answer to its first word, up to 8 characters (`Q1 a…` for `a-b`). U1 says "cut to share the floor equally", which is not the same rule. That goes to the UI reviewer and the FSE, and the card's Notes say so.

Reviewer: l51-words-review, 2026-10-24.

## UI review
l51-words-ui, 2026-10-24, commit 61d9d41 (review build `Deltagos Review`, fixture `--review --canned-post`, auth off, discuss_state_dir under the temp dir). **Verdict: fail** (one sev 3).

Shared test run: **reused**, `test-lease: reused run ef3e4ff5-16196 of 61d9d41854a5 by organizer-probe-l51-words-review`: go test ok, vitest 83 files / 1129 tests pass.

Fixture: lf49's `0037-big-picture-stage.md` copied into the temp `init-a` as 0013 (proposed), 0014 (ruled, `chosen: "Q1 after-graph-performs-start-now, Q2 record-page"`, a `## Ruling`), 0015 (proposed, no `**Q1. …**` line); committed in the temp repo only (76215a4). Nothing was ruled; root checkout unchanged.

### Findings
**UW1 (sev 3, fails Q4 / FR-10).** *Cannot do:* read what keeps Rule disabled, or the signature, in the Decisions rule box. *Where:* Decisions › 0013 › Rule, box foot, at 1024×640 and 1440×900 (the box is 354 px wide at both); `1024x640-Q3-box-empty.png`, `1024x640-Q4-box-q1-picked.png`, `1440x900-Q4-box-empty.png`. *Evidence:* `.rb-sign` (flex 1, min-width 0) is squeezed to 48 px, one word per line, and "commits" overflows into `.rb-missing`: on screen "commits" overprints "words are missing." (AX: `· commits one file` @1593,672 48×65 and the missing text @1601,672 183×33, overlapping). Happens whenever the missing text takes two lines (`Q1 and Q2 not answered yet. Your words are missing.`, `Q2 not answered yet. Your words are missing.`); `Your words are missing.` alone fits (sign wraps to 3 lines, no overlap, `1024x640-Q4-box-words-missing.png`). Needs me's box (528 px) is clean at 1024 (`1024x640-Q4-needsme-box-empty.png`). Main has no missing text, so this is new. *Proposal:* in a narrow box let the foot wrap: missing text on its own row above sign + buttons (e.g. `.rb-foot { flex-wrap: wrap }` with `.rb-missing { flex-basis: 100% }`, or a min-width on `.rb-sign`), never overprint; rule-box.css is in the boundary.

**UW2 (sev 2).** *Cannot do:* read the whole ruled answer on the list with room to spare. *Where:* Ruled list, 0014, 1440×900 (`1440x900-Q2-ruled-line-closed.png`): `“Q1 after…, Q2 record…”` beside ~500 px of empty line. *Evidence:* `chosenFloor` always cuts to the first word (≤8 chars); a plain line ("figure", "as proposed") shows in full and ellipsizes only when short (leftovers-13 floor). Q2 is gated at 1024 only, where the cut is right. *Proposal:* full text with room, the per-answer floor only when the line is short (needs `.dec-ans` rules in decisions.css, outside this boundary; builder's progress.md says the same).

**UW3 (sev 1).** While 0014 is open, its line's accessible name still says `“Q1 after-graph-performs-start-now, Q2 record-page”` (lineName, decisionsPage.ts) while the head's Chosen says it again. Visual rule met; a screen reader hears it twice. *Proposal:* drop it from the name while open, with lineName.

### Rows, how checked, words compared
| Row | State | How | Screen string vs spec |
|---|---|---|---|
| Q1 | 0014 open, 1024×640 | AXPress line, AX tree, shot `1024x640-Q1-ruled-question-open.png` | `Chosen` / `Q1 after-graph-performs-start-now` / `Q2 record-page`, full, no cut = spec; line shows no chosen while open = spec |
| Q1 | 0012 plain open | same, `1024x640-Q1-ruled-plain-open.png` | `Chosen` / `figure` = spec |
| Q2 | 0014 closed, 1024×640 | shot `1024x640-Q2-ruled-line-closed.png`, AX name | `“Q1 after…, Q2 record…”` = spec `Q1 after…, Q2 record…` (quotes as plain lines); name `… ruled, “Q1 after-graph-performs-start-now, Q2 record-page”, by pablo …` = full chosen. Pass |
| Q3 | 0013 / 0015 boxes | AX group names | `Q1 · Where in the order?`, `Q2 · Where does the view live?`; 0015 `Q1` alone = spec. Legend CSS wraps (`white-space: normal; overflow-wrap: anywhere`). Pass |
| Q4 | 0013, 1024: only Q1 picked | AXPress radio; Rule's AXCustomContent `description` | `Q2 not answered yet. Your words are missing.` (words could not be typed, see not verified); Rule's description = that text, no live region (code). Words match spec; layout fails (UW1). Nothing picked: `Q1 and Q2 not answered yet. Your words are missing.` = spec both-missing form. Both picked: `Your words are missing.` = spec |
| Q5 | 0013 / 0002 | AXPlaceholderValue | `Why these answers, in your words. They go under ## Ruling.` / `Why this option, in your words. They go under ## Ruling.` = spec word for word. Pass |
| plain | 0002 box, 1024 | shot `1024x640-Q5-box-plain.png` | no foot text, foot `signed pablo · commits one file`, as on main |

Shots under `.wt-notes/l51-words-ui/`. Screen was unlocked; AX and screencapture worked on my own pid only.

### Spec gaps (for the FSE)
- Amendment 1 U3 places the missing text "beside the disabled Rule" but says nothing of a narrow box where sign, text and two buttons do not fit on one row (UW1).
- "Floors per answer" is gated only at 1024; whether a wide line shows the answers whole is not said (UW2).

### For aglaea
- A1: in a narrow box, does the missing text go on its own row above the foot, or replace the signature while Rule is disabled?
- A2: should a question line show answers whole when there is room (UW2)?

### Not verified in WKWebView
- Typing words into the box: AX value set and AXSelectedText insertion do not reach React without focus, which I may not take; the state "Q1 picked + words written → `Q2 not answered yet.` alone" rests on vitest W7 and `missingWords`.
- Ruling a question record in the review build (needs words), so the temp-repo commit after a ruling was not seen.
- Keyboard order, focus ring on radios, the box's scroll at 640 tall beyond what the shots show.
