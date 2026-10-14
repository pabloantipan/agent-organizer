---
title: "Long bodies and code blocks scroll from the keyboard"
status: now
repos: [organizer]
branch: lf26-scroll-stops
seat: ss-build
stage: one-window
updated: 2026-10-14
next: "review: lf26-scroll-stops, gate met (S1, S2, S3, S4, D1, X0), 052e17f"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-scroll-stops"]
spec: "docs/specs/leftovers-26.md (FR-1 to FR-3, FR-9, FR-10; tab-reaches-links Amendment 3, T22 and §1 names)"
gate: "docs/specs/leftovers-26.md Acceptance, rows S1, S2, S3, S4, D1 and X0"
ui_review: true
---

## Goal
Long bodies and code blocks scroll from the keyboard (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows S1, S2, S3, S4, D1 and X0.

- [x] S1: body stop `<title>, details`, Down ×3 scrollTop 40/80/80 3/3 (Amendment 3, inactive-none); not a stop at 1440 — `.wt-notes/ss-build/s1-inactive-run1..3.jsonl`, `.wt-notes/ss-build/s1-long-1024.jsonl`, `.wt-notes/ss-build/s1-short-1440.jsonl`
- [x] S2: `Code, scrolls`, Right ×3 scrollLeft > 0 3/3; vitest of the hook over pre/table — `.wt-notes/ss-build/s2-settle-run1..3.jsonl`, `frontend/src/lib/useScrollEdges.test.ts`
- [x] S3: trap walks body, code block and table, never `body`, 5/5 — `.wt-notes/ss-build/s3-walk-1024-run1..5.jsonl`, `.wt-notes/ss-build/s3-walk-1024-amend1.jsonl`
- [x] S4: each region a stop while it overflows, named as FR-3 / by its heading (Amendment 1 roles kept) — harness `.wt-notes/ss-build/s4-{role,rule,float,header,help}.jsonl`, AX `.wt-notes/ss-build/s4-ax-{role,rule,float,header,help}.txt`, vitest `frontend/src/components/ScrollStops.test.tsx`
- [x] D1: `AXList` with 5 items; line 101 "an inline list" — `.wt-notes/ss-build/d1-ax-tree.txt`, `.wt-notes/ss-build/d1-roles-101.txt`
- [x] X0: clean clone of 052e17f, make test (621 vitest, go ok), pnpm build, wails build pass, porcelain empty — `.wt-notes/ss-build/x0-summary.txt`, `.wt-notes/ss-build/x0-*.log`

## Done
- ss-build, 2026-10-14: scroll regions are Tab stops only while they overflow (`scrollStop` in `lib/useScrollEdges.ts`), named per FR-2/FR-3; role drawer list and roles.css comment; rebased on main; gate met at 052e17f. Reproduce: `.wt-notes/ss-build/progress.md`.

## Notes
- Found: CardDrawer re-sets its markdown on a same-text refresh, so a focused link in the body loses focus (fixed for pre/table only, links outside this card). A region that stops overflowing while focused drops its tabindex and focus falls out. Carry: fold `inactiveSchedulingPolicy = .none` into `scripts/tab-harness/` (Amendment 3).
