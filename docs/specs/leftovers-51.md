# Leftovers 51: one recipient list, the Chats head held still, hover that eases both ways, a crew test that stops flaking, and the rule box's words for question records: the build spec

status: ruled (0160, pablo 2026-10-24)
by: the FSE, 2026-10-24, on main at ff86545
sources: Aglaea's `docs/ux/specs/review-view.md` Amendment 15 (ff86545) and
its design-system rule, from l48-ui's UI review of lf48-chat-landing (UL1 to
UL4); l48-ui's spec gap (no human token in the review fixture); sup88's and
Aglaea's `docs/ux/specs/rule-questions.md` Amendment 1 (b46e43a), from
l49-ui's UI review of lf49-rule-questions (U1 to U4); sup88's and
sup89's closing reports (TestAppCreateCrewReturnsAtOnce at 1.10 s and
1.16 s against 1 s under swap). Premises read today; lines in
Conversation.tsx and global.css move with lf48-chat-landing, which this
depends on.

## Premises (read 2026-10-24 at ff86545)

| Premise | Shown by |
|---|---|
| the reply box and the rule box build their recipient select with `shownSeats(seats, to)`, roster plus the addressee appended plain; NewThread (after lf48) groups Others | `frontend/src/components/Conversation.tsx:640, 765, 1019` (main); lf48-chat-landing FR-3 |
| the Chats label row and its `+` scroll with the rows, so a landing's nearest scroll can cut them | l48-ui UL2, `wk-1024x612-R42-landing.png` |
| lf48's FR-1 scrolls only on a landing, so a click on a half-cut row leaves it cut | lf48 FR-1; l48-ui UL3 |
| the global button transition sits on `button`; lf48 opts state fills out, so on those controls hover eases in and stops at once | `frontend/src/styles/global.css:22, 356-357`; l48-ui UL4 |
| the review fixture has no token for the human, so NewThread cannot open without a hand-made `tokens.json` | l48-ui spec gaps; `scripts/fixture-home.sh` |
| the Decisions list floors `chosen` at `CHOSEN_FLOOR` (9 characters) as one string, and an opened ruled record shows options and the Ruling words but no `chosen` | `frontend/src/components/DecisionsView.tsx:273, 317, 529`; l49-ui U1 |
| a question's radio group is named by its legend `Q<n>` alone; the words placeholder reads "Why this option" on every record; a disabled Rule says nothing of what is missing | `frontend/src/components/RuleDecisionBox.tsx:174, 190` (after lf49-rule-questions); l49-ui U2-U4 |
| `TestAppCreateCrewReturnsAtOnce` asserts `took < 1 s` with the stub sleeping 3 s per seat; under swap it took 1.10 s and 1.16 s, though the property it guards is "returns before the stub's first sleep ends" | `app_launch_test.go:13-56`; run records 2026-10-23-sup88, 2026-10-24-sup89 |

## Requirements

Card `lf51-composers` (frontend and fixture), after lf48-chat-landing:

- **FR-1** (UL1) One function builds every composer's recipient list
  (new thread, reply box, rule box): the roster, then an `Others` group
  with the names the chat list's Others shows, then, under `Others`, an
  addressee in neither. No composer appends a name outside that function.
- **FR-2** (UL2) The Chats head (its label and `+`) sits outside the
  chat list's scroller, so a scroll moves only rows.
- **FR-3** (UL3) A click on a row the list cuts reveals it with the same
  instant `nearest` scroll; a wholly visible row does not move.
- **FR-4** (UL4) The 100 ms ease sits on the base rule, so hover eases in
  and out alike; a control carrying a state mark (current, selected, open,
  disabled) has no transition at all, hover included.
- **FR-5** (spec gap) `fixture-home.sh --review` gives the human seat a
  stand-in token, so NewThread opens and nothing reaches a real mailbox
  (posts go where `--canned-post` sends them, or fail closed).

Card `lf51-crew-flake` (Go test only):

- **FR-6** HYGIENE: lf51-crew-flake. `TestAppCreateCrewReturnsAtOnce`
  keeps its property, the call returns before the stub's first sleep ends,
  with a bound that swap cannot reach: the stub sleeps 6 s per seat and the
  call must return in under 3 s.

Card `lf51-rule-words` (frontend), rule-questions Amendment 1:

- **FR-7** (U1a) Every ruled record's opened head shows `Chosen`: one
  full line per answer on a question record, the one option on a plain
  record, never cut.
- **FR-8** (U1b) The Ruled list line floors per answer on a question record
  (`Q1 after…, Q2 record…`); its accessible name keeps the full chosen;
  the line drops its chosen while its own record is open under it.
- **FR-9** (U2) A question's legend reads `Q<n> · <the record's **Q<n>.
  …** line without markdown>`, wrapping, never cut; `Q<n>` alone when
  the record has no such line.
- **FR-10** (U3) Beside a disabled Rule the foot names what is missing:
  `Q2 not answered yet.`, `Q1 and Q2 not answered yet.`, `Your words are
  missing.`; small, muted, Rule's `aria-describedby`, no live region.
- **FR-11** (U4) On a question record the words placeholder reads `Why
  these answers, in your words. They go under ## Ruling.`; a plain record
  keeps today's.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| K1 | 1 | vitest of the recipient function and of the three composers in sup10's chat | each lists sup10 once, under `Others`, after the roster; an addressee in neither goes last under `Others` |
