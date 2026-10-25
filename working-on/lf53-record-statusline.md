---
title: "No dead 409 branch in cell registration, and the statusline test reads a real captured payload"
status: now
repos: [organizer]
branch: lf53-record-statusline
seat: l53-stat
stage:
updated: 2026-10-25
next: "sup94: run .wt-notes/l53-stat/organizer as the statusLine for one turn with ORGANIZER_STATUSLINE_CAPTURE=.wt-notes/l53-stat/capture.raw.json, then wake l53-stat (capture at 456a804)"
depends_on: []
boundary: ["docs/specs/leftovers-53.md Boundary, lf53-record-statusline"]
spec: "docs/specs/leftovers-53.md (FR-7 to FR-8)"
gate: "docs/specs/leftovers-53.md#Acceptance → gate"
ui_review: false
---

## Goal
A renamed statusline field fails a test instead of turning into zeros.

## Gate
docs/specs/leftovers-53.md, rows R1, L1 and X0.
