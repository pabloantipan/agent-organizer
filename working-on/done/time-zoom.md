---
title: Time zoom on every Gantt-style axis - Fit, Days, and Hours where a mark has a time
status: done
repos: [organizer]
branch: time-zoom
updated: 2026-10-03
next: "merged 2c0292f; UI review sev 2 U1-U3 and spec gaps G1-G4 to the FSE"
seat: tz-build
depends_on: [header-fold-2]
boundary: ["frontend/src/components/Roadmap.tsx, RoadmapView.tsx, StageRoadmap.tsx (axis and positions only, not the stage word or row), DecisionsView.tsx (the Timeline only)", "one new shared axis module in frontend/src/lib/ and one zoom-control component, with their CSS", "frontend/src/lib/dates.ts and frontend/src/lib/ tests", "internal/scan/git.go (branchSpan's format only) and internal/scan/scan_test.go", "testdata/ fixtures the gate rows need", "not: Calendar.tsx, Portfolio.tsx's mounting, the stores, Home, docs/design-system.md; no bound Go type change"]
spec: "docs/ux/specs/roadmap-time-zoom.md (Aglaea's design, 6569427, with the FSE's Technical notes T1-T5); ruling 0070"
gate: "docs/ux/specs/roadmap-time-zoom.md Acceptance A1-A14, plus T1 and T2 below"
ui_review: true
review: pass
---

## Goal
One zoom on Roadmap Cards, Roadmap Stages and the Decisions Timeline: Fit,
Days, and Hours only where a mark carries a time (0070).

## Gate
- [x] A1-A14: see `docs/ux/specs/roadmap-time-zoom.md`, Acceptance (measured in `.wt-notes/tz-build/gate-*.log`, shots beside them; A14 see Notes)
- [x] T1: `go test ./internal/scan/` passes with a test asserting BranchStart and BranchLast carry an RFC 3339 time
- [x] T2: `cd frontend && npm test` passes with parseISO tests for a date-only and an RFC 3339 string, hasTime for both, and the axis module's ticks, day-end and offersHours
- [x] `go test ./...` and `npm test` green; `wails build` succeeds

## Done
- 2026-10-03 sup26: merged 2c0292f (make test, npm run build green on main); seats tz-build, tz-review, tz-ui ended and revoked; run record ~/agent-slack/docs/runs/2026-10-03-time-zoom.md (~45 min against 45-90)
- 2026-10-03 tz-review: code re-review pass on b72cadd, A14 met as amended by 0073
- 2026-10-03 0073 ruled by pablo (amend A14 to the spec); A14 rewritten in the spec, back to review
- 2026-10-03 tz-build: branch time-zoom on main d1b9245, 1ae27b0 00c8e1e 93a8ba7 197487b c95ab4a ffb2576 b72cadd; one axis (`lib/axis.ts`), one control and frame (`components/TimeZoom.tsx`); make test (vitest 97), npm run build, wails build green; A1-A14 measured, progress in `.wt-notes/tz-build/progress.md`
- 2026-10-03 sup26: worktree .wt/time-zoom on 0774ab2, builder tz-build launched; reviewers tz-review (code) and tz-ui (UI)
- 2026-10-03 sup26 launched by the FSE, header-fold-2 in done/ (4afddc0), per 0071
- 2026-10-03 0071 ruled by pablo ("Ok", accept as written, 1328071); launchable, waits on header-fold-2
- 2026-10-03 cut by the FSE from Aglaea's spec and ruling 0070

