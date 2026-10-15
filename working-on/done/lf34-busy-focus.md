---
title: "One word for alive seats; a busy button keeps focus; focus then words"
status: done
repos: [organizer]
branch: lf34-busy-focus
seat: bf-build
stage: one-window
updated: 2026-10-15
next: "review: lf34-busy-focus, gate met (F1-F6, X0; U1-U4 fixed), 1dad95e"
depends_on: []
boundary: ["docs/specs/leftovers-34.md Boundary, lf34-busy-focus"]
spec: "docs/specs/leftovers-34.md (FR-1 to FR-3; launch-progress L24, L26, L27)"
gate: "docs/specs/leftovers-34.md Acceptance, rows F1, F2, F3, F4 and X0"
ui_review: true
review: pass
---

## Goal
An assumed-live seat reads idle; a busy button keeps focus and says what it is doing; focus moves before the reason is said (launch-progress Amendment 7).

## Gate
docs/specs/leftovers-34.md, rows F1, F2, F3, F4 and X0.

- [x] F1: at once (no feed since the press) and after the next feed, fse, po_ana, dev_bruno all read `idle` (`.wt-notes/bf-build/out/f1.jsonl`)
- [x] F2: helper and seven controls, aria-disabled, gerund, one call, focus kept (`.wt-notes/bf-build/out/f2-vitest.txt`)
- [x] F3: Start `Starting…` aria-disabled with focus, then the heading; 0 body samples (`.wt-notes/bf-build/out/f3.jsonl`)
- [x] F4: N3 and the race, focusin on `Attach fse` before the region's text (`.wt-notes/bf-build/out/f4.jsonl`, `out/f1.jsonl`)
- [x] F5: a resolved fake per control: Attach or the heading (Start), the new seat's row (New agent), the record's opener (Rule), the crew block's Retire… after the report (Retire), the comment field (Save), the reply field (docked Send), the new thread's divider (new thread, branch); never body (`.wt-notes/bf-build/out/f5-vitest.txt`)
- [x] F6: Start, New agent's Start and Retire busy with focus: element opacity 1, ring opacity 1, label and fill at 45%, ring 3.35:1 (3.57:1) on its panel (`.wt-notes/bf-build/out/f6.jsonl`, `out/wkwebview-1024x640-F6-*.png`)
- [x] X0: clean clone at 1dad95e, make test (16 Go packages, vitest 63 files / 732 tests), pnpm run build, wails build pass, status empty (`.wt-notes/bf-build/out/x0-*.txt`)
- F1, F3, F4 rerun on the round 2 code: same results (`out/f1.jsonl`, `out/f3.jsonl`, `out/f4.jsonl`)

## Done
- 2026-10-15 bf-build: busy rule helper `lib/busy.ts` on Start, Draft the cell's Open, Rule, Retire, comment Save and both Sends; assumed seats read idle; feed-closed confirm moves focus before the words; branch lf34-busy-focus at 87abf10 (progress: `.wt-notes/bf-build/progress.md`).

- 2026-10-15 bf-build, round 2 (UI review U1, Amendments 1 and 2): a sent new thread or branch lands on its divider, New agent's Start is busy, the rule words are readonly while ruling, busy keeps the focus ring at full strength; 1dad95e.

