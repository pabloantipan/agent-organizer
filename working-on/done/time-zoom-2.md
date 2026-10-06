---
title: Time zoom, second pass - focus kept at the ends, Today only where it moves, readable day bands, whole marks after a pointer
stage: one-window
status: done
repos: [organizer]
branch: time-zoom-2
updated: 2026-10-03
next: "none: merged 599eca9"
depends_on: []
boundary: ["frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts and axis.test.ts, frontend/src/styles/time-zoom.css", "frontend/src/components/Roadmap.tsx (A19's minutes label only), StageRoadmap.tsx (A22's row highlight only)", "scripts/fixture-home.sh (A23's card only)", "not: DecisionsView.tsx, RoadmapView.tsx, Home, the stores, Go, docs/design-system.md"]
spec: "docs/ux/specs/roadmap-time-zoom.md, Amendment 1 (Aglaea, 726cbe8) and its Technical notes"
gate: "docs/ux/specs/roadmap-time-zoom.md Acceptance A15-A23, plus the build row below"
ui_review: true
review: pass
seat: tz2-build
---

## Goal
time-zoom's UI leftovers, ranked by Aglaea: Amendment 1 of
`docs/ux/specs/roadmap-time-zoom.md`.

## Gate
- [x] A15-A23: see `docs/ux/specs/roadmap-time-zoom.md`, Acceptance
- [x] `go test ./...` and `cd frontend && npm test` green (axis tests for A15's focus target and A20's cut-label rule where pure); `wails build` succeeds

