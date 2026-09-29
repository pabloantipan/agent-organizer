---
title: The frontend's pure logic gets a test runner
status: done
repos: [organizer]
branch: main
updated: 2026-09-29
next: "merge: branch frontend-tests (21a44bb a6fe973 431357e 82e0db3), review passed"
depends_on: ["cell-definition-finish"]
boundary: ["frontend/package.json and package-lock.json (vitest as a dev dependency, a test script)", "frontend/vite.config.ts (the test block) or a vitest config", "frontend/tsconfig.json (only if the tests need it)", "frontend/src/lib/*.test.ts (new)", "Makefile (the test target)", "CLAUDE.md (Commands: the frontend test line)"]
spec: "working-on/decisions/0052-frontend-logic-gets-tests.md (ruled: vitest over lib/); no function in frontend/src/lib changes behaviour"
gate: "the Gate section below"
stage:
seat: tests-lib
review: pass
---

## Goal
0052: the frontend's pure logic in `frontend/src/lib/` is checked by tests,
starting with the Needs me queue and the initiative states, so a gate no
longer needs a screenshot to prove a boolean.

## Gate
- [x] G1: `cd frontend && npm test` runs vitest once (no watch) and exits 0,
  with tests for `needsMeRows`/`queueOf` (`lib/queue.ts`: a proposed record
  owned by the lead, an escalated thread, a `pablo:` card, a Solved mark
  removing a row, FR-7's Launch row for a non-draft cell in definition and
  none for a draft) and for `initiativeStates` (`lib/initiativeState.ts`:
  one case per state, you, executing, business, quiet). Evidence: the
  command's output and exit code.
- [ ] G2: each G1 test fails when its rule is broken: the reviewer inverts
  one condition in each of the two files, runs `npm test`, sees it fail,
  and restores the file. Evidence: the two failing outputs.
- [x] G3: `make test` runs `go vet`, `go test` and the frontend tests, and
  exits non-zero when a frontend test fails. Evidence: `XDG_DATA_HOME=$(mktemp -d) make test`
  exit 0, and exit non-zero with one test broken on purpose.
- [x] G4: `cd frontend && npm run build` exits 0 and `frontend/dist` holds no
  test file; `git diff main -- frontend/src/lib/*.ts ':!*.test.ts'` is empty
  (no behaviour changed). Evidence: both outputs.
- [x] G5: CLAUDE.md's Commands list `cd frontend && npm test`. Evidence: the line.

## Done
- 2026-09-29 cut from 0052 by the FSE
- 2026-09-29 sup17 launched builder tests-lib at 12:16 on branch frontend-tests
- 2026-09-29 tests-lib: gate G1 G3 G4 G5 met on branch frontend-tests (rebased onto main 99ecd7c; 21a44bb vitest + `test: vitest run`, a6fe973 `frontend/src/lib/queue.test.ts` 10 tests + `initiativeState.test.ts` 8 tests, 431357e Makefile, 82e0db3 CLAUDE.md). G1: `cd frontend && npm test` → "Test Files 2 passed (2) / Tests 18 passed (18)", EXIT=0 (.wt-notes/tests-lib/g1-npm-test.txt). G3: `XDG_DATA_HOME=$(mktemp -d) make test` → go vet, go test all ok, "Tests 18 passed (18)", EXIT=0 (.wt-notes/tests-lib/g3-make-test-pass.txt); with one expected key broken on purpose → "Tests 1 failed | 17 passed (18)", "make: *** [test] Error 1", EXIT=2 (.wt-notes/tests-lib/g3-make-test-fail.txt). G4: `npm run build` → "✓ built in", EXIT=0, `find dist -name '*test*'` → 0 (.wt-notes/tests-lib/g4-build.txt); `git diff main -- 'frontend/src/lib/*.ts' ':!*.test.ts'` → empty, lines=0 (.wt-notes/tests-lib/g4-lib-diff.txt). G5: CLAUDE.md Commands: `cd frontend && npm test                        # vitest once over frontend/src/lib (make test runs it after go test)`. G2 left to the reviewer; builder self-check: 14 inversions across both files, each fails the suite (.wt-notes/tests-lib/g2-selfcheck.txt). Lockfile is pnpm-lock.yaml, no package-lock.json; no vitest config added (vite.config.ts is read as is); tests stay in tsc's include and type-check.

## Next
1. review: a reviewer that is not tests-lib runs G2 and checks G1 G3 G4 G5 on branch frontend-tests

## Blockers
none

## Review
- Verdict: pass. Reviewer tests-review, 2026-09-29, branch frontend-tests at 82e0db3.
- Unmet gate items: none.
- G1: `npm test` → "Test Files 2 passed (2) / Tests 18 passed (18)", EXIT=0, runs once. Tests read against the functions: queue.test.ts covers a lead-owned proposed record, an escalated thread, a `pablo:` card, Solved marks removing a card and a thread, FR-7 Launch for a non-draft in-definition cell and none for a draft; initiativeState.test.ts one case per state plus the precedences. (.wt-notes/tests-review/g1-npm-test.txt)
- G2: queue.ts:131 `!g.cell.draft` → `g.cell.draft`: "Tests 2 failed | 16 passed", EXIT=1 (both FR-7 tests); initiativeState.ts:42 `o !== FSE` → `o === FSE`: "Tests 2 failed | 16 passed", EXIT=1 (business, quiet). Both files restored with git checkout; worktree status clean. (g2-queue-inverted.txt, g2-initiativeState-inverted.txt)
- G3: `XDG_DATA_HOME=$(mktemp -d) make test` → go vet, go test all ok, "Tests 18 passed", EXIT=0; with queue.test.ts expecting `decision:a/0070` → "Tests 1 failed | 17 passed", "make: *** [test] Error 1", EXIT=2; restored. (g3-make-test-pass.txt, g3-make-test-fail.txt)
- G4: `npm run build` EXIT=0; `find dist -iname '*test*' -o -iname '*spec*'` → 0, no "vitest" string in dist; `git diff main -- 'frontend/src/lib/*.ts' ':!*.test.ts'` → 0 lines. (g4-build.txt, g4-lib-diff.txt)
- G5: CLAUDE.md:59 `cd frontend && npm test                        # vitest once over frontend/src/lib (make test runs it after go test)`. (g5-claude-md.txt)
- Not covered by the gate: `make test` now needs `frontend/node_modules`; on a fresh clone it fails until `pnpm install` (no install step, no hint). The boundary names package-lock.json but the frontend is pnpm (sup17 noted it; the gate text should say pnpm-lock.yaml). Seat rows (deaf/capped) and FR-9's inactive initiatives in `needsMeRows` have no test; the gate did not ask for them.

## Notes
- 2026-09-29 sup17 runs this card, spawned by the FSE after cell-definition-finish landed (b002aa3)
- 0052's consequence: from now on, every spec's "nothing else broke" row
  includes `cd frontend && npm test`.
- forecast (by docs/estimating.md; 0052 was ruled without one): 19–32 min of
  wave time over 1 wave; basis: 21 cards in 9 single-wave tasks, this
  initiative.
- 2026-09-29 tests-lib: `pnpm install` warns "Ignored build scripts: esbuild"; build and vitest work regardless.
- sup17: the boundary says package-lock.json, but the frontend is pnpm (`frontend/pnpm-lock.yaml`); the builder updates pnpm-lock.yaml instead and adds no package-lock.json.
