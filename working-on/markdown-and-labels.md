---
title: Record bodies never widen the view, dimmed by token not opacity, no cut axis label, the rule box's own placement
status: now
repos: [organizer]
branch: markdown-and-labels
updated: 2026-10-03
next: "review: markdown-and-labels, gate met (L9, L10 Chromium; L11 WKWebView; L0)"
depends_on: [header-fold-3, home-widths-4, zoom-decisions-polish]
boundary: ["frontend/src/styles/global.css (.markdown and .dec.* rules only)", "frontend/src/styles/rule-box.css, frontend/src/components/RuleDecisionBox.tsx, frontend/src/styles/decisions.css (the !important placement only)", "frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts, frontend/src/components/StageRoadmap.tsx (axis labels only)", "frontend/src/lib/ tests", "testdata/fixture-overlay/, scripts/fixture-home.sh", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-4.md (FR-9 to FR-12); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-4.md (Aglaea, 94308ad); the design system as amended there"
gate: "docs/specs/leftovers-4.md Acceptance, rows L9 to L11 and L0"
ui_review: true
seat: mal-build
---

## Goal
The second half of sup27's leftovers, the part that shares files with
sup28's cards and with zoom-decisions-polish.

## Gate
- [x] L9-L11: see `docs/specs/leftovers-4.md`, Acceptance
- [x] L0: see `docs/specs/leftovers-4.md`, Acceptance

## Done
- 2026-10-03 mal-build: FR-9 to FR-12 on markdown-and-labels (7483814, 187f462, 06e16d8, effbfc8, c19204b); L9 and L10 measured in Chromium at a 1024x640 window, L9 with rail expanded and strip, L10 expanded: no scroller bar, the code block scrolls inside, superseded lozenge 6.67:1, no cut or overlapping axis label; L11 in the built app (WKWebView, classic scrollbars): capped box has no horizontal bar, no !important left in decisions.css; L0 green. Evidence and choices: .wt-notes/mal-build/progress.md
- 2026-10-03 sup30 launched by the FSE (its three dependencies in done/)
- 2026-10-03 0075 ruled by pablo (accept as written)
- 2026-10-03 cut from leftovers-4 by the FSE

## Next

## Blockers

## Notes
- FR-10's "the lozenge keeps its tokens" cannot meet L9: --done on the badge tint reads 2.05:1 without any opacity. The superseded and withdrawn lozenges now keep the neutral badge's tokens (--fg-muted, 6.67:1); --fg-subtle measured 4.49:1.
- At Fit a month tick under a milestone title is hidden (their text boxes overlap by 1 px); a taller axis would keep both, but its label rows are Roadmap.tsx's, outside this boundary.
- Pablo's Deltagos was running, so its WebKit storage was not restored: the copy taken before the first launch is in .wt-notes/mal-build/webkit-before/; the runs wrote rail and Decisions section state into the shared storage.
