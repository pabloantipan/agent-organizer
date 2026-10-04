# Needs me leaves out role relays: the build spec

status: ruled (0079)
by: the FSE, 2026-10-04, on main
ruling: 0079 (Pablo, 2026-10-04, in the Hephaistos session: "Do as you
say. In the order you proposed, taking care of the sequence"; relayed by
Hephaistos, thread 01M43W57REPSPT6K1588R5PNF6; ~/agent-slack/docs/decisions.md
2026-10-04, b2993a8), proposal (d).

## Problem

A transversal role is reached by posting to `pablo` with a subject starting
`[for <role>]` (the fse skill, "Roles"). Those threads are addressed to the
human's seat, so `needsMeThread` (`frontend/src/lib/queue.ts:61`) counts them
in Needs me. On 2026-10-04 four of the twelve "need you" rows were relays to
Hephaistos. They belong to the role the subject names, not to the human.

## Requirements

- **FR-1** A thread whose subject starts with `[for <role>]` (case-insensitive,
  any role word, leading spaces ignored) is not in the human's queue:
  `needsMeThread` returns false for it, so Needs me, its badge, the Agents
  pill and Conversations' needs-me worklist all leave it out. An escalated
  relay is still left out; the role answers it.
- **FR-2** Nothing else changes: the thread still shows in its chat, and a
  thread whose subject only contains `[for ` later on is unaffected.

## Acceptance → gate

| # | FR | Check | Expected |
|---|---|---|---|
| R1 | 1, 2 | `cd frontend && npm test`: queue.test.ts cases for `[for hephaistos] x` asked of the human, `[FOR aglaea] x` escalated, ` [for talos] x`, `re: [for hephaistos] x`, and a plain asked thread | the first three are not needs-me; the last two are |
| R0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build` | pass |

## Boundary

`frontend/src/lib/queue.ts` (`needsMeThread` only) and
`frontend/src/lib/queue.test.ts`. Not: components, Go, the discuss server.

## Technical notes

- Spec check: `needsMeThread` is the one predicate; `queueOf` and
  Conversation.tsx (`needsMe`) both read it (grep). Subject is on
  `CellThread` (`internal/service/cell.go:70`, json `subject`). No row asks
  for state. Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `needs-me-relays` | R1, R0 | — | false |
