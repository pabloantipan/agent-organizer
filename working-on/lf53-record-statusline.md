---
title: "No dead 409 branch in cell registration, and the statusline test reads a real captured payload"
status: now
repos: [organizer]
branch: lf53-record-statusline
seat: l53-stat
stage:
updated: 2026-10-25
next: "review: lf53-record-statusline, gate met (R1, L1, X0; Amendment 1), a3d8128"
depends_on: []
boundary: ["docs/specs/leftovers-53.md Boundary, lf53-record-statusline"]
spec: "docs/specs/leftovers-53.md (FR-7 to FR-8)"
gate: "docs/specs/leftovers-53.md#Acceptance → gate"
ui_review: false
---

## Goal
A renamed statusline field fails a test instead of turning into zeros.

## Notes
- 2026-10-25: X0 from a clean clone fails only `internal/service` `TestRegisterCellWritesPushAndRegistersWhenAFactory` (factory_test.go:186, "409 should count as registered"), which pins the dead branch FR-7 removes; the file is outside this card's boundary. CLAUDE.md's Record paragraph says the same. Resolved by Amendment 1 (184e534): both added to the boundary.

## Gate
docs/specs/leftovers-53.md, rows R1, L1 and X0.

## Notes
- FR-8 capture (sup94, 2026-10-25): the root's git-ignored `.claude/settings.local.json` overrode the statusLine from 02:01:59 to 02:02:20 with `.wt-notes/l53-stat/capture-wrap.sh`. It ran the branch build (456a804) with `ORGANIZER_STATUSLINE_CAPTURE` for `AGENT_NAME=sup94` only; every other session ran the installed organizer. `~/.claude/settings.json` and the installed binary were not touched. FSE accepted, no recapture.

## Done
- 2026-10-25: FR-7 and FR-8 built on `lf53-record-statusline` (2eda20c, 69d96d9, 519c819, f245d55, a3d8128), rebased on main; R1, L1 and X0 pass from a clean clone (every Go package ok, vitest 1297/1297, wails build ok, porcelain empty). Commands and outputs in `.wt-notes/l53-stat/progress.md`.

## Declared changes
- modified `internal/record/record.go:RegisterCell`: no 409 branch; a 2xx is registered, anything else is an error; the comment says the record upserts (FR-7)
- modified `internal/record/record_test.go:TestIssueRevokeAndRegister`: 201 registers, 409 and 500 are errors
- added `internal/session/session.go:CaptureEnv`: names the capture variable (FR-8)
- added `internal/session/session.go:Capture`: copies stdin to `$ORGANIZER_STATUSLINE_CAPTURE` when set, nothing otherwise (FR-8)
- modified `internal/cli/crew.go:statuslineCmd`: calls `session.Capture` before `Parse`; a capture failure goes to stderr and the line still prints
- added `internal/session/testdata/statusline.json`: payload captured from sup94's live session, every key kept; ids, paths, costs, repo and times are fixed stand-ins
- modified `internal/session/session_test.go`: `TestParse` reads the fixture instead of the hand-written `sample`; added `readPaths`, `missingPaths`, `TestCapturedPayloadHasEveryReadField`, `TestMissingFieldIsNamed`, `TestCapture` (L1)
- modified `internal/service/factory_test.go:TestRegisterCellWritesPushAndRegistersWhenAFactory`: idempotence is a second 2xx run; a 409 is an error (Amendment 1)
- modified `CLAUDE.md`: the Record sentence reads "a 2xx counts as registered; the record upserts" (Amendment 1)
Risky:
- `RegisterCell`: if a deployed record ever answers 409, `CreateCrew` now stops on it instead of reading it as registered
- `readPaths`: derives the read fields from `statusInput`'s json tags; a field read outside `statusInput` would not be checked
Not changed, on purpose:
- `internal/service/factory.go:registerCell`: passes `RegisterCell`'s error through unchanged
- `session.Parse`: still requires only `session_id`; the fixture test, not a runtime check, catches a renamed field
