---
title: The frontend's pure logic gets a test runner
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "sup17 runs this card (organizer-probe-sup17), spawned by the FSE 2026-09-29 after sup16 ended"
depends_on: ["cell-definition-finish"]
boundary: ["frontend/package.json and package-lock.json (vitest as a dev dependency, a test script)", "frontend/vite.config.ts (the test block) or a vitest config", "frontend/tsconfig.json (only if the tests need it)", "frontend/src/lib/*.test.ts (new)", "Makefile (the test target)", "CLAUDE.md (Commands: the frontend test line)"]
spec: "working-on/decisions/0052-frontend-logic-gets-tests.md (ruled: vitest over lib/); no function in frontend/src/lib changes behaviour"
gate: "the Gate section below"
stage:
seat:
---

## Goal
0052: the frontend's pure logic in `frontend/src/lib/` is checked by tests,
starting with the Needs me queue and the initiative states, so a gate no
longer needs a screenshot to prove a boolean.

## Gate
- [ ] G1: `cd frontend && npm test` runs vitest once (no watch) and exits 0,
  with tests for `needsMeRows`/`queueOf` (`lib/queue.ts`: a proposed record
  owned by the lead, an escalated thread, a `pablo:` card, a Solved mark
  removing a row, FR-7's Launch row for a non-draft cell in definition and
  none for a draft) and for `initiativeStates` (`lib/initiativeState.ts`:
  one case per state, you, executing, business, quiet). Evidence: the
  command's output and exit code.
- [ ] G2: each G1 test fails when its rule is broken: the reviewer inverts
  one condition in each of the two files, runs `npm test`, sees it fail,
  and restores the file. Evidence: the two failing outputs.
- [ ] G3: `make test` runs `go vet`, `go test` and the frontend tests, and
  exits non-zero when a frontend test fails. Evidence: `XDG_DATA_HOME=$(mktemp -d) make test`
  exit 0, and exit non-zero with one test broken on purpose.
- [ ] G4: `cd frontend && npm run build` exits 0 and `frontend/dist` holds no
  test file; `git diff main -- frontend/src/lib/*.ts ':!*.test.ts'` is empty
  (no behaviour changed). Evidence: both outputs.
- [ ] G5: CLAUDE.md's Commands list `cd frontend && npm test`. Evidence: the line.

## Done
- 2026-09-29 cut from 0052 by the FSE

## Next
1. sup17 runs this card

## Blockers
none

## Notes
- 2026-09-29 sup17 runs this card, spawned by the FSE after cell-definition-finish landed (b002aa3)
- 0052's consequence: from now on, every spec's "nothing else broke" row
  includes `cd frontend && npm test`.
- forecast (by docs/estimating.md; 0052 was ruled without one): 19–32 min of
  wave time over 1 wave; basis: 21 cards in 9 single-wave tasks, this
  initiative.
