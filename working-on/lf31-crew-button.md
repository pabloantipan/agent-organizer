---
title: "No button that does nothing; the landed row keeps its ring; focus after a list closes"
status: now
repos: [organizer]
branch: lf31-crew-button
seat: cb-build
stage: one-window
updated: 2026-10-14
next: "review: lf31-crew-button, gate met (B1, B2, B3, B4, X0), e3c470c"
depends_on: []
boundary: ["docs/specs/leftovers-31.md Boundary, lf31-crew-button"]
spec: "docs/specs/leftovers-31.md (FR-1 to FR-4; launch-progress L15-L18)"
gate: "docs/specs/leftovers-31.md Acceptance, rows B1, B2, B3, B4 and X0"
ui_review: true
---

## Goal
No launch button with every seat running; Start says why nothing started; the landed row keeps its ring; focus after a self-closing list goes to the first seat's Attach (launch-progress Amendments 3 and 4).

## Gate
docs/specs/leftovers-31.md, rows B1, B2, B3, B4 and X0.

- [x] B1: margin 8px; ring gap to `.board-wrap` 205/206, 313/98, 407/4 px after landing and two feed updates (Tab harness 1024x640) — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b1.jsonl
- [x] B2: no launch button with all live, meta `3 live · 0 off`; `Bring 1 up`, `Bring crew up`; grep no match — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b-vitest.txt, /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b2-grep.txt
- [x] B3: confirm gone, live region `Every seat is already running`, no `.launch-head`, focus first `Attach` — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b-vitest.txt; live race /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b3-live.jsonl
- [x] B4: `Seat up` closes, focus `Attach fse`; with focus moved to Settings, stays there; Close the list after a failure keeps `Bring 1 up` — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b4a.jsonl, /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b4b.jsonl, /Users/pabloantipan/organizer/.wt-notes/cb-build/out/b-vitest.txt
- [x] X0: make test (692 vitest + Go), pnpm run build, wails build, porcelain empty, clean clone at e3c470c — /Users/pabloantipan/organizer/.wt-notes/cb-build/out/x0-*.txt

## Done
- 6fe44d1 FR-1 (`landed-held` class while held, scroll-margin in launch.css); e3c470c FR-2 to FR-4 (no launch button with 0 off, `startCrew` reads the race from CreateCrew's empty return, `afterList` focus). Gate met; progress /Users/pabloantipan/organizer/.wt-notes/cb-build/progress.md.

## Notes
- B1's feed updates are the page's own `applyAgents` with fake data (filler seats prepended to init-a's crew), lvw-build's method; steps in /Users/pabloantipan/organizer/.wt-notes/cb-build/steps/b1.txt.
- Vitest has no DOM here: B2-B4's vitest read markup and focus fakes; the harness rows show the real focus. In a stale-feed race focus goes to the first row that has an Attach.

## UI review
cb-ui, 2026-10-14, at e3c470c (branch did not move). **Verdict: pass.** No severity 4 or 3.

How checked: Tab harness (offscreen WKWebView, 1024x640, `--links on`) against my own `wails dev -devserver localhost:34189` from a clean detached clone, fixture, auth off, `ORGANIZER_PROBE_BIN` the probe stub; outputs and steps in `.wt-notes/cb-ui/out/` and `steps/`.
- B1 (L15): reran `b1.jsonl`: `landed-held`, scroll-margin 8px/8px, ring gaps 205/206, 313/98, 407/4 px after landing and two `applyAgents` updates. Meets the row (≥ 2 px). The feed updates are fake data through the page's own store, which is what the row asks.
- B2 (L17): live in `b3-current.jsonl`/`b4a.jsonl`: all live, no launch button, meta `3 seats · 3 live · 0 off`, `2 retirable` stays; `Bring 1 up` with one off; grep `Reattach` in frontend/src: no match. Shot `wkwebview-1024x640-B3-after-start.png`.
- B3 (L18): the builder's vitest is markup plus a focus fake, so I ran the row as written live (`b3-current.jsonl`): confirm open with fse off, feed turns current (fse live, launch button gone, confirm stays), Start: confirm gone, live region `Every seat is already running`, no `.launch-head`, focus `Attach fse` (first row). Builder's stale-feed variant also reproduced (`b3-live.jsonl`, focus `Attach po_ana`). Go side read: `StartCrew` returns before writing any launch with no seat to start, so no list can follow.
- B4 (L16 amended): live: self-close with focus on the heading → `Attach fse` (`b4a.jsonl`); focus moved to Settings → stays on Settings (`b4b.jsonl`); Close the list after a real stub failure (`PROBE_STUB_FAIL=fse`) → `Bring 1 up` (`b4c.jsonl`, shots `wkwebview-1024x640-B4-failure-list.png`, `-closed-after-failure.png`), in place of the vitest fake.
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exit 0, 692 vitest + Go; **fresh** run 65b48219-54927 (cb-review reused it). `make review-build` (wails build) passed after `wails dev`.

Findings (none blocks):
- U1 (sev 2) In the stale-feed race the lead hears `Every seat is already running` while the block still shows `1 off` and `Bring 1 up` until the next 10 s tick. Where: crew block after Start, `b3-live.jsonl` "after Start". Evidence: live run, meta `2 live · 1 off`, launch button present for ~10 s. Proposal: leave as is (no new service call is a no-go); or have the press's result hide the button until the next tick.
- U2 (sev 1) The live region keeps `Every seat is already running`; a second identical race announces nothing new (builder's note). Proposal: clear before saying.
- U3 (sev 1) After the confirm turns stale (feed current, 0 off) it still reads `starts the off seats …` beside meta `0 off`. Short window; Start then explains.

Spec gaps (for the FSE): the stale-feed direction of the race (view shows a seat off that runs) is not specified: what the meta and button show between the press and the next tick (U1). FR-4 does not say where focus goes if the first listed seat's row has no Attach when the list closes (code falls through to nothing).

For aglaea: U1, whether the answer should also correct the stale button at once.

Not verified in WKWebView: AX tree and window shots of the review build (no row needs them; harness snapshots used instead); the landing on an Agents role/memory row (same `holdInView`, only the crew landing measured); widths other than 1024x640.
