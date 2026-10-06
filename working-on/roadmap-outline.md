---
title: "The Roadmap as an outline: stages, waves, rounds and cards over the axis, decisions as diamonds, four detail steps"
status: now
repos: [organizer]
branch: roadmap-outline
seat: ro-build
stage: one-window
updated: 2026-10-06
next: "review: roadmap-outline, U1 and U3 fixed, X0 pass, a4ec349"
depends_on: [roadmap-waves-scan]
boundary: ["RoadmapView.tsx, Roadmap.tsx and its axis helpers, new outline components and css", "frontend/src/lib helpers and tests", "not: Go, the Calendar, Home"]
spec: "docs/specs/roadmap-as-a-plan.md (FR-4; docs/ux/specs/roadmap-as-a-plan.md (1f2ded8))"
gate: "docs/specs/roadmap-as-a-plan.md Acceptance, rows P1 to P8 and X0"
ui_review: true
review: pass
---

## Goal
0093: the Roadmap reads like a project plan.

## Gate
docs/specs/roadmap-as-a-plan.md, P1 to P8 and X0. Measured in the review build (WKWebView, 1024×640, fixture); shots and logs in `.wt-notes/ro-build/`, detail in its progress.md.

- [x] P1 opens on Current stage: one stage row, two exit items open, axis 17 Aug → today; reopened after Decisions, still step 1 (`webkit-1024x640-P1-step1-full-overlay.png`)
- [x] P2 each step adds its rows (vitest `the detail steps`; `webkit-1024x640-P2-step-*.png`); back to 1 restores; zoom stays Fit
- [x] P3 0004 raised 1 Sep hollow, ruled 3 Sep solid, line between, at Days; waiting dashed to today; pressing a diamond lands on the record (`webkit-1024x640-P3-*.png`). The fixture's pair is in September, not October
- [x] P4 wave rows: task, supervisor, result, launch → merge bar, `also in` (step 3/4 shots)
- [x] P5 Fit `5 rounds · 1 fail` with ✕ (the fixture wave has 5); double-click the bar → Hours, fail outlined magenta, `✕ fail · gate row 2` (`webkit-1024x640-P5-hours-dblclick-full-overlay.png`)
- [x] P6 `Outside any stage · 5 cards` last at steps 1-2, its waves at 3 (`webkit-1024x640-P6-step3-outside-strip-overlay.png`)
- [x] P7 rail expanded and strip, overlay and classic: web area = window (1024×608), titles ellipsised; the short-worded switch fits the line in WebKit, wraps under Stages in Chromium (`webkit-1024x640-P7-*.png`, `chromium-1024x609-P7-rail-expanded.png`)
- [x] P8 radio arrows on the switch; ↑↓ ← → in the outline; Enter on a card opens its card back, Escape returns to the row; diamonds are buttons named with their record (`webkit-1024x640-P8-enter-card-back-full-overlay.png`)
- [x] X0 fresh clone: make test rc 0 (vitest 334), npm run build rc 0, wails build rc 0

## Done
- 2026-10-06 ro-build: Stages is the outline (2686d39 cardBar, 2d71f0d helpers and tests, 90000ed fitTo, fb184ee outline); gate met, branch rebased on main ee1f49c (main ahead only by card commits), unmerged.
- 2026-10-06 ro-build: U1 and U3 fixed (f8de947, a4ec349), branch rebased on main d10daf6, unmerged. U1: after fitTo and any level change the double-clicked wave, the row under the pointer or the first row in view keeps its height on screen; WKWebView 1024×640, strip: fixture `the late card` wave y 360 → 360 (double-click → Days; `=` → Days and `-` → Fit from the row), real data (real config, temp data dir) sup48's merged wave y 399 → 399 (double-click → Hours); shots `.wt-notes/ro-build/webkit-1024x640-U1-*`. U3: the chevron's transition is under `prefers-reduced-motion: no-preference` (CSS read). X0 from a fresh clone: make test rc 0 (vitest 336), npm run build rc 0, wails build rc 0.

