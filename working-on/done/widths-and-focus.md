---
title: Home widths, third pass - wide from 2200, signals never wrap, columns give way only when they do not fit; three focus and name fixes
status: done
repos: [organizer]
branch: widths-and-focus
updated: 2026-10-03
next: "merged 82ca2a2; W1-W5 and the spec gaps are the FSE's"
depends_on: []
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, RuleDecisionBox.tsx", "frontend/src/lib/width.ts, frontend/src/lib/ and its tests", "frontend/src/styles/home.css, rule-box.css, shell.css (the rail's rules only)", "FR-19 only: frontend/src/components/Overview.tsx (the record row's open), CardDrawer.tsx (focus on open and close), Conversation.tsx (the divider's icon button names)", "frontend/src/stores/board.store.ts only if the class boundary is read there", "not: header-fold-2's files; no Go; not docs/design-system.md"]
spec: "docs/specs/responsive-home.md (FR-13 to FR-19, amendment 3); the ranking: docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md (Aglaea, 3f3df2f); the design system's Widths as amended there"
gate: "docs/specs/responsive-home.md Acceptance, rows G13 to G18 and G8; the Gate section below"
stage: twenty-at-a-glance
ui_review: true
review: pass
---

## Goal
responsive-home-2's UI leftovers and three focus and name fixes, ranked by
Aglaea: FR-13 to FR-19 of `docs/specs/responsive-home.md`.

## Gate
- [x] G13: see `docs/specs/responsive-home.md`, Acceptance
- [x] G14: see `docs/specs/responsive-home.md`, Acceptance
- [x] G15: see `docs/specs/responsive-home.md`, Acceptance
- [x] G16: see `docs/specs/responsive-home.md`, Acceptance
- [x] G17: see `docs/specs/responsive-home.md`, Acceptance
- [x] G18: see `docs/specs/responsive-home.md`, Acceptance
- [x] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-10-03 sup25 closed the task: seats ended, tokens revoked, worktree removed; run record runs/2026-10-03-header-fold-2-widths-and-focus.md (46 min against 0069's 40-70)
- 2026-10-03 sup25 merged widths-and-focus as 82ca2a2 after code and UI review pass; make test and npm run build green on main
- 2026-10-03 wf-build: FR-13 to FR-19 on widths-and-focus (e0875dc..9fdb19d, 9 commits), rebased on main after header-fold-2 (4afddc0, no conflict); G8 green and G13-G18 measured on 9fdb19d; logs, shots and scripts in .wt-notes/wf-build/ (progress.md)
- 2026-10-03 sup25 launched seat wf-build in .wt/widths-and-focus
- 2026-10-03 sup25 launched by the FSE (Pablo's go-ahead, "ok")
- 2026-09-30 0069 ruled by pablo ("Ok", accept as written, 549217f); launchable, sup25 not started yet
- 2026-09-30 cut from responsive-home amendment 3 by the FSE

## Next

## Review
- Verdict: pass (code review, on 9fdb19d). G13-G18 met on the builder's DOM logs and screenshots in .wt-notes/wf-build/, read against the diff; G8 re-run by the reviewer: make test green (go + vitest 68/68), npm run build ok, the redesign's G18 grep empty. Diff inside the boundary.
- Unmet gate items: none.
- Outside the gate: (1) at 2200 with the rail expanded, wide cuts goals to 26-32 characters where regular at 2199 shows them whole (2200x1200-g13.png); FR-4's "goals whole up to about 70" fails at the new boundary, and G13 only checks the class. (2) CellStateLz (Crew.tsx) has no text span, so "cell in definition" would clip mid-word if cut (FR-14); it was whole in every run. (3) G14's "+N" and G13's ellipsis appear only when a cell is forced narrower; the fixture never produces them. (4) The message's branch button has no name and its reply button reads "↩" (Conversation.tsx:440-441); the divider icon buttons are 20x28, under 24 px (.rail-icon, global.css). G18's names log covers only the divider.
- Reviewer: wf-review, 2026-10-03

## UI review
wf-ui, 2026-10-03, on `9fdb19d` (widths-and-focus), `--twenty` and the plain
fixture, wails dev :34345, headless Chromium 1228 (own driver). Shots, logs and
drivers: `.wt-notes/wf-ui/` (g13-17.log, g-force.log, g16-17.log, esc.log, g18-*.log).

**Verdict: pass.** No severity 4 or 3. FR-13 to FR-19 hold as measured:
- FR-13: class compact at 1024/1280/1439, regular at 1440/1512/1920/2199, wide at 2200/3440; no horizontal scroll at any size.
- FR-14: `.lz-t` has `text-overflow: ellipsis`, nowrap; a signals cell forced to 90 and 60 px cuts "2 waiting · yo…" on the text, box not clipped, hover names it whole (1920x1080-forced-sig90.png). The `--twenty` data never cuts one by itself.
- FR-15: every row one line at 1024, 1440, 1920, 3440 on both fixtures; init-a carries "+2"/"+3"/"+4", its `title` and sr-only text list the rest ("and 4 more: 1 blocked, 1 now, 25 live, 6 problems").
- FR-16: 1280 and 1439 show the goal on all 20 rows, at least 30 characters or whole (shortest shown 31/31; longest cut 42/45); a 1024→1439→1024 resize hides it at 1024, brings it back at 1100 and every step after, hides it again on the way down.
- FR-17: at 1512 with Rule open the scrim (fixed, rgb 18,14,25) or the box is the top element at every other Rule and every visible row control; a click on a covered chevron opens nothing.
- FR-18: the rail toggle is 24x24 as strip and expanded (expanded it shows on rail hover or focus).
- FR-19: Overview → 0001 (ruled) by Enter lands on Decisions with 0001 expanded and focused (`button.dec-line`). The card back takes focus on its `h2` title, from Needs me's Open and from a Work card, and Escape, ✕ or the backdrop return it to the opener. After Answer focus sits on the thread divider; Tab reaches "Escalate w-queued: …", "Close w-queued: …".

**W1, sev 2.** *Cannot:* read goals at the new wide boundary with the rail expanded. *Where:* 2200x1200-home-expanded.png. *Evidence:* 2199 shows every goal whole (38/38, 49/49); 2200 shows 28 to 34 characters (29/38, 31/49, 29/46). FR-13 says FR-4 ("whole up to about 70") holds from 2200. One pixel costs the goals. 3440, Pablo's real wide screen, shows them whole. *Severity:* 2. Not 3, because no width Pablo uses (1024, 1512, 3440) hits it and about 30 characters still show. *Proposal:* measure on the row (FR-16's rule): stay one column until the list beside Needs me keeps about 70 characters of goal. Or move WIDE_FROM to where that holds with the rail expanded (about 2400 by these numbers; to be measured).

**W2, sev 2.** *Cannot:* see that init-a has a blocked card at 1440 without hovering. *Where:* 1440x900-plain-init-a-row.png. *Evidence:* the signals cell shows "3 waiting · you, alejandro +4", and "1 blocked" is under the +N. Next date shows "—" on every row and keeps about 96 px, and the stage label is cut ("2 · The joins · n…"). *Severity:* 2. FR-15 allows it, and the hover and name carry it. *Proposal:* a blocked signal is never the one folded into +N. An all-"—" next-date column gives way before the signals do.

**W3, sev 2 (not this spec).** *Cannot:* close the rule box with Escape after clicking its text. *Where:* any class; esc.log. *Evidence:* a click on the record text puts focus on `BODY`, and Escape then leaves the box open (at 1512, 1024 and 2200). The next Tab goes back into the box. *Severity:* 2. Cancel still works. *Proposal:* listen for Escape on the document while a box is open (Focus and names: "Escape closes every inline box"). This belongs to rule-box-finish.

**W4, sev 1.** *Cannot:* tell which row's Rule is open while the box is up. *Where:* 1512x945-rule-open-0.png. *Evidence:* the opener's own Rule sits under the scrim, dimmed like the rest. `aria-expanded` is true but nothing shows it. *Severity:* 1. *Proposal:* raise the opener above the scrim with `--surface-selected` (Disclosure state).

**W5, sev 1 (outside FR-19).** The message's reply ("↩") and branch buttons are named only by their `title`. Every `.rail-icon`, divider ones included, is 20x28, under the 24 px minimum. After "hide", the last control in the conversation, Tab goes to the page body. Already noted by the builder and the code review.

**Spec gaps (FSE):**
- FR-13 moves the class threshold but FR-4's ~70 characters is never checked at 2200 with the rail expanded. G13 checks only the class (W1). Should wide's start be measured on the list, like FR-16, and not fixed?
- FR-15 says nothing about which signals fold first. Blocked and waiting-on-you should not be the ones hidden (W2).
- FR-16 covers compact. Regular at 1440 still cuts goals to 25-30 characters while an empty next-date column keeps its width. Does "a column gives way only when it does not fit" also mean an empty column gives way first?
- No fixture row cuts a lozenge or reaches "+N" by itself in `--twenty`. G13 and G14 can only be shown by forcing the DOM (or by the plain fixture's init-a for +N).

**Not verified:**
- WKWebView (the real app): every number is headless Chromium. Overlay scrollbars and fonts may differ.
- G8: the code review's, not run here.
- 200% zoom: below the 1024 minimum window.
- An ellipsis on a lozenge from real data, since none occurs. CellStateLz's cut is untested because it never got narrow.

## Blockers

## Notes
- FR-16 choices: the goal is kept first, then the next date, which can show alone. Goal at least 224 px (about 30 characters, measured at 36 or more), signals at least 160 (lib/width.ts compactColumns). Regular keeps its two-line narrow fallback.
- The --twenty fixture no longer cuts a lozenge or overflows signals at 1440, 1920 or 3440 (1920 is regular now). G13's ellipsis and G14's +N are shown by forcing one cell narrower in the DOM; see g13.log and g14.log.
- Found: Home's list grew to its min-content, so a column that did not fit widened the page. `.home`'s track and sections are now minmax(0, 1fr). Also fixed a +N measure loop that the text span caused (81f0693).
- Not in the boundary, left open: CellStateLz (Crew.tsx) has no text span. After Answer, Tab next reaches the message's reply button, named "↩", and its branch button, which has no name (Conversation.tsx:440-441). The divider's icon buttons are 20x28, under the 24 px minimum (.rail-icon in global.css).
