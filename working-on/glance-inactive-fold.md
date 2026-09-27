---
title: Initiatives that are not active fold into one rail group
status: now
repos: [organizer]
branch: main
updated: 2026-09-27
next: "review: glance-inactive-fold, gate G12, G10 met, evidence in .wt-notes/wave1-fold, 150db85 8d36ada 8207402 14934a7 56272c7"
depends_on: ["glance-needs-me-lead"]
boundary: ["frontend/src/components/Home.tsx (the initiative list)", "frontend/src/components/Rail.tsx", "frontend/src/lib/queue.ts (skip initiatives that are not active)", "frontend/src/styles/ (the rail's and Home's CSS only)", "testdata/fixture-twenty/ (one archived initiative)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-9); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G12, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-fold
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
1. review: glance-inactive-fold, gate G12, G10 met, evidence in .wt-notes/wave1-fold, 150db85 8d36ada 8207402 14934a7 56272c7

## Blockers
none

## Notes
- 2026-09-27 wave1-fold: active is `status: active`, and an empty or missing `status` also counts as active, since older initiative.yaml files carry none (`isActive` in lib/queue.ts).
- 2026-09-27 wave1-fold: folded initiatives have no rank; ranks count active ones only, and their stored slot in the priority and groups is kept so reactivating restores it (progress.md).
- 2026-09-27 wave1-fold, for the FSE: "opens read-only" holds only for the rail. An opened inactive initiative still allows: Rule (Decisions, the header's waiting count, Overview's FSE panel "rule"), Work's card drag (card order), card comments, Conversations posting and new threads (its cell), and on Agents: New agent, Bring crew up, Clean exited, Retire. Its header still says "1 decision waiting", and Conversations' needs-me entry still counts its rows (`queueOf` is unfiltered).
- 2026-09-27 sup6 runs this card (organizer-probe-sup6), spawned by the FSE after 0034 and 0036
