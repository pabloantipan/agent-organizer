---
title: "No dead 409 branch in cell registration, and the statusline test reads a real captured payload"
status: now
repos: [organizer]
branch: lf53-record-statusline
seat: l53-stat
stage:
updated: 2026-10-25
next: "decide: FR-7 breaks internal/service/factory_test.go:183-187 (TestRegisterCellWritesPushAndRegistersWhenAFactory asserts '409 should count as registered'), outside my boundary; may l53-stat flip it to expect an error (and CLAUDE.md's Record line, '2xx or 409 both count as registered')? Branch at 7aee595, R1 and L1 pass, X0 fails only on that test"
depends_on: []
boundary: ["docs/specs/leftovers-53.md Boundary, lf53-record-statusline"]
spec: "docs/specs/leftovers-53.md (FR-7 to FR-8)"
gate: "docs/specs/leftovers-53.md#Acceptance → gate"
ui_review: false
---

## Goal
A renamed statusline field fails a test instead of turning into zeros.

## Notes
- 2026-10-25: X0 from a clean clone fails only `internal/service` `TestRegisterCellWritesPushAndRegistersWhenAFactory` (factory_test.go:186, "409 should count as registered"), which pins the dead branch FR-7 removes; the file is outside this card's boundary. CLAUDE.md's Record paragraph says the same.

## Gate
docs/specs/leftovers-53.md, rows R1, L1 and X0.

## Notes
- FR-8 capture (sup94, 2026-10-25): the root's git-ignored `.claude/settings.local.json` overrode the statusLine from 02:01:59 to 02:02:20 with `.wt-notes/l53-stat/capture-wrap.sh`. It ran the branch build (456a804) with `ORGANIZER_STATUSLINE_CAPTURE` for `AGENT_NAME=sup94` only; every other session ran the installed organizer. `~/.claude/settings.json` and the installed binary were not touched. FSE accepted, no recapture.
