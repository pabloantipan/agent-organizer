---
title: "Deltagos's factory-report readers become authored atlax promises"
status: now
repos: [organizer]
branch: lf59-atlax-authored
seat: l59-authored
stage:
updated: 2026-11-01
next: "PR with talos-lab"
review: pass
reviewer: l59-authored-rev
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
prs:
  - {repo: organizer, pr: 25, target: main, state: merged, merge: a7bd633}
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

## Review
- **Verdict: pass.** Unmet gate items: none. Reviewer l59-authored-rev, 2026-11-01, at 62fe627 on a1c0f7a, from a clean clone.
- Pin: the card was added at 3fe9e92, an ancestor of c6aaeb8; `git diff c6aaeb8` leaves `touches:` and `change_order:` unchanged. Holds.
- change-check (default base): base 49656bd (local main, which does not contain a1c0f7a), 108 files, 105 undeclared, all `added` files of lf59-atlax-surface plus a "high suggested" risk on two of them (ResetPassword, cli.login): the default base is behind origin, nothing of this card. With `--base a1c0f7a`: `3 files, 0 flags` (the three declared files, modified; tests touched none).
- S2: the three files valid against `element.schema.json` (Draft 2020-12, jsonschema 4.26, specs ca14f12). Samples exist: `factory-report/expected.json`, `factory-report/expected-windows.json`. ReportText untouched since a1c0f7a, `authored: false`. `internal/` identical to a1c0f7a; both tests are on the base (report_test.go:121, :259).
- Tests (`go test ./internal/service -run '^<name>$' -v`):
  - TestReportDecodesContract: CONTRACTS_DIR=specs-230 PASS; CONTRACTS_DIR=<empty dir> FAIL "contract sample expected.json is missing"; unset with HOME=<empty dir> FAIL, same line.
  - TestReportWindows: CONTRACTS_DIR=specs-230 PASS; <empty dir> FAIL "contract sample expected-windows.json is missing"; unset with empty HOME FAIL, same.
- S4/S5: `atlax verify --repo <clone> --base a1c0f7a --card working-on/lf59-atlax-authored.md` → `atlax verify agent-organizer: 0 finding(s), 0 blocking; exit 0` (atlax 69d0e77, change order frozen 2026-11-01T22:18:18Z).
- X0: fresh run (not replayed), `make test` exit 0 (Go all ok, vitest 1431 passed), `git status --porcelain` empty.
- Note 1 (to the FSE via sup102): with CONTRACTS_DIR set to the empty string both tests PASS on this Mac: `reportContractDir` falls back to `~/agent-slack/specs/contracts`, which holds the samples. "Fails with an empty CONTRACTS_DIR" therefore depends on the machine; read it as an empty directory (done above).
- Note 2 (to the FSE via sup102): change-check's default base is local main, which lacks the origin merge a1c0f7a; review prompts on this route should pass `--base`.
