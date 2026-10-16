---
title: "Usage hours are active time, and a session with no cost record is priced from a table"
status: next
repos: [organizer]
branch: uc-price
seat: up-build
updated: 2026-10-15
next: "sup75 runs it after uc-resume; 0138 ruled"
risk: high
footprint: [internal/usage/ledger.go (Line.active, Ingest, costOf, splitCost), internal/usage/report.go (totals, the model cut), internal/usage/prices.go (new), frontend/src/lib/usage.ts, frontend/src/components/Usage.tsx]
depends_on: [uc-resume]
boundary: ["docs/specs/usage-audit.md Boundary (uc-price)"]
spec: "docs/specs/usage-audit.md (FR-3 to FR-6; 0138)"
gate: "docs/specs/usage-audit.md Acceptance (uc-price), rows P1 to P9 and X0"
ui_review: false
---

## Goal
The Usage view's hours are active time (messages 5 minutes apart or less), and a session with no cost record is priced from a table the organizer keeps instead of reading $0 (0138, Pablo: "Do as you recommend").

## Gate
docs/specs/usage-audit.md, rows P1 to P9 and X0.

## Notes
Forecast 25-50 min over 1 wave (the FSE; basis: one-card Go tasks here, uc-resume's 0138 forecast); 0138 forecast only uc-resume.
