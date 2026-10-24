---
title: "Every composer lists recipients one way, the Chats head stays put, a click reveals a cut row, and hover eases both ways"
status: next
repos: [organizer]
branch: lf51-composers
seat: l51-comp
reviewer: l51-comp-review, l51-comp-ui
stage:
updated: 2026-10-24
next: "review: lf51-composers, gate met (K1-K5, X0; K4 fixed: .rail-item.active), 15ec836"
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
Risky:
- `global.css`: every button's transition is now the base rule's 100 ms on background, border and colour; before, the reduced-motion block made it .12 s without colour
- `fixture-home.sh --review`: with a token, Conversations shows mailbox errors (absent socket) it used to hide behind "no token"
Not changed, on purpose:
- `frontend/src/styles/shell.css`, `roles.css`, `overview.css`, `work.css`: their own base transitions on some buttons are outside the boundary and the marked-controls list
- `internal/discuss`: the client still dials DISCUSS_BIND else 127.0.0.1:9494; the fixture points it away instead
- other `fixture-home.sh` modes: byte for byte as before

## Notes
- l51-comp: FR-4 eases hover both ways on `--ease-out` from the base rule; Amendment 15 UL4 also names `--ease-exit` for the way out, which a base-only rule cannot carry. Reviewer's call whether that matters for R49.

## Review
Verdict: **pass** at 15ec836 (restarted on the moved branch; the d7605a9 fail on K4 is superseded). Unmet gate items: none. K1-K5, X0 met.

### change-check (from a fresh clean clone at 15ec836)
```
repo organizer: base 774c338ff (default origin/main) ... head lf51-composers (clone HEAD 15ec8360a, on detached) 15ec8360a; 6 files
| outside boundary | frontend/src/components/Conversation.composers.test.tsx |  | added |
| outside boundary | frontend/src/components/Conversation.landing.test.tsx |  | modified |
| outside boundary | frontend/src/components/Conversation.reveal.test.tsx |  | modified |
| untested? | frontend/src/components/Conversation.tsx | isCut | no test file names it |
| untested? | frontend/src/components/Conversation.tsx | RecipientOptions | no test file names it |
| declared, not changed |  | frontend/src/styles/global.css:.rail-item.active | no matching change |
| declared, not changed |  | frontend/src/components/Conversation.landing.test.tsx:K4 | no matching change |
7 flags: outside boundary 3, undeclared 0, declared, not changed 2, new env var 0, new dependency 0, new host 0, untested? 2
```
- outside boundary ×3: Conversation.tsx's own tests, which the Boundary names; landing.test.tsx is also the CSS test that reads global.css (K4). Explained.
- untested? `isCut` (module-private, exercised through `rowReveal().click` in composers.test K3, top, bottom and ±0.5 px) and `RecipientOptions` (private, drawn by every K1 composer render). Explained.
- declared, not changed ×2: change-check matches symbols, and neither is one: `.rail-item.active` is a CSS selector and `K4` a describe name. The diff shows both: `git diff d7605a9 15ec836` adds `.rail-item.active, .rail-item.active:hover` to the `transition: none` list (global.css:654-655) and the `.rail-item → .rail-item.active` test. Explained.
- `git diff --stat main...15ec836`: the same 6 files; d7605a9..15ec836 changes only global.css and Conversation.landing.test.tsx in the boundary (Conversation.tsx, composers.test, reveal.test, fixture-home.sh byte-identical: `git diff --quiet` exit 0); the other files in that range are main's rebase. package.json and pnpm-lock.yaml unchanged: no new dependency.

