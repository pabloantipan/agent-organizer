---
title: The UI reviews' leftovers in one pass - the rule box, focus and names, one accent, blockers said once
status: done
repos: [organizer]
branch: main
updated: 2026-09-29
next: "done: merged 508d9a8; UI1–UI7 and the reviews' uncovered notes are the FSE's"
depends_on: []
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Conversation.tsx, SlackView.tsx, AgentsView.tsx, Crew.tsx, Rail.tsx, CardDrawer.tsx", "frontend/src/components/DecisionsView.tsx (focus landing only)", "frontend/src/stores/board.store.ts (focus targets only)", "frontend/src/lib/ and its tests", "CSS", "testdata/ and scripts/fixture-home.sh (FR-12 only)"]
spec: "docs/specs/ui-leftovers.md (FR-1 to FR-12); the rows: docs/ux/reviews/2026-09-29-triage-ui-leftovers.md; the rules: docs/design-system.md, Focus and names, Disabled actions (ec3ecbb)"
gate: "docs/specs/ui-leftovers.md Acceptance, rows G1 to G5; the Gate section below"
stage: discovery-in-a-cell
seat: left-build
ui_review: true
review: pass
---

## Goal
FR-1 to FR-12 of `docs/specs/ui-leftovers.md`: Aglaea's triage rows 1–8,
10–12, 14 and fixture gaps V1–V3.

## Gate
- [x] G1: see `docs/specs/ui-leftovers.md`, Acceptance
- [x] G2: see `docs/specs/ui-leftovers.md`, Acceptance
- [x] G3: see `docs/specs/ui-leftovers.md`, Acceptance
- [x] G4: see `docs/specs/ui-leftovers.md`, Acceptance
- [x] G5: see `docs/specs/ui-leftovers.md`, Acceptance

## Done
- 2026-09-29 cut from ui-leftovers by the FSE
- 2026-09-29 left-build: FR-12 fixture (cdb3934, ae17dcd): the canned health copies organizer-fixture's live threads (the G19 thread asks pablo; the script posts one fse → pablo only when none does), init-drafted 0001 per drafting.md §5, health for define/drafted/ready-fixture
- 2026-09-29 left-build: FR-1–FR-11 (2c7110c rule box, 8457a9a focus and names, 28366f9 Conversations, e35361a persona file, 20d149c no owner, d44f5bd card hint); rebased on main 3ec76f8
- 2026-09-29 G1: `.wt-notes/left-build/g1-rule-init-{drafted-0001,a-0002}-{1440x900,1024x640}.png`, `.wt-notes/left-build/g1-dom.txt`: Question and Recommendation only (options false), Rule/Cancel bottom 616 < 640 and 876 < 900, open Rule `aria-expanded=true` on #2f1b55 (--surface-selected); link lands expanded, `.wt-notes/left-build/g2-focus-log.txt` step 4 "expanded record: init-a/0002"
- 2026-09-29 G2: `.wt-notes/left-build/g2-focus-log.txt` (keyboard only, both sizes): rule box opens on SPAN.rb-title with the record as describedby, Escape and Cancel back to "Rule init-a 0002", link → BUTTON.dec-line 0002, Launch → "Bring crew up", Open → LI designer_diego, roster link → BUTTON.dec-line 0001, Draft the cell → Open, Escape/Cancel → "Draft the cell", Bring crew up confirm the same; names "Rule init-a 0002", "Answer init-a w-queued: …", "Open init-define designer_diego", "Launch init-ready"; opens pressed 0
- 2026-09-29 G3: `.wt-notes/left-build/g3-dom.txt`, `.wt-notes/left-build/g3-conversations-*.png`: Answer on Home → Conversations with "w-queued: which repo…" targeted; row verbs class `tiny-btn` (no accent), People `aria-pressed` true on #2f1b55; init-ready without a token: one reason line, header "0 threads · as pablo · read only", composer false, "token" once
- 2026-09-29 G4: `.wt-notes/left-build/g4-dom.txt`, `.wt-notes/left-build/g4-*.png`: Crew header, lozenge and collapsed-rail hover read "designer_diego has no persona file; the drafting session writes it, or write it by the persona-agents skill", "waits on its first launch" nowhere on Agents; row "no owner · raised …" and signal "2 waiting · pablo, no owner" (a temp record 0009 in the fixture copy only); init-b card back hint without "Write about this card"
- 2026-09-29 G5: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, 13 Go packages ok, vitest 33 passed (`.wt-notes/left-build/g5-make-test.txt`); `npm run build` exit 0 (`.wt-notes/left-build/g5-npm-build.txt`); G18 grep on `main...ui-leftovers` empty (`.wt-notes/left-build/g5-g18-grep.txt`); `wails build` exit 0

