---
title: Decisions holds still - the view moves by itself while a record is read (Pablo's report)
status: done
repos: [organizer]
branch: decisions-still
seat: dst-build
updated: 2026-10-06
next: ""
depends_on: []
boundary: ["frontend/src/components/DecisionsView.tsx, RuleDecisionBox.tsx", "frontend/src/styles/decisions.css, rule-box.css, global.css (.markdown rules only)", "frontend/src/lib/useScrollEdges.ts and lib/ tests", "not: Home, Conversations, Go, docs/design-system.md"]
spec: "docs/specs/decisions-still.md (FR-1 to FR-3)"
gate: "docs/specs/decisions-still.md Acceptance, rows W1 to W3 and W0"
ui_review: true
review: pass
---

## Goal
Nothing on Decisions moves unless the operator moves it. Measure the cause first.

## Gate
- [x] W1-W3: see `docs/specs/decisions-still.md`, Acceptance
- [x] W0: see `docs/specs/decisions-still.md`, Acceptance

## Done
- 2026-10-06 sup41: merged to main as 10ba09a (6230714..10ba09a, rebased on ee41225 with the four patches unchanged; make test and npm build green there); code review pass and UI recheck pass at ea490ae; seats ended
- 2026-10-05 Pablo, in the FSE session: "vibration: I don't see again" (his observation, relayed by the FSE; the UI recheck at the band still decides the gate)
- 2026-10-05 dst-build: F1 fixed (fa1f835: tallness decided before ruling and held while the box is open, lib/stuckHead.ts; ea490ae: vitest for the hold and the hard bottom line); band rows below; W0 at ea490ae
- 2026-10-05 dst-build: fix 5e7fccb (.dec-head.stuck changes paint only: inset shadow, body border transparent, actions keep their padding) + guard test 1fc4140; branch decisions-still rebased on 682013f; W2 zero motion in both engines, W3 and W0 pass. Evidence in .wt-notes/dst-build/ (progress.md)
- 2026-10-05 sup41: builder dst-build launched in .wt/decisions-still from main 37560ff
- 2026-10-05 0086 ruled by pablo ("ok", 0d6bb82); sup41 launched by the FSE
- 2026-10-05 cut by the FSE from Pablo's report ("this view 'vibrates'")

## Next

## Blockers

## Notes
- W1, the cause (measured 2026-10-05, dst-build). A feedback loop between the
  stuck head's measure and the stuck head's own CSS. `DecisionsView.tsx:166-187`
  sets `tall` (so `.dec-head.stuck`, line 296) when the expanded record's
  `offsetHeight` exceeds the room under the section heading, and re-measures
  from a ResizeObserver on the record (lines 183-184). But `.stuck` changes the
  record's height: `decisions.css:73-79` adds the head's 1 px border-bottom,
  drops `.dec-actions`' 4 px top padding (line 79) and the body's 1 px
  border-top (line 78): the record is 4 px shorter stuck (0085: 673 -> 669 px,
  head 78 -> 75, body top +3 px). Whenever the unstuck height is within 4 px
  above the room, stuck makes it short, short unsticks it, unstuck makes it
  tall: the class flips every frame, the body jumps 3 px, `--dec-box-max`
  flips with it, and DecisionsView re-renders each time. Not the scroll edges
  (colour only, no toggling seen) and not the refresh (no change on agents
  events). Pablo's window height was in that band for 0085 (at 1245 wide).
  - WKWebView (instrumented copy of `make review-build`, recorder via
    runtime.LogInfo, never committed; fixture home with a copy of
    working-on/decisions/, 0085 set waiting in the copy only), classic bars,
    rail full: 1245x932 still (record 673 < room, never stuck); 1245x878, 0085
    expanded: 52 box changes in 300 samples / 30 s, the head's class flipped
    about 100 times a second (`wk-w1-1245x878-expanded-classic.log`; the
    shot taken then captured the wrong window and was dropped; Chromium's
    `chromium-1245x878-w1-expanded-full-classic.png` is the before shot).
  - Chromium (wails dev, same fixture), 1245x878, rail full, classic: 0085
    expanded, 30 s: 3597 layout shifts (source `div.dec-body`, y 346 -> 343),
    18030 mutations (`div.dec-head` class, `.dec` style --dec-box-max); scrolled
    stuck: 18020 mutations; Playwright could not click Rule ("element is not
    stable"). Rule open moves the band 12 px (the facts join the head), so at
    878 it holds still. `chromium-1245x878-w1-full-classic.json`.
    1245x932 and 1024x640: still in both engines.
  - Also seen, not motion: every DecisionsView render re-sets the find
    input's and the rule box radios' `name`/`type` attributes to the same
    values (React's input update); no layout, no class.
- W2 (fix at 46bdef7, rebased to 1fc4140 with no Decisions file changed on main):
  orgcopy/0029 at 1245x932 and 1024x640, rail full and strip, classic and overlay, plus
  orgcopy/0085 at 1245x878 (the window that looped); expanded, stuck, Rule open; 30 s each,
  3 agents refreshes. Chromium: 0 layout shifts, 1 box state, 0 class/style mutations in
  all 30 states. WKWebView (instrumented review build): 0 box changes in all 27 measured
  states (0085 overlay's Rule state not driven: Rule off-window there; classic measured).
- W3: Q2, B12, B13, L12 pass in Chromium (1024x640, rail full, classic and overlay) and
  WKWebView (1024x640, rail full, overlay; B13 also classic): head at the heading's foot
  before and after Rule, facts in the head, box below it and capped, head leaves with the
  record's end; 0006's code block keeps scrollLeft 300, same node, over 40 s.
- Found, not asked: the Decisions board overflows sideways when a Ruled line's chosen
  option is long (organizer 0082: `.dec-meta`, global.css:756, nowrap and no shrink,
  1043 px), scrollWidth 1175 at any narrower view; with a trackpad the board swings and
  rubber-bands sideways. Input-driven, outside FR-2; what the line cuts is a design
  question, sent to sup41.

## Review
- Verdict: pass. Commit reviewed: ea490ae36783711cf4618fb42207fe344e171e69 (branch decisions-still, re-review after the UI review's F1). Unmet gate items: none. Reviewer: dst-review, 2026-10-05. The first review (pass at 1fc4140) is replaced by this one.
- W1: the cause names decisions.css:73-79 and DecisionsView.tsx:166-187 and was measured in both engines. The code agrees: stuck added a 1 px head border and removed the 4 px top padding of the actions and the 1 px top border of the body, so the stuck record was 4 px shorter, and the ResizeObserver measured it again. 0023ff9 removes exactly those three size changes. The head's line is now `inset 0 -1px 0 var(--border)`, which d8221ac (§8 A1) allows.
- F1 fix (fa1f835): `tall` while ruling is the answer measured before the box opened (`stickNow`/`holdTall`), and it is measured again once the box closes, as d8221ac's §8 says. The only way to open the box is the Rule button on a record that is already expanded and was measured, so there is always an answer held. While ruling, `tall` is constant, and `boxMax` only sets the capped box's max-height (the box is absolutely placed), so the hold cannot feed the measure again. Mutation check: with the hold removed from `stuckHead.ts`, 3 of the 5 hold tests fail.
- FR-3: the sticky position, `--dec-box-max`, and the facts line in the head while ruling (`isRuling`) are kept. `RecordBody` and `useScrollEdges.ts` are unchanged, so every caller of useScrollEdges is unchanged too.
- W2: Chromium and WKWebView cover all 24 required states at 1fc4140: 0 shifts and 0 box changes. Those measurements predate fa1f835, and they still hold: the hold changes the output only when the measure changes after Rule opens, and in all 24 Rule states both engines recorded `stuck: true`. W2 at the band (0085, 1245x879/868, full, classic) was rerun at ea490ae in both engines: 0 shifts, 0 changes, and stuck while ruling.
- W3: Q2, B12, B13 and L12 pass at the spec's rows (WKWebView at 1fc4140, unchanged for them by the same argument; Chromium rerun at ea490ae). The F1 band sweep passes 12/12 in both engines, and Chromium fails 12/12 before the fix.
- W0: rerun from a clean clone at ea490ae: `make test` passes (Go ok, vitest 259/259), `npm install`, `npm test` and `npm run build` pass, and `wails build` produces Deltagos.app.
- Boundary: DecisionsView.tsx, decisions.css, lib/stuckHead.test.ts and lib/stuckHead.ts. stuckHead.ts is not named in the boundary. It is a pure helper (no React, DOM or store), imported only by DecisionsView.tsx and its test. I judge it inside the card's intent, not a finding.
- Not covered by the gate (for the FSE): W2's required windows never loop on main (dst-ui G1), so the gate rows that can fail before the fix are the band rows the builder added. The spec should name them. The board still overflows sideways on a long Ruled line (G5), which is not in this spec.
- Review fixes (F1, A1), at ea490ae, branch rebased on 398645f. Tallness is decided
  before ruling and held while the box is open (`lib/stuckHead.ts`, `stickNow`/`holdTall`,
  used by `DecisionsView.tsx` in the tall measure; vitest in `lib/stuckHead.test.ts`).
  A1: the stuck head's line is `box-shadow: inset 0 -1px 0 var(--border)` (no blur, no
  spread), asserted by the same test file.
  - W3 band, F1 (0085, 1245x868 to 1245x879 in 1 px steps, rail full, classic; head
    stuck by a scroll, then Rule): Chromium before the fix (9b50992's DecisionsView): 12/12
    fail, head 161 -> -166, Rule covered. After: 12/12 pass: still stuck, head top 161 = the
    heading's foot before and after, Rule, the line and the box title hit-tested, box top
    267 >= head bottom 263, capped, inside the board, unchanged 3 s later
    (`chromium-F1band-full-classic-0085.json`). WKWebView (instrumented review build):
    12/12 pass, head [161, 78 -> 102 px] stuck, box 267 capped, Rule and the box title
    AX-hit-tested (`wk-F1band-full-classic-0085.txt`, shots at 868, 873, 879).
  - B12/B13/Q2 at the band (0085, 1245x879 and 1245x868, rail full, classic; 300 px
    scroll, since 0085 is a few px taller than the room and 600 px is past its end):
    Chromium pass at both, landing via its Timeline row leaves the head whole under the
    heading with Rule hit (head top 224, heading foot 169). WKWebView pass at both: landed
    head 224, Rule hit; +300 head at 161, Rule hit; past the end head bottom 95 <= record
    bottom 96. B13 per the band sweep above.
  - W2 at the band (0085, 1245x879 and 1245x868, full, classic, expanded / stuck / Rule
    open, 30 s, 3 refreshes each): Chromium 0 shifts, 1 box state, Rule state now stuck;
    WKWebView 0 box changes, Rule state stuck and capped (`w2-*-band.txt`).
  - W3 at the spec's rows rerun at ea490ae in Chromium (1024x640 full classic with L12,
    overlay): pass.

## UI review
- Reviewer dst-ui, recheck 2026-10-06 at **ea490ae36783711cf4618fb42207fe344e171e69**; every row below was measured on it (detached worktree `.wt/dst-ui`, `npm install`, a fresh fixture home with the `orgcopy` copy of the organizer's records, 0029 and 0085 waiting in the copy, and init-a/0006). **Verdict: pass.** F1 (sev 3 at 1fc4140) is fixed in both engines. A1's line now meets §8 as amended (d8221ac): a hard 1 px `--border` line. No sev 4 or 3 remains. The first review at 1fc4140 is in git history (1c4870a).
- How: Chromium = `wails dev -devserver localhost:34575` + headless Playwright (viewport = window − 31 px, classic = Chromium's own 15 px bars, overlay = `--hide-scrollbars`). WKWebView = `make review-build` at ea490ae: a clean copy for shots and a copy with a temporary `<script src=/rec.js>` (reverted at once, never committed). That copy logs once a second to the fixture's organizer.log: the head, body and box rects every 100 ms, mutations under `.decisions`, geometry and `elementFromPoint` hit-tests. It was started with `-AppleShowScrollBars Always` (classic, 14 px) from the fixture env and driven only by AX press and scroll-to-visible plus keys posted to its pid. A 30 s window counted only while the app was on screen. Evidence: `.wt-notes/dst-ui/` (`f1band.mjs`, `chromium-1245-F1band_full_classic-ea490ae.json`, `wkf1.out`, `wkre-w2w3.out`, `r2/`, `*-ea490ae.png`).

### F1 recheck: Rule on the stuck head at the band (0085, 1245 wide, rail full, classic)
| Window | Chromium | WKWebView |
|---|---|---|
| 868–879, each 1 px | pass, all 12. Before: stuck, head y 161 at the heading's foot. After Rule: still stuck, head y 161, line, Rule and the box's title hit-tested, facts in the head, box below Rule and inside the view, nothing changed 2 s later. Record 673 → 661 | pass, all 12. Before: stuck, head y 161, Rule hit. After Rule: stuck, head y 161, line and Rule hit (Rule y 227), facts in the head (199–223), box top 267 below Rule's bottom (255), bottom 684 ≤ 836–847, `max-height` 539–550, identical 5 s later |
| 866–867 (below the band) | pass | not run |
| 880–881 (above) | record not taller than the view: it does not stick (§8), so there is no stuck head to rule from; reference only | same at 880 |
- Main and 1fc4140 failed the same steps (head −139, Rule covered); see 1c4870a.

### B12 and B13 at the band
- B12 (Chromium 1245×868, 874, 879; WKWebView 1245×874): reading, the head sits at the heading's foot (y 161) with the line and Rule hit; past the record's end it leaves (line not hit). Chromium also checked it while ruling: the head stays stuck, then leaves with the record's end, the box riding with Rule (`chromium-1245x874-B12band-pastend-ruling_*.png`). Pass.
- B13 at the band = the F1 table: the head does not move, the box sits under Rule, in view. Pass, both engines. Held 30 s with Rule open at 1245×874 (both engines): 0 shifts (Chromium), 1 box state, 0 class mutations, 0 px change (WKWebView). Pass.

### A1
- The stuck head's bottom line is `box-shadow: inset 0 -1px 0 var(--border)`, which the amended §8 accepts ("a border or a hard inset shadow, no blur"). Measured as one hard 1 px row with no blur rows on either side: Chromium #433e4f on #2a2438 (`chromium-1245x932-W2-stuck_full_classic_0029.png`, y 238); WKWebView #413d4a on #282132 (`webkit-1245x874-A1-stuck_full_classic_0085-ea490ae.png`, y 270). Pass.

### W2 spot check (30 s each, no input, ≥ 2 refreshes; expanded / stuck / Rule open)
| Window | Rail | Bars | Chromium | WKWebView |
|---|---|---|---|---|
| 1245×932, 0029 | full | classic | pass ×3: 0 shifts, 1 box state, 0 class/style mutations, 3 refreshes | pass ×3: 1 box state, 0 class mutations, only the today line's style (exempt, FSE), 0 px except N1 |
| 1024×640, 0029 | strip | overlay (Chromium) / classic (WKWebView) | pass ×3 | pass ×3, 0 px |
| 1245×874, 0085 (band) | full | classic | pass ×3, Rule held stuck | Rule state pass (above) |

### W3 once
- Q2 and L12, plus B12 and B13 at their own conditions, 1024×640 rail full classic. Chromium: B12, B13, Q2 and L12 pass (L12: scrollLeft 300 kept, same node, 4 refreshes in 40 s). WKWebView: B12 (scrolled 664 px: head y 161, line and Rule hit; past the end, head y −226), B13 (head 161 before and after, box 267 under Rule, capped 311 px and scrolling inside), Q2 (facts 199–223 in the head, box below them) and L12 (scrollLeft 300 kept, same node, 4 refreshes) pass.

### Notes
- N1 (sev 1, not FR-2): in WKWebView, 1245×932 Rule open, a focus ring appeared on the box's title between 15 and 20 s with no input from my driver and no class or box change in the page. Most likely the window became key while another session drove the machine. Recorded, not motion.
- From the first review: G1 is answered by the band rows in W3; G3 is answered by the FSE (time-driven marks exempt); G4 (the review build's window titled "Deltagos") and G5 (0082's line overflowing sideways) stay with the FSE. A2 is settled by d8221ac.

### Not verified
- In WKWebView: the band rows with overlay bars or the strip rail, B12 while ruling at the band, and below-band windows 866–867. Chromium covers B12-ruling and 866–867.
- Pablo's own window and data: the band was measured on the fixture copy of 0085.
- Conduct: the machine was in use from 20:05 to about 01:00 (likely another review seat's driver part of the time; it also left my HID-idle signal unusable). The WKWebView window was raised only after ≥ 30 s idle, near 01:10. One run was lost to my own launcher typo (21:09–00:10; no app started); nothing it logged was used. I quit only my own instances, by pid.
