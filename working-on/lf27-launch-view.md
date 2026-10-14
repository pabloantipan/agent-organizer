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