- 2026-09-29 sup20: merged to main as 508d9a8 after both passes (code 22:53, UI 23:06); `make test` and `npm run build` green on main

## Next
1. left-review and left-ui review branch ui-leftovers

## Blockers
none

## Notes
- 2026-09-29 sup20 runs this card, spawned by the FSE after 0058
- 2026-09-29 sup20: one builder `left-build` on branch `ui-leftovers` (.wt/ui-leftovers), a code reviewer `left-review`, a UI reviewer `left-ui` in its own worktree; 0059 and 0060 still proposed at launch, so rows 9 and 13 stay out
- No Go change is needed; the frontend uses pnpm.
- Rows 9 and 13 wait on 0059 and 0060; if ruled before launch, the FSE adds their FRs.
- 2026-09-29 left-build: FR-10's "everywhere" stops at the boundary: DecisionsView (focus landing only) still reads "owner —" on a proposed record's line
- 2026-09-29 left-build: not verified: focus after Draft the cell's real Open (goes to the "Drafting in a Terminal" line; Open is not pressed), WKWebView, VoiceOver (V4)
- 2026-09-29 left-build: the chat-list no-token line assumes a missing token whenever the human cannot post, also when discuss is down (lead-side-fixes FR-12's wording); `Retire.tsx`'s dialog is outside the boundary and was not checked for Escape
- 2026-09-29 left-build: harness to rerun the evidence: `.wt-notes/left-build/scripts/` (headless Chromium on `wails dev -devserver localhost:34125`); choices in `.wt-notes/left-build/progress.md`

## Review
- Verdict: pass. Unmet gate rows: none.
- G1: `.wt-notes/left-build/g1-dom.txt` and the four g1 screenshots: init-drafted 0001 (roster, seat lines) and init-a 0002 at 1024x640 and 1440x900 show Question and Recommendation, `options:false`, Rule/Cancel bottom 616<640 and 876<900; open Rule `aria-expanded=true` on rgb(47,27,85) (`--surface-selected`, `shell.css` `.ib-act .act[aria-expanded]`); the link calls `openDecision` (`RuleDecisionBox.tsx` RecordBody), landing expanded per g2 log step 4.
- G2: `.wt-notes/left-build/g2-focus-log.txt`, both sizes: title on open with the record as `aria-describedby`, back to "Rule init-a 0002" on Escape and Cancel, link → 0002's `dec-line`, Launch → Bring crew up, Open → designer_diego's row, roster link → 0001's `dec-line`, Draft the cell and Bring crew up confirms open on Open and close on Escape/Cancel to their opener; eight Needs me names carry their row.
- G3: `.wt-notes/left-build/g3-dom.txt`, g3 screenshots: row verbs `tiny-btn` (no primary), People `aria-pressed` on the selected surface; init-ready: one reason line, header "read only", no composer, "token" once; Answer lands on the asking thread.
- G4: `.wt-notes/left-build/g4-dom.txt`, g4 screenshots: Crew header, lozenge and collapsed-rail title name designer_diego's file and who writes it; "no owner" on row and signal (temp record in the fixture copy); init-b card back hint without "Write about this card".
- G5: rerun, `.wt-notes/left-review/`: `make test` exit 0 (13 Go packages ok, vitest 33 passed), `npm run build` exit 0, G18 grep on `main...ui-leftovers` empty. Boundary: `diff --stat` touches only boundary files; no Go, no design-system.md. Worktree status clean.
- Not covered by the gate: (1) at 1024x640 the roster record's Recommendation is cut mid-line by the record's scroll area and "0001 in Decisions" scrolls out of view; FR-2 allows it, the Goal ("recommendation in view at every size") does not quite hold. (2) FR-10 "everywhere" vs boundary: DecisionsView still reads "owner —"; the spec's boundary contradicts its FR. (3) `fixture-home.sh` reads the live discuss mailbox and may post an fse → pablo question into organizer-fixture: the fixture is not hermetic. (4) Focus after a ruling lands (Needs me heading) is untested, since ruling is forbidden to reviewers.
- Reviewer: left-review, 2026-09-29

## UI review
- Commit: `d44f5bd` (branch ui-leftovers), run in `.wt/left-ui` with `scripts/fixture-home.sh` and `wails dev -devserver localhost:34165`, headless Chromium at 1440x900, 1024x640 and 400x800. Screenshots and logs: `.wt-notes/left-ui/` (`rule-log.txt`, `kb-log.txt`, `leak-log.txt`, `ans-log.txt`, `g4-log.txt`, `g4b-log.txt`, `vis-log.txt`; harness in `scripts/`).
- Verdict: **pass**. Failing findings: none. FR-1 to FR-12 read and work as their triage rows ask; the one severity 3 (UI1) is in a layout this card neither covers nor touches.
- Checked and holding: the rule box opens on its title with Question and Recommendation as its description, no Options, Rule and Cancel inside the window at both sizes (`rule-*-{clamped,more,more-scrolled}-*.png`); Escape and Cancel return to "Rule <initiative> <NNNN>"; the open Rule sits on rgb(47,27,85); "<NNNN> in Decisions" and the roster link land on the expanded record's line (`decisions-landed-*.png`); Launch → Bring crew up, Open → designer_diego's row with a visible ring (`after-open-focus-1024x640.png`), both confirms open on Open, Tab reaches Cancel, and Escape and Cancel give focus back to their opener (`kb-draft-confirm-*.png`, `bring-crew-confirm-1024x640.png`); every Needs me verb names its row; Conversations' row verbs are default buttons and People is `aria-pressed` on the selected surface; init-ready without a token says so once, with no composer, and the header says "read only" (`conv-init-ready-no-token-*.png`); init-define's Crew header, lozenge and collapsed-rail title name the file and who writes it, and "waits on its first launch" appears nowhere on its Agents (`agents-init-define-crew-*.png`); "no owner" shows on the row and in the signal (`home-no-owner-*.png`, temp record 0009 in the fixture copy, since removed); init-b's card back hint drops "Write about this card", and init-a's keeps it (`card-back-*.png`).

### UI1: at the minimum window the lead cannot read the question they pressed Answer for
1. At 1024x640, Answer on Home opens init-a's Conversations with the thread targeted. The timeline is 8 px tall (423–431) under the initiative header and the chat head, so the fse's question never shows, and the page does not scroll. The lead would be answering blind.
2. `answer-landing-1024x640.png`, `answer-landing-scrolled-1024x640.png` (every scroll area scrolled to its end); at 1440 the same landing reads well (`answer-landing-1440x900.png`). `ans-log.txt`.
3. Heuristic: Nielsen 1 (visibility of status) and 6 (recognition over recall); WCAG 1.4.10 at the app's own minimum window.
4. Severity 3. Not a fail: this card's CSS and components do not change the height (`InitiativeHeader` and the Conversations layout are outside its diff and its boundary), and no FR sizes Conversations. Before this card no fixture thread asked the human, so no one could see it; FR-12 is what made it visible.
5. Proposal: at short windows, give the timeline the room. For example, the header collapses to its title line inside a sub-view, or Answer scrolls the page to the chat. This is for responsive-home or header-review-2 to take.

### UI2: Tab past Cancel leaves the open rule box for rows it covers
1. With the box open and Rule still disabled, Tab from Cancel moves to "Rule init-a 0003", a button the fixed box covers. Its focus ring cannot be seen. Enter on it opens a second box over the first. Once that closes, focus is back under the first box, and Escape does nothing because focus is outside it.
2. Home, rule box on init-a 0002, both sizes. `rule-focus-leaks-*.png`, `rule-focus-leaks-enter-*.png`, `leak-log.txt` (`focusCovered: true`, `boxes: 2`).
3. Heuristic: WCAG 2.4.11 (focus not obscured) and 2.4.3; design system, Focus and names: "Escape closes every inline box".
4. Severity 2. The lead can come back with Shift+Tab. FR-5 names only open and close, and the spec's rabbit hole rules out a focus manager.
5. Proposal: Tab from the box's last control returns to its title, or Tab out of the box closes it and focus goes to its opener. Either way, one box at a time.

### UI3: Answer on Home drops focus on the page body
1. After Answer, `document.activeElement` is BODY. The next Tab starts from the rail, not from the thread or the composer.
2. Home → init-a Conversations, both sizes. `kb-log.txt` ("after Answer: active=BODY"), `kb-after-answer-*.png`.
3. Heuristic: design system, Focus and names, "Navigating (a row verb …): focus lands on the thing named … never on the page body".
4. Severity 2. FR-5 lists Open, Launch, the roster link and Draft the cell, not Answer (see Spec gaps).
5. Proposal: land on the targeted thread's divider, or on the docked box that already targets it.

### UI4: on a roster record at 1024x640 the Recommendation shows one line
1. The Question's six-line clamp (heading and seat lines) fills the record area (227 px). The Recommendation shows about one line, cut through its glyphs. Reading the rest, and the "0001 in Decisions" link, needs a scroll inside the box, and nothing marks the area as scrollable (overlay scrollbars).
2. `rule-init-drafted-0001-clamped-1024x640.png`; at 1440 both sections show whole (`rule-init-drafted-0001-clamped-1440x900.png`). `rule-log.txt` (`recScroll 337/227`).
3. Heuristic: the spec's Goal ("the recommendation in view, at every window size"); Nielsen 6. The code review's note (1) found the same.
4. Severity 2. FR-2 allows the record to scroll, and the Recommendation starts in view.
5. Proposal: when the record area is shorter than both clamps, clamp the Question tighter so that the Recommendation's start and "more" both show, or put a fade on the scroll edge.

### UI5: the Decisions tab still reads "owner —" for a record with no owner
1. Home says "no owner" on the row and in the signal, while init-b's Decisions line for the same record says "owner —".
2. `decisions-init-b-no-owner-*.png`, `g4-log.txt`.
3. Heuristic: consistency (Nielsen 4); FR-10 "everywhere".
4. Severity 1. The builder noted that the boundary kept DecisionsView to "focus landing only".
5. Proposal: `ownerPhrase` on DecisionsView's line, in a card whose boundary allows it.

### UI6: the rule box hides its opener and does not name its record
1. The box is placed over the rows when there is no room below. For init-drafted 0001 at 1440 it covers that row's Rule, so FR-4's selected state is not seen, and at 1024 it covers most of the row's subject. The dialog is labelled by its title alone ("Is this the cell for the first stage?"), with no initiative, and its head shows only the number.
2. `rule-init-drafted-0001-clamped-1440x900.png`, `rule-init-drafted-0001-clamped-1024x640.png`; `aria-labelledby` = the title (`RuleDecisionBox.tsx`).
3. Heuristic: Nielsen 1; Focus and names, Names (WCAG 2.4.6).
4. Severity 1. The opener's name was just announced, and the box's title matches the row.
5. Proposal: put the initiative id in the box head next to the number ("init-drafted 0001"), and include it in the dialog's name.

### UI7: the People toggle's name does not say People
1. A screen reader hears "3 · 2 live · 1 deaf, toggle button, pressed", which does not say what the button shows or hides. The title changes ("hide people"), but a title reaches no one who does not hover.
2. Conversations header, init-a. `kb-log.txt` ("People toggle"), `conv-init-a-needs-me-*.png`.
3. Heuristic: WCAG 2.4.6 and 4.1.2; Focus and names.
4. Severity 1.
5. Proposal: `aria-label="People, 3 seats, 2 live, 1 deaf"`, keeping the visible counts.

### Spec gaps (for the FSE)
- Answer's focus landing (UI3) and the landing of a card row's Open are not in FR-5's list, though the design system rule covers them.
- The rule box is non-modal and fixed over the rows. The spec says nothing about Tab leaving it, or about two boxes at once (UI2), and its rabbit hole rules out the general answer.
- FR-10 says "everywhere", but the boundary kept DecisionsView to its focus landing (UI5). Either amend the FR or widen the boundary.
- No spec sizes Conversations at 1024x640 (UI1). responsive-home or header-review-2 should say how much room the sub-view gets under the initiative header.
- The Goal "recommendation in view at every window size" and FR-2 "the record scrolls" pull in different directions on a long record at 1024 (UI4). Say which wins.

### Not verified
- The landing after a ruling (focus to the Needs me heading), and the rule box's busy and refused states: ruling is forbidden to this review.
- A card row's Open in Needs me, "Open onboarding-flow Step map": the fixture has no card whose next action is addressed to pablo on this machine.
- Draft the cell's and Bring crew up's opened and error states after a real Open (V4), WKWebView and VoiceOver (V4): this review used headless Chromium only.
- Conversations' own Rule box (RuleBox) on the asking thread: I did not open it.
- 400 px: at 400x800 Home scrolls sideways (document 586 px wide), but the app's minimum window is 1024x640 (`main.go`), so this width cannot occur in the app (`home-400x800.png`, `rule-init-drafted-0001-400x800.png`).
- UI reviewer: left-ui, 2026-09-29
