---
title: Escape keeps what he wrote (rule box, comments, composer), and Home's fixed columns give their slack to cut cells
stage: one-window
status: done
repos: [organizer]
branch: drafts-and-slack
seat: das-build
updated: 2026-10-04
next: ""
depends_on: []
boundary: ["frontend/src/lib/drafts.ts, lib/width.ts and their tests", "frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx (its rule box's draft only), Home.tsx", "frontend/src/components/CardDrawer.tsx (the comment field's draft, name and updated date), Conversation.tsx (the composer's draft and field names)", "frontend/src/components/InitiativeHeader.tsx (the target's date), StageRoadmap.tsx (the row's name)", "frontend/src/styles/home.css (the three grid templates at lines 8, 15, 140 only, as --t-state/--t-phase variables with today's defaults; widened by the FSE 2026-10-04 for FR-2)", "frontend/src/stores/board.store.ts (the rule drafts only, through lib/drafts; accepted by the FSE 2026-10-04 after das-review)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-9.md (FR-1, FR-2); Aglaea's calls d06e265"
gate: "docs/specs/leftovers-9.md Acceptance, rows S1 to S4 and S0"
ui_review: true
review: pass
---

## Goal
Nothing he writes is lost to an Escape; Home's dates whole at 1512.

## Gate
- [x] S1-S4: see `docs/specs/leftovers-9.md`, Acceptance
- [x] S0: see `docs/specs/leftovers-9.md`, Acceptance

## Done
- 2026-10-04 merged 583b3f3 by sup36 (reviewed at 9453240: code pass, UI pass); make test green on main; U2, U3 to aglaea, U1, U4-U6 and G1-G3 to the FSE
- 2026-10-04 das-build: branch drafts-and-slack, 8 commits abe9b04..9453240 on main 097402a; one session draft store (lib/drafts.ts), Escape keeps rule box/comment/composer drafts with `· draft` verbs, fixed columns give slack to a cut next date (fixedColumns via shareRoom), dates in words, field and stage names; S0-S4 met, evidence in .wt-notes/das-build/progress.md
- 2026-10-04 sup36: worktree .wt/drafts-and-slack off 477aef6, seat das-build launched
- 2026-10-04 0081 ruled by pablo ("Accepted"); sup36 launched by the FSE
- 2026-10-04 cut from leftovers-9 by the FSE

## Next

## Blockers

## Review
- Verdict: pass (code and checks; the WKWebView shots are the UI reviewer's).
- Commit reviewed: 9453240 (branch drafts-and-slack).
- Unmet gate items: none. S0: make test from a clean clone and in a worktree, npm test (199) and npm run build pass; wails build taken from the builder's phase table. S2: drafts.test.ts keeps, restores and discards per decision/card/thread/new/branch key; store is an in-memory Map, no storage or sync hit. S3: width.test.ts fixedColumns via shareRoom, cause in Notes. S4: dateWords on header target and card back updated; names as FR-4.
- Boundary finding: frontend/src/stores/board.store.ts changed, outside the card's boundary (inside the spec's, which excludes stores only beyond the draft's session state); the change only moves ruleDrafts into lib/drafts. FSE to widen the card or accept.
- Reviewer: das-review, 2026-10-04.

## UI review
- Commit run: 9453240 (detached worktree .wt/das-ui, fixture from that clean checkout). Verdict: **pass**. No sev 4 or 3.
- Evidence: `.wt-notes/das-ui/` (drivers `s1.mjs`, `s3.mjs`, `s4.mjs`, `wk.swift`, `wk-*.sh`; logs `s1-chromium-*.json`, `wk-*-{classic,overlay}.txt`). Chromium: wails dev :34535, headless Chromium, viewport 1512×913 (the 1512×945 window less its 32 px title bar); classic = 15 px bars, overlay = OverlayScrollbar, 0 px. WKWebView: `Deltagos Review.app` at 1512×945 exactly (frame read back), `-AppleShowScrollBars Always` / `WhenScrolling`; AX hit-tests (element at the centre is the element), clicks refused outside its window.

| Row | Window, rail | Bars | Chromium | WKWebView | Result |
|---|---|---|---|---|---|
| S1 Home rule box | 1512×945, strip | classic, overlay | `chromium-1512x945-S1-home-verb-draft-*`, `-home-reopened-*` | `webkit-1512x945-S1-home-verb-draft-*`, `-home-reopened-*` | words and option return, `Rule · draft` hit; Cancel → `Rule`, empty |
| S1 Decisions rule box | same | both | `chromium-…-S1-decisions-verb-draft-*` | `webkit-…-S1-decisions-verb-draft-*`, `-decisions-reopened-*` | same; Home's row shows the same draft (one key) |
| S1 comment | same | both | `chromium-…-S1-comment-reopened-*` | `webkit-…-S1-comment-reopened-*` | Escape closes the card back, words return, `Save · draft` hit; Cancel → empty |
| S1 composer | same | both | `chromium-…-S1-composer-reply-reopened-*`, `-new-thread-closed-*`, `-new-thread-reopened-*` | `webkit-…` same names | reply `Send · draft`, new thread `Start · draft`, + and link `· draft`; cancel → empty |
| S1 session only | same | both | reload: `Rule`, empty, no words in localStorage | quit and restart: `webkit-…-S1-restart-overlay` `Rule`, empty | pass |
| S1 Escape while composing | same | both | — | `webkit-…-S1-bubble-typo-*`, `-bubble-composing-*` | first Escape goes to the input method, box stays; second closes, draft kept |
| S3 | 1512×945, strip | classic, overlay | `chromium-1512x945-S3-home-strip-*`, `-S3-init-a-row-*`: state 96 (need 95), phase 69 (69), next 120 (120); next date hit | `webkit-1512x945-S3-home-strip-*`: `30 Nov` and `due · w-later` whole and hit (1510–1630 classic, 1524–1644 overlay) | pass; see U1 |
| S4 | 1512×945, strip | both | `chromium-1512x945-S4-{header,cardback,stages}-*` | `webkit-1512x945-S4-{header,cardback,stages}-*` | `target 1 Oct`, `updated 20 Aug · 1mo`, no ISO; names `Comment on Beta card`, `Message to fse`/`po_ana`, `Subject`, `Stage 1: Foundations, done, 2 Aug to 15 Aug. …`, `Stage 2: …, now, since 15 Aug. …` |

Findings
- **U1 (sev 2)** Cannot read who init-a's 6 waiting records wait on, and one signal folds to `+1`, at 1512 strip. Where: Home, init-a row (`chromium-…-S3-init-a-row-classic`, `webkit-…-S3-home-strip-classic`). Evidence: Chromium signals track 312 needs 367 while Stage holds 61 px (overlay 317/367, 65 px); WKWebView shows 13 px (classic) / 20 px (overlay) of "you, alejandro" with Stage's text ending ~65 px short of its column. Against the design system's Widths (d06e265), not FR-2, which names fixed columns only. Proposal: Stage's slack goes to signals the way fixed columns' does.
- **U2 (sev 2, for aglaea)** A new thread drafted to one seat reappears in another seat's chat, addressed to that seat. Where: Conversations (`webkit-1512x945-newthread-shared-overlay`). Evidence: subject typed in fse's form, Escape, po_ana's chat shows it with `Message to po_ana`; the channel too: one `thread:<initiative>/new` key, recipient not kept. Start there wakes the wrong seat. Proposal: key the new-thread draft per chat, or keep its recipient.
- **U3 (sev 2, for aglaea)** On Decisions a kept draft is invisible while its record is collapsed; records come back collapsed, so `Rule · draft` shows only after opening the record. Home's row shows it. Proposal: mark the collapsed To rule row ("draft").
- **U4 (sev 1)** The composer's kind and recipient selects have no accessible name (Chromium `SELECT` unlabeled, WKWebView `AXPopUpButton` without description); the chats' search field likewise.
- **U5 (sev 1)** An Escape that ends a composition leaves the marked character (`´`) committed into the kept draft.
- **U6 (sev 1)** Dates still not in words outside FR-3: message times `Sep 26 10:24 PM` in Conversations; Overview's decisions `ruled 2026-08-05`.

Spec gaps (for the FSE)
- G1: FR-2 says fixed columns while the design system says any column (U1).
- G2: FR-1 says per thread, and a new thread has no thread yet: per chat, per recipient or per initiative is undefined (U2).
- G3: FR-4 names the message and subject fields only; the composer's selects and the search field have no names (U4). FR-3 covers two dates; U6's are left.

For aglaea: U2, U3.

Not verified
- A correction bubble: the fields have autocorrect off, so typing "wrods teh" kept the words verbatim and showed no bubble; a dead key's marked text was tested in its place.
- Keyboard-only (Tab) paths, and any width but 1512×945. Rail expanded was looked at once: next date whole (`webkit-1512x945-home-rail-expanded-overlay`).
- A Chromium page error on load in wails dev (`Cannot read properties of null (reading 'nodes')`) was not traced; nothing visible failed.
- Reviewer: das-ui, 2026-10-04.

## Notes
- FR-2 measured before the fix (Chromium 1512x945, rail strip, classic and overlay): next date needs 120 px in its 96 px track (cut 24); slack in state (144 track, widest 96: 48 px) and phase (96, widest 69: 27 px). home.css widened by the FSE for --t-state/--t-phase.
- Still at 1512 strip: init-a's signals cut 20-25 px (folds "+1") while the flexible id (63 px) and stage (61 px) columns hold slack; FR-2 named fixed columns only.
- WKWebView with classic bars: the bar is drawn but Home's rows keep the overlay width (1412 px); Chromium's lose ~17 px.
- The reply composer gained a `cancel` link (shown while a message is kept), so Cancel exists in all four places.
