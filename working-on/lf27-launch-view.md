---
title: "Bring crew up and New agent show each seat starting"
status: now
repos: [organizer]
branch: lf27-launch-view
seat: lv-build
stage: one-window
updated: 2026-10-14
next: "review: lf27-launch-view, gate met (V1, V2, V3, V4, X0), a4021cc"
depends_on: [lf27-launch-state]
boundary: ["docs/specs/leftovers-27.md Boundary, lf27-launch-view"]
spec: "docs/specs/leftovers-27.md (FR-6 to FR-8; launch-progress L1-L7)"
gate: "docs/specs/leftovers-27.md Acceptance, rows V1, V2, V3, V4 and X0"
ui_review: true
review: pass
---

## Goal
Bring crew up and New agent show each seat starting (launch-progress 91cf067; tab-reaches-links A3; sup62 and sup63 closes).

## Gate
docs/specs/leftovers-27.md, rows V1, V2, V3, V4 and X0.
- [x] V1: /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v1.jsonl, /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v1-ax-mid.txt, /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v1-ax-failed.txt, /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v1-failed.png, /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v1-harness.png
- [x] V2: /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v2.jsonl
- [x] V3: /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v3-ok.jsonl, /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v3-fail.jsonl
- [x] V4: /Users/pabloantipan/organizer/.wt-notes/lv-build/out/v4.jsonl
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/lv-build/out/x0.txt

## Done
- 2026-10-14 lv-build: crew block becomes the seat list in place, New agent's button becomes the seat's state, an unseen failure is one Needs me row; harness rows V1-V4 by key on wails dev with the stub, AX and screenshot on the review app, X0 from a clean clone (5e31130, 163bf42, eb90232, a4021cc). Reproduce: /Users/pabloantipan/organizer/.wt-notes/lv-build/progress.md.

## Notes
- No dismiss in the service for a failed start: the view adds "Close the list" (view-only), else the crew rows never came back after a failure.
- V3's new row needs a process: the run used /Users/pabloantipan/organizer/.wt-notes/lv-build/stub-standin.sh, which runs scripts/probe-stub.sh unchanged and starts a fixture stand-in agent for a seat that started.
- The Needs me row is undated, so in the fixture it sits behind "Show the other N"; first-five placement would need an order rule.
- Copy the command writes the Mac's real clipboard (Wails runtime), also from wails dev; pressed once for V1.

