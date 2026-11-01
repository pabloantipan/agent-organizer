---
title: "Deltagos's factory-report readers become authored atlax promises"
status: now
repos: [organizer]
branch: lf59-atlax-authored
seat: l59-authored
stage:
updated: 2026-11-01
next: "review: lf59-atlax-authored, gate met (S2, S4, S5, X0 pass), 62fe627"
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

## Declared changes
- modified `atlax/elements/fn.organizer.App.Report.yaml`: authored, live; contract `contracts/factory-report/expected.json`, test `TestReportDecodesContract`
- modified `atlax/elements/fn.organizer.App.ReportWindows.yaml`: authored, live; contract `expected-windows.json`, test `TestReportWindows`
- modified `atlax/elements/prod.agent-organizer.service.Report.yaml`: authored, planned → live; names test `TestReportDecodesContract`; comment and summary drop "planned"
Risky:
- the three elements: a change to `report_test.go`, the samples or these files now needs a card's change order (book guard)
Not changed, on purpose:
- `atlax/elements/fn.organizer.App.ReportText.yaml`: its test needs the real `factory`

## Done
- 2026-11-01 l59-authored: 62fe627 on lf59-atlax-authored (unmerged; talos-lab's PR). Both tests pass with CONTRACTS_DIR and fail naming the sample with an empty dir; S2 valid, `atlax verify --card` exit 0 no finding, X0 pass. Evidence in `.wt-notes/l59-authored/`.
