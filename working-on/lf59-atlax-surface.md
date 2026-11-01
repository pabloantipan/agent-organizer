---
title: "Deltagos's atlax slice names every Wails method and CLI command"
status: now
repos: [organizer]
branch: lf59-atlax-surface
seat: l59-surface
stage:
updated: 2026-11-01
next: "review: lf59-atlax-surface, gate met (S1, S2, S4/S5 with --card, X0) at 2f0d7b6; FR-8 authored none: the change order froze at 600b8f2 with adds: [], three ready for a follow-up card (Notes)"
depends_on: [lf59-atlax-record]
boundary: ["atlax/"]
spec: "docs/specs/atlax-seed.md (Amendment 4, FR-7 to FR-9)"
gate: "docs/specs/atlax-seed.md#Acceptance → gate"
ui_review: false
autonomy: unattended
touches: []
change_order:
  adds: []
  modifies: []
  retires: []
---

## Goal
The factory model shows everything Deltagos offers its window and its CLI, and atlax tells the FSE when one of its promises breaks.

## Gate
docs/specs/atlax-seed.md Amendment 4: S1, S2 (every derived element has exactly one file), S4 and S5 with --card, X0.

## Pre-answered
- Base: origin/main at the card's start, with lf59-atlax-record merged.
- Merge target: `main` through talos-lab's PR.
- Tool: `atlax` at claudecode 3d7aea5 or later (a worktree at origin/main, never ~/claudecode's working tree); contracts at specs 230a515 or later.
- `touches:` and `change_order.adds` are filled by the builder with exactly the elements it authors (FR-8); the rest are unauthored files and need no change order.
- Tests: none written; an authored element names an existing test that reads a contract sample.
- Short-sample fallback: an element whose test or sample is missing stays unauthored, with the reason in the card's Notes.
- Data shape across states: element files per `contracts/atlax/element.schema.json` at the specs pin.
- Evidence: `atlax derive --json` and `atlax verify --card --json` under `.wt-notes/<seat>/`.
- Never `atlax publish` or `atlax check` from the card.
- Retention: n/a.

## Notes
- Derive on b56a224 (claudecode ca24ea2): 81 wails and 26 cli, 107 files; the spec's 78 counted an earlier main. Every file is named and designated as derive gives it, `authored: false`, `lifecycle: live`.
- FR-8, which qualify: only the factory-report readers have a contract sample and an existing test reading it on the base: `fn:organizer.App.Report` (`contracts/factory-report/expected.json`, `TestReportDecodesContract`), `App.ReportWindows` (`expected-windows.json`, `TestReportWindows`), `App.ReportText` (`expected.txt`, `TestReportTextRealFactory`), all in `internal/service/report_test.go`, all passing.
- FR-8, why none is authored here: `atlax verify` counts the change order as committed when the card first went now (600b8f2, `adds: []`); listing the three in `touches:` and `adds` gave six blocking book-guard findings ("the card lists X now, but its change order frozen at 2026-11-01T21:51:35Z did not"). The Pre-answered "filled by the builder" predates that rule. The authored versions are ready in `.wt-notes/l59-surface/authored-ready/`; a follow-up card whose change order lists them before it goes now flips them.
- Stay unauthored, by group: `App.Usage`, `cli.usage` (the sample is the post's, authored on `prod:agent-organizer.record.PostUsage`; usage.View has none); `GetBoard`, `cli.status`, `cli.board`, `cli.decisions`, `RuleDecision`, `cli.rule` (the working-on sample is the scanner's, `prod:agent-organizer.scan.ReadInitiative`; their outputs have none); the cell, crew, retire, review, lock, auth, order, float, config and type-only methods and the other commands (no sample in agent-mailbox-specs).
- FR-9: 23 elements carry `consumes:` (mailbox health, thread get, threads list, messages post, thread status, search, drain, healthz; record cells post, usage post, keys issue and revoke), traced from the discuss and record call sites; the map is in `.wt-notes/l59-surface/progress.md`. All resolve against ~/atlax e7816b4.
- `prod:agent-organizer.service.Report` (planned, unauthored) has its test on main since lf57-report-go; left as it is (boundary: the 13 existing files untouched).
- Authoring `App.ReportText` would make verify need the real `factory` installed (the test skips only under CI).

## Declared changes
- added `atlax/elements/fn.organizer.App.*.yaml` (81 files): one unauthored element per Wails-bound method (FR-7), consumes: where it reads the mailbox or the record (FR-9)
- added `atlax/elements/fn.organizer.cli.*.yaml` (26 files): one unauthored element per organizer subcommand (FR-7, FR-9)
Risky:
- `consumes:` lines: a later change to a mailbox or record promise now notifies organizer-fse for these 23 elements; over-traced ones (doctor's healthz is read only with a TCP bind) would be noise
Not changed, on purpose:
- the 13 existing element files and `atlax/plant.yaml`: derive designates none of them
- `touches:` and `change_order.adds`: empty, since the frozen change order allows no authored element on this card
- no code, test or fixture

## Done
- 2026-11-01 l59-surface: 107 element files on lf59-atlax-surface (fac5c89 wails, 2f0d7b6 cli), unmerged; S1, S2, S4/S5 with --card and X0 met; FR-8 waits for a follow-up card.
