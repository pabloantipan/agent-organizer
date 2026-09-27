---
title: Initiatives that are not active fold into one rail group
status: done
repos: [organizer]
branch: main
updated: 2026-09-27
next: "merge glance-inactive-fold into main (reviewed, pass)"
depends_on: ["glance-needs-me-lead"]
boundary: ["frontend/src/components/Home.tsx (the initiative list)", "frontend/src/components/Rail.tsx", "frontend/src/lib/queue.ts (skip initiatives that are not active)", "frontend/src/styles/ (the rail's and Home's CSS only)", "testdata/fixture-twenty/ (one archived initiative)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-9); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G12, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-fold
review: pass
---

## Goal
Roadmap stage twenty-at-a-glance: FR-9 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G12: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE
- 2026-09-27 wave1-fold: FR-9 built on `glance-inactive-fold` (150db85 queue, 8d36ada home, 8207402 + 56272c7 rail, 14934a7 fixture), rebased on main, unmerged. G12: on `--twenty` Home lists 20, `legacy-intranet` (archived) absent from the list and from Needs me; badge 5 → 3, the two rows it would add are its record 0001 (owner pablo) and card page-inventory (`pablo:`); rail ends with "Not active (1)", collapsed, expands, opens it (G12-home.png, G12-home-2.png, G12-rail-collapsed.png, G12-rail-open.png, G12-opened.png, G12-count.md). G10: `npm run build` ✓ built in 1.05s; the G18 grep over main...glance-inactive-fold prints nothing (exit 1). Evidence in .wt-notes/wave1-fold.

## Next
1. merge glance-inactive-fold into main (reviewed, pass)

## Blockers
none

## Notes
- 2026-09-27 wave1-fold: active is `status: active`, and an empty or missing `status` also counts as active, since older initiative.yaml files carry none (`isActive` in lib/queue.ts).
- 2026-09-27 wave1-fold: folded initiatives have no rank; ranks count active ones only, and their stored slot in the priority and groups is kept so reactivating restores it (progress.md).
- 2026-09-27 wave1-fold, for the FSE: "opens read-only" holds only for the rail. An opened inactive initiative still allows: Rule (Decisions, the header's waiting count, Overview's FSE panel "rule"), Work's card drag (card order), card comments, Conversations posting and new threads (its cell), and on Agents: New agent, Bring crew up, Clean exited, Retire. Its header still says "1 decision waiting", and Conversations' needs-me entry still counts its rows (`queueOf` is unfiltered).
- 2026-09-27 sup6 runs this card (organizer-probe-sup6), spawned by the FSE after 0034 and 0036

## Review
- Verdict: pass. G12 and G10 met on 56272c7.
- Unmet gate items: none.
- G10: `npm run build` ✓ built in 1.12s; the G18 grep over main...glance-inactive-fold prints nothing (exit 1); the new CSS uses role tokens only.
- G12: `isActive`/`inactiveIds` (lib/queue.ts) is the one predicate; an empty status counts as active; `needsMeRows`, Home and the rail all use it. The fold is outside the DragDropContext, has no rank, no rename, and is last. Every rail write path keeps folded ids: flat reorder, grouped reorder and rest moves go through `keepHidden`; group reorder, "Group by client" and "New group" persist from lists that still hold them. Fixture: `go run . status` lists 21, and the diff adds only legacy-intranet and a README note. Own screenshots on `--twenty` at 1440×900: Home has no legacy-intranet, badge 3 = 3 rows, "Not active (1)" last and collapsed, it expands and opens (.wt-notes/wave1-review-fold/R-*.png).
- Boundary: every changed file is inside it (global.css holds the rail's rules).
- Not covered by the gate: with the rail collapsed to the strip, a folded initiative is not shown and cannot be opened. `queueOf` is still unfiltered, so the Agents pill and Conversations still count an inactive cell's rows (listed in Notes). An opened inactive initiative still allows the writes listed in Notes, so FR-9's "read-only" is open. A group whose members are all folded shows as empty. The card's `branch: main` does not name the branch.
- Reviewer: wave1-review-fold, 2026-09-27.