## Notes
- Reduced motion checked by inspection only (animation under no-preference).
- A duplicated stage id joins its work to the first stage with that id; the later row says so.
- AXPress on an edge pointer does not scroll in WKWebView, a click does (TimeZoom, outside this boundary).
- `styles/roadmap.css` keeps the old stage-detail rules, now unused (outside this boundary).
- No fixture initiative has waves and no roadmap; that state is covered in vitest only.
- 0100 ruled 2026-10-06; launches when usage-view is in done/.
- supervisor sup48, spawned by the FSE 2026-10-06.

## Review
- Verdict: pass (code, checks, recorded evidence; the WKWebView visual rows are ro-ui's). Re-review after ro-ui's U1/U3 fail.
- Commit reviewed: a4ec34985dcc4930c03f92f8ed6cb294a1e6b831 (rebased on main d10daf6; fixes f8de947, a4ec349). The first pass covered fb184ee.
- Unmet gate items: none.
- X0 from a fresh clone of a4ec349: `XDG_DATA_HOME=$(mktemp -d) make test` rc 0 (14 Go packages ok, vitest 336); `npm install && npm test && npm run build` rc 0; `wails build` rc 0.
- The fixes (`git diff fb184ee..a4ec349 -- frontend`): U3, the chevron's transition moved under `prefers-reduced-motion: no-preference` (my finding 1, now closed). U1, `useTimeZoom` records a row's screen top before a level change (the double-clicked wave's row, the row under the pointer for pinch and ⌘+wheel, else the first row below the stuck axis via the new pure `rowInView`, with 2 vitest cases) and scrolls its scrollers back after the change; the zoom buttons focus with `preventScroll`. All in boundary (TimeZoom.tsx, lib/axis.ts and its test, OutlineRows.tsx, outline.css). No Go, no wailsjs. TimeZoom is shared, so Roadmap › Cards gets the kept row too: that is a behaviour change outside Stages, benign, for ro-ui's eye. Whether the row really holds in WKWebView is ro-ui's row; the DOM walk itself is not unit-tested.
- In the code (unchanged since fb184ee): step is `useState(1)`, reset per initiative, no storage; the switch clears chevrons; zoom kept across steps; a dot wave draws on its record date, a wave or round with no times draws nothing (0022); diamonds are buttons named by `decisionName`, open via `openDecision`; outline.css has no oklch, color-mix, nesting or @layer, tier-2 tokens only; nothing animates under reduced motion.
- Findings still open: (2) the vitest "back to step 1" case calls a pure function twice and proves nothing; the restore rests on `setStep` clearing `open`, shown only by the WebKit AX check. (3) Hours at step 3 reads as Days at step 2 and comes back at 3: the spec's "the step never changes the zoom" and "Hours only from step 3" (0070) disagree, the build took 0070's side; the FSE should write that into the spec. (4) Diamond buttons sit inside `role=tree` outside any treeitem, and ↑↓ on a focused diamond move the row focus. (5) "Every stage is done" at step 1 is in no test and no fixture. (6) `styles/roadmap.css` keeps unused `srm-detail`/`srm-gem` rules: harmless, a cleanup card.
- Gate gap: P7's "wraps under Stages" never happens in WebKit at 1024 (the short words fit); it was seen only in Chromium. U1 (keep the row on zoom) was caught only by the UI review; no P row asks for it.
- Reviewer: ro-review (reviewer seat), 2026-10-06.

## UI review

ro-ui (UI reviewer), 2026-10-06, branch `roadmap-outline` at **fb184ee** (every row was checked on that commit). WKWebView: `make review-build` (`Deltagos Review.app`) at 1024×640 on the fixture, plus the real config with a temp data dir. Chromium: `wails dev` on the fixture, 1024×609. Shots in `.wt-notes/ro-ui/`.

**Verdict: fail** on U1 (sev 3, FR-4 "double-click to fit… anchored on it"). Every P row passes as Aglaea wrote it.

### Findings

- **U1 (3), zooming loses the row the lead zoomed on.** *Cannot:* double-click a wave lower in the outline and see it at the new level. *Where:* Roadmap › Stages at steps 3-4, any wave not near the top (`webkit-1024x640-REAL-sup47-dblclick.png`). *Evidence:* real data in WKWebView: double-click sup47's second wave (AX row at y 528 in a window spanning 160-800) gives Hours, the frame scrolls to its top (Stage 1), and the wave row sits at y 1874, about 1,070 px below the window. Fixture in Chromium: `the late card` wave centred at top 351, double-click gives Days, the row is at 922 with the frame at 145-514 and the viewport 609 tall. The Zoom in button does the same (351 → 922): from Fit, the zoomed frame becomes its own scroller (`.tz-frame.zoomed`, max-height) and starts at scrollTop 0. The builder's P5 shot passed because the fixture's failing wave sits near the top. *Proposal:* after `fitTo` (and any change of level), scroll the frame vertically so the row under the pointer (or the double-clicked wave) stays at the same height on screen.
- **U2 (3, pre-existing, outside this card's boundary): in WKWebView, pressing a diamond focuses the record but leaves it out of view.** *Where:* step 2, press 0004 → Decisions (`webkit-1024x640-P3-diamond-lands*.png`). *Evidence:* focus is on `0004 …, ruled` at y 811, the window ends at 765, and nothing moved after 2.5 s or on a second press. Overview's record link to 0001 does the same (`…P3-compare-overview-0001-lands.png`), and DecisionsView.tsx is unchanged by this branch. In Chromium the same press scrolls the record to top 224 (`board-wrap` scrollTop 430). The likely cause is DecisionsView's landing (`wrap.scrollTo({behavior:"smooth"})`) in WebKit. *Proposal:* a card against the Decisions landing, checked in WKWebView. This finding does not count against this card's verdict.
- **U3 (1), the chevron rotates under reduced motion.** `.ol-chev` keeps `transition: transform 100ms` outside the `no-preference` guard (Playwright with `reducedMotion: reduce`: breathe `none`, chevron `transform 0.1s`). The States row says nothing animates. Same as ro-review's finding (1).
- **U4 (2, data plus scan, not this card's code): one exit item on the organizer's own stage 6 draws as an empty box.** `working-on/roadmap.yaml:64`, `- the Roadmap reads as a plan: stages, …`, is a YAML mapping because of the ": ". The scan keeps it with no text and reports no problem, so step 1 shows `Open:` with a blank title (`webkit-1024x640-REAL-step1.png`). The item it hides is this card's own exit item. *Proposal:* quote the line (FSE), and have the scan report a non-string exit item as a problem (a Go card).
- **U5 (1), `.ol-card` dims `next` with `opacity: .55`.** The design system says dimmed is a token, never opacity.

### P1-P8

| Row | WKWebView 1024×640 (review build, fixture) | Chromium 1024×609 (wails dev, fixture) | Result |
|---|---|---|---|
| P1 | screenshot + AX: Current checked, one stage row (The joins), two open exit items, axis 17 Aug → today; Current again after All → Decisions → Roadmap (`P1-step1-full`, `P1-reopened-full`) | DOM: Current `aria-checked`, the same 4 rows | pass |
| P2 | AX row lists per step (5 / 21 / 38 / back to 3), zoom `Fit` at every step; screenshots step 2-4 | DOM rows per step (5/12/32/4); at Days: Days at every step; at Hours: Days at steps 1-2 and Hours again at 3 (0070, see A1) | pass |
| P3 | screenshot at Days via the `‹ 3 Sep` pointer (real click): hollow Tue 1 Sep, solid Thu 3 Sep, line between; waiting lines dashed to today; real click on the diamond → Decisions with 0004 focused and expanded (out of view, U2) | DOM: raised x 611, ruled 691 (centre of the Thu 3 column, 671-711), solid link 80 px in `--decision-ruled`; 5 waiting links dashed, all ending at today's x; the press lands in view | pass (U2 noted) |
| P4 | screenshots step 3/4; AX names: task, `sup11`/`sup12`, `merged`/`in flight`, `24 Sep 10:05 → 24 Sep 13:40`; at Hours the bar runs 10:05-13:40 | DOM: wave bar 528-758 at Hours = round 1's start to round 5's end | pass |
| P5 | Fit: `✕` + `5 rounds · 1 fail` (fail count in magenta); synthetic double-click on the bar → `Zoom, Hours`, segments built / fail (outlined magenta, ✕) / built / pass / take, `✕ fail · gate row 2` in magenta after the row (`P5-hours-dblclick`) | DOM: fail segment has a magenta border (`rgb(217,70,239)`); the hover title lists round, kind, card, times, result, reviewer, reason | pass |
| P6 | AX: `Outside any stage · 5 cards` last at steps 1-2; at 3 its waves (prose-only dot, sup13 in flight) under a dashed bracket | DOM: same order | pass |
| P7 | AX: web area 1024×608 = the window's content, `hscroll` finds no horizontal bar, rail expanded and strip; titles ellipsised (`foundations an…`); short words; the switch fits beside Stages in both rail states (`P7-step4-full`, `P7-step4-strip`) | DOM: `scrollWidth === clientWidth` (1024), body 1024, nothing past the viewport outside the frame; 10/10 cut titles use `text-overflow: ellipsis`; rail expanded: the switch wraps under Stages (`chromium-…-rail-expanded-wrapped`); strip: it fits | pass |
| P8 | synthetic keys after asserting frontmost and the focused element: switch → wraps to Current, ← ← back; the ring shows after Tab/Shift-Tab (keyboard focus); ↓ → ↓ ↓ ↑ ← ← from Stage 1, Rounds is a stop; Enter on a card opens its card back with focus on the title, Escape returns to the card row; Tab from a stage row reaches the 0001 diamond with its ring (`P8-*`) | press_key: → applies and `:focus-visible` holds; ↓×3 reaches a card, Enter opens the dialog (H2 focused), Escape returns, ← to the wave, ← shuts it | pass |

### States checked

No roadmap (init-define: the line, no switch, both engines by AX). No waves recorded yet (init-b, steps 3-4). A stage with no waves (The views). A wave with no round data (`rounds not recorded`, fixture and real data). A wave in flight (sup13 fixture, sup48 real: bar to now, faded). A stage with no cards (`No cards`). Outside any stage (fixture, and real: 32 cards). A done stage at step 1 (not drawn). Edge pointers (`‹ 15 Aug`, `‹ 3 Sep`, a real click scrolls). Narrow 1024×640 in both rail states. Reduced motion: CSS read, plus Playwright emulation (breathe off; U3). Not reached: "the current stage has no exit items" (no fixture stage has an empty list) and "every stage done".

Real data (the organizer, real config, temp data dir): stage 6 at step 1 with its 2 met and 2 open items (U4); step 4 shows sup47's two waves (`4 rounds · 1 fail`, `9 rounds · 3 fail`) and sup48's two (one merged, one in flight) under stage 6.

### Spec gaps (for the FSE)

- G1: "anchored on it" does not say vertical. Write that a level change keeps the anchored row where it was on screen (U1).
- G2: an exit item that is not a string has no state in the spec or the scan (U4).
- G3: the hover-or-inside rule for `fail · …` leaves room; the build puts it after the row, never hover only. Accept or amend.

### Design questions (for aglaea)

- A1: at Hours, going to step 1-2 shows Days and step 3 brings Hours back (0070 against "the step never changes the zoom"). Is that the intended reading?
- A2: on real data, Outside any stage holds dozens of prose-only dot waves dated before 2026-10-06, and at step 4 each has a `rounds not recorded` row. Should a dot with no cards sit under the stage whose span holds its date, or fold into one line?
- A3: the toolbar (Stages, Detail, zoom) scrolls away on a long outline while the axis sticks. Should the Detail switch stick with the axis?
- A4: a stage row's chevron at step 1 opens its waves, not just the diamonds (one step deeper is "All"). Is that what Project-style local disclosure should mean here?

### Not verified

- DOM reads in WKWebView: the review build has no Web Inspector, so WebKit's P7 is by AX (web area = window, no horizontal scroll bar), not by `scrollWidth`.
- `prefers-reduced-motion` at runtime in WKWebView: a system setting of Pablo's.
- The States rows "no exit items" and "every stage done": no fixture covers them.
