---
title: The rule box's tables scroll, the facts line stays while ruling, his words kept verbatim, dates in words, make test from a clean checkout
status: done
repos: [organizer]
branch: rule-words-and-dates
updated: 2026-10-04
next: "merged to main cdefd78; findings U1-U5, D1 and the review's boundary note with the FSE and aglaea"
depends_on: []
boundary: ["frontend/src/styles/rule-box.css, decisions.css, home.css; frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx, Home.tsx", "frontend/src/components/Conversation.tsx (the composer's attributes only), CardDrawer.tsx and its CSS (cap, scroll, comments' attributes)", "frontend/src/components/TimeZoom.tsx (.tz-more name, Timeline names' dates), StageRoadmap.tsx (dates only)", "frontend/src/lib/dates.ts and lib/ tests", "testdata/fixture-overlay/", "Makefile (the test target only)", "frontend/src/styles/shell.css (the .home max-width rule at :65 only, FR-4; widened by the FSE 2026-10-04)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-8.md (FR-1 to FR-8); the ranking docs/ux/reviews/2026-10-04-rank-leftovers-8.md (Aglaea, 10bc67a); the design system's Principles as amended there"
gate: "docs/specs/leftovers-8.md Acceptance, rows Q1 to Q7 and Q0"
ui_review: true
review: pass
seat: rwd-build
---

## Goal
sup33's leftovers with Aglaea's A1-A3.

## Gate
- [x] Q1-Q7: see `docs/specs/leftovers-8.md`, Acceptance
- [x] Q0: see `docs/specs/leftovers-8.md`, Acceptance

## Done
- 2026-10-04 sup35 ended: seats rwd-build, rwd-review, rwd-ui killed and revoked, worktree and branch removed, task threads closed; D1 and U1 answered by aglaea (d06e265) for the next ranking; run record runs/2026-10-04-rule-words-and-dates.md (50 min against 40-80)
- 2026-10-04 code review pass and UI review pass at bd1ff21; merged to main cdefd78 by sup35, make test green on main (vitest 191)
- 2026-10-04 rwd-build: FR-4 fixed at the source, `.home` capped at 1,480 (shell.css:65, boundary widened by the FSE via sup35; bd1ff21): at 1512×945 with the strip the list reaches the content edge in both engines; gate met, rows in `.wt-notes/rwd-build/gate.md`
- 2026-10-04 rwd-build: FR-1, 2, 3, 5, 6, 7, 8 built on rule-words-and-dates (fbd0d2f e1f0470 8eefbae 802d297 a40e038 6fc221f fc712a2, fixture 0e3f3c1); Q1 Q2 Q5 Q6 Q7 Q0 pass in Chromium and WKWebView, Q3's values pass in WKWebView (`.wt-notes/rwd-build/gate.md`)
- 2026-10-04 0080 ruled by pablo ("Ok", 5fa5b5e); sup35 launched by the FSE
- 2026-10-04 cut from leftovers-8 by the FSE

## Next

## Review
- Verdict: pass (code review; the UI review is separate).
- Commit reviewed: bd1ff21 (`git diff main...bd1ff21`).
- Unmet gate items: none.
- Checks: Q7 fresh `git clone` + `checkout bd1ff21` + `make test`, exit 0
  (Go ok, vitest 191); Q0 detached worktree, `XDG_DATA_HOME=$(mktemp -d)
  make test` 0, `npm test` 0, `npm run build` 0; `wails build` from the
  builder's log only (q0b). Q4's cause is on the card before the fix
  (2b25628 < bd1ff21) and the fix is that cause (shell.css:65 cap).
  Q5: `dateWords` in lib/dates.ts with lib tests; no raw ISO left in
  record meta, Timeline names or Stages (grep).
- Findings, not gate items: (1) boundary: Conversation.tsx also changes the
  queue's RuleBox (attributes and its Escape guard) and keydown handlers, not
  only the composer's attributes; CardDrawer's note edit gains an Enter
  composing guard. Both serve FR-3; the FSE decides. (2) Q3's Escape with a
  correction bubble is guarded in code (preventDefault on composing/229,
  boxStack skips prevented keys) but no one has raised a bubble yet: the UI
  reviewer's. (3) Q4 in WKWebView: the list reaches the edge but init-a's
  goal, first signal and next date still ellipsise while Stage and Phase
  show slack; the gate's "room" reads as list width, so it passes, but the
  column split is not covered by any row.
- Reviewer: rwd-review, 2026-10-04.

## UI review
- Verdict: **pass** (no severity 4 or 3). Commit run: bd1ff21, every row
  (detached worktree `.wt/rwd-ui`, fixture from that clean checkout; Chromium
  via `wails dev -devserver localhost:34525`, WKWebView via `make
  review-build`, Deltagos Review). Shots, AX dumps, drivers and JSON under
  `.wt-notes/rwd-ui/`; WKWebView rows hit-tested by the AX element at the
  point, Chromium by `elementFromPoint`; every synthetic click was refused
  outside the review app's window frame.
- Scrollbars: WebKit "classic" is `-AppleShowScrollBars Always`; the first
  WebKit run (`*-classic-auto.png`) was the system's Automatic setting with a
  mouse attached, which also drew classic bars (the thumb stays when idle) and
  measured the same; "overlay" is `-AppleShowScrollBars WhenScrolling`,
  confirmed by no thumb when idle. Windows are window sizes (Chromium viewport
  = h − 31). Rail: the review bundle remembered the strip, so every WebKit
  row ran with the strip; Chromium as noted.

| Row | Chromium (shot · window · rail · bars) | WKWebView (shot · window · rail · bars) | Result |
|---|---|---|---|
| Q1 | `chromium-1024x640-Q1-rule-box-0010-{classic,overlay}.png` (strip), `chromium-1512x945-Q1-…` (expanded); both bars. Box 560 / 460 px with 0010 = same as 0002 without a table; table scrollWidth 750 > client 511/526 (1024), 411/426 (1512); `edge-right` (fg-subtle); words whole ("initiative id"); hit at the table centre = a `td` | `webkit-1024x640-Q1-rule-box-0010-{classic,overlay}.png`, `webkit-1512x945-Q1-…-{classic,overlay}.png`, strip. Box 560 / 460; table frame 514 / 414 (classic), 528 / 428 (overlay) with rows 749 wide inside; edge pixel (138,130,151) at its right end vs (78,72,87) for a cell border; AX hit at the centre = a cell | pass |
| Q2 | `chromium-{1024x640,1512x945}-Q2-decisions-0008-ruling-scrolled600-{classic,overlay}.png`; strip at 1024, expanded at 1512. Scrolled exactly 600 in `.board-wrap`; head sticky, facts line inside it (y 199–231), box top 272 ≥ head bottom 268; `w-later` link hit-tests | `webkit-1024x640-Q2-…-{classic,overlay}.png`, strip. Find field −39 → −639 (600 px); head at 224, facts at 263, Rule 294, box 335; AX hit on `w-later` = the link, on the box = the box | pass |
| Q3 | `q35-chromium.json`, `q6-chromium.json`, `chromium-1512x945-Q3-composer-classic.png` (expanded, classic): `autocorrect="off" autocapitalize="off" spellcheck="false"` on the rule box's words, the new-thread subject and body, the card comment | `webkit-1024x640-Q3-{rulebox,composer,comment}-typed-{classic,overlay}.png`, strip: `words` typed with real key codes stays `words` in all three (AX value); no spelling underline on "teh recieve". Escape **with a bubble showing: not verified** (below) | pass, bubble not verified |
| Q4 | `chromium-1512x945-Q4-home-strip-list-{classic,overlay}.png` (strip). `.home` and `.home-list` end at 1477 classic / 1492 overlay = the content edge (gap 0); last cell hit-tests. init-a's next date cut ("due · w-later" 68 > 45 px) | `webkit-1512x945-Q4-home-strip-{classic,overlay}.png`, `-row-zoom.png` (strip). AXTable 66–1478 classic / 66–1492 overlay = the content edge; the chevron at the row's end hit-tests. Same date cut ("due · …") | edge pass; "no column cut while room remains" not met: U1 (sev 2) |
| Q5 | `chromium-1512x945-Q5-{decisions-timeline-open,decisions-ruled-record-meta,roadmap-stage1-open}-classic.png` (expanded, classic): "raised 27 Sep by fse", Ruled "· by pablo · 27 Sep", Timeline names "raised 2 Aug, ruled 5 Aug by acme", Stages "done 15 Aug", "met 10 Aug", Target/Done "15 Aug"; no ISO text in the view; Timeline name and stage sub hit-test | `webkit-1512x945-Q5-…-classic-auto.png`, `webkit-1024x640-Q5-{decisions-timeline,roadmap-stage1-open}-{classic,overlay}.png`, strip: same words in AX; the Timeline name hit-tests | pass (ISO elsewhere: U3) |
| Q6 | `chromium-1024x640-Q6-card-back-w-wide{,-scrolled,-bottom}-{classic,overlay}.png` (strip): modal 48–561 in a 609 viewport; body overflow auto, 752/702 > 432; `edge-bottom` then `edge-top` after a wheel of 400; backdrop and document do not scroll. `+N`: `role="img"`, name "1 more milestone on 22 Sep: Billing switched on", hit-tests at both sizes | `webkit-1024x640-Q6-card-back-w-wide{,-scrolled,-bottom}-{classic,overlay}.png`, strip: dialog 111–623 in a 640 window; a wheel moves the comment field 366 → 77 while the heading stays at 131; bottom edge pixel (138,130,151) at y 590 in overlay. `+N` is an AXImage named "1 more milestone on 22 Sep: Billing switched on", AX hit at its centre = it | pass |

### Findings
- **U1 (2)** — *The lead cannot read which card Home's next date belongs to,
  while columns to its left keep room.* Where: Home, 1512×945, rail strip,
  both bars, both engines, bd1ff21; `chromium-1512x945-Q4-home-strip-list-classic.png`,
  `webkit-1512x945-Q4-home-strip-overlay-row-zoom.png`. Evidence: heuristic,
  design system Widths ("a column gives way only when it doesn't fit") and
  Q4's third clause; measured: the next-date cell is 96 px and needs ~119
  ("30 Nov" + "due · w-later" 68 px shown in 45) while the initiative column
  keeps ~60 px past its longest id (init-draftable ends at 231, the column
  at 291) and the state column ~48 px past "waits on you". FR-4 fixed the
  cap (the list now reaches the edge); the column split is not FR-4's cause
  and is the same in both engines. Proposal: share the fixed columns' slack
  before cutting the next date (`shareRoom` in `lib/width.ts`), a
  responsive-home row for the FSE; not this card.
- **U2 (2)** — *An Escape loses the lead's typed ruling or comment.* Where:
  Decisions › 0008 › Rule, and the card back's comment field, WKWebView,
  1024×640, bd1ff21; `webkit-1024x640-Q3-rulebox-typed-overlay.png`. Evidence:
  observed by driving the app (heuristic: Nielsen error prevention, user
  control): `words` typed, Escape (no bubble) closes the box and reopening
  Rule shows an empty field; Escape in a comment closes the card back with
  the draft unsaved (seen; that it is gone on reopening is read from the
  code, the field's state lives in the closed drawer). Existed before this branch (Escape closes the topmost box,
  leftovers-5); FR-3 only spares the Escape that ends a correction. Proposal:
  for aglaea (D1 below).
- **U3 (1)** — *Dates still read as ISO in two places a person reads.* Where:
  the initiative header "target 2026-10-01" (every sub-view) and the card
  back's "updated 2026-10-04 · today"; `webkit-1024x640-Q2-…-classic.png`,
  `chromium-1024x640-Q6-card-back-w-wide-classic.png`. Evidence: heuristic,
  the amended Principle ("wherever a person reads them"); FR-5 names only
  record meta, Timeline names and Stages, so not a gate miss. Proposal: spec
  gap S1.
- **U4 (1)** — *A screen reader on a Stages row does not hear the stage's
  date.* Where: Roadmap › Stages, WKWebView; the row is an AXButton named
  "Stage 1: Foundations, done. Show its detail", which hides its visible
  "done 15 Aug". Evidence: heuristic, design system Names (and WCAG 2.5.3
  label in name). Proposal: put the sub line in the name ("…, done 15 Aug").
  Spec gap S2.
- **U5 (1)** — *The comment field and the composer's fields have no name.*
  Where: WKWebView AX: card back comment AXTextArea, composer subject and
  body, title and description empty (placeholder only). Evidence: heuristic,
  WCAG 1.3.1 / 4.1.2. Not this spec; noted for the FSE (S2).

### Spec gaps (for the FSE)
- S1: FR-5 lists three places; the Principle says everywhere. The header's
  target and the card back's updated badge remain ISO (U3), and so do
  Roadmap's milestone and target hover titles (the builder's note).