## Review
- Verdict: pass (code re-review, A14 as amended by 0073). Unmet: none. Branch head still b72cadd, so A1-A13, T1, T2 and the build row stand as met in the first review.
- A14 (amended), my own run on b72cadd (wails dev on an export of it, the builder's fixture, headless Chromium 1512x945): Cards Fit -> Days; switch to Stages: Fit; Stages -> Days; back to Cards: Fit; Cards -> Days, open Decisions: Fit, -> Days -> Fit; back to Roadmap > Cards: Fit. The builder's `gate-a2-a14-1512.log` agrees on the Decisions leg. In the code each graph's level is `useTimeZoom` state in its own component (`Roadmap`, `StageRoadmap`, `DecisionsView`), and `RoadmapView` mounts Cards or Stages, never both, so one zoom cannot move another level.
- First review (3b533f5), kept:
- Verdict: fail (code review). Unmet: A14. A1-A13, T1, T2 and the build row are met.
- A14: measured Roadmap Days -> Decisions -> Roadmap at Fit; the check says "still at Days". The gate is wrong, not the build: sub-views are exclusive (`App.tsx`, outside the boundary), and T5 plus the States row reset the level on remount. Keeping Days needs remembered state (T5 forbids it) or a mounted hidden Roadmap (out of boundary). Pablo amends A14, for example to "zooming Decisions never changes another graph's level; each resets on remount", then this passes as built.
- Checks re-run on b72cadd: `XDG_DATA_HOME=$(mktemp -d) make test` (go test ./..., vitest 97), `npm run build`, `wails build`, all green.
- Outside the gate: `scripts/fixture-home.sh` is outside the boundary (it allows `testdata/` fixtures); the change is additive and A3, A6 and A12 need it. Pinch was measured as Chromium ctrl+wheel only; the WebKit gesture path is read, not run, so the UI review should pinch a real trackpad. A2 shows `September 2026`, not `October 2026`, because of the fixture. The Hours note's copy differs from the spec; the change is sound but Aglaea should accept it. At Fit, Today is shown but does nothing. At Hours, the sticky day label covers the first `:00` label (shot `1512x945-cards-hours-midnight.png`).
- Reviewer: tz-review, 2026-10-03 (first review and re-review).

## UI review
- Verdict: pass (UI review). Sev 4/3: none. Run on b72cadd (detached worktree, fixture home, `wails dev -devserver localhost:34385`, headless Chromium at 1512x945 and 1024x640). Shots, drivers and logs in `.wt-notes/tz-ui/` (`a1.log`, `a2a9.log`, `a9.log`, `a10.log`, `a11.log`, `misc.log`).
- Measured: A1 on all three graphs with each input (+ button, ctrl+wheel burst as pinch, ⌘+wheel, `+`, `=`, double-click on the axis), one level per action; a 1 s continuous pinch moves one level; out by pinch, `-` and the button. A2: Days ticks `Sat 12`, `Oct 1`, weekends tinted, sticky `July/August/September 2026` as scrolled. A3: Hours across 2/3 Oct, `Sat 3 Oct` at the midnight tick, sticky `Fri 2 Oct`, quarter lines, no quarter labels. A4: pinch on Alpha's end, end moves 2.9 px. A5: due 12 Sep ends on the Sun 13 tick (829 = 829). A6: band, "all day: no time recorded", note once. A7: `‹ 1 Sep` scrolls the dot in, Days kept. A8: Today at 0.330 (Days), 0.331 (Hours); Fit restores scroll 0 and width as built. A9: plain wheel scrolls the page (Fit and Days), shift+wheel pans. A10: page scrollWidth 1024 at every level on all three; the control stays on the switch line. A11: Tab reaches −/+, Today, Fit inside group "Zoom, <level>"; the frame takes focus with a visible ring and keys work there, not on the buttons. A12: Stages, Decisions and init-b Cards stop at Days; init-a Cards offers Hours. A13: the undated label and slots keep 107 and 121 px at Fit and at Days. A14 as amended by 0073: Cards Days, then Decisions opens at Fit, Days, Fit, then Roadmap reopens at Fit.
- U1 (sev 2) Keyboard focus drops to the page when a zoom button switches itself off. Where: the control on every graph. Evidence: Enter on Zoom in at Days goes to Hours, the button disables, `document.activeElement` is BODY (`a11.log`). The same happens with − reaching Fit and with Fit, which unmounts. A screen-reader user loses their place. Design system, Focus and names. Proposal: when the pressed button disables or goes away, move focus to the other zoom button, or keep Fit rendered but disabled.
- U2 (sev 2) At Hours the whole-day band of a day-only card is barely visible, and the band is wider than the view. Where: Cards at Hours, w-nogate, w-queued and w-review (`1512x945-cards-hours-dayband.png`). Evidence: `--status-next-bg` (14 % alpha) at opacity .5 gives about 7 % fill, roughly 1.2:1 against the lane (WCAG 1.4.11 asks 3:1). The status hues look alike. The band is 1,536 px and the view is at most 980, so with the dot off view the row reads as empty and shows no pointer. Proposal: drop the extra opacity or give the band a 1 px border in the status colour, and pin the dot at the visible left edge while the band crosses it.
- U3 (sev 2) Pressing an edge pointer hides a timed bar's start under the label column. Where: Cards at Hours, Beta (`1512x945-cards-hours-beta.png`). Evidence: after `‹ 2 Oct` the bar's left edge is at frame x 193 and the lane starts at 240, so 09:12 is out of sight. `revealScroll` puts the end at 2/3 whatever the width. Proposal: when the mark fits in the view, scroll so all of it shows with a margin.
- U4 (sev 1) Today at Fit is enabled but does nothing (`a2a9.log`, last line). Proposal: disable it at Fit, or let it go to Days anchored on today.
- U5 (sev 1) The sticky context label is a pixel early at a boundary: `Thu 24 Sep` shows over a `Fri 25 Sep` midnight tick at the lane's left edge (`1512x945-cards-hours-dayband-leftend.png`). Partial tick labels (`t 12`, `Oct`) also show clipped next to the label column. Proposal: read the context label a few px into the lane, and hide a tick label that does not fit.
- U6 (sev 1) Edge pointers are 18 px tall, below the 24 px target; they pass by 2.5.8's spacing exception. At Stages Days the weekend tint breaks the current row's highlight into stripes (`1512x945-stages-days-diamonds.png`).
- Spec gaps (for the FSE): G1, the window rule ("Fit span plus one day") conflicts with A8: Today at one third needs two thirds of the view after today, so the build extends the window (Cards Days runs to 19 Oct with data ending 4 Oct). Say which rule wins. G2, the Hours note's words: the spec's "Dates have no time of day; each fills its day." is false once git ends carry times; the build says "Dates without a time of day fill their whole day.". Aglaea to accept or reword. G3, the spec does not say what Today does at Fit (U4), or whether a timed bar's minutes show anywhere but the hover title. G4, the fixture cannot show A2's `October 2026` sticky label because its data ends 5 Oct; a later dated card would make it reachable.
- Not verified: the WebKit pinch path (gesture events; headless Chromium only, no real trackpad) and the app inside WKWebView (`wails dev` served to Chrome); the `now HH:MM` label ticking over a minute; prefers-reduced-motion (the build does not animate, so nothing to reduce); Hours on Stages and Decisions (not offered by design).
- Reviewer: tz-ui, 2026-10-03.

## Next

## Blockers

## Notes
- A14 against T5: the sub-views are exclusive (`App.tsx`), so leaving Roadmap unmounts it and the States row "left and reopened → back to Fit" applies; measured Roadmap Days → Decisions Days → Fit → Roadmap at Fit. Levels are independent per graph; the literal "still at Days" needs a remembered level, which T5 forbids.
- `scripts/fixture-home.sh` got one additive block: `feat/beta` with two commits timed 2 Oct 09:12 and 17:48 (-03:00), so the fixture's Cards offer Hours (b72cadd).
- A2's `October 2026` cannot be the sticky label on the fixture (its data ends 5 Oct); the shot shows `September 2026` mid-September.
- The Hours note reads "Dates without a time of day fill their whole day.": the spec's "Dates have no time of day" is false once git ends carry times.
- WebKit pinch (gesture events) is wired with the same one-level lock but only ctrl+wheel was testable headless.
Sequenced after header-fold-2: its boundary holds Roadmap.tsx, RoadmapView.tsx and DecisionsView.tsx.
