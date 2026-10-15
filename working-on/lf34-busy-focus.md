---
title: "One word for alive seats; a busy button keeps focus; focus then words"
status: now
repos: [organizer]
branch: lf34-busy-focus
seat: bf-build
stage: one-window
updated: 2026-10-15
next: "review: lf34-busy-focus, gate met (F1-F4, X0), 87abf10"
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
- [x] X0: clean clone at 87abf10, make test, pnpm run build, wails build pass, status empty (`.wt-notes/bf-build/out/x0-*.txt`)

## Done
- 2026-10-15 bf-build: busy rule helper `lib/busy.ts` on Start, Draft the cell's Open, Rule, Retire, comment Save and both Sends; assumed seats read idle; feed-closed confirm moves focus before the words; branch lf34-busy-focus at 87abf10 (progress: `.wt-notes/bf-build/progress.md`).

## Notes
- "New agent's Open" read as Draft the cell's Open, the only Open/Opening… in AgentsView; New agent's own Start has no busy state (progress.md, Found, not asked).
- F2 runs without a DOM (no DOM library in package.json): server render with seeded state and a stand-in focus; F3 is the live check.
- F3's 20 ms interval stalls around the harness's key step; samples on every mutation and focusin cover it.

## Review
Verdict: pass. Every row met at 87abf10c9e4048e65aff190f26a528ae1b09283a; unmet: none. Evidence in `.wt-notes/bf-review/out/`.

