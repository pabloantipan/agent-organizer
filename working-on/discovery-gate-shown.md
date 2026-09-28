---
title: Overview shows the gate into building
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: discovery-gate-shown, branch discovery-gate-shown, gate G3, G5 met, 3a1950b 29f2734"
depends_on: []
boundary: ["frontend/src/components/Overview.tsx (StageGates)", "testdata/fixture-overlay/ (an initiative in discovery with a gated building stage)", "frontend/src/styles/ (Overview's CSS only)"]
spec: "docs/specs/discovery-in-a-cell.md (FR-4); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G3, G5; the Gate section below"
stage: discovery-in-a-cell
seat: cell-gate
---

## Goal
Roadmap stage discovery-in-a-cell: FR-4 of `docs/specs/discovery-in-a-cell.md`.

## Gate
- [x] G3: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [x] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 cell-gate: Overview draws "Gate into building" while the current stage is in discovery (29f2734); fixture init-b gated by proposed 0001, new init-c ungated (3a1950b). G3: `.wt-notes/cell-gate/g3-waiting-init-b.png` (0001 waiting 4d, fuchsia dashed diamond) and `g3-no-gate-init-c.png` ("no gate record yet"), wails dev on the fixture home. G5 after rebase on main: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (`g5-make-test.txt`), `npm run build` "✓ built", exit 0 (`g5-npm-build.txt`), G18 grep on main...discovery-gate-shown empty, grep exit 1 (`g5-g18-grep.txt`)

## Next
1. review: discovery-gate-shown, branch discovery-gate-shown, unmerged

## Blockers
none

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
- 2026-09-28 cell-gate: the fixture's Needs me now counts 4, not 3 (init-b 0001 is proposed, owned by pablo), and the rail lists init-c; earlier fixture screenshots that count either read one less
