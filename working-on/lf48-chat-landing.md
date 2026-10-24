---
title: "A landing shows its chat row, state fills do not ease, the new-thread picker reaches Others, and the fixture has a chat with a supervisor"
status: next
repos: [organizer]
branch: lf48-chat-landing
seat:
stage: review-map
updated: 2026-10-23
next: "sup90 runs it (0156 ruled 2026-10-24)"
depends_on: []
boundary: ["docs/specs/leftovers-48.md Boundary"]
spec: "docs/specs/leftovers-48.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-48.md#Acceptance → gate"
ui_review: true
---

## Goal
Landing in Conversations always shows the row you landed on, the highlight never lags, and you can start a chat with anyone listed under Others.

## Gate
docs/specs/leftovers-48.md, rows L1-L4 and X0; the UI review checks review-view R42 to R44.
