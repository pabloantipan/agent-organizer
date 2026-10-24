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
review: fail
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
Verdict: **fail** at d7605a9. Unmet gate items: **K4**. K1, K2, K3, K5, X0 met.

### change-check (from the clean clone at d7605a9)
```
risk: medium (missing, read as medium)
repo organizer: base 0694b32b3 (default origin/main) ... head lf51-composers (clone HEAD d7605a92f, on detached) d7605a92f; 6 files, 5 flags
## Flags
| outside boundary | frontend/src/components/Conversation.composers.test.tsx |  | added |
| outside boundary | frontend/src/components/Conversation.landing.test.tsx |  | modified |
| outside boundary | frontend/src/components/Conversation.reveal.test.tsx |  | modified |
| untested? | frontend/src/components/Conversation.tsx | isCut | no test file names it |
| untested? | frontend/src/components/Conversation.tsx | RecipientOptions | no test file names it |
5 flags: outside boundary 3, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2
```
- outside boundary ×3: Conversation.tsx's tests, which the Boundary names ("Conversation.tsx and its tests"); landing.test.tsx is also the CSS test that reads global.css (K4). Explained.
- untested? `isCut`: module-private; exercised through `rowReveal().click` in composers.test K3 (cut at top, bottom, ±0.5 px edges). Explained.
- untested? `RecipientOptions`: private component; every K1 composer render draws it. Explained.
- No undeclared, no declared-not-changed, no new dependency (package.json and pnpm-lock.yaml identical to main).

### Rows
- **K1 met.** composers.test: `recipientsOf` cases; new thread, reply box, rule box each render `["", po_ana, dev_bruno, "# Others", sup10]` with `to=sup10`, `ghost` last under Others, roster addressee not appended; Conversation's docked composer in sup10's chat the same. grep: the only recipient `<option>`s left are `RecipientOptions` (Conversation.tsx:824-825) plus each select's `everyone` option (:656, :880, :1083); `shownSeats` gone everywhere in src. Fails on main: reply/rule box `expected [ '', 'po_ana', 'dev_bruno', 'sup10' ] to deeply equal [ …, '# Others', 'sup10' ]`, `recipientsOf` not exported (new-thread rows pass on main, lf48's work).
- **K2 met.** composers.test K2: in `<nav class="chats">` the `Chats` label and `+` come before `<div class="chats-rows">`, search and every row inside it; global.css `.chats` lost `overflow`, `.chats-rows` has `overflow: auto`. Main: `expected -1 to be greater than 0`.
- **K3 met.** `scrollIntoView` called once with `{ block: "nearest" }` and no `behavior` on a row cut at the bottom (and top), none on a visible row, none on the commit after; reveal.test drives the same through Conversation's own onClick handlers (journal cut → one scroll; po_ana visible → none). Main: `expected "vi.fn()" to be called 1 times, but got 0 times`, and the two reveal.test K3 rows fail.
- **K4 not met.** The base `button` rule (global.css:22) carries `background|border-color|color var(--dur-fast) var(--ease-out)`, `--dur-fast: 100ms`, and `button` left the reduced-motion block; the 16 listed marks and their `:hover` set `transition: none`; `button:disabled` and aria-disabled set none. Main: 19 fail (`expected 'background .12s ease, border-color .1…' to match …`). But reading global.css for every state-mark rule, the test's list misses one:
  ```
  $ grep -n "rail-item" frontend/src/styles/global.css
  162:  cursor: pointer; margin-bottom: 2px; user-select: none; transition: background var(--dur-fast) var(--ease-out);
  165:.rail-item.active { background: var(--surface-selected); box-shadow: inset 2px 0 0 var(--accent); }
  356:  .card, .rail-item { transition: background .12s ease, border-color .12s ease; }
  $ grep -n 'rail-item' frontend/src/components/Rail.tsx
  302: <button … className={`rail-item folded ${selectedInitiative === id ? "active" : ""}`} …
  388: <button … className={`rail-item role ${roleOpen === r.name ? "active" : ""}`} …
  ```
  `.rail-item.active` is a selected mark on a button that sets no transition, so it rides `.rail-item`'s `.12s ease` (line 356, the very line this diff edited, which kept `.rail-item` in it): the rail's selected fill eases on and off. K4 expects "each state-mark rule sets `transition: none`" and FR-4 "a control carrying a state mark … has no transition at all". Other state-mark-looking rules in global.css checked and not controls: `.init.open` (no element uses it), `.rail-group-tools.open` (a span, opacity only); `.tiny-btn:disabled` (:574) and `.person.active` (:617) resolve to none through `button:disabled` / `button.person.active`.
- **K5 met.** `eval "$(scripts/fixture-home.sh --review)"` from the clone: `discuss/tokens.json` mode `-rw-------`, one entry `fixture-standin-… → {project: organizer-fixture, agent: pablo}`; config.yaml has `discuss_state_dir: /private/tmp/organizer-fixture.*/discuss`, 0 lines matching `state/discuss|9494|.local/state`; `export DISCUSS_BIND='unix:/private/tmp/organizer-fixture.*/discuss/none.sock'` (no file there). Without `--review`, branch vs main: stdout and stderr identical after normalising the temp dir and pids; the temp homes' file lists identical (194 files, no tokens.json, no DISCUSS_BIND). Main with `--review`: no tokens.json (the script's own stderr on the branch shows the two scripted calls ran before the token was written). Stand-in pids ended by saved pid, temp homes removed.
- **X0 met.** `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run `96692d28-76344` of d7605a9 (l51-comp-ui reused it), exit 0: Go packages ok, `Test Files 83 passed (83)`, `Tests 1135 passed (1135)`. `pnpm run build` exit 0 `✓ built in 1.45s`; `wails build` exit 0; `git status --porcelain` empty (wails touched nothing).

Fails on main: the three test files copied onto a clean clone of main 0694b32, `npx vitest run` of them: 32 failed (K1 8, K2 1, K3 4, K4 19), lines quoted above.

### Notes
- Note: Amendment 15 UL4 names `--ease-exit` for leaving hover; the branch eases both ways on `--ease-out` (builder's note). Not in the gate; to the FSE (or Aglaea's R49).
- Note: buttons whose base transition lives in other stylesheets (shell.css:121, :158, roles.css:27, overview.css:34, :104, work.css:59, :98, per the builder) are outside this boundary; whether any carries a state mark that eases is unchecked by K4, which reads global.css only. To the FSE.
- Note: with a token, the review fixture shows mailbox errors on the absent socket (declared Risky); expected under FR-5, for the UI reviewer.

Reviewer `l51-comp-review`, 2026-10-24.
