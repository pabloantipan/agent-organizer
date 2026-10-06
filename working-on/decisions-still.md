---
title: Decisions holds still - the view moves by itself while a record is read (Pablo's report)
status: now
repos: [organizer]
branch: decisions-still
seat: dst-build
updated: 2026-10-05
next: "review: decisions-still, F1 fixed, gate met (W1-W3 with the band rows, W0; Chromium and WKWebView)"
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
- Reviewer dst-ui, 2026-10-05. Commit run: 1fc41403708759aa1de4071cc4005e8907642d47 (detached worktree `.wt/dst-ui`); every row below was measured on it. Before: main's `decisions.css` at 682013f swapped into my worktree (Chromium) and into an instrumented review build (WKWebView). Records: my own fixture home (`scripts/fixture-home.sh` from that checkout) plus `orgcopy`, a copy of the organizer's `working-on/decisions/` with 0029 and 0085 set waiting in the copy (as the builder's W2 did; 0087 waits as is), and init-a/0006 for L12. Evidence, drivers and logs: `.wt-notes/dst-ui/`.
- **Verdict: fail**, on F1 (sev 3) against FR-3 (decisions-view §8, B13). The motion itself is gone: W2 holds in every combination in both engines, and a 1 px window-height sweep finds no loop band left. F1 is older than this branch (main's loop hid it), but it sits in Pablo's reported state and window, and its fix is inside this card's boundary. It is design-shaped (A2), so aglaea should see it first.
- How: Chromium = `wails dev -devserver localhost:34575` + headless Playwright, viewport = window − 31 px; classic = Chromium's own 15 px bars, overlay = `--hide-scrollbars` (0 px). Recorder: `layout-shift` (PerformanceObserver, buffered, counted from t0), a MutationObserver on `.decisions` (attributes, childList), and the head, body and box rects every 100 ms, with the agents events counted. WKWebView = `make review-build` copies started from the fixture env (`-AppleShowScrollBars Always` = classic 14 px, `WhenScrolling` = overlay 0 px). In-page measurement comes from a copy built with a temporary `<script src=/rec.js>` (reverted at once, never committed). It writes one line a second to the fixture's organizer.log through `runtime.LogInfo`: the same rects every 100 ms, mutations by kind and target, then geometry and `elementFromPoint` hit-tests. WebKit has no `layout-shift` entry type. Second witness: `screencapture -o -l <id>` of the window every 5 s, pixel-diffed inside the board. Driven by AX press and scroll-to-visible plus keys posted to the app's pid; no pointer events. A 30 s window counts only if the app was on screen throughout, 30 lines were logged and the machine had no input during it.

### Findings
- **F1 (sev 3) Rule pressed on a stuck head throws the head out of view, at the window where it used to loop.**
  - What the person cannot do: rule from the stuck head he is reading. Rule, the line and the facts jump above the view. The box's number and title slide under the board's top edge.
  - Where: Decisions, orgcopy 0085 expanded, scrolled until its head sticks, then Rule. WKWebView 1245×879 classic, rail full: `webkit-1245x879-B13band-stuck-clean_*.png` → `webkit-1245x879-B13band-rule-open-clean_*.png`, from the unmodified review build. Chromium 1024×985 classic: `chromium-1024x985-W2-rule_full_classic_0085.png`.
  - Evidence (WKWebView, in page): before Rule: scrollTop 453, `stuck`, head y 161 at the heading's foot, Rule hit. After Rule: `stuck` false, head y −139, Rule y −73 (`elementFromPoint`: covered), box top y 53, record 673 → 661 px. The facts leave the body (−36) and join the head (+24), and `tall` (DecisionsView.tsx:166-187) is measured on that ruling layout, so the record is no longer "taller than the view" and the head unsticks. Chromium: head 161 → 10. Band: 12 px of window height per record (0085 at 1245 wide, rail full, classic: stuck up to 879 unruled and up to 867 ruling, so windows 868–879). Main (Chromium, main CSS, 1245×878): head y 27, unstuck after Rule, same cause.
  - Severity 3: the reported view, state and window; B13 says "the head does not move", §8 says the box "never pushes the head up". The only recovery is to scroll back up.
  - Proposal: decide `tall` from the record without the ruling facts (or keep a stuck head stuck while its record is ruling), so pressing Rule never unsticks it. Add a W3 row: B13 at the band (0085, the window 1 px above its stuck threshold, both engines).
- **F2 (sev 1) a lone layout shift outside Decisions.** Chromium logged it in 5 of about 45 30-second runs, only with 4 runs in parallel: one entry of 2e-5 at 0.5–1.9 s, source the text "init-a" in `.rail-title`, same rect before and after. Not reproduced in 7 runs without load; never a Decisions node. Recorded, not motion of Decisions.
- **F3 (sev 1) glyph rasterisation noise.** WKWebView 1245×932 strip overlay, Rule open: 62 px of two option labels' text changed between 5 s frames (rows 475–515). No rect, class or style changed in the page.
- Not findings: React re-sets the find input's and the radios' `name`/`type` on each refresh (no layout). The Timeline's today line (`span.tz-today`, `tz-today-at`) gets a new style each refresh: 4 style mutations per refresh, the only ones in every WKWebView window. Chromium dev mode raises the page error "Cannot read properties of null (reading 'nodes')" from wails dev's browser runtime, not from app code.

### W2 (30 s each, no input, ≥ 2 refreshes; 0029 unless named; expanded / stuck / Rule open)
| Window | Rail | Scrollbars | Chromium | WKWebView |
|---|---|---|---|---|
| 1245×932 | full | classic | pass ×3: 0 shifts, 1 box state, 0 class/style mutations, 3 refreshes (Rule: 2) | pass ×3: 1 box state, 0 class mutations, only the today line's style, 0 px change, 3 refreshes |
| 1245×932 | full | overlay | pass ×3 | pass ×3 |
| 1245×932 | strip | classic | pass ×3 | pass ×3 |
| 1245×932 | strip | overlay | pass ×3 | pass ×3 (F3) |
| 1024×640 | full | classic | pass ×3 | pass ×3 |
| 1024×640 | full | overlay | pass ×3 | pass ×3 |
| 1024×640 | strip | classic | pass ×3 | pass ×3 |
| 1024×640 | strip | overlay | pass ×3 | pass ×3 (one window discarded: someone used my review window, see Not verified) |
| band 1245×878/879, 0085 | full | classic | pass ×3 (expanded and stuck still; Rule → F1) | expanded and stuck pass; Rule → F1 |
| band 1245×878, 0085 | full | overlay | expanded and Rule pass; record not tall, no stuck state | not run |
| band 1024×985, 0085 | full | classic | pass ×3 (Rule → F1) | not run |
| band 1245×884, 0087 | strip | classic | pass (not tall there) | not run |
| **main**, band, 0085 | full | classic | 3,596 shifts, 7,204 class/style mutations / 30 s (1245×878) | 2,966 head class flips / 30 s, head 75↔78 px (1245×879) |
- Sweep (1 px window steps, 640–1100, about 0.4 s each, head class flips and body y): Chromium branch, 60 combinations (1245 and 1024 × rail full and strip × classic and overlay × 0085, 0087 and 0029 × expanded, stuck and Rule): 0 heights move, while every 0085 and 0087 combination crosses its stuck threshold. Main: 4 px bands (0085: 876–879 expanded or stuck, 864–867 Rule; 1024 wide: 983–986; 0087: 882–885). WKWebView branch, 1245 full classic 0085, 850–910: 0 move, threshold at 879/880 crossed.

### W3
| Row | Chromium | WKWebView |
|---|---|---|
| Q2 (Rule open, scrolled) | pass: 1024×640 full classic and overlay, strip classic; 1245×932 full classic | pass: 1024×640 full, classic and overlay. Facts at y 199–223 inside the head (161–263), box top 267 below them, Rule hit |
| B12 | pass (same four): line and Rule hit at the heading's foot; past the end the head leaves (line not hit) | pass: 1024×640 full, classic and overlay. Scrolled 657/664 px, not 600 (AX scroll-to-visible); head y 161 = heading foot; past the end head y −127/−134 |
| B13 | pass at the row's conditions; **fails at the band (F1)** | pass at 1024×640 full, classic and overlay: head y 161 before and after, box 267 below Rule (bottom 255), capped 311/325 px and scrolling inside, bottom ≤ 608. **Fails at the band (F1)** |
| L12 | pass: same node, scrollLeft kept through 4 refreshes in 40 s (300 at 1024; at wider views the block's max, 166 or 149) | pass: 1024×640 full, classic and overlay; scrollLeft 300 kept, same node, 4–5 refreshes in 40 s |

### Spec gaps (for the FSE)
- G1 W2's two windows never loop on main for these records (0 flips at 1245×932 and 1024×640 in the main sweep): the loop is a 4 px band of window height per record. A gate that cannot fail before the fix proves nothing. Gate it as a height sweep (or the band window per record) in both engines.
- G2 No row covers Rule pressed at the band (F1).
- G3 FR-2's "nothing moves" never says whether the Timeline's clock-driven today line (style each refresh, about 0.001 px) is exempt; the code reviewer raised it too.
- G4 The review build's window is titled "Deltagos", like the lead's. At about 18:47 someone chose an option and typed words into my fixture review window (nothing ruled; the fixture's 0029, 0085 and 0087 are still proposed). Title the review build's window "Deltagos Review". Also, WebKit throttles an occluded or off-Space window, so WKWebView gates need the screen; a reviewer has to wait for an idle machine.
- G5 The design system now says a record line's chosen option gives way first (cb20fcf). The branch still overflows sideways (0082's line; horizontal bar at 1024 and 1245, both engines). Not in this spec: card it.

### Design questions (for aglaea)
- A1 The stuck head's bottom line is now an inset shadow, not a border, and the stuck head is 3 px taller than before (the action row keeps its 4 px). It looks the same (`crop-webkit-1245x932-stuck-head.png`). §8 says "a 1 px `--border` at its bottom": accept the shadow?
- A2 §8 conflicts with itself at the band: "a record shorter than the view does not stick" against "the box never pushes the head up". The ruling layout is 12 px shorter. My recommendation: tallness is decided without the ruling facts, so a head that is stuck stays stuck while ruling (F1).

### Not verified
- Pablo's own window, data and installed build (v0.2.0-1047): I used a fixture copy of the records at the band windows.
- In WKWebView, the band rows with overlay bars or the strip rail, and the band sweep beyond 1245 full classic. Chromium covers them.
- An exact 600 px scroll in WKWebView: AX scroll-to-visible landed at 645–664 px.
- Keyboard and focus when Rule opens (outside this spec).
- `chromium-1245x878-W2-full_classic_0085.json` (branch) was overwritten by my main run; its summary is in `w2-chromium-branch.txt`.
- Chromium's viewport is 1 px taller than WKWebView's content at the same window size (−31 against −32).
- Conduct: I raised my review window only after 120–150 s of machine idle. Whenever someone was active I waited, and I posted a status to sup41 about it. I quit only the instances I started, by pid.
