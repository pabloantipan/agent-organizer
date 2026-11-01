---
title: "Deltagos's atlax slice names every Wails method and CLI command"
status: done
repos: [organizer]
branch: lf59-atlax-surface
seat: l59-surface
stage:
updated: 2026-11-01
next: "done: PR #23 merged a1c0f7a (2026-11-01)"
review: pass
reviewer: l59-surface-rev
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
prs:
  - {repo: organizer, pr: 23, target: main, state: merged, merge: a1c0f7a}
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
- Derive on b56a224 (claudecode ca24ea2): 81 wails and 26 cli, 107 files; the spec's 78 counted an earlier main. Every file is named and designated as derive gives it, `authored: false`, `lifecycle: live`. (went: to the FSE via sup102; the gate counts every derived element)
- FR-8, which qualify: only the factory-report readers have a contract sample and an existing test reading it on the base: `fn:organizer.App.Report` (`contracts/factory-report/expected.json`, `TestReportDecodesContract`), `App.ReportWindows` (`expected-windows.json`, `TestReportWindows`), `App.ReportText` (`expected.txt`, `TestReportTextRealFactory`), all in `internal/service/report_test.go`, all passing. (went: lf59-atlax-authored)
- FR-8, why none is authored here: `atlax verify` counts the change order as committed when the card first went now (600b8f2, `adds: []`); listing the three in `touches:` and `adds` gave six blocking book-guard findings ("the card lists X now, but its change order frozen at 2026-11-01T21:51:35Z did not"). The Pre-answered "filled by the builder" predates that rule. The authored versions are ready in `.wt-notes/l59-surface/authored-ready/`; a follow-up card whose change order lists them before it goes now flips them. (went: lf59-atlax-authored, atlax-seed Amendment 5)
- Stay unauthored, by group: `App.Usage`, `cli.usage` (the sample is the post's, authored on `prod:agent-organizer.record.PostUsage`; usage.View has none); `GetBoard`, `cli.status`, `cli.board`, `cli.decisions`, `RuleDecision`, `cli.rule` (the working-on sample is the scanner's, `prod:agent-organizer.scan.ReadInitiative`; their outputs have none); the cell, crew, retire, review, lock, auth, order, float, config and type-only methods and the other commands (no sample in agent-mailbox-specs). (went: to the FSE via sup102)
- FR-9: 23 elements carry `consumes:` (mailbox health, thread get, threads list, messages post, thread status, search, drain, healthz; record cells post, usage post, keys issue and revoke), traced from the discuss and record call sites; the map is in `.wt-notes/l59-surface/progress.md`. All resolve against ~/atlax e7816b4. (went: to the FSE via sup102)
- `prod:agent-organizer.service.Report` (planned, unauthored) has its test on main since lf57-report-go; left as it is (boundary: the 13 existing files untouched). (went: lf59-atlax-authored)
- Authoring `App.ReportText` would make verify need the real `factory` installed (the test skips only under CI). (went: lf59-atlax-authored, Amendment 5 keeps it unauthored)

## Declared changes
- added `atlax/elements/fn.organizer.App.*.yaml` (81 files): one unauthored element per Wails-bound method (FR-7), consumes: where it reads the mailbox or the record (FR-9)
- added `atlax/elements/fn.organizer.cli.*.yaml` (26 files): one unauthored element per organizer subcommand (FR-7, FR-9)
Risky:
- `consumes:` lines: a later change to a mailbox or record promise now notifies organizer-fse for these 23 elements; over-traced ones (doctor's healthz is read only with a TCP bind) would be noise (went: to the FSE via sup102)
Not changed, on purpose:
- the 13 existing element files and `atlax/plant.yaml`: derive designates none of them
- `touches:` and `change_order.adds`: empty, since the frozen change order allows no authored element on this card
- no code, test or fixture

## Review
Verdict: **pass**. Unmet gate items: none.
Reviewer: l59-surface-rev, 2026-11-01, on 2f0d7b6 (branch not moved), base b56a224, from a clean clone.

- Pin: card added at f781612, an ancestor of 600b8f2; `git diff 600b8f2` leaves `touches: []` and `change_order` unchanged. Held.
- change-check (`change-check organizer lf59-atlax-surface`; it defaulted to moved main 7f4c981, rerun with `--base b56a224`, same result): `107 files, 0 flags` in the repo line; `1 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 1, untested? 0, could not read 0, boundary unreadable 0`. The one flag, `risk: high suggested (auth: …App.ResetPassword.yaml, …cli.login.yaml)`, is the filename heuristic on two YAML element files; no auth code changed. No undeclared, outside boundary or declared-not-changed line.
- S1: `atlax/plant.yaml` valid against `plant.schema.json` (Draft 2020-12, specs ca14f12).
- S2: `atlax derive --repo <clone> --json` (claudecode ca24ea2): wails 81, cli 26, http 0. `atlax/elements/` holds 120 files, 0 schema errors; every derived designation has exactly one file (missing 0, duplicated 0), filename = designation, kind and `terminal` (binding+signature / command) equal derive's, `owner: organizer-fse`, `authored: false`, `lifecycle: live`, one-line summary each. The 13 not derived are the pre-existing `prod:agent-organizer.*` files; the diff `b56a224..2f0d7b6` is 107 `A` lines only, so they are unchanged.
- S4/S5: `atlax verify --repo <clone> --base b56a224 --card working-on/lf59-atlax-surface.md` → `atlax verify agent-organizer: 0 finding(s), 0 blocking; exit 0` (plus the informational "touches not in the card's touches" list of the 107 unauthored designations).
- FR-7 summaries: 25 spot-checked against `app.go`, `floaticon_darwin.go`, `internal/service/` and `internal/cli/cli.go` (Report, ReportText, ReportWindows, ReadSpec, GetBoard, RetrySeat, Sleep, Wake, ResetPassword, SignOut, Runs, PickUp, SeenLaunch, StopStarting, ReviewFile, Clean, FloatListHeight, MemoryNotifications, CopyReviewPrompt, Help; cli config, memory, doctor, version, logout); all match.
- FR-8: authored count 0. Judged met: Amendment 5, the spec owner's, records that this card's change order froze with `adds: []`, moves the three qualifying readers to lf59-atlax-authored (already carded with them in `touches:`/`change_order`), and the Notes list which qualify and why each other stays unauthored. FR-8's "becomes authored here" no longer applies to this card as amended.
- FR-9: 23 elements carry `consumes:`, all on `agent-mailbox-api` / `agent-mailbox-record`, both published; verify reports no ext-break.
- X0: fresh run (lease queued behind 2 runs, real timings): `make test` exit 0, Go packages all ok, vitest 89 files / 1431 tests passed; `git status --porcelain` empty.
- Note: the gate was wrong for FR-8 as first written (Pre-answered "filled by the builder" against verify's change-order freeze); already corrected by Amendment 5. (went: lf59-atlax-authored)
- Note: the gate does not check FR-9's completeness (a mailbox or record call reached from a method without a `consumes:` line passes S2/S4); I traced none missing in the spot-checks but did not prove it for all 107. (went: to the FSE via sup102)

## Done
- 2026-11-01 l59-surface: 107 element files on lf59-atlax-surface (fac5c89 wails, 2f0d7b6 cli), unmerged; S1, S2, S4/S5 with --card and X0 met; FR-8 waits for a follow-up card.