### Rows
- **K1 met.** composers.test: `recipientsOf` cases; new thread, reply box and rule box each render `["", po_ana, dev_bruno, "# Others", sup10]` with `to=sup10`, `ghost` last under Others, a roster addressee not appended; Conversation's docked composer in sup10's chat the same. grep: the only recipient options are `RecipientOptions` (Conversation.tsx:824-825) plus each select's `everyone` (:656, :880, :1083); `shownSeats` is gone from src. Fails on main (0694b32, round 1): reply/rule box `expected [ '', 'po_ana', 'dev_bruno', 'sup10' ] to deeply equal [ …, '# Others', 'sup10' ]`, `recipientsOf` absent; new-thread rows already pass on main (lf48).
- **K2 met.** In `<nav class="chats">` the `Chats` label and `+` come before `<div class="chats-rows">`; search and every row are inside; `.chats` lost `overflow`, `.chats-rows` has `overflow: auto`. Main: `expected -1 to be greater than 0`.
- **K3 met.** `scrollIntoView` once with `{ block: "nearest" }`, no `behavior`, on a row cut at the bottom (and top); none on a visible row or on the commit after; reveal.test drives the same through Conversation's own onClick handlers. Main: `expected "vi.fn()" to be called 1 times, but got 0 times`.
- **K4 met.** The base `button` rule (global.css:22) carries `background|border-color|color var(--dur-fast) var(--ease-out)`, `--dur-fast: 100ms`; `button` left the reduced-motion block. Every state mark sets `transition: none` with its hover: the 16 listed fills, now `.rail-item.active` / `:hover` (specificity 0,2,0 beats `.rail-item`'s .12s at :356), `button:disabled`, aria-disabled. I reread global.css for every state-mark rule (`.active|.on|.current|.open|.selected`, `aria-current|pressed|expanded|selected`, `:disabled`): all on controls are covered; the rest are not controls or not fills: `.init.open` (no element), `.rail-group-tools.open` (a span, opacity), `.g-bar.open` (a Gantt bar's open end, radius/mask, no transition), `.tiny-btn:disabled` and `.person.active` resolve to none through `button:disabled` / `button.person.active`; `.card` has no state class. Fails on main: round 1, 19 failures (`expected 'background .12s ease, border-color .1…' to match …`); the new row on main 774c338: `× .rail-item → .rail-item.active …`, `AssertionError: expected null to be 'none'`.
- **K5 met.** From the 15ec836 clone, `eval`-able output of `scripts/fixture-home.sh --review`: `discuss/tokens.json` `-rw-------`, one entry `fixture-standin-… → {project: organizer-fixture, agent: pablo}`; config `discuss_state_dir: /private/tmp/organizer-fixture.*/discuss`, 0 lines matching `state/discuss|9494|.local/state`; `DISCUSS_BIND='unix:…/discuss/none.sock'` (no file). Without `--review` (round 1, script byte-identical since): stdout and stderr identical to main after normalising temp dir and pids, same 194-file tree, no tokens.json. Stand-in pids ended by saved pid, temp homes removed.
- **X0 met.** `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run `96a4669c-74360` of 15ec836, exit 0: Go packages ok, `Test Files 83 passed (83)`, `Tests 1136 passed (1136)`. `pnpm run build` exit 0 `✓ built in 1.54s`; `wails build` exit 0; `git status --porcelain` empty.

### Notes
- Note: K4 and FR-4 say a control *carrying* a mark has no transition; when the mark leaves, the row is back on the base rule, whose 100 ms ease then fades the fill out. l51-comp-ui's C1 (R49) is this. The gate as written is met; if "lands and leaves at once" is wanted, FR-4/K4 need a rule for the leaving mark. To the FSE.
- Note: Amendment 15 UL4 names `--ease-exit` for leaving hover; the branch eases both ways on `--ease-out`. To the FSE.
- Note: K4 reads only global.css; buttons with their own base transition in shell.css, roles.css, overview.css, work.css are unchecked for marks. To the FSE.
- Note: with a token, the review fixture shows mailbox errors on the absent socket (declared Risky); expected under FR-5. To the FSE (UI reviewer saw it).

Reviewer `l51-comp-review`, 2026-10-24.

## UI review
l51-comp-ui, 2026-10-24, on **d7605a9**. **Verdict: fail**, on one finding of severity 3 (C1, R49). R46, R47 and R48 pass. Evidence is in `.wt-notes/l51-comp-ui/out/`: harness logs `h-1024x612.txt` and `h-1440x872.txt`, shots `wk-*.png`, config checks `dev-*-config-check.txt`, canned posts `posts-*.jsonl` and `killed.txt`.

**Shared test run: reused.** The run was `96692d28-76344` of d7605a92f705, started by l51-comp-review. `make test` exited 0: Go ok, vitest 83 files and 1135 tests (`x0-make-test.txt`). `make review-build` (test-lease, not shared) was ok.

**How the states were checked.**
- **The review build.** It ran from my worktree with `--review --canned-post`, pid saved, and was killed by that pid. The screen was unlocked and its window shot at 1024×640 and 1440×900 on Home (`rb-*-home-base.png`). Its AX tree exposed no web content (one empty AXGroup), so no row could be pressed in it.
- **Every row below** ran in the offscreen WKWebView Tab harness (as-ui's, l48-ui's copy). The harness ran against my own `wails dev` of a clean clone of d7605a9, with a fresh `--review --canned-post` fixture per run. Sizes 1024×612 and 1440×872 are the content areas of 1024×640 and 1440×900.
- **I added one `mouse` step**, an NSEvent sent only to the harness's offscreen window. It never reached `:hover` (`matches(':hover')` stayed false), so hover in WKWebView is not verified.
- **FR-5.**
  - Every config had one `discuss_state_dir` under its temp dir, `auth: off` and `canned_post`, plus `editor: /usr/bin/true`.
  - `DISCUSS_BIND` was `unix:$tmp/discuss/none.sock`.
  - `tokens.json` (0600) holds one `fixture-standin-…` key for organizer-fixture/pablo. No line in it or in the config points at `~/.local/state/discuss`, 9494 or a real socket.
  - `+` is enabled, with no no-token line.
  - A reply and a new thread from sup10's chat landed as two JSON lines in `$tmp/posts.jsonl` (`to: sup10`), and nothing else was dialled.
  - The fixture's own startup line `no thread asks pablo (discuss 127.0.0.1:9494: … tokens.json)` fails on the missing temp file before any dial. That line was there before this branch.

**Rows.**
- **R46: pass, both sizes.** In sup10's chat, the new-thread form (docked, and again by `+`) and the reply box (after a click on the `rv-fixture: …` divider) read `everyone (wakes 3)`, fse, po_ana, dev_bruno, then `<optgroup label="Others">` with [sup10]. The rule box (needs me › Rule w-asks-pablo, sup10 still under Others in the list) reads the same. sup10 shows once in each. Shots: `wk-*-R46-*.png`.
- **R47: pass, both sizes.** Agents › Message is `openSlack('init-a','sup10')`.
  - At 1024×612 the head [74,193→217] and `+` [233,193→257,217] sit above `.chats-rows` [223→594] and outside it (`headInRows` false). `elementFromPoint` at `+` is `+`. The only scroller is `.chats-rows`.
  - sup10 lands in view [525→553] with no scroll.
  - Forcing the rows to scrollTop 59 leaves the head and `+` rects unchanged. 1440 is the same.
- **R48: pass at 1024×612.** journal was cut at the bottom edge (580→608 under 594; rows at scrollTop 13). One click reveals it whole (566→594, scrollTop 27, instant), and the head does not move. A click on a wholly visible row (needs po_ana) leaves scrollTop at 27. At 1440×872 the list fits, so no row can be cut. That case is checked only at 1024.
- **R49: fail (C1).**
  - Computed `transition` on non-current rows (fse, sup10) is background, border-color and color at 0.1s `cubic-bezier(0,.4,0,1)` (`--ease-out`). No `.chat:hover` rule sets a transition, so leaving hover eases on the same 100 ms.
  - The current row reads `none / 0s`, and `.chat.active:hover` reads `none`. `button:disabled` reads `none`.
  - A newly current row has its fill within 16 ms.
  - The mark leaving a row is not at once. That is C1.

**Findings.**
- **C1 (3), R49 and UL4, regresses Amendment 13 R43.**
  - What Pablo cannot do: tell which chat is shown after a click. The row that loses the current mark keeps its fill while the new row gains it.
  - Where: `wk-1024x612-R49-after-mark-moves.png` shows channel, fse, po_ana and dev_bruno all drawn filled and outlined, with dev_bruno the only `.active`. In `wk-1024x612-R48-after-cut.png`, six rows are filled after one click on journal.
  - Evidence (`L2` in `h-1024x612.txt`):
    - po_ana is clicked, then dev_bruno.
    - po_ana loses `.active` within 16 ms and takes `transition: 0.1s` from the base rule.
    - In a window that draws no frames its fill `rgba(138,63,252,.18)` is still there at 2000 ms, and the snapshot (WebKit's own rendering) draws it.
    - In a window that draws frames this would be a 100 ms ease-out of the old fill. That was not verified: the review build exposes no rows to AX.
    - lf48 FR-2 removed exactly this lag. R43 ("the only non-transparent fill in the list is on the clicked row", read about 400 ms after a click in this harness) passed on lf48 and now fails.
  - Cause: FR-4 puts the ease on the base rule. A mark that leaves goes to the base style, and CSS takes a transition from the style after the change. So a leaving mark eases just as a leaving hover does. UL4 calls that the greater fault: "a hover that switches at once is the lesser fault than a mark that lags". The builder built FR-4 as written. The spec contradicts itself, and no stylesheet-only rule meets both FR-4 and "a mark never eases".
  - Proposal: one of
    - (a) the old row drops its transition for the frame its mark leaves (a short-lived class set by the list on a pick);
    - (b) hover's ease kept on `:hover` only, giving up ease-out (lf48 as it was, UL4 reversed);
    - (c) Aglaea accepts a 100 ms fade of the leaving mark and drops R43's no-frames reading.
    - Not the builder's call: for aglaea and the FSE first.
- **C2 (1), for aglaea.** Hover out uses `--ease-out`, not the `--ease-exit` UL4 names. The base rule cannot carry two curves, as the builder noted. Recorded only.

**Words, design vs screen.** `Others` (UL1, optgroup label) reads `Others`: same. `Chats` (head) reads `CHATS` via the shared uppercase: same. `everyone (wakes 3)` is unchanged.

**Spec gaps, for the FSE.** FR-4 and UL4 do not say what the row that loses a mark does. The two sentences conflict for it (C1). R48 is undefined where the list fits, at 1440×900.

**Design questions, for aglaea.** C1's choice among (a), (b) and (c). C2.

**Not verified in WKWebView.**
- Real pointer hover in and out. The offscreen `:hover` was never reached, so R49's hover half rests on computed styles and CSSOM.
- C1 in a window that draws frames. The review build's web content is not in its AX tree.
- Keyboard order of the head after the move.