## Done
- 2026-10-03 sup27 ended: seats killed and tokens revoked, worktree and branch removed; run record runs/2026-10-03-decisions-view-and-time-zoom-2.md (~45 min against 0074's 40-75, ~$32)
- 2026-10-03 merged to main 599eca9 by sup27 after the code review (pass) and the UI review (pass, 17def3a); make test, npm run build and wails build green on main with decisions-view
- 2026-10-03 tz2-build built Amendment 1 on `time-zoom-2` (d0ebc90, 7d25c11, 17def3a, rebased on main); A15-A23 measured in .wt-notes/tz2-build/measurements.md; go test, make test, npm run build, wails build green
- 2026-10-03 sup27 launched by the FSE (0074 ruled, accept as written)
- 2026-10-03 cut by the FSE from Aglaea's Amendment 1 (726cbe8)

## Next

## Blockers

## Review
- Verdict: pass (code review; the UI review is separate).
- Unmet gate items: none. A15-A23 checked against the diff, the vitest cases (focusAfter, revealScroll, contextAt, tickLabelWhole, timesLabel) and the builder's measurements and shots in `.wt-notes/tz2-build/`. Build row re-run in the worktree: `make test` (go + vitest 107) green, `npm run build` green, `wails build` green.
- Findings outside the gate:
  - Boundary: A23's card went into `testdata/fixture-overlay/init-a/working-on/w-later.md` and the overlay README, not `scripts/fixture-home.sh`, which is the only fixture path the boundary names. It is the right place (the script copies the overlay), but it is outside the boundary as written. `Roadmap.tsx` also swaps the Hours band markup for `DayBand` (A17), beyond "A19's minutes label only". The card's Notes declare both.
  - `--status-done` against the lane is 2.42:1, under A17's 3:1. No done band is drawn today (Hours exists only on Cards, which shows open cards only), but a done or superseded band at Hours would fail A17.
  - A20's cut-label rule estimates text width from character count (`tickLabelExtent`, 6-7.4 px per character), not from the rendered width. It holds for today's fonts (the sweeps found 0 cut labels), but it will drift if the font or size changes.
  - All measurements are from headless Chromium; WKWebView is left to the UI reviewer (0074).
  - `wails build` rewrites `frontend/wailsjs/runtime/*` in the worktree. I reverted it; nothing was committed.
- Reviewer: tz2-review, 2026-10-03

## UI review
- Run: `time-zoom-2` 17def3a, detached worktree, fixture home. Chromium is headless shell 1234 against `wails dev` :34441. WKWebView is the `wails build` app, captured with `screencapture -l`. The window was resized by dragging its edges, because System Events was refused. It was 1512×978 and 1024×673, which is 1512×945 and 1024×640 of content under a 33 px title bar. Shots and logs are in `.wt-notes/tz2-ui/`, drivers in `drive/` and `wk/`.
- Verdict: **pass**. No finding is severity 4 or 3 against the spec. A15-A23 hold in both engines, with the gaps listed below.
- Findings:
  - **U1 (2) WKWebView: no focus ring after focus moves (§A1.1, DS Focus).** What the lead cannot do: see where focus went. On the real app, he presses Enter on `+` at Days. Hours opens and focus lands on `−`, but no ring is drawn, so it looks as if focus was dropped. Where: `webkit-1512x945-A15-cards-kbd-plus-at-days` (ring on `+`), `-kbd-enter-to-hours` (no ring anywhere), `-kbd-enter-on-minus` (the next Enter acts on `−`, ring back). The same happens on Decisions (`-A15-decisions-return-twice`). Evidence: Chromium draws it (`chromium-*-A15-cards-hours-moved-focus-ring`, `:focus-visible` true). WebKit seems to drop focus-visible because the pressed button blurs when it disables. Proposal: move focus before the pressed button disables, or keep it focusable with `aria-disabled`, then check the ring in WKWebView.
  - **U2 (2, app-wide, not this card) WKWebView: Tab does not reach buttons.** With macOS keyboard navigation off (the default; `AppleKeyboardUIMode` is unset on this machine), Tab and Option-Tab never reach `−`/`+`/Today/Fit. The only keyboard path is a click into the chart, then keys. Where: `wk/crop_tab5..8`. A11's "tab to the control" was only ever measured in Chromium.
  - **U3 (1)** At Days and Hours, the today band and grid show through the gaps between the sticky label cells, so each label gets a purple outline. Where: `chromium-1024x640-A20-cards-hours-midnight-2px`, `webkit-1512x945-A21-cards-hours-pointers`. Proposal: one continuous background behind the label column.
  - **U4 (1)** When zoomed, the frame's inset focus ring sits under the sticky labels and axis. Only slivers show between the rows on the left (`webkit-1512x945-A23-cards-days-end`). Proposal: put the ring outside the frame.
  - **U5 (1)** §A1.6 hides cut tick labels, but other axis text is still cut: a milestone title shows as "…nonical" under the label column, `today` is cut to "t" at the right edge (`webkit-1024x640-U5-cards-days-cut-labels`), and "no dates · order only" is clipped by the frame or its scrollbar (`webkit-1024x640-A22-stages-days-weekend`).
  - **U6 (1)** WKWebView draws classic scrollbars inside the frame: a vertical one at 1024 (rows are taller than the frame's max-height) and the horizontal one. They overlay the lane's last ~12 px. Chromium's headless shots don't show this.
  - **U7 (1, as built before this card)** Decisions at Fit, 1024 with the rail open: the weekly labels run together ("31 Aug 7 Sep", `webkit-1024x640-A16-decisions-fit`).
- Gate rows (Chromium shot | WKWebView shot; prefix `chromium-`/`webkit-` and the size; 1512 = 1512x945, 1024 = 1024x640):

  | Row | Result | Chromium | WKWebView |
  |---|---|---|---|
  | A15 | pass; WKWebView ring: U1 | 1512/1024 `A15-cards-fit-after-fitkey`. Log: + to − at Hours, − and Fit to +, never BODY; control 211.5 px at every level, on all three graphs | 1512/1024 `A15-cards-*`, `A15-decisions-return-after-days`. Reached by click; Return then proved the focus target. The buttons sit in the same place at every level |
  | A16 | pass | `A16-{cards,stages,decisions}-{fit,days}`, `A16-cards-hours` (both sizes) | `A16-*-fit`, `-days`, `A15-cards-hours-after-plus` (both sizes) |
  | A17 | pass | `A17-cards-hours-midband`: border #a9a0ff on #201b2b is 7.31:1 (now 5.14, blocked 5.18); dot +4.0 px | `A17-cards-hours-midband` (both): dot at +4 px; pixels 6.56:1 |
  | A18 | pass; 1024 with the rail open: G1 | `A18-A19-cards-hours-beta`: left +24.8 px, right in view (both sizes, rail collapsed) | 1512 `A18-A19-cards-hours-beta`: +25 px, right in view. 1024 (rail open): the start is hidden by §A1.3 (G1) |
  | A19 | pass | `09:12–17:48` 6 px after the bar, in view | same, both sizes |
  | A20 | pass | `A20-cards-hours-midnight-2px`: at +1/+2/+3 px the context reads "Sun 4 Oct"; 0 cut labels in 84 positions over 48 h (both sizes) | 1512 `A20-…-2px`: "Sat 3 Oct", none cut. 1024 `A20-…-4px`: 4 px only |
  | A21 | pass | `A21-cards-hours-pointers`: every pointer 24.0 px (Cards, Stages, Decisions) | `A21-cards-hours-pointers`: 24 px measured on Cards |
  | A22 | pass | `A22-stages-days-weekend`: one colour across the row (956 px) | `A22-stages-days-weekend`: one colour, both sizes |
  | A23 | pass | `A23-cards-days-end`: "November 2026" | `A23-cards-days-end`: "November 2026", both sizes |

- A1-A14 still hold (Chromium logs `chromium-*-regress.log`, `-cards.log`, `-stages*.log`, `-a20.log`):
  - A1: `+`, ctrl+wheel, ⌘+wheel and the keys each move one level.
  - A4: the anchored end moved 10 px (8 px at 1024).
  - A5: the bar ends on the 12/13 Sep boundary.
  - A6: the note shows once; the band title says "all day: no time recorded".
  - A7: the pointer reveals the mark and stays at Days.
  - A8: today sits at 0.32-0.33 of the lane at Days and Hours.
  - A9: a plain wheel neither zooms nor pans; shift+wheel pans 200 px.
  - A10: scrollWidth equals the window width at every level, at both sizes.
  - A12: `+` is disabled at Days on Stages and Decisions.
  - A13: the undated slots come after the window.
  - A2 and A3 show their labels.
  - A14 in WKWebView: Stages arrived at Fit after Cards at Days; Decisions arrived at Fit.
- Spec gaps (for the FSE):
  - **G1** A18 assumes the lane fits Beta's 550 px bar plus 48 px. At 1024 with the rail open, the lane is 492 px. §A1.3 then ends the bar at two thirds and its start is hidden, in both engines (`chromium-1024x640-A18-cards-hours-beta-railopen`). The build follows §A1.3. The row should name its width and rail state.
  - **G2** A11 and A15 say "tab to the control". In WKWebView with default macOS settings, Tab never reaches it (U2). The spec should either name the WKWebView keyboard path, or the app should check whether it can enable tab-to-buttons in WKWebView.
  - **G3** §A1.6 should cover axis mark titles, the today label and the undated label (U5).
  - **G4** The rail is remembered per machine. Fresh Chromium storage starts collapsed at 1024, while the app here had it open. Every 1024 gate row should name the rail state.
- Not verified:
  - In WKWebView, A15 by Tab: the buttons were reached by click (U2).
  - In WKWebView, A20 at 1024 at 1–3 px: synthetic pixel scrolls jumped, so only 4 px was reached.
  - In WKWebView, pointer heights on Stages and Decisions: the background matches the lane, so they could not be measured from pixels. They use the same CSS as Cards.
  - In WKWebView, pinch (gesture events). In Chromium, only ctrl+wheel stood in for it.
  - In Chromium, A14: the driver errored before it.
  - In both engines, a done or superseded band at Hours: the fixture has no such case.
  - In both engines, a vertical page scroll under a plain wheel: nothing overflowed.

## Notes
Parallel with decisions-view: disjoint files (decisions-view does not touch the zoom control or the axis).
- A17's pinned dot needed the band markup: it moved to `DayBand` in TimeZoom.tsx and Roadmap.tsx calls it (one line beyond A19's label). A22 is CSS only; StageRoadmap.tsx is untouched. A23's card is in the overlay (`w-later.md`), so the script is unchanged.
- `--status-done` on the lane is 2.42:1, under A17's 3:1; no done band is drawn today (open cards only).
- The fixture stand-ins ignore SIGTERM; `kill $FIXTURE_AGENT_PIDS` does not end them, `kill -9` does.
