# Leftovers 35: focus you can see on every surface, busy colours that follow their roles, a sent thread that never shows: the build spec

status: proposed (0133)
by: the FSE, 2026-10-15, on main at 3f52a92
sources: lf34-busy-focus's UI review (`working-on/done/lf34-busy-focus.md`,
`## UI review`, U5, U6), answered by Aglaea in
`docs/ux/specs/launch-progress.md` Amendment 9 (bb59da8, L29, L30) and in
thread 01M500DD (U5's answer; the tidy's done findings, 0131: keep ram-view's
`agentTarget` and Rescan placement, keep redesign-roadmap's gem radius, drop
the other four). Gate rows follow 0095 and 0108: no row drives Pablo's
desktops, focus or input, starts a real seat, or writes the real clipboard.

## Requirements, card `lf35-ring-tokens` (frontend)

- **FR-1** (L30) `--focus-ring` is `--violet-11` (#c0abfe) app-wide,
  instead of `--violet-9` (#8a3ffc). The accent and the accent "you are
  here" line (initiatives-view A5) stay #8a3ffc. No other ring colour is
  hard-coded: any rule drawing focus with the accent or a literal reads
  `--focus-ring`.
- **FR-2** (L29, the design system's Derived tokens) Every `--busy-*` token
  names its source role in a comment beside it (`--busy-fg-on-accent` gets
  `/* --fg-on-accent */`). A vitest reads `tokens.css` and fails when a
  twin's rgb is not its source's resolved rgb at the twin's alpha.
- **FR-3** (U5, Aglaea in 01M500DD) A new thread or a branch that was sent
  (`PostToCell` returned an id) and that the feed has not listed after
  `LIST_WAIT_MS` (Crew's two-feed rule, one constant, not a copy): Send
  leaves busy, the form clears, the live region says `Sent. The thread
  shows when the feed lists it.`, and focus goes to the docked message
  box's field. If the thread shows later, focus does not move. Never the
  word "failed".
- **FR-4** (ram-view finding, Aglaea's first) A memory session's `Agents ›`
  finds its row by the agent's key (`<session>#<pid>`, carried on the row
  as a data attribute), not by its place in a list. The landing is tested
  on the DOM side.
- **FR-5** (ram-indicator §1, rides with FR-4) The top bar reads Usage,
  memory, Rescan, in that order (today Rescan comes before Usage).
- **FR-6** (redesign-roadmap finding, Aglaea's last) `.srm-gem`'s radius is
  4px, on the 4/6/8/12 scale.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| R1 | 1 | Tab harness in WKWebView at 1024×640, fixture: focus a control on the crew panel, one in a drawer (the card back), a selected rail row, and a pressed control; computed `outline-color` and its contrast against the surface behind it | `rgb(192,171,254)` on all four, each ≥ 3:1 |
| R2 | 1 | `grep` over `frontend/src` for focus rules (`:focus`, `:focus-visible`) naming `--accent`, `#8a3ffc` or `rgb(138` | none; the A5 "you are here" line still #8a3ffc |
| R3 | 2 | vitest over `tokens.css`: every `--busy-*` has a source comment and matches it at its alpha; then the same test with `--fg` changed alone (a fixture string, not the file) | passes on the file; fails on the changed copy |
| R4 | 3 | vitest of Conversations with a fake `PostToCell` that returns an id and a feed that never lists it, timers faked past `LIST_WAIT_MS`; then the feed lists it | Send not busy, form cleared, region text exact, focus on the docked field; after the late listing focus unchanged; no "failed" |
| R5 | 4 | vitest with a DOM (or the harness): two agents whose list order differs from the feed's order; `Agents ›` on the second | focus on the row whose key matches, not the one at its index |
| R6 | 5, 6 | Tab harness: the top bar's button order; computed `border-radius` of a `.srm-gem` | Usage, memory, Rescan; `4px` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf35-ring-tokens`: `styles/tokens.css` and any stylesheet with a focus
  rule that does not read `--focus-ring`; a tokens test in `lib/` (or
  beside `tokens.css`); `Conversation.tsx` (FR-3) and `Crew.tsx` only to
  export or share `LIST_WAIT_MS`; `lib/agentFocus.ts`, `AgentsView.tsx` and
  the agent row's component (FR-4); the top bar's component (FR-5);
  `styles/roadmap.css` (FR-6); their tests; `docs/design-system.md` only to
  say the ring is violet-11. Not: Go, `Gate.tsx`, `lib/queue.ts`.

## No-gos

- No new service call. The accent fill and the A5 line keep #8a3ffc. No
  `color-mix`, `oklch` or nesting (the Safari 15 floor).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf35-ring-tokens` | R1, R2, R3, R4, R5, R6, X0 | — | true |
