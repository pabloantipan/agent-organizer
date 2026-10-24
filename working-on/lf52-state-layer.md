---
title: "Every state mark is painted on one untransitioned layer, so a mark never eases and hover eases on every control"
status: next
repos: [organizer]
branch: lf52-state-layer
seat: l52-layer
stage:
updated: 2026-10-24
next: "review: lf52-state-layer, gate S1-S3 and X0 met, e6d77d6"
depends_on: []
boundary: ["docs/specs/leftovers-52.md Boundary, lf52-state-layer"]
spec: "docs/specs/leftovers-52.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-52.md#Acceptance → gate"
ui_review: true
---

## Goal
No highlight in Deltagos ever lags behind a click, and hover eases on every control.

## Gate
docs/specs/leftovers-52.md, rows S1-S3 and X0.

## Done
- 2026-10-24 l52-layer: one shared layer (`.sl`, `.sl::before`, `.sl-shadow`) paints every state mark; S1 92/92, S2, S3 30/30 pass (49 and 15 fail on main); X0 passes from a clean clone of e6d77d6 (8db6359, e6d77d6; .wt-notes/l52-layer/progress.md).

## Declared changes
- modified `frontend/src/styles/global.css`: adds the shared layer (`.sl`, `.sl::before`, `.sl-shadow`); moves tiny-btn, strip, rail-item, person and chat marks onto it; removes lf51's `transition: none` list and the rail-item's own transitions
- modified `frontend/src/styles/shell.css`: place-tab, gear (on, open), ib-act .act, ihead-details, stg (and its focus ring), subtabs and seg marks on the layer; drops the sub-tabs' transparent inset
- modified `frontend/src/styles/float.css`, `usage.css`, `memory.css`, `roles.css`, `initiatives.css`, `rule-box.css`: their marks on the layer (rb-option via `.sl-shadow`); own background transitions removed
- modified `Rail.tsx`, `SlackView.tsx`, `Conversation.tsx`, `UsageChart.tsx`, `TopBar.tsx`, `InitiativeHeader.tsx`, `UsageTable.tsx`, `RoadmapView.tsx`, `StageRoadmap.tsx`, `Usage.tsx`, `FloatList.tsx`, `Home.tsx`, `InitiativesView.tsx`, `MemoryButton.tsx`, `RuleDecisionBox.tsx`: class `sl` (or `sl-shadow`) on the marked controls, nothing else
- added `frontend/src/components/stateLayer.kit.ts`: reads the stylesheets as rules, reaches/specificity/winners, MARKS
- added `frontend/src/components/StateLayer.css.test.ts`: S1, S2, FR-3
- added `frontend/src/components/StateLayer.harness.test.tsx`: S3
- modified `Conversation.landing.test.tsx`: lf51's K4 removed (superseded by S1-S3)
- modified `CardDetails.test.tsx`, `CharterOnce.test.tsx`, `Home.waits.test.tsx`, `InitiativesView.test.tsx`, `Rail.keys.test.tsx`, `ReviewSymbol.test.tsx`, `TopBar.test.tsx`: class literals follow `sl`
Risky:
- `.sl`: `position: relative; z-index: 0` makes each control a stacking context (no control here holds a raised child today)
- hover's border-color and ink no longer ease on these controls; the sub-tabs' hover is ink only
Not changed, on purpose:
- `review.css` (0159); `decisions.css` (no state fill there; `.dec-chev` is ink with no transition)
- `.ib-row.focused`: its word is outside the premise's list (Notes)
- dead `.srm-*` rules in roadmap.css and time-zoom.css

## Notes
- The seven markup tests above pin class strings; updating them is outside the boundary's letter but follows from the class it allows.
- `.ib-row.focused` (Home's inbox) paints a fill on its own transitioned background, so its leaving mark eases; "focused" is not in the spec's state list, so S1 does not see it. A next leftovers could add it.
- The rule box options lost their reduced-motion `transition: none` with the layer; they ease as every control does.
