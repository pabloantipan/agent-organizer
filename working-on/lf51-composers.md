---
title: "Every composer lists recipients one way, the Chats head stays put, a click reveals a cut row, and hover eases both ways"
status: next
repos: [organizer]
branch: lf51-composers
seat: l51-comp
reviewer: l51-comp-review, l51-comp-ui
stage:
updated: 2026-10-24
next: "review: lf51-composers, gate met (K1-K5, X0; C3 per Amendment 3: lf48's marked controls switch at once), 490b943"
review: pass
depends_on: [lf48-chat-landing]
boundary: ["docs/specs/leftovers-51.md Boundary, lf51-composers"]
spec: "docs/specs/leftovers-51.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-51.md#Acceptance → gate"
ui_review: true
---

## Goal
Pablo finds every recipient in the same place in every composer, and the chat list never hides its own head or a row he clicked.

## Gate
docs/specs/leftovers-51.md, rows K1-K5 and X0; the UI review checks review-view R46 to R49.

## Done
- l51-comp, 2026-10-24: FR-1 to FR-5 on branch lf51-composers (97c8a79, 3dbe032, d7605a9), rebased on main 48c77ac; K1-K5 fail on main and pass on the branch, X0 passes from a clean clone; commands and output in .wt-notes/l51-comp/progress.md.
- l51-comp, 2026-10-24, round 2: K4 fixed, `.rail-item.active` and its hover `transition: none`, K4 row added (15ec836); rebased on main b836de5 (head 15ec836, earlier commits now b37805c, 2007071, c615584); X0 passes again from a clean clone.
- l51-comp, 2026-10-24, round 3: UI review C1 per Amendment 2, the chat row's current fill and outline on `.chat.active::before` with no transition, hover easing the row's own background-color on `--ease-out` (a88877d); four K4 rows; rebased on main a15819f (earlier commits now 669f384, c0369ec, e8e6e0c, 83305c3); X0 passes from a clean clone.
- l51-comp, 2026-10-24, round 4: UI re-review C3 per Amendment 3, the 15 other controls on lf48 FR-2's list set `transition: none` on base and hover (490b943); K4 checks each and the People panel row; rebased on main 070ae78 (earlier commits now d565532, 1ddeaf8, 7697bb5, 097aa89, 6847c41); X0 passes from a clean clone.

