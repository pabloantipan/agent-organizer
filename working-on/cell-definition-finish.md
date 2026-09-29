---
title: A cell in definition reads as one on the rail, and its buttons say why
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "review: cell-definition-finish, branch cell-definition-finish, gate G6, G7, G5 met, 6d52e2a 5aaa45f 96b60e1 1738f24 31409a3 18e108f"
depends_on: ["cell-draft"]
boundary: ["frontend/src/components/Rail.tsx (the mark)", "frontend/src/components/Crew.tsx (the Bring crew up and Retire buttons only)", "internal/service/crew.go (Retirable only)", "frontend/src/lib/queue.ts (needsMeRows, the launch row)", "frontend/src/components/Home.tsx (the Launch row and verb)", "CLAUDE.md (Launch among the Needs me verbs)", "testdata/", "tests", "CSS"]
spec: "docs/specs/discovery-in-a-cell.md (FR-1 rail, FR-5, FR-6, FR-7, amendment 1); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G6, G7, G5; the Gate section below"
stage: discovery-in-a-cell
seat: draft-finish
---

## Goal
Roadmap stage discovery-in-a-cell: sup15's closing points 1, 2 and 4 of
`runs/2026-09-28-discovery-in-a-cell.md`, as FR-1 (rail), FR-5 and FR-6, and 0051's Launch row as FR-7, of
`docs/specs/discovery-in-a-cell.md`, amendment 1.

## Gate
- [x] G6: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [x] G7: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [x] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-29 cut from amendment 1 by the FSE
- 2026-09-29 FSE added FR-7 and G7 (0051 ruled "a Launch row in Needs me", d10c0d0), before launch
- 2026-09-29 draft-finish built it on `cell-definition-finish` (6d52e2a Retirable, 5aaa45f rail mark, 96b60e1 Bring crew up, 1738f24 Launch row, 31409a3 fixture README, 18e108f rail wrap), rebased on main. Evidence in `.wt-notes/draft-finish/`: G6 `go test ./internal/service -run TestRetirableIsEmptyWhileTheCellIsInDefinition` PASS (`g6-retirable-test.txt`); `g6-rail-expanded.png`, `g6-rail-collapsed.png` (+`-titles.json`: init-define and init-drafted carry the icon and "cell in definition: …"); `g6-crew-init-define-disabled-hover.png` (disabled, "no persona file: agents/designer_diego.md", "Retire…"), `g6-crew-init-drafted-disabled-hover.png` (disabled, "…until 0001 the-cell-roster is ruled", "Retire…"), `cli-fixture.txt` (`retire --retirable` dry: "retire seats: none" for both). G7 `g7-home.png` (badge 6, one Launch row `launch:init-define`, init-define "waits on you", none for init-drafted or init-a), `g7-launch-lands-agents.png` (init-define › Agents). G5 `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, `npm run build` "✓ built", G18 grep empty (`g5-*.txt`), after the rebase. Choices and found-not-asked in `progress.md`

## Next
1. review against G6, G7, G5 (a reviewer that is not draft-finish)

## Blockers
none

## Notes
- 2026-09-29 sup16 runs this card (organizer-probe-sup16), spawned by the FSE after 0050; FR-7 added after 0051 was ruled
- 2026-09-29 draft-finish: `organizer retire --retirable` on a cell in definition says "every seat is the human, the reconciler, named by an open card, or working", omitting "in definition" (`retire.go`, outside this boundary). Hover screenshots show the title in an injected overlay: headless Chromium paints no native tooltip
- After cell-draft: both touch `Crew.tsx` and `crew.go`; FR-6 also disables
  the button on a draft, which cell-draft introduces.
