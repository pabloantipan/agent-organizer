---
title: "The spec reader: a spec opens in a right drawer with its contents and figures"
status: next
repos: [organizer]
branch: dg-reader
seat: dd-build
stage: review-map
updated: 2026-10-15
next: "building: dd-build on branch dg-reader (sup76, launched 00:05)"
risk: medium
footprint: [app.go, internal/service (spec read), a drawer component, frontend/src/components/Initiatives.tsx, InitiativeHeader.tsx, CardDrawer.tsx, frontend/wailsjs/]
depends_on: [dg-render]
boundary: ["docs/specs/diagrams.md Boundary, dg-reader"]
spec: "docs/specs/diagrams.md (FR-6 to FR-8; diagrams-in-app D1-D8)"
gate: "docs/specs/diagrams.md Acceptance, rows D6, D7, G3 and X0"
ui_review: true
---

## Goal
The spec reader: a spec opens in a right drawer with its contents and figures (T11c; review-map exit 3; Aglaea's diagrams-in-app).

## Gate
docs/specs/diagrams.md, rows D6, D7, G3 and X0.
