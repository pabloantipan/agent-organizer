---
title: A review build with its own bundle id, so reviewers stop writing into the lead's app
status: next
repos: [organizer]
branch: review-build
updated: 2026-10-04
next: "review: review-build, N7 and N0 met"
depends_on: []
boundary: ["Makefile", "a script under scripts/ if needed", "CLAUDE.md (the Packaging line only)", "not: wails.json, build/darwin/ templates, frontend, Go"]
spec: "docs/specs/leftovers-6.md (FR-8)"
gate: "docs/specs/leftovers-6.md Acceptance, rows N7 and N0"
ui_review: false
review: pass
seat: revb-build
---

## Goal
`make review-build` gives reviewers `Deltagos Review.app` under
`cl.antipan.organizer.review`, so its WebKit storage is not the lead's
(leftovers-6 S4, third sighting).

## Gate
- [x] N7: see `docs/specs/leftovers-6.md`, Acceptance
- [x] N0: see `docs/specs/leftovers-6.md`, Acceptance

## Review
- Verdict: pass. Diff main...review-build (Makefile, scripts/review-build.sh, CLAUDE.md Packaging line) is inside the boundary. N7: `make review-build` built `Deltagos Review.app`, bundle id cl.antipan.organizer.review, signed adhoc; launched from a fresh shell over the fixture, rail toggled twice (true→false→true), quit by pid. `~/Library/WebKit/cl.antipan.organizer` mtime unchanged; while it ran, its WebKit networking process had only the `.review` dir open. Two WAL files in the lead's dir newer than the marker came from Pablo's Deltagos (32614) and rbs-build's build (51307), not from the review app. N0: `XDG_DATA_HOME=$(mktemp -d) make test` (Go + 161 vitest), `npm run build`, wails build (inside make review-build) all pass.
- Unmet: none.
- Gate gap for the FSE: N7's "mtime of the dir unchanged" passes even when WebKit writes inside the dir (it writes WAL files deep inside without touching the top-level mtime). Use `find -newer` plus an lsof check on who wrote the files.
- Reviewer: revb-review, 2026-10-04

## Done
- 2026-10-04 revb-build: `make review-build` (f733251) and the Packaging sentence (3ef0105) on branch review-build, rebased on main; N7 over the fixture (bundle id cl.antipan.organizer.review, adhoc, its own WebKit dir, the lead's dir mtime unchanged) and N0 green; evidence in .wt-notes/revb-build/
- 2026-10-04 0077 ruled by pablo ("go"); sup31 launched by the FSE
- 2026-10-03 cut from leftovers-6 by the FSE

## Next

## Blockers

## Notes
- build/bin keeps both bundles after `make review-build`; `make build`'s `-clean` removes Deltagos Review.app again.
- While builders test their own `Deltagos.app` it writes into the lead's WebKit dir (seen: rbs-build's 51307); the supervise skill's switch to `make review-build` stops that.
