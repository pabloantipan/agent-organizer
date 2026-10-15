# Leftovers 34: one word for alive seats, a busy control keeps focus, focus then words: the build spec

status: proposed (0130)
by: the FSE, 2026-10-15, on main at 5a3ed0b
sources: lf33-press-running's UI review (`working-on/done/lf33-press-running.md`,
`## UI review`, U1-U3), answered by Aglaea in `docs/ux/specs/launch-progress.md`
Amendment 7 (81d5e4d, L26, L27, L24 amended) and the design system's busy
rule it added (`docs/design-system.md`). Gate rows follow 0095 and 0108: no
row drives Pablo's desktops, focus or input, starts a real seat, or writes
the real clipboard.

## Requirements, card `lf34-busy-focus` (frontend)

- **FR-1** (L26) A seat the press reports running (leftovers-33 FR-2)
  reads the word a feed-running, not-working row draws (`stateWord`, today
  `idle`), not `running`. The next feed changes no word unless the seat is
  working.
- **FR-2** (L27, the busy rule) A pressed control that waits on the
  service takes `aria-disabled="true"` instead of `disabled`, shows its
  gerund label, ignores presses, and keeps focus until the result moves it.
  One helper in `lib/` (props for the button and a guarded handler), used
  by: the crew confirm's Start (`Starting…`, until the list heading or the
  race's `Attach` takes focus), Draft the cell's Open (`Opening…`), New agent's Start (`Starting…`), the rule
  box's Rule (`Ruling…`), Retire's run (`Retiring…`), the card back's
  comment save (`Saving…`), and Conversations' two Send buttons
  (`Sending…`). A control disabled for another reason (empty text, no
  choice) keeps `disabled`. Out of scope: `Gate.tsx` (sign-in, firebase
  only, which no seat may run).
- **FR-3** (L24 amended) After the race and after a feed closes the
  confirm, focus moves to `Attach` first and the live region then says
  `Every seat is already running`. The race already does this
  (leftovers-33); the feed-closed confirm changes to match.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| F1 | 1 | Tab harness at 1024×640 with the probe stub: leftovers-32's N1 race (stale feed with fse off, press Start); read every seat row's state word at once and after the next `applyAgents` | fse and its alive, not-working peers all read `idle`; no word changes after the feed |
| F2 | 2 | vitest of the helper: busy props, a press while busy ignored; vitest per control listed in FR-2 with a pending fake call: attribute, label, `document.activeElement` | `aria-disabled="true"`, no `disabled`, the gerund, the handler not called twice, focus on the control, never `body` |
| F3 | 2 | Tab harness with the stub: focus Start, press, read `document.activeElement` every 20 ms until the list heading has focus | Start (aria-disabled, `Starting…`) then the heading; never `body` |
| F4 | 3 | Tab harness: leftovers-32's N3 (confirm open, focus on Start, `applyAgents` with the seat live) and N1's race; the order of focus change and live-region text | in both, focus on `Attach` before the region's text is set |
| F5 | 2 | vitest per control of FR-2 with a fake call that resolves: where focus is after the result; for a new thread and a branch in Conversations, the new thread's divider (as a `landOn` landing does) | a named target for each, never `body`: the list heading or `Attach` (Start), the new seat's row (New agent), the record (Rule), the crew block (Retire), the comment field (Save), the reply field (docked Send), the new thread's divider (new thread, branch) |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf34-busy-focus`: a new helper in `lib/` and its test; `Crew.tsx`,
  `AgentsView.tsx` (Draft the cell's Open, New agent's Start), `RuleDecisionBox.tsx` (Rule),
  `Retire.tsx` (the run button), `CardDrawer.tsx` (the comment save),
  `Conversation.tsx` (the two Send buttons), only where FR-1 to FR-3
  change them, and their tests; the stylesheets only for an
  `[aria-disabled="true"]` look matching today's disabled one. Not: Go,
  `Gate.tsx`, `lib/queue.ts`.

## No-gos

- No new service call. No change to any control that is disabled for a
  reason other than waiting.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf34-busy-focus` | F1, F2, F3, F4, X0 | — | true |

Amendment 1, 2026-10-15, the FSE, from bf-ui's fail at 87abf10 (0108): the
gate checked only the pending state, while FR-2 and the design system's
rule say focus is kept until the result moves it, never to the body. U1
(sev 3): a new thread or a branch in Conversations drops focus to the body
once sent. So:
- **F5** added: after the result, each control's focus lands on a named
  target, never `body`; a new thread and a branch land on the new thread's
  divider.
- FR-2's "New agent's Open" named no control (the builder rightly took
  Draft the cell's Open): it now names Draft the cell's Open and **New
  agent's Start** (`Starting…`), whose second press today starts a second
  seat (U2).
- The rule box's words field stays focusable while ruling (`readOnly`,
  not `disabled`), so Cmd+Enter from it keeps focus (U3).
U4 (a busy control's focus ring is dimmed under 3:1) waits on Aglaea.