## Notes
- "New agent's Open" read as Draft the cell's Open, the only Open/Opening… in AgentsView; New agent's own Start has no busy state (progress.md, Found, not asked).
- F2 runs without a DOM (no DOM library in package.json): server render with seeded state and a stand-in focus; F3 is the live check.
- F6 reaches three of the eight busy controls in the fixture (Start, New agent's Start, Retire); Send needs a mailbox, Save and Rule were not driven; the same CSS rules draw them.
- Retire's result is its report (focus on Close); closing it lands on the crew block's Retire….
- F3's 20 ms interval stalls around the harness's key step; samples on every mutation and focusin cover it.

## Review
Verdict: pass. Round 2: every row checked at 1dad95e975eb88de51b9b27463857d9081415bf8 in a fresh clean clone (removed after). Nothing from round 1 (87abf10) counts. Unmet: none. Evidence in `.wt-notes/bf-review/r2/out/`.

- F1: Tab harness, 1024×640, my `wails dev` on 34202 (its own vite on 5174, serving my clone), fixture, auth off, probe stub through `ORGANIZER_PROBE_BIN`. N1 race: the stale feed shows fse off, then Start, and the real `CreateCrew` names fse running (Attach on `organizer-fixture-probe-fse`). At once, 0 feeds since the press: `fse:idle po_ana:idle dev_bruno:idle`. After the next real feed: the same (`f1.jsonl`). Met.
- F2: vitest (`f2-f5-vitest.txt`, 35 passing). The helper: props, a press while busy ignored, `disabled` kept when not busy. One test per FR-2 control with a pending fake call: crew Start, Draft the cell's Open, New agent's Start, Rule, Retire, comment Save, the docked Send, and the new thread's Start/Branch. Each shows `aria-disabled="true"`, no `disabled`, the gerund, and the call made once. The rule words are `readOnly`, not `disabled`. The other reasons still reach `disabled` (diff; tested for Send). Focus is a stand-in, since vitest here has no DOM. Met as written.
- F3: harness, fse off. Keydown 3826 ms, then Start `Starting…` aria-disabled with focus 3827, then the heading 4027; 9 samples, 0 `body` (`f3.jsonl`). The first try (`f3-interfered.jsonl`) is void: bf-ui's concurrent fixture ran a stand-in under the same session name `organizer-fixture-probe-fse`, so my fse read running. Rerun with only my stand-ins alive. The 20 ms interval stalls around the key step; mutation and focusin samples cover the gap. Met.
- F4: N3 (`f4.jsonl`): feed 3729, focusin `Attach fse` 3738, region text 3840. Race (`f1.jsonl`): focusin 4653, region text 4756. No `body`. Met.
- F5: vitest (`Busy.after.test.tsx`), with fake calls that resolve. Rule lands on the record's opener; the race on Attach; Retire, once its report closes, on the crew block's Retire…; Save on the comment field; the docked Send on the reply field. New agent lands on the new seat's row and a new thread or branch on its divider, with Send busy and focused until the thread is drawn. Never `body`. New agent, the new thread and the branch, and the race's `none`, drive the exported landing functions (`landNewAgent`, `landPosted`, `focusAfter`), not the effects that call them. The diff shows those effects call them. The queued Start's heading is F3. Met as written.
- F6: harness, a never-resolving fake per binding (`f6.jsonl`, `wkwebview-1024x640-F6-*.png`). Start, New agent's Start and Retire, each busy and focus-visible: element opacity 1, ring opacity 1, ring `rgb(138,63,252)`, label and fill at 45%. Ring contrast 3.35:1 on `rgb(32,27,43)` (Start, Retire) and 3.57:1 on `rgb(26,21,35)` (New agent). Met.
- X0: `make test` exit 0 (16 Go packages ok, vitest 63 files / 732 tests), `pnpm run build` 0, `wails build` 0, `git status --porcelain` empty (`x0-*.txt`). Met.
- Boundary and No-gos: the diff touches `lib/busy.ts` and its test, Crew, AgentsView, RuleDecisionBox, Retire, CardDrawer, Conversation, their tests, `global.css` and `tokens.css` (busy colours). No Go, `Gate.tsx` or `lib/queue.ts`. No new Go binding. Conversation now also calls the existing `GetAgents` after a post.
- Shared test run: reused, run 7693e457-85575 of 1dad95e975eb (by organizer-probe-bf-ui).
- Reviewer bf-review, 2026-10-15, commit 1dad95e.

## UI review
Verdict: pass. Round 2: every row checked at 1dad95e975eb88de51b9b27463857d9081415bf8 in a fresh clean clone. Nothing from round 1 (87abf10) counts. F1 to F6 and X0 are met as written, and nothing of severity 4 or 3 remains. Reviewer bf-ui, 2026-10-15. Evidence in `.wt-notes/bf-ui/r2/`.

How each state was checked:
- F1 (FR-1, L26): Tab harness in WKWebView, 1024×640, my `wails dev` on 34203, fixture, auth off, probe stub through `ORGANIZER_PROBE_BIN`. N1 race with the real bound `CreateCrew`: the stale feed shows `fse:off`, Start is pressed. At once, 0 feeds since the press: `fse:idle po_ana:idle dev_bruno:idle`. After the next real feed: the same. No `body` (`r2/f1.jsonl`). Met.
- F2 (FR-2): vitest (in X0): `lib/busy.test.ts`, plus `Busy.controls.test.tsx` with one test per control of FR-2's eight (Start, Draft the cell's Open, New agent's Start, Rule, Retire, comment Save, docked Send, new thread Start/Branch). Each gets `aria-disabled`, no `disabled`, the gerund and one call. The rule words are readonly, never disabled. Other reasons still reach `disabled` (diff; test for Send with no body). Focus is a stand-in, since vitest has no DOM. Met as written.
- F3 (FR-2): harness, fse off, Return on Start: Start, then `Starting…` with aria-disabled and focus (3822 ms), then the heading (4078). 9 samples, 0 `body` (the one `BODY` in the file is before the press) (`r2/f3.jsonl`). Met.
- F4 (FR-3): N3: feed 3725, focusin `Attach fse` 3735, region text 3837 (`r2/f4.jsonl`). Race: focusin 4668, region text 4772 (`r2/f1.jsonl`). No `body`. Met.
- F5 (FR-2, Amendment 1): vitest `Busy.after.test.tsx` has a target for each control: Attach or the heading (Start), the seat row (New agent), the opener (Rule), the crew block's Retire… (Retire), the comment field, the reply field, and the divider for a new thread and a branch (Send stays busy and focused until the thread is drawn). It is a stand-in DOM. The new-thread case tests `NewThread` plus `landPosted`; the parent's `onPosted` effect is checked by code read only. Read in the commit that clears `posted`: the chat switch and the thread's section draw together, and the layout effect focuses the divider before paint. Met as written.
- F6 (Amendment 2, L28): harness, the page's binding replaced by a never-resolving call, focus on each busy control, computed styles in WKWebView (`r2/f6.jsonl`):
  - Start (`Starting…`): element opacity 1, ring `solid 2px rgb(138,63,252)` at opacity 1, ring contrast **3.35:1** on the crew panel `rgb(32,27,43)`. Label `rgba(255,255,255,.45)`, fill `rgba(138,63,252,.45)`.
  - New agent's Start: **3.57:1** on the page `rgb(26,21,35)`, same dim.
  - Retire (`Retiring…`): **3.35:1** on the modal `rgb(32,27,43)`. Label `rgba(255,77,99,.45)`, fill `rgba(255,77,99,.063)`.
  - Shots: `r2/wkwebview-1024x640-F6-{start,newagent,retire}-busy.png`. The ring reads at full strength around a dimmed `Starting…`.
  - Draft the cell's Open, Rule, Save and the Sends use the same `button.primary` / `tiny-btn` busy rules. Not focused live, since the fixture has no mailbox or draftable cell.
  - Met.
- X0: shared test run fresh, run 7693e457-85575 of 1dad95e (`make test` exit 0: 16 Go packages ok, vitest 732 tests). bf-review reused it. After my `wails dev`, `wails build` passed and `git status --porcelain` was empty.
- Boundary and No-gos: the diff touches only `frontend/src`: `lib/busy.ts` and its test, Crew, AgentsView, RuleDecisionBox, Retire, CardDrawer, Conversation, their tests, `global.css` and `tokens.css` (the busy tokens). No Go, `Gate.tsx` or `lib/queue.ts`, and no new service call (the `getAgents` after a post is an existing call).

Round 1 findings, rechecked at 1dad95e:
- U1 (sev 3, new thread or branch drops focus to the body): fixed. Send stays busy and focused until the feed carries the thread, then focus lands on its divider (`onPosted`, `landPosted`; F5). Checked by code read and vitest, not in WKWebView (no mailbox).
- U2 (sev 2, New agent's Start had no busy state): fixed. `busyButton`, `Starting…`, a second press starts nothing, Escape is held while starting. Busy look and ring measured live in F6.
- U3 (sev 2, rule words disabled while ruling): fixed. `readOnly`, and a second Cmd+Enter starts nothing (vitest).
- U4 (sev 2, the busy ring was dimmed to about 1.6:1): fixed. 3.35:1 or more measured (F6).

New findings (none of severity 4 or 3):
- **U5 (severity 2): a sent new thread that never reaches the feed leaves Send busy for good.** What the person cannot do: if `PostToCell` answers with a thread id but the reload never lists that thread, `Sending…` stays and nothing says why. Where: `Conversation.tsx` `onPosted`; there is no timeout, unlike Crew's `LIST_WAIT_MS`. Evidence: code read. Severity 2: it needs a feed that drops a thread it just created. Cancel still works. Proposal: the same two-feed fallback Crew uses, landing on the reply field.
- **U6 (severity 1): the busy tokens copy other tokens' values as rgba** (`--busy-fg` is `--fg` at 45%, and so on, `tokens.css`). Changing a role leaves its busy twin behind. The build had to, since the Safari 15 floor has no color-mix. Proposal: note it beside each role in `docs/design-system.md`.

Spec gaps (for the FSE):
- F2 and F5 ask for `document.activeElement` in vitest, which has no DOM here. Both rest on a stand-in. Only the crew Start's focus (F3) and the busy ring (F6, three controls) are seen live.

Design questions, for aglaea:
- U6: should busy colours be derived tokens named in the design system, so a role change carries its busy twin?
- The busy ring sits at 3.35:1 on the crew panel, just over the line. Any panel lighter than `rgb(32,27,43)` would take it under 3:1.

Not verified in WKWebView:
- F5's landings, U1's divider, Rule, the comment Save and both Sends live: the fixture has no discuss mailbox to post into, and no ruling was run.
- Whether VoiceOver speaks focus before the polite words (launch-progress A7).
- The review build (`make review-build`) was not launched for AX or screencapture. Every live row ran in the harness's WKWebView.
- `auth: firebase` states: not run, as the rules require. The diff touches no firebase path.