## Review
Verdict: pass. Reviewer lv-review, 2026-10-14, commit 606c364 (branch lf27-launch-view; the card's a4021cc rebased on main, range-diff identical). Fresh clone at 606c364, removed after; own wails dev on 34144 with the fixture, auth off, `ORGANIZER_PROBE_BIN` = stub-standin (runs scripts/probe-stub.sh unchanged, `PROBE_STUB_FAIL=bruno,lynx`); every press a harness `key return`. Evidence in /Users/pabloantipan/organizer/.wt-notes/lv-review/out/.
- V1 met: v1.jsonl, Return on Reattach all then Start: fse, po_ana, dev_bruno each with a word, seconds grow (`starting · 1 s` to `4 s`, `trying again · 0 s` to `2 s`), `✕ dev_bruno didn't start · the pane did not run claude (probe exit 3, twice)` with `Try again` and `Copy the command`, stub output only in the hover. Review build by AXPress on my pid: v1-ax-mid.txt, v1-ax-failed.txt (AXHeading, words, no shapes or seconds), v1-failed.png (`screencapture -l` of its window). Copy not pressed: present in AX and DOM, handler `ClipboardSetText(seat.launch_line)`, title the same line.
- V2 met: v2.jsonl, live log `[7,"fse running"]`, `[12,"po_ana running. 2 of 3 running, 1 off"]`, nothing per second; focus on the H3 after the press; Stop starting by key while po_ana starts: `dev_bruno off`, po_ana finishes. x-retry.jsonl: a retried seat's new failure is said once more.
- V3 met: v3-ok.jsonl `Starting · 0..3 s` (name `Starting wren, n seconds`, focus kept), then focus on the row `organizer-fixture-probe-wren`, live `wren running`; v3-fail.jsonl `Trying again · n s`, then the danger line and focus on `Try again, lynx`.
- V4 met: v4.jsonl, Home mid-start no row; Agents mid-start the list, no Bring up button; after the failure Home has `Crew of init-a: 1 seat didn't start` with Agents (behind Show the other N, which FR-7 and L6 do not place); Agents by key lands on the heading; Home after, row gone.
- X0 met: `test-lease run --share -- make test` reused run e8a3c0fd-97913 of 606c364e9f04 (lv-ui), exit 0, Go ok, vitest 650 passed; `pnpm run build`, `wails build` exit 0; `git status --porcelain` empty.
Unmet rows: none. Close the list is an act the lead takes (L: the list stays until the lead acts), not counter to FR-6.


## UI review
Verdict: pass. Reviewer lv-ui, 2026-10-14, every row checked on commit 606c364 (branch lf27-launch-view). No severity 4 or 3. Shots, AX and harness logs in /Users/pabloantipan/organizer/.wt-notes/lv-ui/ (`wk-*` review app via `screencapture -o -l`, `harness-*` WKWebView takeSnapshot).
- How checked: review build (`make review-build`, my pid, fixture, auth off, `ORGANIZER_PROBE_BIN` = stub-standin over scripts/probe-stub.sh unchanged, `PROBE_STUB_FAIL=bruno,lynx`) by AXPress and AX reads each second (out/v1-ax-series.txt) for V1 and V4; my own `wails dev` on 34145 with the same stub, Tab harness by `key return` for V1, V2, V3 ok and fail (out/v1.jsonl, v2.jsonl, v3-ok.jsonl, v3-fail.jsonl). Copy the command not pressed (Pablo's clipboard): present in AX and DOM, handler `ClipboardSetText(seat.launch_line)`, vitest Launch.test.tsx.
- V1 (L1, L5): every seat with a word and shape, seconds grow, aria-hidden; `✕ dev_bruno didn't start · the pane did not run claude (probe exit 3, twice)`, `Try again, dev_bruno`, `Copy the command, dev_bruno`; the stub's output only in the hover. Danger 5.2:1, live 10.5:1, warning 9.2:1, muted 7.9:1 on the panel. Nothing animates (`getAnimations` shows only button hover transitions).
- V2 (L2-L4): live `fse running`, then `po_ana running. 2 of 3 running, 1 off`, nothing per second; focus on the H3 with a visible ring; Stop starting by key: `dev_bruno off`, po_ana finishes, focus heading → Reattach all when the list closes.
- V3 (L3): `Starting · n s` (name `Starting wren, n seconds`, aria-disabled, focus kept) → focus on row `organizer-fixture-probe-wren`, live `wren running`; failure: `Trying again · n s` → danger line, focus on `Try again, lynx`, live `lynx didn't start`.
- V4 (L6, L7): Home mid-start has no row; back on Agents mid-start the list, not the button; after the failure Needs me 15 and the row `Crew of init-a: 1 seat didn't start`, verb `Agents init-a`, lands on the list heading; Home after: 14, row gone.
- X0: shared run fresh, mine: `test-lease run --share -- make test` run e8a3c0fd-97913 of 606c364, exit 0 (vitest 650 passed; the code reviewer reused it); `make review-build` and `wails build` exit 0; `git status --porcelain` empty.

Findings
- U1 (2) A screen-reader user who presses Try again and fails again hears nothing. Where: Crew list and New agent's danger line; out/v1.jsonl (live `[20,"dev_bruno didn't start. 2 of 3 running, 1 didn't start"]`, retry at t 35, failed again at t 43, no new entry). Evidence: `useAnnouncer`/`setSaid` set the same string, so the region's DOM doesn't change (lv-review's x-retry was a fresh mount with an empty region, so it did say it). L2 says each result once; the second failure is a new result. Proposal: empty the region and set the text on the next tick, or add the try count (`dev_bruno didn't start again`).
- U2 (2) A lead who walked away sees the failure only as the badge's +1: the row is undated, sorts after the dated rows and sits behind "Show the other 10" (wk-1440x900-V4-home-folded.png). FR-7 and L6 don't place it, so it meets them as written. Proposal: date the row by its failure time, or put an unseen failure in the first five (spec gap, below).
- U3 (2, for aglaea) A settled list still says `Starting crew · 2 of 3 running` with nothing starting (wk-1440x900-V1-failed.png). The spec gives only that line. Proposal: once done, `Crew start · 2 of 3 running, 1 didn't start`.
- U4 (2, for aglaea, service side) `Bring 1 up` (one seat off) lists all three seats as `waiting`/`starting`, and the heading counts `0 of 3 running` while two already ran (out/v1-ax-series.txt t=1). The confirm says "starts the off seats". With real probe a live seat should come back quickly as running, but the count still starts at 0. Proposal: list only the seats being started, or start running seats as `running`.
- U5 (1) After New agent succeeds, focus moves to the new row and scrolls it into view; a later agents tick that grows the list leaves the focused row off screen (v3-ok.jsonl end: onScreen false). In the fixture the list held 9 stand-ins from repeated runs.

Spec gaps (for the FSE): where an unseen-failure row sorts in Needs me (U2); the settled list's heading (U3); Close the list, a view-only act the spec doesn't name, which I judge as "the list stays until the lead acts" and not against FR-6 or L7 (the service has no dismiss, and a restart drops launches anyway); which seats a Bring crew up list shows when some already run (U4).
For aglaea: U3, U4.
Not verified in WKWebView: the 1024×640 minimum window (shots only at 1440×900); the retrying state as a WK screenshot (harness text and AX only); VoiceOver speech (DOM of the live region only); Copy the command pressed (clipboard is Pablo's); auth firebase not applicable.
