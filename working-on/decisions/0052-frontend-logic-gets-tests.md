---
title: The frontend's pure logic gets a test runner
status: ruled
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [vitest over lib/, move the logic to Go, no frontend tests]
chosen: vitest over lib/
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

Two reviews in a row found frontend logic no test covers, because the
frontend has no test runner (`frontend/package.json` has dev, build and
preview; `make test` is `go vet` and `go test`):

- sup14: nothing tests the Decisions tab's Rule condition
  (`runs/2026-09-28-rule-anyone-and-reinstall.md`);
- sup15: nothing tests Overview's gate into building
  (`runs/2026-09-28-discovery-in-a-cell.md`, point 5).

The queue (`lib/queue.ts`), the initiative states (`lib/initiativeState.ts`)
and the health words (`lib/health.ts`) are also proved only by screenshots.
Gates that need a screenshot for a boolean cost a builder minutes and a
reviewer a judgement. Should the frontend's pure logic get tests?

## Options

- **vitest over lib/**: add vitest as a dev dependency, a `test` script,
  and `make test` running it after `go test`. Tests only for pure functions
  in `frontend/src/lib/`; components that hold logic move it there when a
  card touches them. Cost: one card (runner, the Makefile line, tests for
  `queueOf` and `initiativeStates` as the first two); every later card's G5
  runs it.
- **move the logic to Go**: the service computes queue, states and gates and
  the frontend only draws them. Cost: large; it re-opens where the queue is
  defined (CLAUDE.md: one definition in `lib/queue.ts`).
- **no frontend tests**: screenshots stay the proof. Cost: none now; the
  finding recurs on every card with frontend logic.

## Recommendation

The FSE's: vitest over lib/. It is the smallest change that turns the two
findings into checks, and it keeps the queue's one definition where it is.

## Ruling

pablo, 2026-09-29, in the organizer on lodestar: Do

## Consequences

On "vitest over lib/": the FSE cuts one card (runner and first tests), and
G5 of every spec from then on includes `cd frontend && npm test`.
