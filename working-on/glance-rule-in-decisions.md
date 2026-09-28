---
title: Rule a decision from the Decisions tab
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: glance-rule-in-decisions, gate G15, G10 met, 718d69e"
depends_on: []
boundary: ["frontend/src/components/DecisionsView.tsx", "frontend/src/components/RuleDecisionBox.tsx (reuse; props only if needed)", "frontend/src/styles/ (the Decisions tab's CSS only)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-12); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G15, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-decrule
---

## Goal
Pablo's review of the installed app (0038): FR-12 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G15: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 wave1-decrule: an expanded proposed record the lead owns (or nobody) shows Rule, which opens `RuleDecisionBox` unchanged; ruled, withdrawn, superseded and business-owned records show none (718d69e on `glance-rule-in-decisions`, rebased on main 8133c91). Evidence in `.wt-notes/wave1-decrule/`:
  - G15: `G15-box.png` (0002 expanded, box open with one-machine and words), `G15-ruled.png` (0002 under Ruled, no Rule), `G15-no-rule.png` (0004 expanded, no Rule; no `.dec-actions` in the DOM after the ruling). On `FIXTURE_HOME=/tmp/organizer-fixture.zWVwUR/home`: `git -C "$FIXTURE_HOME/init-a" log -1 --stat` → `dbdf235 docs(decisions): rule 0002 where-the-fixture-runs (one-machine)`, `working-on/decisions/0002-where-the-fixture-runs.md | 10 ++++++----`, `1 file changed, 6 insertions(+), 4 deletions(-)`. `git show` changes only `status: proposed→ruled`, `ruled: 2026-09-28`, `ruled_by: pablo`, `chosen: one-machine`, and one line under `## Ruling` ("pablo, 2026-09-28, in the organizer on fixture: One machine is enough…").
  - G10: `cd frontend && npm run build` → `✓ built in 1.08s` after the rebase; the G18 grep over `main...glance-rule-in-decisions` printed nothing (exit 1). `wails build` run after `wails dev`.

## Next
1. review: glance-rule-in-decisions, gate G15, G10 met, 718d69e

## Blockers
none

## Notes
- 2026-09-28 sup8 runs this card (organizer-probe-sup8), spawned by the FSE after 0038
- 2026-09-28 wave1-decrule: `ownedByLead` in `lib/queue.ts` is not exported, so `DecisionsView.tsx` carries a copy with the same behaviour (owner empty or equal to `leadOf`), as the card allowed; exporting it from queue.ts would let the two share it.
- 2026-09-28 wave1-decrule: `RuleDecisionBox.tsx` and `rule-box.css` unchanged; the one new rule is `.dec-actions` in a new `styles/decisions.css`.
- 2026-09-28 wave1-decrule, found: `Record` was a component declared inside `DecisionsView`, so every store update (the 10 s agents feed) remounted it; that would have wiped the words typed into the box. It is now a render function; the box kept its text across a tick.
- 2026-09-28 wave1-decrule, found: the fixture has no proposed record owned by someone other than the lead, so the FR-8 negative (a business-owned proposed record offers no Rule) is covered by the code, not by a screenshot.
- 2026-09-28 wave1-decrule, found: `wails build` flips the mode of `frontend/wailsjs/go/main/App.{d.ts,js}` to 755 in the worktree; reverted, not committed.
