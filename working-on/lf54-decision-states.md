---
title: "Decision states are read once on each side, and ruled_by reads as a person plus a mode"
status: now
repos: [organizer]
branch: lf54-decision-states
seat: l54-states
stage:
updated: 2026-11-01
next: "l54-states builds it; DecisionsView.tsx and Overview.tsx may call the lib helper only, FsePanel.tsx as is (leftovers-54 Amendment 5, c15ceaa)"
depends_on: [lf53-frontmatter]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-decision-states"]
spec: "docs/specs/leftovers-54.md (FR-6 to FR-7)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: true
---

## Goal
A crossing record shows in Needs me and the Decisions view the way the skill reads it.

## Gate
docs/specs/leftovers-54.md, rows G5 and X0.

## Notes
- 2026-11-01 l54-states: Go side done (da6738e, 1a86149): TestWorkingOnContract passes at 54cf10d. Premise row 6 is incomplete: DecisionsView.tsx, Overview.tsx and FsePanel.tsx also compare decision status to literals; asked sup99.
