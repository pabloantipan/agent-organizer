---
title: "A mermaid block in a record or card draws as a dark figure, with its source and a text line"
status: next
repos: [organizer]
branch: dg-render
seat: dr-build
stage: review-map
updated: 2026-10-15
next: "building: dr-build on branch dg-render (sup76, launched 23:30)"
risk: medium
footprint: [internal/diagram/ (new), app.go, frontend/wailsjs/, internal/cli (doctor), frontend/src/lib/ (mermaid blocks, class line), a figure component, the five marked sites, frontend/src/styles/, a fixture record]
depends_on: []
boundary: ["docs/specs/diagrams.md Boundary, dg-render"]
spec: "docs/specs/diagrams.md (FR-1 to FR-5; diagrams-in-app D1-D8)"
gate: "docs/specs/diagrams.md Acceptance, rows G1, G2, D1, D2, D5, D8 and X0"
ui_review: true
---

## Goal
A mermaid block in a record or card draws as a dark figure, with its source and a text line (T11c; review-map exit 3; Aglaea's diagrams-in-app).

## Gate
docs/specs/diagrams.md, rows G1, G2, D1, D2, D5, D8 and X0.
