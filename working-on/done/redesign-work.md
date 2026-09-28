---
title: Work shows five columns, the wave strip and who is on each card
status: done
repos: [organizer]
branch: main
updated: 2026-09-26
seat: wave2-work
review: pass
next: "review: redesign-work, gate G13, G18 met, 72cb9d8"
depends_on: ["redesign-shell-home"]
boundary: ["frontend/src/components/Board.tsx", "frontend/src/components/CardItem.tsx", "frontend/src/components/WaveStrip.tsx (new)", "frontend/src/styles/work.css (new)"]
spec: "docs/specs/redesign.md (FR-23, FR-19); visual: docs/specs/redesign-mockups.html; values: docs/design-system.md"
gate: "docs/specs/redesign.md Acceptance, rows G13, G18; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-19 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G13: see `docs/specs/redesign.md`, Acceptance
- [x] G18: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-27 wave2-work: Work is Next · Now · Blocked · In review (lane from `next: review:`) · Done, a wave strip per running wave with a tile per card opening its back, and each open card's agent line or "nobody on it" plus its runs tokens (72cb9d8 on `redesign-work`, rebased on main 219ca85). G13: `.wt-notes/wave2-work/G13-work.png` (five columns, w-review in In review, wave 1 strip: 0 building, 1 in review, 2 queued, gate rows 3/4, w-nogate "gate —", "no supervisor", every card "nobody on it") and `G13-tile.png` (w-review tile opens its card back), from `wails dev` on `scripts/fixture-home.sh`. G18: the `git diff main...redesign-work … | grep -E …` of the spec prints nothing (grep exit 1). `npm run build` passes; `wails build` rebuilt. Choices in `.wt-notes/wave2-work/progress.md`

## Review
- Verdict: pass. Unmet gate items: none. Reviewer wave2-review-work, 2026-09-26.
- G13: my own `wails dev` on `scripts/fixture-home.sh` (`.wt-notes/wave2-work/review-G13-work.png`, `review-G13-tile.png`) shows Next 4 · Now 1 · Blocked 1 · In review 1 (w-review, taken off its status column) · Done 1 collapsed; one wave 1 strip, "no supervisor", gate rows 3/4, 0 building · 1 in review · 2 queued, three tiles, and a tile opens its card back; every card and tile says "nobody on it". The builder's `G13-work.png` has no wave strip in it, although this card says it does: it was taken before the agents feed arrived. The strip is only in `G13-tile.png`, dimmed behind the modal.
- G18: the grep prints nothing (exit 1); `npm run build` (tsc + vite) is green in `.wt/redesign-work`. FR-23 beyond the grep: every token used is tier-2, no legacy alias, only xs/sm/md sizes, `:focus-visible` rings on card and tile (computed outline solid), no `:has()` or nesting. Boundary: the four files, nothing outside.
- Not covered by the gate: the fixture has no live agent, so the joined agent line (name, context bar, time, tokens) and the per-card runs tokens have never been drawn; W1's "spawned by · time · duration" and W2's phases are missing, and wave 1 exposes no data for them (A3 has no backend). The wave number badge and a few px sizes (7px dots, 1px 7px badge padding) are outside tabular numerals or spacing tokens.

## Next
1. review: redesign-work, gate G13, G18 met, 72cb9d8

## Blockers
none

## Notes
- 2026-09-27 sup3: the gate screenshots run against `eval "$(scripts/fixture-home.sh)"` (1993e12): a temp copy of `testdata/home` with `testdata/fixture-overlay` laid over it: init-a a git repo with two FSE-signed commits, proposed records 0002 (the fixture record G15/G16 rule) and 0003 raised by the FSE and owned by pablo, the current stage gated on 0002, three cards seated `wave1-*`, and a cell `organizer-fixture` whose `fse` seat has one question thread open to pablo in the mailbox. `testdata/home` and `status.golden` are unchanged
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-27 sup3 runs this card (organizer-probe-sup3), spawned by the FSE after wave 1 passed
- 2026-09-27 wave2-work: the card back (CardDrawer) draws Gate checkboxes as large grey boxes apart from their bullets (G13-tile.png); outside this boundary
- 2026-09-27 wave2-work: the Board's own header and review-prompt buttons are gone from Work; the initiative header names it and the buttons stay on Home's row detail
