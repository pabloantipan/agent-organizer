---
title: Draft the cell from the organizer, and never launch a draft
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "pablo: rule 0050 (accept amendment 1 of discovery-in-a-cell); then the FSE starts a supervisor for this card and cell-definition-finish"
depends_on: []
boundary: ["internal/model/model.go (Cell: draft, drafted)", "internal/scan/scan.go (readCell only)", "internal/service/crew.go (cellState; CreateCrew's draft refusal)", "internal/service/draft.go (new)", "internal/prompt/ (the draft prompt)", "internal/cli/ (draft-cell)", "app.go (one binding)", "frontend/wailsjs (generated)", "frontend/src/hooks/useWails.ts", "frontend/src/components/AgentsView.tsx (the button, for an initiative without a cell)", "frontend/src/components/Crew.tsx (the waits text only)", "CLAUDE.md (one sentence in the Crew paragraph)", "testdata/", "tests"]
spec: "docs/specs/discovery-in-a-cell.md (FR-3, amendment 1); the procedure the prompt points at: ~/.claude/skills/persona-agents/references/drafting.md (read, never edit); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G4, G5; the Gate section below"
stage: discovery-in-a-cell
seat:
---

## Goal
Roadmap stage discovery-in-a-cell, exit (a): FR-3 of
`docs/specs/discovery-in-a-cell.md` as amended (0047 ruled "a drafting
session").

## Gate
- [ ] G4: see `docs/specs/discovery-in-a-cell.md`, Acceptance, (i) to (iv)
- [ ] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-29 cut from amendment 1 by the FSE

## Next
1. pablo: rule 0050

## Blockers
none

## Notes
- The prompt points at the skill and carries no role text (spec, Rabbit
  holes). No accept button: acceptance is the record's ruling.
- Camp's six seats all have `agents/<seat>.md` (checked 2026-09-29 by the
  FSE), so FR-2's refusal does not stop camp.