## Declared changes
- added `frontend/src/components/Conversation.tsx:recipientsOf`: the one recipient list (roster, then Others, then an addressee in neither under Others), FR-1
- added `frontend/src/components/Conversation.tsx:RecipientOptions`: draws recipientsOf in every composer's select
- deleted `frontend/src/components/Conversation.tsx:shownSeats`: appended a name outside the list
- modified `frontend/src/components/Conversation.tsx:ReplyBox`: takes `others`, draws RecipientOptions
- modified `frontend/src/components/Conversation.tsx:RuleBox`: exported, takes `others`, draws RecipientOptions
- modified `frontend/src/components/Conversation.tsx:NewThread`: draws RecipientOptions
- modified `frontend/src/components/Conversation.tsx:NeedsMe`: passes `others` to its RuleBoxes
- modified `frontend/src/components/Conversation.tsx:Conversation`: rows in a `.chats-rows` scroller under the Chats head (FR-2); row clicks pass the row and scroller to the reveal (FR-3); passes `others` to ReplyBox and NeedsMe
- modified `frontend/src/components/Conversation.tsx:rowReveal`: `click(key, row, list)` reveals a cut row, nearest and instant (FR-3)
- added `frontend/src/components/Conversation.tsx:isCut`: whether the scroller cuts a row
- modified `frontend/src/styles/global.css`: `.chats` no longer scrolls, `.chats-rows` does (FR-2); the marked controls' base and hover transitions removed, `button` dropped from the reduced-motion block, `button:disabled` `transition: none` (FR-4)
- added `frontend/src/components/Conversation.composers.test.tsx`: K1, K2, K3
- modified `frontend/src/components/Conversation.reveal.test.tsx`: K3 through Conversation's click handlers
- modified `frontend/src/components/Conversation.landing.test.tsx`: L2 replaced by K4
- modified `scripts/fixture-home.sh`: `--review` writes a stand-in token for organizer-fixture/pablo and exports DISCUSS_BIND at an absent socket (FR-5)
- modified `frontend/src/styles/global.css:.rail-item.active`: the rail's selected mark and its hover `transition: none` (round 2, K4)
- modified `frontend/src/components/Conversation.landing.test.tsx:K4`: the `.rail-item.active` row
- modified `frontend/src/styles/global.css:.chat`, `.chat.active`, added `.chat.active::before`: the current mark on its own layer, hover easing background-color only (round 3, Amendment 2)
- modified `frontend/src/components/Conversation.landing.test.tsx:K4`: the chat row's layer, instant leave and hover ease rows
- modified `frontend/src/styles/global.css`: lf48's marked controls other than the chat row set `transition: none` on base and hover (round 4, Amendment 3)
- modified `frontend/src/components/Conversation.landing.test.tsx:K4`: base and hover none per control, the People panel row
Risky:
- `.chat`: `position: relative; z-index: 0` makes each chat row a stacking context for its layer
- `global.css`: every button's transition is now the base rule's 100 ms on background, border and colour; before, the reduced-motion block made it .12 s without colour
- `fixture-home.sh --review`: with a token, Conversations shows mailbox errors (absent socket) it used to hide behind "no token"
Not changed, on purpose:
- `frontend/src/styles/shell.css`, `roles.css`, `overview.css`, `work.css`: their own base transitions on some buttons are outside the boundary and the marked-controls list
- `internal/discuss`: the client still dials DISCUSS_BIND else 127.0.0.1:9494; the fixture points it away instead
- other `fixture-home.sh` modes: byte for byte as before

## Notes
- l51-comp: FR-4 eases hover both ways on `--ease-out` from the base rule; Amendment 15 UL4 also names `--ease-exit` for the way out, which a base-only rule cannot carry. Reviewer's call whether that matters for R49.
- l51-comp, round 4: round 3's note is settled by Amendment 3. Still open and older than this card: `.rail-item`'s own base ease (global.css and the reduced-motion block) eases the rail's selected fill as it leaves; its layer is next leftovers (Amendment 2).

## Review
Verdict: **pass** at 490b943 (fourth round, reviewed whole; the a88877d, 15ec836 passes and the d7605a9 fail are superseded). Gate: K1-K5 with K4 as amended by Amendments 2 (f16e172) and 3 (b96419d), and X0. Unmet gate items: none.

### change-check (from a fresh clean clone at 490b943)
```
| outside boundary | organizer/frontend/src/components/Conversation.composers.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/Conversation.landing.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/Conversation.reveal.test.tsx |  | modified |
| untested? | organizer/frontend/src/components/Conversation.tsx | isCut | no test file names it |
| untested? | organizer/frontend/src/components/Conversation.tsx | RecipientOptions | no test file names it |
| declared, not changed |  | frontend/src/styles/global.css:.rail-item.active | no matching change |
| declared, not changed |  | frontend/src/components/Conversation.landing.test.tsx:K4 | no matching change |
| declared, not changed |  | frontend/src/styles/global.css:.chat | no matching change |
| declared, not changed |  | frontend/src/components/Conversation.landing.test.tsx:K4 | no matching change |
| declared, not changed |  | frontend/src/components/Conversation.landing.test.tsx:K4 | no matching change |
10 flags: outside boundary 3, outside footprint 0, undeclared 0, declared, not changed 5, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```
- outside boundary ×3: Conversation.tsx's own tests, which the Boundary names; landing.test.tsx is also the CSS test that reads global.css. Explained.
- untested? `isCut`: private, run through `rowReveal().click` in composers.test K3 (top cut, bottom cut, visible, within 0.5 px). `RecipientOptions`: private, drawn by every K1 render. Explained.
- declared, not changed ×5: change-check matches code symbols, and CSS selectors (`.rail-item.active`, `.chat`) and a describe name (`K4`) are not symbols. The diff shows each one: `.rail-item.active` and its hover are in the none list (global.css:694-695). `.chat`, `.chat.active` and `.chat.active::before` are at global.css:643-650. The K4 rows are in landing.test.tsx. Explained.
- `git diff --stat main...490b943`: 6 files, all in the Boundary. 6847c41..490b943 touches only global.css and landing.test.tsx. `pnpm-lock.yaml`, `package.json`, `go.mod` and `go.sum` are the same as on main, so no new dependency. Nothing under `frontend/wailsjs/`.

