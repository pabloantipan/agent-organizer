---
title: A new thread's draft belongs to its chat (no wrong seat woken), draft marks, any column gives slack, names, IME, dates
stage: one-window
status: done
repos: [organizer]
branch: drafts-per-chat
updated: 2026-10-04
next: "merged 2242dbf; U2, U3 with aglaea; U1, G1, G2 for the FSE"
depends_on: [roles-ui]
boundary: ["frontend/src/lib/drafts.ts, lib/width.ts, lib/dates.ts and their tests", "frontend/src/components/Conversation.tsx and SlackView.tsx (drafts, names, times)", "frontend/src/components/DecisionsView.tsx (the To rule line's draft mark), Home.tsx (shareRoom's columns), Overview.tsx (the ruled date)", "frontend/src/components/RuleDecisionBox.tsx and CardDrawer.tsx (the IME guard only)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-10.md (FR-1 to FR-6); Aglaea's calls feeb8d6"
gate: "docs/specs/leftovers-10.md Acceptance, rows T1 to T5 and T0"
ui_review: true
seat: dpc-build
review: pass
---

## Goal
No draft wakes the wrong seat; the rest of drafts-and-slack's leftovers.

## Gate
- [x] T1-T5: see `docs/specs/leftovers-10.md`, Acceptance
- [x] T0: see `docs/specs/leftovers-10.md`, Acceptance

## Done
- 2026-10-04 merged to main as 2242dbf after code review pass and UI review pass at af63e7f (both engines); seats ended (sup39)
- 2026-10-04 dpc-build: FR-1 to FR-6 on drafts-per-chat (7 fix commits, rebased on main); T1-T5 hit-tested at 1512×945, rail strip, classic and overlay, in headless Chromium and in Deltagos Review.app (T2 in WKWebView classic only); T0 green from a clean clone. Evidence and choices: .wt-notes/dpc-build/progress.md
- 2026-10-04 0084 ruled by pablo ("Ok"); sup39 launched by the FSE
- 2026-10-04 cut from leftovers-10 by the FSE

## Next

## Blockers

## Review
- Verdict: pass (dpc-review, 2026-10-04), code and runnable checks; the WKWebView and visual rows are the UI reviewer's.
- Commit reviewed: af63e7f (branch drafts-per-chat, 7 commits on main).
- Unmet gate items: none.
- T1: new-thread drafts keyed `thread:<i>/new:<chat>` with `to`; Start posts only `newThreadPost` of its own chat; prefill carries its chat; lib test covers A→B→A and posting A from B returns null.
- T2: `· draft` on the collapsed line and `, draft` in its name. T3: `giveSlack` over shareRoom, with a test that a flexible column's slack goes first. T4: names on both selects of both forms and the search; `useImeEscape` (isComposing, 229, WKWebView's keyCode 27) in the composer, RuleDecisionBox and CardDrawer, runs before any close. T5: `timeWords` and `dateWords` in `lib/dates.ts`, no second helper. Drafts stay in memory (0081).
- Boundary: all 12 changed paths inside it; no Go, no design-system.md.
- T0 from a clean clone: make test (13 Go packages, 246 vitest), npm install/test/build, wails build all pass.

## UI review
- Commit run: af63e7f, every row (detached worktree .wt/dpc-ui, fixture from that clean checkout, now removed). Verdict: **pass**. No sev 4 or 3.
- Evidence: `.wt-notes/dpc-ui/` (drivers `rows.mjs`, `t3need.mjs`, `wk.swift`, `wk-t1.sh`…`wk-t5.sh`; logs `chromium-rows-{classic,overlay}.log`, `chromium-1512x945-rows-*.json`, `wk-t*-{classic,overlay}.txt`; crops `crop-*`). Chromium: wails dev :34555, headless Chromium, viewport 1512×913 (the 1512×945 window less its 32 px title bar); classic = 15 px bars, overlay = OverlayScrollbar, 0 px; `PostToCell` wrapped to count posts. WKWebView: `Deltagos Review.app` at 1512×945 exactly (frame read back), `-AppleShowScrollBars Always` (classic) / `WhenScrolling` (overlay); AX hit-tests (the AX element at the centre, or at both ends, belongs to the element); clicks refused outside its window. Rail as the strip (46 px) in every row.

