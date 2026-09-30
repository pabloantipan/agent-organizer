---
title: The UI reviews' leftovers in one pass - the rule box, focus and names, one accent, blockers said once
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "review: ui-leftovers, branch ui-leftovers, gate met, cdb3934 ae17dcd 2c7110c 8457a9a 28366f9 e35361a 20d149c d44f5bd"
depends_on: []
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Conversation.tsx, SlackView.tsx, AgentsView.tsx, Crew.tsx, Rail.tsx, CardDrawer.tsx", "frontend/src/components/DecisionsView.tsx (focus landing only)", "frontend/src/stores/board.store.ts (focus targets only)", "frontend/src/lib/ and its tests", "CSS", "testdata/ and scripts/fixture-home.sh (FR-12 only)"]
spec: "docs/specs/ui-leftovers.md (FR-1 to FR-12); the rows: docs/ux/reviews/2026-09-29-triage-ui-leftovers.md; the rules: docs/design-system.md, Focus and names, Disabled actions (ec3ecbb)"
gate: "docs/specs/ui-leftovers.md Acceptance, rows G1 to G5; the Gate section below"
stage: discovery-in-a-cell
seat: left-build
ui_review: true
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