### Rows (each new test copied onto a clean clone of main c40eb66: `Tests 37 failed | 46 passed (83)`)
- **K1 met.**
  - `recipientsOf` is the one builder. The only recipient `<option>`s in Conversation.tsx are `RecipientOptions` (:824-825) plus each select's `everyone` (:656, :880, :1083). The new thread (:881), the reply box (:657) and the rule box (:1084) all draw it. `shownSeats` is gone from `frontend/src`.
  - Tests: each of the three composers for `to=sup10` gives `["", po_ana, dev_bruno, "# Others", sup10]`; `ghost` goes last under Others; a roster addressee is not appended. Conversation's docked composer gives the same.
  - Conversation passes `others` to ReplyBox (:510) and to NeedsMe, which passes it to both RuleBoxes (:992, :1022). Read, not rendered.
  - On main: `expected [ '', 'po_ana', 'dev_bruno', 'sup10' ] to deeply equal [ '', 'po_ana', 'dev_bruno', …(2) ]`. RuleBox is not exported on main: `Element type is invalid … got: undefined`.
- **K2 met.** The label and `+` come before `<div class="chats-rows">`. All rows and the search are inside it. Only `.chats-rows` has `overflow: auto`, since `.chats` lost it. On main: `expected -1 to be greater than 0`.
- **K3 met.**
  - `scrollIntoView({ block: "nearest" })` runs once, with no `behavior`, on a row cut at the bottom or at the top. It runs none on a visible row, none within 0.5 px of an edge, and none on the commit after.
  - Every list row's onClick passes `e.currentTarget` and `rowsRef.current`.
  - On main: `expected "vi.fn()" to be called 1 times, but got 0 times`.
- **K4 (amended by A2 and A3) met.**
  - Base `button` (global.css:22) carries `background|border-color|color var(--dur-fast) var(--ease-out)`, with `--dur-fast: 100ms`. The reduced-motion block no longer names `button`. `button:disabled` sets `transition: none`, and the aria-disabled rules do too.
  - The 15 controls on lf48's list: base and `:hover` set `transition: none` (:664-693), and every mark and mark:hover sets none (:694-729).
  - The chat row is per A2: a `::before` layer with no transition, and hover eases `background-color` on `--ease-out`.
  - People panel: `.person.active` draws the fill. `button.person`, `button.person:hover`, `.active` and `.active:hover` are all none, and no `.person` rule in any stylesheet sets another transition. So the row that loses `.active` drops its fill in the next frame.
  - The test reads every stylesheet, global.css first. I grepped every `transition:` in `frontend/src/styles/*.css` other than none. None lands on a listed control, so the computed value is none by the cascade.
  - I reread global.css for every state-mark rule (`.active/.on/.open/.current`, `aria-current/expanded/pressed`, `:disabled`). Each is covered, or is not a control fill: `.init.open` is unused, `.rail-group-tools.open` is opacity on a span, `.g-bar.open` is a shape, and `.tiny-btn:disabled` is covered by `button:disabled`.
  - On main, 23 K4 rows fail (base ease, hover none ×15, People, the chat rows, rail, disabled), for example `expected 'background var(--dur-fast) var(--ease…' to be 'none'`.
  - The new rows against 6847c41's global.css (the C3 state): `Tests 17 failed | 46 passed (63)`, which is the 15 Amendment 3 rows plus `.gear.open` and the People panel row. So they catch C3.
