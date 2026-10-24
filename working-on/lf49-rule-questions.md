---
title: "Ruling a record with several questions picks one answer per question and writes them all into chosen"
status: next
repos: [organizer]
branch: lf49-rule-questions
seat:
stage: review-map
updated: 2026-10-24
next: "pablo: rule 0157 (multi-question records)"
depends_on: []
boundary: ["docs/specs/leftovers-49.md Boundary"]
spec: "docs/specs/leftovers-49.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-49.md#Acceptance → gate"
ui_review: true
---

## Goal
A record that asks Q1 and Q2 is ruled in Deltagos with an answer to each, and `chosen` says both.

## Gate
docs/specs/leftovers-49.md, rows Q1-Q4 and X0. Built only if 0157 chooses A.
