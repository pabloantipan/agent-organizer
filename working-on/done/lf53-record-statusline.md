---
title: "No dead 409 branch in cell registration, and the statusline test reads a real captured payload"
status: done
repos: [organizer]
branch: lf53-record-statusline
seat: l53-stat
reviewer: l53-stat-rev
review: pass
stage:
updated: 2026-10-25
next: "merge lf53-record-statusline (a3d8128); review passed"
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

## Review
**Verdict: pass.** Unmet gate items: none. Reviewer `l53-stat-rev`, 2026-10-25, at a3d8128 from a clean clone.

change-check (`change-check organizer lf53-record-statusline`, base 73e1405b0, 8 files):
```
| outside boundary | organizer/CLAUDE.md |  | modified |
| undeclared | organizer/internal/record/record_test.go |  | modified |
| undeclared | organizer/internal/service/factory_test.go |  | modified |
| untested? | organizer/internal/cli/crew.go | statuslineCmd | no test file names it |
| declared, not changed |  | internal/record/record_test.go:TestIssueRevokeAndRegister | no matching change |
| declared, not changed |  | internal/session/session.go:CaptureEnv | no matching change |
| declared, not changed |  | internal/service/factory_test.go:TestRegisterCellWritesPushAndRegistersWhenAFactory | no matching change |
7 flags: outside boundary 1, undeclared 2, declared, not changed 3, untested? 1
```
- outside boundary CLAUDE.md: Amendment 1 adds the one Record sentence to the boundary; the diff changes exactly that sentence to "a 2xx counts as registered; the record upserts".
- undeclared record_test.go, factory_test.go and declared-not-changed TestIssueRevokeAndRegister, TestRegisterCellWritesPushAndRegistersWhenAFactory: the same two changes. The builder declared them as `file:TestFunc`, and change-check resolves no symbols in test files, so it reports one change twice. The diff changes exactly those two functions.
- declared-not-changed CaptureEnv: the diff adds `const CaptureEnv` at session.go:125, and change-check lists only the func `Capture`. A const it does not resolve.
- untested? statuslineCmd: crew.go has no CLI test. `Capture` is tested in `internal/session`. I ran the built binary on the fixture: unset gives exit 0 and no capture file; set gives a byte-identical copy at mode 0600; an unwritable path prints `organizer statusline: capture: open …: no such file or directory` on stderr and the line still prints, exit 0.

Gate:
- R1 met. `go test ./internal/record -run TestIssueRevokeAndRegister` PASS: 201 nil, 409 error, 500 error. `grep -n -e 409 -e StatusConflict internal/record/record.go` is empty. On main's record.go (73e1405) the same test fails `record_test.go:134: 409 is a failure` and factory_test fails `factory_test.go:190: 409 should be an error: <nil>`. Amendment 1: factory_test runs a second 2xx for idempotence and expects 409 to be an error containing "409"; CLAUDE.md is as above.
- L1 met. `internal/session/testdata/statusline.json`: the id, transcript, cwd, scratchpad, prompt_id, workspace dirs and repo, session_name, total_cost_usd (1.25) and every `*_at` are stand-ins, with no real path, id or cost. Removing `cost.total_cost_usd` fails `session_test.go:74: … session.go reads "cost.total_cost_usd", the captured payload has no such field`, and removing `model.display_name` names that field. TestCapture shows that unset writes nothing.
- X0 met. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: exit 0, every Go package ok, vitest 86 files and 1297 tests passed. `test-lease run -- wails build`: exit 0. `git status --porcelain`: empty, and wailsjs/runtime was unchanged.

Note: L1's "fails on main" holds only because the check does not exist on main. Main has no fixture and no field test, and the branch's session tests fail to compile against main's session.go (`undefined: Capture`). The field check alone would pass on main, since `statusInput` is unchanged. The gate row would be clearer as "absent on main".
Note: I cannot check the fixture's "every key kept" against the raw capture, because the raw capture was deleted (progress.md phase 3). The key set (prompt_cache, rate_limits, effort, thinking, output_style, …) reads as a full current payload, and the capture method is on the card's Notes.
Builder's "Found, not asked" (unused keys kept in the fixture) needs no destination. It describes the fixture and is not a defect. I found nothing outside the gate.