- S2: names, not in any row: Stages row names drop the date (U4); the
  comment and composer fields are unnamed (U5).
- S3: Q4's "no column cut while room remains" was read by the build as list
  width only; a row should name the column split (U1), as the code reviewer
  also noted.

### Design questions (for aglaea)
- D1 (from U2): what should Escape do in a box holding the lead's unsent
  words (a ruling, a comment, a message)? Keep the draft for the record, ask,
  or not close? Today one Escape discards them silently.

### Not verified
- Q3's correction bubble and its Escape, in WKWebView: synthetic key events
  (real virtual key codes through the HID event tap) raised no correction,
  underline or capitalisation in the rule box **and none in a control field
  without the attributes** (Decisions' find, `webkit-1024x640-Q3-control-find-typed-classic-auto-zoom.png`),
  so no bubble could be shown and "keeps `words`" does not discriminate on
  this machine. The guard is in code (the code review). Needs a real
  keyboard.
- Q3's attributes in the WKWebView DOM: AX does not expose them and the
  review build has no inspector; read in Chromium (same bundle) only.
- The reply box of an existing thread: the fixture's chats showed the
  new-thread form; its attributes read from the code only.
- Q6 at 1512×945: the w-wide card back fits the window there (body 732 = its
  content), so "longer than the window" was reached at 1024×640 only. Q2 at
  1512 in WKWebView not shot (Chromium both sizes).
- Chromium in browser mode logs `Cannot read properties of null (reading
  'nodes')` on every load; not checked against main or in the built app.
- Reviewer: rwd-ui, 2026-10-04.

## Blockers

## Notes
- Compact after bd1ff21 (rail as a strip, classic): a 1024×640 window keeps
  Home at 923 px (under either cap, unchanged); a 1400×900 window gets 1299
  (was capped at 1240); the list reaches the content edge in both. Compact
  content (window < 1440) never reaches 1,480, so compact is never capped.
- Found, not asked: `.home.roomy { max-width: 1480px }` (shell.css) is now
  redundant with the base cap; the roomy class (`ROOMY_FROM` in lib/width.ts)
  no longer changes Home's width. Left as is.
- Found, not asked: at 1512×945 with the strip, WKWebView still ellipsises
  init-a's next date ("30 Nov due · …") with the row at full width, where
  Chromium fits it; the room is used, so this is the column split, not a cap.
- Found, not asked: ISO dates remain in the card back's "updated" badge,
  InitiativeHeader's target and Roadmap's milestone and target hover titles;
  Retire's dialog is not capped at the window.
- Q3's correction bubble and its Escape could not be raised by synthetic
  typing in WKWebView on this machine (a control field without the
  attributes was not corrected either): left to the UI reviewer with a real
  keyboard.
- FR-4 measured (rwd-build, 2026-10-04, 0e3f3c1, fixture): Home at a
  1512×945 window, rail as a strip. The list (`.home-list`, and Needs me
  above it) ends at x=1306 in both engines: `.home` is 1240 px wide because
  `.home { max-width: 1240px }` (`frontend/src/styles/shell.css:65`) holds
  in regular below 1720 (`roomy`, `ROOMY_FROM` in `lib/width.ts`, lifts it
  to 1480). The content edge is at 1477 with classic scrollbars (15 px
  gutter on `.board-wrap`, 20 px padding) and 1492 with overlay ones, so
  the list stops 171 px short (classic) and 186 px short (overlay) — A3's
  "~200". Chromium (classic) and WKWebView (Deltagos Review, classic and
  overlay, AX frames: the table 66..1306) measure the same; no engine
  difference and not the scrollbar gutter. Meanwhile the goal is clamped,
  signals fold to "+3" and the next date is cut to "due · …". The design
  system's Widths caps regular at 1,480. Shots and numbers in
  `.wt-notes/rwd-build/` (`q4-chromium-before.json`,
  `wk-1512x945-Q4-home-strip-classic-before.png`).