- F1: Tab harness (builder's steps, my clean clone, my `wails dev` on 34202, fixture, auth off, probe stub via `ORGANIZER_PROBE_BIN`), N1 race: stale feed shows fse off, Start pressed, the real `CreateCrew` names fse running (Attach on `organizer-fixture-probe-fse`). At once, 0 feeds since the press: `fse:idle po_ana:idle dev_bruno:idle`; after the next real feed: the same (`out/f1.jsonl`). Met.
- F2: vitest, `lib/busy.test.ts` (props, a press while busy ignored, disabled kept when not busy) and `Busy.controls.test.tsx`, one test per control with a never-resolving fake call: Start, Open (Draft the cell), Rule, Retire, comment Save, the docked Send and the new-thread Start/Branch, each `aria-disabled="true"`, no `disabled`, the gerund, the call once. 24 passing (`out/f2-vitest.txt`). The diff passes the other reasons (`!ready`, no plan, empty body or subject) to `disabled`, tested for Send. Focus is a stand-in, since vitest here has no DOM; F3 is the live check. Met.
- F3: harness, fse off: keydown 3830 ms, Start `Starting…` aria-disabled with focus 3832, heading `Starting 1 seat…` 4061; 9 samples, 0 `body` (`out/f3.jsonl`). The 20 ms interval stalled from 3535 to 4061 around the key step, so samples between come from every mutation and focusin, which any focus loss would trigger. Met.
- F4: N3 (`out/f4.jsonl`): applyAgents with fse live 3730, focusin `Attach fse` 3740, region text 3842. Race (`out/f1.jsonl`): focusin `Attach fse` 4680, region text 4783. No `body` in either. Met.
- X0: fresh clone at 87abf10: `make test` exit 0 (16 Go packages ok, vitest 62 files / 721 tests), `pnpm run build` 0, `wails build` 0, `git status --porcelain` empty (`out/x0-*.txt`). Met.
- Boundary and No-gos: the diff touches only `lib/busy.ts` and its test, Crew, AgentsView, RuleDecisionBox, Retire, CardDrawer, Conversation, their tests and `global.css` (aria-disabled drawn as disabled). No Go, `Gate.tsx` or `lib/queue.ts`. No new service call.
- Spec naming: FR-2's "New agent's Open (`Opening…`)" names no control. New agent's own submit is `Start`, which still has no busy state (a second press can start a second seat). I judged it as Draft the cell's Open, the only `Opening…` in AgentsView.tsx. Raised to sup71.
- Shared test run: reused, run 89bc8959-43994 of 87abf10c9e40 (by organizer-probe-bf-ui).
- Reviewer bf-review, 2026-10-15, commit 87abf10.

## UI review
Verdict: fail, on U1 (severity 3). Every row checked at 87abf10c9e4048e65aff190f26a528ae1b09283a; F1, F3, F4 and X0 met as written, F2 met as written. Reviewer bf-ui, 2026-10-15. Evidence in `.wt-notes/bf-ui/`.

How each state was checked:
- F1 (FR-1, L26): Tab harness in WKWebView, 1024×640, my clean clone, my `wails dev` on 34203, fixture, auth off, probe stub through `ORGANIZER_PROBE_BIN`. N1 race: the stale feed shows fse off, Start pressed, the real bound `CreateCrew` answers fse running (`Starting…` 4562 ms, Attach on `organizer-fixture-probe-fse` 4674). At once, 0 feeds since the press: `fse:idle po_ana:idle dev_bruno:idle`; after the next real feed: the same. No `body` (`out/f1.jsonl`). Met.
- F2 (FR-2, L27): vitest read, not rerun apart (it passed inside X0): `lib/busy.test.ts` and `Busy.controls.test.tsx`, one test per control of the seven (Start, Draft the cell's Open, Rule, Retire, comment Save, docked Send, new thread Start/Branch). Diff: the other reasons (`!ready`, no plan, empty body or subject, `!canPost`) still reach `disabled`; one test covers it (Send, no body). Focus is a stand-in (no DOM in vitest), so F3 is the only live focus evidence. Met as written.
- F3 (FR-2): harness, fse off, Return on Start: Start, then `Starting…` with `aria-disabled="true"` and focus (3827), then the heading (4069); 10 samples, 0 `body` (`out/f3.jsonl`). A second run, 9 samples, 0 `body` (`out/f3shot.jsonl`). The 20 ms interval stalls ~300 ms around the key step, as the builder noted; mutation and focusin samples cover it. Met.
- F4 (FR-3, L24 amended): N3 (`out/f4.jsonl`): feed 3726, focusin `Attach fse` 3736, region text 3839. Race (`out/f1.jsonl`): focusin 4674, region text 4778. No `body`. Met.
- Busy look: computed styles in WKWebView (`steps/out/css.txt`): `[aria-disabled="true"]` and `:disabled` draw the same (opacity .45, cursor default, same background, border and text) for primary, danger, ghost and plain buttons. Matches the Boundary.
- Boundary and No-gos: the diff touches `lib/busy.ts` and its test, Crew, AgentsView, RuleDecisionBox, Retire, CardDrawer, Conversation, their tests and `global.css`. No Go, `Gate.tsx` or `lib/queue.ts`, and no new service call.
- Shared test run: fresh, run 89bc8959-43994 of 87abf10c9e40 (`make test` exit 0: 16 Go packages ok, vitest 62 files / 721 tests). bf-review reused it.

Findings:
- **U1 (severity 3): a new thread or a branch drops focus to the body once it is sent.** What the person cannot do: a keyboard or VoiceOver user who starts a thread (or a branch) in Conversations loses their place when the post succeeds. The next Tab starts at the top of the window, and the new thread is announced nowhere. Where: `Conversation.tsx` `NewThread` `send`: on success `onDone` unmounts the form, and with it the focused `Sending…` button. The parent's `goTo` sets the target and scrolls without landing focus (the landing branch runs only for `landOn`), and `ReplyBox` takes focus on mount only for `replyTo`. The builder fixed this end for the docked Send and the comment Save, not here (progress.md, Found: "focus can reach the body"). Evidence: code read at 87abf10, not seen in WKWebView (see Not verified). It goes against the design system's "focus never drops" ("when the focused thing leaves, focus goes to a named next target … never the body") and FR-2's "keeps focus until the result moves it". F2 tests only the pending state, so the gate is met and the rule is not. Proposal: on success, land on the new thread as `landOn` does (focus its divider), or focus the `ReplyBox` field that replaces the form. Same for a branch.
- **U2 (severity 2): New agent's Start has no busy state.** A second Return while `createAgent` is pending starts a second seat (builder's Found; code read `AgentsView.tsx` `NewAgent.create`). FR-2 names "New agent's Open", which is no control: the builder wired Draft the cell's Open. Not a fail: the spec does not name this control. Proposal: give the FSE the naming fix; New agent's Start goes on `busyButton`.
- **U3 (severity 2): the rule box's words field is `disabled` while ruling.** Cmd+Enter from the words drops focus to the body during the call (builder's Found; code read). Only the Rule button is in FR-2.
- **U4 (severity 2, for aglaea): a focused busy control's focus ring is dimmed with it.** Opacity .45 applies to the outline too: #8a3ffc over the crew panel `rgb(32,27,43)` comes out near (80,43,137), about 1.6:1 against the panel, under 1.4.11's 3:1 for a focus indicator. Before this card a disabled button never held focus, so this is new. Computed: outline `solid 2px rgb(138,63,252)` with opacity .45 on the element.

Spec gaps (for the FSE):
- FR-2's "New agent's Open (`Opening…`)" names no control (U2).
- FR-2 says "until the result moves it" but no row checks where the result lands for the seven controls. F2 checks only the pending state (U1).
- F2 asks for `document.activeElement` in vitest, but vitest here has no DOM. The stand-in proves the attribute, not focus.

Design questions, for aglaea:
- U4: should busy dim the label only (or use another treatment) so the focus ring keeps 3:1?
- The design system's busy row still opens with "disabled," and then asks for `aria-disabled`. The first word reads as the attribute.
- Cancel and Escape stay live on a busy Start: they close the confirm while CreateCrew runs, and the list arrives later anyway. Intended?

Not verified in WKWebView:
- U1, U3 and the five controls besides Start live: the fixture has no discuss mailbox to post into or rule against. Judged from code and vitest.
- Whether VoiceOver speaks focus before the polite words (Amendment 7: for whoever has a screen).
- The review build (`make review-build`) was not launched for AX or screencapture: every live row ran in the harness's WKWebView instead. The busy Start lasts ~200 ms, too short for a window shot. There is one WKWebView snapshot, of the list heading after the press (`wkwebview-1024x640-F3-list-heading.png`).
- `auth: firebase` states: not run, as the rules require. The diff touches no firebase path.