- **K5 met.** From the 490b943 clone, `scripts/fixture-home.sh --review` exits 0.
  - `discuss/tokens.json` is `-rw-------` and holds 1 entry, `fixture-standin-… → {project: organizer-fixture, agent: pablo}`.
  - The config has `discuss_state_dir: /private/tmp/organizer-fixture.AARuIA/discuss` and 0 lines matching `state/discuss|9494|.local/state|.local/share/organizer`.
  - `DISCUSS_BIND='unix:…/discuss/none.sock'`, and the socket file does not exist.
  - Without `--review`, branch and main give the same normalised env output and config, a 405-file tree that is the same apart from temp names, pids and git object hashes, and stderr that differs only in temp names. There is no `DISCUSS_BIND` and no tokens.json.
  - I ended the 24 stand-in agents by the pids I saved (`organizer-fixture-agent`, checked with `ps` first) and removed the temp homes.
- **X0 met.**
  - `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **reused** run `7a530487-88382` of 490b943f6bf8 (started by organizer-probe-l51-comp-ui), exit 0. Go is all ok; vitest gives `Test Files 84 passed (84)` and `Tests 1153 passed (1153)`.
  - `test-lease run -- pnpm run build` exits 0 (`✓ built in 1.33s`). `test-lease run -- wails build` exits 0.
  - `git status --porcelain` in the clone was empty, before and after `git checkout -- frontend/wailsjs/runtime`.

### Notes (none blocking)
- Note, to the next leftovers (Amendment 2 defers it): `.rail-item` keeps its own base ease (global.css `.rail-item` and the reduced-motion block). So the rail's selected fill still eases as it leaves, though `.rail-item.active` is none. The builder records the same.
- Note, to the FSE (outside this Boundary, and older than this card): two marks outside lf48's list sit on bases that carry their own transition, so they ease in and out.
  - `roles.css:31` `.r-row[aria-expanded="true"]` (its base `.r-row` eases background, :27).
  - `rule-box.css:118` `.rb-option.on span` (its base eases background and border, :111).
  - The design system's "a state mark never eases" reaches them too. They belong with Aglaea's answer on the layer pattern.
- Note, to the FSE: K1's NeedsMe-to-RuleBox `others` path is read, not rendered by a test; the RuleBox render is tested directly.
- Note, to the FSE: the review fixture shows mailbox errors on the absent socket (declared Risky). This is expected under FR-5.

Reviewer `l51-comp-review`, 2026-10-24.

## UI review
l51-comp-ui, 2026-10-24, re-review on **490b943**, which replaces the a88877d and d7605a9 reviews. **Verdict: pass.** There is no finding of severity 4 or 3.

- C3 is fixed.
- R43 and R49 (amended) hold.
- R46, R47 and R48 still hold.
- The spot-checked controls switch their marks at once.

Evidence is in `.wt-notes/l51-comp-ui/r3/`: harness logs `h-1024x612.txt` and `h-1440x872.txt`, shots `wk-*.png` and `rb-*.png`, config checks `dev-*-config-check.txt`, canned posts `posts-*.jsonl` and `killed.txt`.

**Shared test run: fresh.** The run was `7a530487-88382` of 490b943f6bf8, and l51-comp-review reused it. `make test` exited 0: Go ok, vitest 84 files and 1153 tests (`r3/x0-make-test.txt`). `make review-build` (test-lease, not shared) was ok.

**How the states were checked.** These are the same methods as the a88877d review.
- **The review build** from my worktree at 490b943, `--review --canned-post`, pid saved, killed by that pid.
  - AXPress on my pid: init-a › Conversations › po_ana › dev_bruno.
  - `screencapture -o -l` of its window 500 ms and 2 s after the last press, at 1440×900, plus a shot at 1024×640.
- **The offscreen WKWebView harness** against my own `wails dev` of a clean clone of 490b943, with a fresh fixture per size, 1024×612 and 1440×872.
  - Hover is emulated by copying each `:hover` rule as `.fh`, in place after its original.
  - Transitions are read with `getAnimations()`.
- **FR-5, as before.**
  - Each config has `discuss_state_dir` under its temp dir, `auth: off`, `canned_post` and `editor: /usr/bin/true`.
  - `DISCUSS_BIND` is the absent `none.sock`, and `tokens.json` holds one stand-in for organizer-fixture/pablo with no real path or socket.
  - A reply and a new thread from sup10's chat landed only in `posts.jsonl` at each size.

**Rows.**
- **C3: fixed.**
  - Harness at 1440: in the People panel, after a click on po_ana and then on dev_bruno, the 16 ms sample and every sample up to 2000 ms show one filled person row, the `.active` one. No animation runs on the row that lost it.
  - Review build: 500 ms and 2 s after the press, only dev_bruno is filled in the People panel and in the chat list (`rb-1440x900-C3-dev_bruno-*.png`). The AX tree has `.person.active` on dev_bruno only.
- **R43 (amended): pass, both sizes.**
  - From 16 ms to 2000 ms after each click, one chat row carries the `::before` fill, the `aria-current` one.
  - The snapshot draws one filled chat row.
- **R49 (amended): pass, both sizes.**
  - Non-current rows: `transition: background-color 0.1s cubic-bezier(0, 0.4, 0, 1)`. Hover in starts one 100 ms `--ease-out` transition, and hover out uses the same base rule.
  - Current row: `transition: none`. Its own background and its layer are unchanged on hover, and no animation starts.
- **R46: pass, both sizes.** The new-thread form (docked and from `+`), the reply box and the rule box in sup10's chat read `everyone (wakes 3)`, fse, po_ana, dev_bruno, then `Others` [sup10]. sup10 shows once in each.
- **R47: pass, both sizes.** The head and `+` sit above and outside `.chats-rows`. The landing on sup10 needs no scroll, and a forced 59 px scroll leaves the head and `+` in place.
- **R48: pass at 1024×612.**
  - Cut journal (580→608 under the 594 edge) is revealed whole by one click (scrollTop 13→27).
  - A wholly visible row does not move.
  - At 1440 nothing is cut.
- **Amendment 3 spot check.**
  - Every listed control present on these screens reads `transition: none` at base and under hover, with no animation: `button.person` 3, `.tiny-btn[aria-pressed]` 2, `.subtabs button` 6, `.places .place-tab` 3, `.gear` 3, `.ihead-details` 1, `.memory button.memory-btn` 1 (1440); `.strip-all` 1, `.strip-item` 16 (1024).
  - Pressed in the harness:
    - Sub-tab Conversations → Agents: the inset accent underline moves at 16 ms and stays put to 500 ms.
    - Place tab Initiatives → Home: `.on` and its colour switch at the first sample.
    - No animation runs on either.
  - Absent on these screens and not checked: `.seg button`, `.stg`, `.fl-row`, `.week-list button`, `.ib-act .act`, `.ic-more`.

**Words, design vs screen.** `Others` (optgroup and list label), `Chats`/`CHATS`, `everyone (wakes 3)`: same as the design, unchanged.

**Findings.** None of severity 4 or 3. The list is kept, not new:
- The marked controls other than the chat row switch hover at once until they get layers (Amendment 3, next leftovers).
- R48 is undefined where the list fits.

**Design questions, for aglaea.** As before: whether A16's layer becomes the pattern for every marked control. Amendment 3 parks it for the next leftovers.

**Not verified in WKWebView.**
- A real pointer hover: rests on the computed transition, `getAnimations()` on the emulated hover, and the cascade.
- A frontmost window: I may not bring one front.
- The six listed controls absent from these screens.
