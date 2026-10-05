---
title: Decisions holds still - the view moves by itself while a record is read (Pablo's report)
status: now
repos: [organizer]
branch: decisions-still
seat: dst-build
updated: 2026-10-05
next: "review: decisions-still, gate met (W1-W3, W0; Chromium and WKWebView)"
depends_on: []
boundary: ["frontend/src/components/DecisionsView.tsx, RuleDecisionBox.tsx", "frontend/src/styles/decisions.css, rule-box.css, global.css (.markdown rules only)", "frontend/src/lib/useScrollEdges.ts and lib/ tests", "not: Home, Conversations, Go, docs/design-system.md"]
spec: "docs/specs/decisions-still.md (FR-1 to FR-3)"
gate: "docs/specs/decisions-still.md Acceptance, rows W1 to W3 and W0"
ui_review: true
---

## Goal
Nothing on Decisions moves unless the operator moves it. Measure the cause first.

## Gate
- [x] W1-W3: see `docs/specs/decisions-still.md`, Acceptance
- [x] W0: see `docs/specs/decisions-still.md`, Acceptance

## Done
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
