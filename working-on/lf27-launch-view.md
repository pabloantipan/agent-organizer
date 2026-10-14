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

