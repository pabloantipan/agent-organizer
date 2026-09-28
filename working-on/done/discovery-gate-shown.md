---
title: Overview shows the gate into building
status: done
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
review: pass
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

## Review
- Verdict: pass. Unmet gate items: none.
- G3: met. Read both screenshots: `.wt-notes/cell-gate/g3-waiting-init-b.png` shows Overview of init-b (stage 1 discovery) with "Gate into building · stage 2 · Build B", row 0001 with a hollow fuchsia diamond and "waiting 4d"; `g3-no-gate-init-c.png` shows init-c with "no gate record yet" / "no record". The diff draws them through the existing `GateRow` (the waiting row opens the record's Needs me row, the ruled one Decisions), so FR-4's link holds. Fixture (3a1950b): init-b gated by proposed 0001, init-c's build stage names no record.
- G5: met, rerun by the reviewer on 29f2734: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, no FAIL; `npm run build` "✓ built", exit 0; G18 grep on main...discovery-gate-shown empty, grep exit 1. Outputs in `.wt-notes/cell-gate-review/`. main is ahead of the branch by card commits only.
- Diff stays inside the boundary: `Overview.tsx` and `testdata/fixture-overlay/`; no CSS added (reuses `.gl-row.missing`, `.diamond.missing`).
- Not covered by the gate: a building stage whose gates name only non-existent records says "no gate record yet" and drops the numbers (the current stage's gates show "missing" per number instead); no test covers `phaseAt`/`BuildingGate` (G3 is screenshots only); the fixture's Needs me is now 4 and lists init-c, so older fixture screenshots read one less (builder's note).
- Reviewer: cell-gate-review, 2026-09-28

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
- 2026-09-28 cell-gate: the fixture's Needs me now counts 4, not 3 (init-b 0001 is proposed, owned by pablo), and the rail lists init-c; earlier fixture screenshots that count either read one less
