# Leftovers 11: roles-ui's findings, and Needs me's first five: the build spec

status: proposed (0085)
by: the FSE, 2026-10-04, on main
design: `docs/ux/specs/transversal-roles.md` Amendment 1 (Aglaea, f3535e7;
A2 and A3 already built in roles-ui) and roles-ui's UI review
(`working-on/done/roles-ui.md`, U1-U6); the design system's Focus and names.

## Problem

- **A1, a design change to Needs me (Pablo's yes needed):** with 14 rows,
  Roles starts below the fold on Home, so the glance it was built for fails.
- U1 (sev 2): after following a role's mail line, focus falls to the page in
  Conversations; after an initiative link, to the page on its Overview.
- U3, U4, U6 (sev 1): the strip's role items are named by name only; role
  rows do not share column tracks at 1024 strip; a landed session row's name
  says `running` while it shows `idle`.

## Requirements, card `roles-and-needs-me-five`

After drafts-per-chat (both change `Home.tsx`, `Conversation.tsx`).

- **FR-1** (A1) At compact and regular, Needs me shows its oldest five rows
  and then one row `Show the other N` (Ruled's pattern); the badge and the
  heading keep the total (`Needs me · 14`). Wide is unchanged. The definition
  of Needs me (0034, `needsMeRows`) is unchanged.
- **FR-2** (U1) A role's mail line lands focus on the targeted thread's
  divider; an initiative link lands focus on that initiative's header title.
- **FR-3** (U6) A landed session row's accessible name is built from the
  row's visible state label.
- **FR-4** (U3) A role item in the rail strip is named with its state and
  mail (`Hephaistos, live, 2 messages waiting`).
- **FR-5** (U4) Role rows share their column tracks at every class.
- Accepted as built, no work: U2 (a session's start reads `up 05:38`,
  Agents' own vocabulary; the spec's word "started" is amended to it); a
  session outside every initiative is shown as static text.

## Acceptance → gate

Rows name window or content, the rail state and the scrollbar kind; UI review
in `make review-build`, pinned; visual rows hit-tested in both engines.

| # | FR | Check | Expected |
|---|---|---|---|
| V1 | 1 | Home with 14 Needs me rows at a 1512×945 window (regular) and 1024×640 (compact), rail expanded; then wide | five rows and `Show the other 9`; heading `Needs me · 14`; Roles in view at 1512 without scrolling; wide unchanged |
| V2 | 2 | a role's mail line; an initiative link in the drawer | `activeElement` is the thread's divider; the header title |
| V3 | 3, 4 | the names log over a landed session row and a strip role item | the row's name says its visible state; the item's name carries state and mail |
| V4 | 5 | Home at a 1024×640 window, rail as a strip, three roles | doing-now and where columns aligned across role rows (DOM: equal track starts) |
| V0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`Home.tsx` and `home.css` (Needs me's five and the role rows' tracks),
`lib/queue.ts` (a helper for the first five only, `needsMeRows` unchanged)
and `lib/` tests, the roles drawer and rail item components and their CSS,
`Rail.tsx` (the role item's name), `AgentsView.tsx` (the landed row's name
only), `Conversation.tsx` and `SlackView.tsx` (focus on a landing only),
`InitiativeHeader.tsx` (focus target only), `testdata/` and
`scripts/fixture-home.sh` (a 14-row Needs me fixture). Not: Go,
`docs/design-system.md`.

## Technical notes

- Spec check (spec-craft 5b): FR-1 changes layout only; the badge equals the
  row count still (0034); no row asks for stored state. Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `roles-and-needs-me-five` | V1–V4, V0 | drafts-per-chat | true |