| K2 | 2 | vitest reading the chat list's DOM | the Chats label and `+` are outside the scrolling element |
| K3 | 3 | vitest with a stand-in list: a click on a row cut at the bottom; on a wholly visible row | `scrollIntoView({ block: "nearest" })` once on the cut row; none on the visible one |
| K4 | 4 | vitest reading `global.css` | the base `button` rule carries the 100 ms transition; each state-mark rule sets `transition: none` |
| K5 | 5 | `eval "$(scripts/fixture-home.sh --review)"`, then read the token file it writes | a token entry for the human seat; no real discuss socket in the config |
| C4 | 6 | `go test -run TestAppCreateCrewReturnsAtOnce -count=20 .` under `test-lease` | 20 passes; the source shows `PROBE_STUB_SLEEP` 6 and the 3 s bound |
| W5 | 7, 8 | vitest of DecisionsView with the leftovers-49 fixture ruled `Q1 after-graph-performs-start-now, Q2 record-page` and a plain ruled record | the open head shows `Chosen` with both answers in full, the plain one its option; the closed line reads `Q1 after…, Q2 record…` with the full chosen as its accessible name; open, the line has no chosen |
| W6 | 9 | vitest of RuleDecisionBox with the fixture, with and without its `**Q1. …**` line | legend `Q1 · <words>`; legend `Q1` |
| W7 | 10 | vitest: Q1 picked, words typed; nothing picked, no words | foot `Q2 not answered yet.`, Rule's description is it; `Q1 and Q2 not answered yet.` |
| W8 | 11 | vitest: the fixture; a plain record | `Why these answers, …`; `Why this option, …` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

The UI review of lf51-composers (ui_review: true) checks review-view R46 to
R49 in the review build with FR-5's fixture; that of lf51-rule-words checks
rule-questions Q1 to Q5.

## Boundary

- `lf51-composers`: `frontend/src/components/Conversation.tsx` and its
  tests, `frontend/src/styles/global.css` and the CSS test that reads it,
  `scripts/fixture-home.sh` (`--review` only).
- `lf51-crew-flake`: `app_launch_test.go` only.
- `lf51-rule-words`: `frontend/src/components/RuleDecisionBox.tsx`,
  `frontend/src/components/DecisionsView.tsx` and their tests,
  `frontend/src/lib/decisions.ts` and its test, `frontend/src/styles/rule-box.css`.
- The three share no file; one wave, after lf48-chat-landing (merged
  5255715) and lf49-rule-questions merge.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf51-composers` | K1-K5, X0 | lf48-chat-landing | true |
| `lf51-crew-flake` | C4, X0 | — | false |
| `lf51-rule-words` | W5-W8, X0 | lf49-rule-questions | true |

## Amendment 1 (FSE, 2026-10-24): the foot's missing text has its own row

From l51-words' UI review (UW1, severity 3; spec gap) and Aglaea's
`docs/ux/specs/rule-questions.md` Amendment 2 (0dc56ee). FR-10 reads: the
missing text is the foot's first row at every width, full width, wrapping,
aligned left with the content; the signature and the buttons keep their own
row under it, unchanged; the row goes once Rule is enabled. It never
overprints the signature. W7 adds: in the Decisions box (354 px) and in Needs
me's, the missing text's row sits above the signature's and neither overlaps
the other. Inside the card's boundary (`rule-box.css`).

Not in lf51-rule-words, for the next leftovers: rule-questions Amendment 2's
UW2 (answers whole while the list line has room, the per-answer floor only
when it has not; `decisions.css`) and UW3 (while a record is open, its line's
accessible name drops the chosen; `lineName` in `decisionsPage.ts`). Both are
outside this card's boundary.

## Amendment 2 (FSE, 2026-10-24): the mark is its own layer

From l51-comp-ui's UI review of lf51-composers (C1, severity 3: with the
ease on the base rule a leaving mark eased out, so after a click the old
row stayed filled; R43 failed) and Aglaea's `docs/ux/specs/review-view.md`
Amendment 16 (1e3f9aa), which corrects her Amendment 15 UL4. FR-4 reads:
hover eases the row's own `background-color` over 100 ms with `--ease-out`,
in and out; the current or selected fill is painted by a separate layer
with no transition (a `::before` at inset 0 under the content, or an inset
`box-shadow`), so the mark arrives and leaves at once. CSS only, no
short-lived class and no script; if the layer cannot be built inside the
boundary, the fallback is a class the list sets on the row whose mark
leaves, never giving up hover's ease-out nor accepting a fading mark.
K4 adds: after a click, the row that lost the mark has no fill in the next
frame (R43 as amended), and hover's background eases on the chat row (R49
as amended). `.rail-item.active` keeps 15ec836's `transition: none` in this
card; its layer follows in the next leftovers. C2: one curve, `--ease-out`.

## Amendment 3 (FSE, 2026-10-24): every other marked control keeps switching at once

From l51-comp-ui's re-review of lf51-composers at a88877d (C3, severity 3;
spec gap). Amendment 2 moved only the chat row's mark onto its own layer and
kept `.rail-item.active` at `transition: none`; it was silent on the rest of
the `transition: none` list lf48 FR-2 built (`button.person`, `.subtabs
button`, `.seg button`, `.strip-item`, `.places .place-tab`, `.stg`,
`.fl-row`, and every other entry), which FR-4 removed, so a mark leaving
any of them eases again. FR-4 reads, for this card: the chat row as
Amendment 2 has it; every other control on lf48's list keeps `transition:
none` (hover included) until it gets its own layer, so no state mark eases
anywhere. K4 adds: for each control on lf48's list, the computed transition
is `none`, and after a press in the People panel the row that lost
`.active` has no fill in the next frame. Moving those controls onto layers
(so their hover eases too) is the next leftovers, with Aglaea's answer on
whether the layer is the pattern for every marked control.
