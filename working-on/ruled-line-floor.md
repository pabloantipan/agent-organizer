---
title: The Ruled line drops its chosen option cleanly, the wake count beside Rule, the review window says Review, one word map
status: now
repos: [organizer]
branch: ruled-line-floor
seat: rlf-build
stage: one-window
updated: 2026-10-06
next: "review: ruled-line-floor, gate met (L1-L5, X0), 982b6fe"
depends_on: []
boundary: ["frontend/src/components/DecisionsView.tsx, decisions.css, global.css (.dec-meta and .wakes only)", "frontend/src/components/Conversation.tsx (rule box, WakeCount), Home.tsx (its rule box's wake count only)", "AgentList.tsx, Crew.tsx, RoleDrawer.tsx (the state word map only), one new lib/ module and its test", "main.go (the window title only)", "scripts/fixture-home.sh (--empty)", "not: docs/design-system.md, the floating panel's native code"]
spec: "docs/specs/leftovers-13.md (FR-1 to FR-5); Aglaea 5c937df"
gate: "docs/specs/leftovers-13.md Acceptance, rows L1 to L5 and X0"
ui_review: true
review: pass
---

## Goal
leftovers-13: no Ruled line ever shows an empty option or a stray dot; the
rest of the last two waves' leftovers, every gate row a seat's (0095).

## Gate
docs/specs/leftovers-13.md, L1-L5 and X0. Evidence in .wt-notes/rlf-build/ (progress.md, *.log, shots).
- [x] L1: 93 lines, both engines, 1024x640 and 1512x945, rail full and strip: 0 under the floor, 0 stray `·`, `.board-wrap` sw = cw in all (main WK 1024 full 18/13). Drop exercised (Chromium 760 full 10 dropped; WK view narrowed to 420 px, 90): all whole in title and aria-label, undone on widening.
- [x] L2: Conversations' RuleBox, card and thread rows: the count is Rule's neighbour, same row, gap 8 px, one seat #b5afc3, all #d946ef, no inline style (Chromium 4 configs; WK 1024 full card one/all, thread one).
- [x] L3: Deltagos Review.app window "Deltagos Review"; the branch's Deltagos.app (bundle id swapped only) "Deltagos".
- [x] L4: grep finds the map only in lib/stateWords.ts; no .wakes.hot; no inline color; vitest 3/3.
- [x] L5: --empty, review build, list on another desktop: "Home" then "No initiatives yet. Deltagos finds them under the roots in its settings." (= §3).
- [x] X0: clean clone: make test (go ok, vitest 279), npm run build, wails build.

## Done
- 1095661 chosen option floor and drop with its dot; 38c49a6 one state word map; 62932d7 wake count beside Rule, `.wakes.all`; dfacbc8 window title from the bundle; 982b6fe fixture --empty. Rebased on main 0ab607a.

## Notes
- Home's Needs me rule box is RuleDecisionBox (writes the record, wakes nobody): no wake count to move there.
- Found, not asked: the fixture's default roles read this machine's real sessions (Home showed "Hephaistos · 2 sessions" on --empty); the 1024 window floor means no line drops at any window size today.
- INCIDENT 2026-10-06 ~13:25, rlf-build: while measuring L2 in WKWebView, a Web Inspector console paste (measure.sh: cmd-V, Enter) landed in the open RuleBox's textarea instead of the console, and Enter ruled it: one `decision` (body: the l2.js measuring script, to everyone) went into organizer-fixture's thread "w-queued: which repo does the queued card start in" as pablo, and the fixture's temp Order marks it Solved. Only the fixture project and a temp home; no real initiative or record. Not undone (undoing would be another post). measure.sh now refuses unless the focused window is the Web Inspector before click, paste and Enter. The next `fixture-home.sh` run posts a fresh asking thread by design, since w-queued no longer asks pablo.
- 0096 ruled 2026-10-06; supervisor sup46, spawned by the FSE.
- L1 on main 382cc2e (94 records copied into init-nopeople, 93 Ruled lines with a chosen option; sweep in .wt-notes/rlf-build): WKWebView 1024x640 full 18 under the ~8-char floor, 13 stray `·`; 1024 strip 1/1; 1512 full and strip 0/0. Chromium 1024 full 15/11, strip 1/1, 1512 0/0. `.board-wrap` scrollWidth == clientWidth in all eight.
- L1 cause: `frontend/src/styles/global.css:762` `.dec-chosen { flex: 1000 0 0; min-width: 0 }` starts the option at 0 and gives it only what the title leaves, so it has no floor; and its separator is not in it: `DecisionsView.tsx:316` puts `\u00a0· ` at the head of `.dec-meta`, so an option at 0 px leaves the dot.

## Review
- Verdict: pass. Commit reviewed: 982b6febd4750826a96155daefdb953ea4c599ab (branch ruled-line-floor). Unmet gate items: none.
- X0 re-run in a clean clone of that commit: `XDG_DATA_HOME=$(mktemp -d) make test` (go 13 ok, vitest 279), npm install/test/build, `wails build` all exit 0. L4 greps there: the map literal only in `lib/stateWords.ts`, no `.wakes.hot`, no inline style on WakeCount; vitest 3/3. `fixture-home.sh --empty` exits 0, root an empty dir. L1-L3, L5 from the recorded sweep.log, l2.log, l3.log, l5.log (L5 built at e4404a4, same tree as 982b6fe in frontend/, main.go, scripts/).
- Code: FR-1 option shrinks 1000x the title to an 8ch floor, title to 20ch, then `data-drop` hides option and dot together; whole text in `title` and `aria-label` (`lineName`); `.dec-line` overflow hidden. FR-2 count is Rule's neighbour in Conversations' RuleBox (card and thread rows); Home's RuleDecisionBox has no count. FR-3 Info.plist name, Deltagos fallback, review-build.sh unchanged.
- Boundary finding: `global.css` loses the `.dec-chosen` rule (moved to decisions.css), outside ".dec-meta and .wakes only". FR-1 needs it (the card's own cause is global.css:762), so the boundary text is too narrow, not the build. FSE's.
- Not gated: a title of 20 chars or less keeps `min-width: 0` and can ellipsize to nothing before the option drops; the sweep does not check titles. The `--empty` fixture's roles read this machine's real sessions.
- Reviewer: rlf-review, 2026-10-06.
