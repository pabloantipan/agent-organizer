---
title: A review build with its own bundle id, so reviewers stop writing into the lead's app
status: next
repos: [organizer]
branch: review-build
updated: 2026-10-03
next: "decide: pablo - accept 0077 (amended); then it runs in the next wave, beside rule-box-and-stages and home-signals-5"
depends_on: []
boundary: ["Makefile", "a script under scripts/ if needed", "CLAUDE.md (the Packaging line only)", "not: wails.json, build/darwin/ templates, frontend, Go"]
spec: "docs/specs/leftovers-6.md (FR-8)"
gate: "docs/specs/leftovers-6.md Acceptance, rows N7 and N0"
ui_review: false
---

## Goal
`make review-build` gives reviewers `Deltagos Review.app` under
`cl.antipan.organizer.review`, so its WebKit storage is not the lead's
(leftovers-6 S4, third sighting).

## Gate
- [ ] N7: see `docs/specs/leftovers-6.md`, Acceptance
- [ ] N0: see `docs/specs/leftovers-6.md`, Acceptance

## Done
- 2026-10-03 cut from leftovers-6 by the FSE

## Next

## Blockers

## Notes
