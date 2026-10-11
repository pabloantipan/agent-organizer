---
title: "The rail's back to Initiatives is its own button"
status: done
repos: [organizer]
branch: lf20-back-button
seat: bk-build
stage: one-window
updated: 2026-10-11
next: "review: lf20-back-button, gate met (R1, R2, X0), 4810e18"
depends_on: []
boundary: ["docs/specs/leftovers-20.md Boundary, lf20-back-button"]
spec: "docs/specs/leftovers-20.md (FR-3, FR-4; initiatives-view Amendment 5, I36)"
gate: "docs/specs/leftovers-20.md Acceptance, rows R1, R2 and X0"
ui_review: true
review: pass
---

## Goal
Back is a small button of its own; the counts are not pressable (Aglaea, 9a058c0, from sup56's close).

## Gate
docs/specs/leftovers-20.md, rows R1, R2 and X0.

- [x] R1: vitest `frontend/src/components/Rail.hero.test.tsx`; AX on the review app: AXButton `Back to Initiatives` 85x24, AXPress opens Initiatives (`.wt-notes/bk-build/r1-ax.txt`, `r1-hero-crop.png`)
- [x] R2: vitest `Rail.hero.test.tsx` (counts outside any button, no handler; Home one button going Home); AXPress on the summary stays put (`.wt-notes/bk-build/r2-ax.txt`)
- [x] X0: clean clone at 4810e18: make test 532/532, pnpm run build, wails build pass, porcelain empty (`.wt-notes/bk-build/x0-summary.txt`)

## Done
- 2026-10-11 bk-build: back is its own 24 px button atop the hero; the rest of the hero is a summary on an initiative; Home unchanged (4438084, 4810e18).

## Notes
- `Places.test.tsx` (lf19 L2) pinned the old hero-back markup by source text; its one assertion now reads the new button (4810e18). Outside the named test files, inside the hero's tests.

## Review
Pass: R1, R2 and X0 are met at 4810e18.

- R1: in a clean clone, vitest `Rail.hero.test.tsx` and `Places.test.tsx` pass (13/13). With main's `Rail.tsx` the hero test fails (3/3). On my own review app (fixture, `auth: off`), AX on init-a shows exactly one AXButton `Back to Initiatives`, 85x24, first in the `init-a summary` group. AXPress on it moves to Initiatives (`place-tab.on`). Evidence: `.wt-notes/bk-review/r1-ax.txt`, `r2-and-back-ax.txt`, `r1-hero-crop.png`.
- R2: vitest checks that eyebrow, name, stats and stat are not under a button and carry no handler, and that the section has no onClick. On Home the hero is one `rail-hero` button and pressHero goes Home. In AX, the summary subtree holds no button other than Back (`summary-subtree.txt`). AXPress on the summary leaves the screen on init-a.
- X0: in a clean clone at 4810e18, `XDG_DATA_HOME=$(mktemp -d) make test` passes (532/532 vitest, go ok), and so do `pnpm run build` and `wails build`. `git status --porcelain` is empty (`x0-*.log`).
- Unmet: none.
- Reviewer bk-review, 2026-10-11, commit 4810e18cb858978d5041b36d2e281a4c9370d2fe. There is no `## UI review` yet, so status and place are unchanged.

## UI review
Pass. Every row checked at 4810e18cb858978d5041b36d2e281a4c9370d2fe, on my own Deltagos Review build (fixture, `auth: off`). Evidence is under `.wt-notes/bk-ui/`.

- R1 (FR-3, I36): on init-a, the AX tree has exactly one AXButton `Back to Initiatives`. It is 85x24 at both 1440x900 and 1024x640, and it sits first inside the `init-a summary` group. AXPress on it opens Initiatives (`place-tab.on`). Shots `wkwebview-1440x900-R1-initiative.png`, `wkwebview-1024x640-R1-hero-crop.png`; `r1-init-a-tree.txt`, `r1-r2-ax.txt`. Vitest `Rail.hero.test.tsx` and `Places.test.tsx` pass, 13/13.
- R2 (FR-4): the client, id and counts are an AXGroup with static text and no button. AXPress on the group leaves the app on init-a, Overview (`r1-r2-ax.txt`). On Home the hero is still one `rail-hero.active` button (`r2-home-ax.txt`, `wkwebview-1024x640-R2-home-crop.png`). The Home markup is the same as main's except the removed back line.
- Design system: the back button uses tokens (`--accent-fg`, `--surface-hover`, `--radius-sm`). It keeps the global `:focus-visible` ring. The summary has no hover change and a default cursor, so it no longer looks pressable. Its target is ≥ 24 px (2.5.8).
- Findings sev 4/3: none.
- Sev 1, recorded: on Home the hero's accessible name reads "Working on Home 1 now1 blocked11 next". It is a list of numbers, the same complaint §3 made about the initiative hero. It is outside FR-4, which says "unchanged". Proposal: name it `Home` and keep the counts as its description.
- Spec gaps (FSE): none for this card.
- For aglaea: whether the Home hero should get the same split (the sev 1 above).
- Not verified in WKWebView: keyboard focus ring on `Back to Initiatives`, and where focus lands after Back (no synthetic keys under 0108). Judged from CSS: the global `:focus-visible` outline is 2 px with a 2 px offset, nothing clips it inside the hero's 16 px padding. Hover fill not verified (no pointer hovers).
- UI reviewer bk-ui, 2026-10-11.
