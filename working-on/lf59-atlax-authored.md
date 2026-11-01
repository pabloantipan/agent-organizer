---
title: "Deltagos's factory-report readers become authored atlax promises"
status: now
repos: [organizer]
branch: lf59-atlax-authored
seat: l59-authored
stage:
updated: 2026-11-01
next: "l59-authored builds Amendment 5 on lf59-atlax-authored (sup102 launched 2026-11-01 19:20)"
depends_on: [lf59-atlax-surface]
boundary: ["atlax/"]
spec: "docs/specs/atlax-seed.md (Amendment 5)"
gate: "docs/specs/atlax-seed.md#Acceptance → gate"
ui_review: false
autonomy: unattended
touches: [fn:organizer.App.Report, fn:organizer.App.ReportWindows, prod:agent-organizer.service.Report]
change_order:
  adds: [fn:organizer.App.Report, fn:organizer.App.ReportWindows]
  modifies: [prod:agent-organizer.service.Report]
  retires: []
---

## Goal
A change that breaks how Deltagos reads the factory report is a redline in atlax, not a surprise in the window.

## Gate
docs/specs/atlax-seed.md Amendment 5: S2 (the three files), S4 and S5 with --card, X0.

## Pre-answered
- Base: origin/main with lf59-atlax-surface merged.
- Merge target: `main` through talos-lab's PR.
- The change order above is final: it is committed before the card goes now, as atlax requires.
- Files: the ready versions in `.wt-notes/l59-surface/authored-ready/` (l59-surface's), checked against the merged slice.
- Tests: none written; each authored element names its existing test in `internal/service/report_test.go`.
- Short-sample fallback: an element whose named test fails stays unauthored, removed from the change order by a note to the FSE, never by editing the frozen order.
- Data shape across states: element files per `contracts/atlax/element.schema.json`.
- Evidence: `atlax verify --card --json` under `.wt-notes/<seat>/`.
- Never `atlax publish` or `atlax check` from the card.
- Retention: n/a.
