---
title: Needs me holds only the lead's decisions
status: done
repos: [organizer]
branch: main
updated: 2026-09-27
next: "review: glance-needs-me-lead, gate G11, G10 met, evidence in .wt-notes/wave1-lead, 55d9277 1b88612"
depends_on: []
boundary: ["frontend/src/lib/queue.ts (needsMeRows)", "frontend/src/components/TopBar.tsx (the badge, only if it counts separately)", "testdata/fixture-twenty/ (records owned by business or the FSE, if missing)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-8); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G11, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-lead
review: pass
---

## Goal
Roadmap stage twenty-at-a-glance: FR-8 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G11: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE
- 2026-09-27 wave1-lead: needsMeRows keeps a proposed record only when its owner is the lead (cell human, else pablo) or empty; DEFAULT_LEAD and leadOf moved to queue.ts, asksLead removed (55d9277). Fixture's onboarding-flow cell committed (1b88612). G11: badge 3 = Needs me rows 3 = "waits on you" rows 3 (claims-portal, onboarding-flow, vendor-audit); carla, rodrigo and fse records left out (`.wt-notes/wave1-lead/G11-needs-me.png`, `G11-home-rows.png`, `G11-count.md`). G10: `npm run build` → `✓ built in 1.19s`, exit 0; the G18 grep over main...glance-needs-me-lead printed nothing (exit 1). Rebased on main, unmerged.

## Next
1. review: glance-needs-me-lead, gate G11, G10 met, evidence in .wt-notes/wave1-lead, 55d9277 1b88612

## Blockers
none

## Notes
- 2026-09-27 sup6 runs this card (organizer-probe-sup6), spawned by the FSE after 0034 and 0036
- 2026-09-27 sup6: boundary widened to `frontend/src/lib/initiativeState.ts`, only to import the lead (`DEFAULT_LEAD`, `leadOf`) from `queue.ts` and drop `asksLead`, which FR-8 makes redundant
- 2026-09-27 wave1-lead: `testdata/fixture-twenty/onboarding-flow/agents/cell.json` was never committed, because `.gitignore`'s `agents/` matches it; on a fresh checkout `--twenty` showed 2 "waits on you", not 3. Committed with `git add -f` (1b88612). New fixture cells will hit the same; a `!testdata/**/agents/` exception is outside this card.
- 2026-09-27 wave1-lead: on `--twenty` no initiative has two Needs me rows, so badge and "waits on you" count are equal (3); they may differ legitimately elsewhere, since the badge counts rows.

## Review
- Verdict: pass. Unmet gate items: none.
- G10: `npm run build` in the worktree green (`✓ built in 1.44s`, exit 0); the G18 grep over `main...glance-needs-me-lead` printed nothing (exit 1).
- G11: `needsMeRows` keeps a proposed record only when its owner, trimmed and lowercased, is empty or `leadOf` the initiative's group (cell `human`, else "pablo", trimmed and lowercased); threads, cards and seats untouched. TopBar and Home both count `needsMeRows(...).length`, and nothing else counts decisions for the badge. `initiativeState.ts` drops `asksLead`, whose filter is now inside `needsMeRows`, so the states are the same by construction. On `--twenty` at 1440×900 (own run, `.wt-notes/wave1-review-lead/G11-badge-needs-me.png`, `G11-home-full.png`): badge 3, Needs me 3 (claims-portal 0002, vendor-audit 0001, the onboarding-flow card), "waits on you" 3 (claims-portal, onboarding-flow, vendor-audit), "waits on business" 2 (data-lake, pricing-model). The carla (data-lake 0002), rodrigo (pricing-model 0002) and fse (email-digest 0002) records are absent.
- Boundary: the diff is `queue.ts`, `initiativeState.ts` (the widening in Notes) and `testdata/fixture-twenty/onboarding-flow/agents/cell.json`. Nothing is outside it.
- Not covered by the gate: (1) G11's wording is at fault, not the build. The badge counts rows and "waits on you" counts initiatives, so the two diverge as soon as one initiative has two Needs me rows; they are equal on `--twenty` only because none does. The gate should read "badge = Needs me rows, and each initiative with a row says waits on you". (2) Every fixture cell's human is pablo and every owner is set, so neither a non-pablo lead nor an empty owner is exercised, and there is no unit test for `needsMeRows`. (3) "Space-insensitive" is `trim` only; an owner written "Pablo  A" would not match. (4) `.gitignore`'s `agents/` hides fixture cells (builder's note); it needs a `!testdata/**/agents/` exception.
- Reviewer: wave1-review-lead, 2026-09-27