| Row | Window, rail | Bars | Chromium | WKWebView | Result |
|---|---|---|---|---|---|
| T1 | 1512×945, strip | classic, overlay | `chromium-1512x945-T1-{A-typed,B-empty,A-restored}-*`: B empty, recipient po_ana (`Message to po_ana`); A back with subject, body, `fse`, `Start · draft`; Enter in B's empty body and the channel form post nothing; 0 posts | `webkit-1512x945-T1-{A-typed,B-empty,A-restored}-*`: same values; Subject, Recipient, Start hit; list `fse · draft 2`, `po_ana` unmarked; fse still 2 threads | pass |
| T2 | same | both | `chromium-…-T2-line-draft-*`: `0002 … owner pablo · 14 days · draft`, name `…, 14 days, draft`; draft words hit at the line's end, not clipped; no other line marked; Home `Rule · draft` | `webkit-…-T2-line-draft-*`, `crop-webkit-T2-classic.png`: same name, line hit, `· draft` drawn | pass |
| T3 | same | both | `chromium-…-T3-home-strip-*`, `-init-a-row-*`: 5 signals hit at both ends, no `+N`; but see U1 | `webkit-…-T3-home-strip-*`, `crop-webkit-T3-*`: `6 waiting · you, alejandro` / `1 blocked` / `1 now` / `7 live` / `6 problems` / `30 Nov` whole, both ends hit (`wk-t3-*.txt`) | pass |
| T4 names | same | both | `Kind of message`, `Recipient` (new thread and reply), `Search init-a's conversations` | AXPopUpButton `Kind of message`, `Recipient`; AXTextField `Search init-a's conversations`; all hit | pass |
| T4 IME | same | both | CDP `imeSetComposition` `´` then Escape (synthetic): composer, rule box, comment back to `abc `, boxes stay | Option-e dead key (ABC layout) then Escape: composer body and subject, Home rule box, card back comment: `caf´` → `caf`, box stays; second Escape closes; reopen `caf` (`webkit-…-T4-*-{composing,escaped}-*`) | pass (accented); Japanese not verified |
| T5 | same | both | `chromium-…-T5-{times,overview-ruled}-*`: `26 Sep 22:24`; `ruled 5 Aug`, both hit | `webkit-…-T5-*`: `26 Sep 22:24` hit, no ISO or AM/PM in the chat; `0001 … ruled 5 Aug` hit | pass |

Findings
- **U1 (sev 1)** In Chromium only, init-a's waiting signal reads `you, alejand…` at 1512 strip while Stage keeps ~39 px. Where: Home, init-a row (`crop-chromium-T3-classic.png`). Evidence: the lozenge is capped at `max-width: 142px` (shareRoom floors the cap); its text needs 128.6 px in 128; the cut test's `+ 1` tolerance misses it, so no hover title names it whole either (`chromium-1512x945-T3-need-*.json`). WKWebView, the app, draws it whole. Proposal: ceil the cap, or keep a lozenge whole when it is within 1 px of its natural width.
- **U2 (sev 1, for aglaea)** A ruling draft shows on the To rule line and on Home but not on the record's Timeline row, nor on the summary's `0002, the oldest waiting: show it`. Proposal: say whether "wherever its record shows" includes the Timeline.
- **U3 (sev 2, for aglaea)** The channel's new-thread form addresses the first seat (`Message to fse`, recipient `fse`), so a thread started from the channel wakes fse, not everyone, unless changed. Pre-existing (builder's note). Proposal: channel defaults to everyone, or names who it wakes before Start.

Spec gaps (for the FSE)
- G1: FR-4 names the composer's selects; the needs-me Rule box (`RuleBox` in Conversation.tsx) has a recipient select with no aria-label (from code, title only; not rendered here).
- G2: T4's Japanese IME needs an input source the review machine does not have enabled; the gate should name a dead key as acceptable, or the fixture machine should carry one.

For aglaea: U2, U3.

Not verified
- Japanese IME in WKWebView: no Japanese input method is enabled on this machine (ABC and Latin American only); enabling one changes the machine's settings. In Chromium only a synthetic CDP composition was run.
- Widths other than 1512×945, rail expanded, keyboard-only Tab paths, "Write about this card" landing into a guessed chat.
- The Chromium page error on load in wails dev (`Cannot read properties of null (reading 'nodes')`), seen again; nothing visible failed.
- Reviewer: dpc-ui, 2026-10-04.

## Notes
- FR-3: home.css gives stage and id no width variable, so their slack reaches the signals only in proportion (fr); at 1512 strip the stage still keeps ~40 px and the id ~45 px while the goal is cut. A `--t-stage`/`--t-id` (styles, outside this card) would close it.
- FR-5: WKWebView sends the IME Escape after compositionend, keyCode 27 with key `´` (measured); the guard handles that and Chromium's isComposing order.
- The channel's new-thread form defaults its addressee to the first seat, not everyone (pre-existing).
