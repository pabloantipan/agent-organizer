---
title: "Every composer lists recipients one way, the Chats head stays put, a click reveals a cut row, and hover eases both ways"
status: next
repos: [organizer]
branch: lf51-composers
seat: l51-comp
reviewer: l51-comp-review, l51-comp-ui
stage:
updated: 2026-10-24
next: "review: lf51-composers, gate met (K1-K5, X0; C1 per Amendment 2: the chat mark on its own layer), a88877d"
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
- l51-comp, round 3: the other marked controls in K4's list still take button's base ease, so their leaving mark eases out over 100 ms (C1's mechanism); Amendment 2 scopes the layer to the chat row (`.rail-item` next leftovers). Most of those fills live outside this card's boundary; a next-leftovers item if it matters.

## Review
Verdict: **pass** at a88877d (third round; the 15ec836 pass and the d7605a9 fail are superseded). Gate: K1-K5 with K4 as amended by Amendment 2 (f16e172), and X0. Unmet gate items: none.

### change-check (from a fresh clean clone at a88877d)
```
| outside boundary | frontend/src/components/Conversation.composers.test.tsx |  | added |
| outside boundary | frontend/src/components/Conversation.landing.test.tsx |  | modified |
| outside boundary | frontend/src/components/Conversation.reveal.test.tsx |  | modified |
| untested? | frontend/src/components/Conversation.tsx | isCut | no test file names it |
| untested? | frontend/src/components/Conversation.tsx | RecipientOptions | no test file names it |
| declared, not changed |  | frontend/src/styles/global.css:.rail-item.active | no matching change |
| declared, not changed |  | frontend/src/components/Conversation.landing.test.tsx:K4 | no matching change |
| declared, not changed |  | frontend/src/styles/global.css:.chat | no matching change |
| declared, not changed |  | frontend/src/components/Conversation.landing.test.tsx:K4 | no matching change |
9 flags: outside boundary 3, outside footprint 0, undeclared 0, declared, not changed 4, new env var 0, new dependency 0, new host 0, risk 0, untested? 2
```
- outside boundary ×3: Conversation.tsx's own tests, named by the Boundary; landing.test.tsx is also the CSS test that reads global.css. Explained.
- untested? `isCut` (private, exercised through `rowReveal().click` in composers.test K3) and `RecipientOptions` (private, drawn by every K1 composer render). Explained.
- declared, not changed ×4: change-check matches code symbols; CSS selectors (`.rail-item.active`, `.chat`) and a describe name (`K4`) are not symbols. The diff shows each: 83305c3..a88877d changes `.chat`, `.chat.active` and adds `.chat.active::before` (global.css:642-650) and four K4 tests; `.rail-item.active` none came in 15ec836 (still global.css list). Explained.
- `git diff --stat main...a88877d`: the same 6 files. 83305c3..a88877d touches only global.css and Conversation.landing.test.tsx; Conversation.tsx, composers.test, reveal.test and fixture-home.sh are byte-identical (`git diff --quiet` exit 0). Lockfile as on main: no new dependency.

### Rows
- **K1 met.** composers.test: `recipientsOf`; new thread, reply box, rule box each `["", po_ana, dev_bruno, "# Others", sup10]` for `to=sup10`, `ghost` last under Others, a roster addressee not appended; Conversation's docked composer the same. The only recipient options are `RecipientOptions` plus each select's `everyone`; `shownSeats` gone. Fails on main (round 1): `expected [ '', 'po_ana', 'dev_bruno', 'sup10' ] to deeply equal [ …, '# Others', 'sup10' ]`.
- **K2 met.** Label and `+` before `<div class="chats-rows">`, all rows and search inside; only `.chats-rows` scrolls. Main: `expected -1 to be greater than 0`.
- **K3 met.** `scrollIntoView({ block: "nearest" })` once on a cut row (top or bottom), none on a visible one or on the commit after, also through Conversation's own handlers. Main: `called 1 times, but got 0 times`.
- **K4 (amended) met.** Base `button` carries the 100 ms `--ease-out` on background, border, colour; the 15 other listed marks, `.rail-item.active` and disabled set `transition: none` with hover. The chat row: `.chat` has `transition: background-color var(--dur-fast) var(--ease-out)` and `.chat:hover` none of its own (hover eases in and out on one curve, no `--ease-exit`: C2); `.chat.active` keeps the base's `background: transparent; border-color: transparent` and sets `transition: none`; the fill and outline are `.chat.active::before` (absolute, inset -1px, z-index -1 under the content in the row's `z-index: 0` context, `transition: none`). My reading of the leaving row: its own background is transparent before and after the class goes, so its transition has nothing to run, and the layer goes with the class: no fill in the next frame (R43 amended). The row being clicked while hovered goes `--panel` → transparent under `.chat.active`'s `none`, so no fade there either. `.chat` is used only in Conversation.tsx. Reread global.css for every state-mark rule: covered, or not a control/fill (`.init.open` unused, `.rail-group-tools.open` a span, `.g-bar.open` a bar shape). Fails on main 09f65bb: `Tests 23 failed | 39 passed (62)` (base ease, 15 hovers, the four chat-row rows, rail-item, disabled). The new rows on 83305c3: `Tests 4 failed | 58 passed (62)`: `× .chat: hover eases the row's own background-color …`, `× .chat.active: the fill and outline are a ::before …`, `× .chat.active leaves the row's own background and border … (R43 amended)`, `× on the current row the fill does not change on hover`.
- **K5 met.** From the a88877d clone, `scripts/fixture-home.sh --review`: `discuss/tokens.json` `-rw-------`, one `fixture-standin-… → {project: organizer-fixture, agent: pablo}`; config `discuss_state_dir: /private/tmp/organizer-fixture.*/discuss`, 0 lines matching `state/discuss|9494|.local/state`; `DISCUSS_BIND='unix:…/discuss/none.sock'` (no file). Without `--review` the script is byte-identical to the one I diffed against main in round 1 (same stdout, stderr, 194-file tree). Stand-in pids ended by saved pid, temp home removed.
- **X0 met.** `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **reused** run `4430c780-32187` of a88877d52ed4 (started by l51-comp-ui), exit 0: Go ok, `Test Files 84 passed (84)`, `Tests 1152 passed (1152)`. `pnpm run build` exit 0 `✓ built in 1.37s`; `wails build` exit 0; `git status --porcelain` empty.

### Notes
- Note (the gate, to the FSE): Amendment 2 moves only the chat row's mark to a layer and defers `.rail-item.active`; it is silent on the other 15 marked controls (`button.person.active`, `.seg button.on`, `.subtabs button.on`, `.places .place-tab.on`, `.gear.on/.open`, `.stg.current`, …). On main their bases carried `transition: none` because "a transition is read from the style after the change" (0694b32 global.css:646, the base list ending :665); FR-4 as first written put the ease on the base and this branch removed those bases (`grep -c '^button.person,$'`: main 1, a88877d 0). So on those controls a leaving mark now eases out over 100 ms: C1 on every one but the chat row and the rail. The builder followed the gate; the gate needs the layer (or the leave rule) for them too, in this card or the next leftovers.
- Note: the review fixture shows mailbox errors on the absent socket (declared Risky); expected under FR-5. To the FSE.

Reviewer `l51-comp-review`, 2026-10-24.

## UI review
l51-comp-ui, 2026-10-24, re-review on **a88877d**, which replaces the d7605a9 review. **Verdict: fail**, on one finding of severity 3 (C3).

- R46, R47 and R48 still pass.
- R43 and R49, as amended, pass on the chat list: C1 is fixed, and C2 is settled by Amendment 2.
- The People panel's person rows keep the leaving-mark lag that C1 had. This branch made them lag.

Evidence is in `.wt-notes/l51-comp-ui/r2/`: harness logs `h-1024x612.txt` and `h-1440x872.txt`, shots `wk-*.png` and `rb-*.png`, config checks `dev-*-config-check.txt`, canned posts `posts-*.jsonl` and `killed.txt`.

**Shared test run: fresh.** The run was `4430c780-32187` of a88877d52ed4, and l51-comp-review reused it. `make test` exited 0: Go ok, vitest 84 files and 1152 tests (`r2/x0-make-test.txt`). `make review-build` (test-lease, not shared) was ok.

**How the states were checked.**
- **The review build**, from my worktree at a88877d with `--review --canned-post`, pid saved, killed by that pid.
  - This time its AX tree exposed the page.
  - I opened init-a › Conversations with AXPress on my pid and pressed chat rows: channel, then po_ana, then dev_bruno. I shot `screencapture -o -l` right after each press and 500 ms later (`rb-1440x900-R43-*.png`, `rb-1440x900-people-after-2s.png`).
  - Home is shot at 1024×640 and 1440×900.
- **The offscreen WKWebView harness**, as in the first review, against my own `wails dev` of a clean clone of a88877d, with a fresh fixture per size. The sizes are 1024×612 and 1440×872.
  - Offscreen, `:hover` cannot be reached. Hover was emulated by copying each of the page's 105 `:hover` rules as `.fh`, inserted right after its original so cascade order holds, then toggling `.fh`.
  - Transitions were read with `getAnimations()`.
- **FR-5, as before.**
  - Each config has `discuss_state_dir` under its temp dir, `auth: off`, `canned_post` and `editor: /usr/bin/true`.
  - `DISCUSS_BIND` is the absent `none.sock`. `tokens.json` (0600) holds one stand-in key for organizer-fixture/pablo, with no real path or socket in it.
  - At each size a reply and a new thread from sup10's chat landed only in `posts.jsonl`.

**Rows.**
- **R46: pass, both sizes.** In sup10's chat, the new-thread form (docked and from `+`), the reply box and the rule box (needs me › Rule w-asks-pablo) read `everyone (wakes 3)`, fse, po_ana, dev_bruno, then `<optgroup label="Others">` with [sup10]. sup10 shows once in each.
- **R47: pass, both sizes.**
  - The head and `+` sit above `.chats-rows` and outside it. `elementFromPoint` at `+` is `+`.
  - Landing on sup10 (`openSlack`) needs no scroll. A forced scroll of 59 px leaves the head and `+` rects unchanged.
- **R48: pass at 1024×612.**
  - journal was cut at 580→608 under the list's 594 edge. One click reveals it whole (566→594, scrollTop 13→27), and the head does not move.
  - A click on a wholly visible row leaves scrollTop at 27.
  - At 1440 the list fits, so no row can be cut there.
- **R43 (amended): pass on the chat list.**
  - Harness: po_ana is clicked, then dev_bruno. At 16 ms after each click, and at every sample up to 2000 ms, the chat list has one fill, the `::before` layer of the `.active`/`aria-current` row. The old row reads background transparent with no layer and no running animation.
  - The snapshot (`wk-*-R49-after-mark-moves.png`) draws one filled chat row.
  - In the review build's window, 500 ms after each press, only the pressed chat row is filled.
- **R49 (amended): pass.**
  - A non-current row (fse, sup10) has computed `transition: background-color 0.1s cubic-bezier(0, 0.4, 0, 1)`, which is `--ease-out`.
  - Hover in starts one `background-color 100ms cubic-bezier(0, 0.4, 0, 1)` transition.
  - No `.chat:hover` rule sets a transition, so hover out eases on the same base rule. The emulated hover-out could not show it, because offscreen the in-transition never advanced.
  - The current row (channel): `transition: none`. Its own background stays transparent and its layer stays `rgba(138,63,252,.18)` with and without hover, and no animation starts.
  - A new current row has its layer within 16 ms.
  - C2: one curve, `--ease-out`, as Amendment 2 says.

**Findings.**
- **C3 (3), the design system's "a state mark never eases" (A15 UL4 as corrected by A16); same defect as C1.**
  - What Pablo cannot do: tell which seat is selected in the People panel after picking another chat. The person row that loses `.active` keeps its fill, so two or three seats read as selected.
  - Where: the People panel beside Conversations, open at 1440.
    - `r2/wk-1440x872-R49-after-mark-moves.png` (crop `r2/c-wk-1440-people.png`) has fse, po_ana and dev_bruno all filled, and only dev_bruno is `.active`.
    - In the review build's own window, `r2/rb-1440x900-people-after-2s.png` has po_ana and dev_bruno filled 2 s after the press, with only dev_bruno `.person.active` in the AX tree.
  - Evidence: harness `L2` (1440): from 16 ms to 2000 ms after each click, the old person rows read `rgba(138,63,252,.18)` with `background-color 100ms … running`.
  - Cause:
    - On main, `button.person` was in the `transition: none` base list (lf48 FR-2).
    - FR-4 (d7605a9, now c0369ec..83305c3) removed that list, so `button.person` rides `button`'s 100 ms ease.
    - Amendment 2 moved only `.chat`'s mark onto a layer, and kept `.rail-item.active`. `button.person.active` is still filled on its own background, and leaves by easing.
    - In a window that draws frames this is a 100 ms fade. The review build's window, occluded and never brought front, kept it, like the harness.
  - Proposal: the same `::before` layer for `button.person.active`, in `global.css`, which is inside the boundary. Or, as Amendment 2's fallback for `.rail-item`, restore `transition: none` on `button.person`'s base until its layer comes. For the FSE.
  - The other controls FR-4 took out of that list (`.subtabs button`, `.seg button`, `.strip-item`, `.places .place-tab`, `.stg`, `.fl-row` and the rest) lose their marks the same way. I did not measure them.

**Words, design vs screen.** `Others` (optgroup and list label), `Chats`/`CHATS`, `everyone (wakes 3)`: same as the design, unchanged since d7605a9.

**Spec gaps, for the FSE.**
- Amendment 2 names the chat row and `.rail-item` and is silent on `button.person` and the rest of the old `transition: none` list, which FR-4 now makes ease when a mark leaves (C3).
- R48 is undefined where the list fits (1440).

**Design questions, for aglaea.** Whether A16's layer is the pattern for every state-marked control, and so whether R43's no-frames reading applies to the People panel and the other marked controls.

**Not verified in WKWebView.**
- A real pointer hover, in or out: rests on the computed transition, `getAnimations()` on an emulated hover, and the cascade.
- A frontmost, drawing review window: I may not bring it front.
- Keyboard order of the head.
