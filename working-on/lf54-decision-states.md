---
title: "Decision states are read once on each side, and ruled_by reads as a person plus a mode"
status: now
repos: [organizer]
branch: lf54-decision-states
seat: l54-states
stage:
updated: 2026-11-01
next: "decide: sup99 — may l54-states edit DecisionsView.tsx (the Ruled list, timeline, turnaround and rule box read status literals at :21, :75-77, :83, :273, :282, :330-333, :454-458, :485-494) and Overview.tsx:43-44 to call the lib helper? The premise names only lib files; FR-6 cannot be met without them. Recommend yes for both; FsePanel.tsx:31 left as is"
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
