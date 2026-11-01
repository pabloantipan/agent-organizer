# Leftovers 61: records waiting on the cells leave Needs me, one word per status: the build spec

status: accepted (0173, ruled 2026-11-01)
by: the FSE, 2026-11-01, on main after PR #16 (29e7d2c)
sources: Pablo's ruling of 0173, "take Aglaea's DS1-DS6", in the FSE
session on 2026-11-01; Aglaea's design `docs/ux/specs/decision-states.md`
(d05ea58), rows DS-a to DS-f; the UI review of lf54-decision-states
(UI2-UI4, A1-A2).

## Premises (read 2026-11-01 at 29e7d2c)

| Premise | Shown by |
|---|---|
| decision states are read through one helper (`isRulable`, `decisionTone`, the open and ruled buckets) since lf54-decision-states | `frontend/src/lib/decisions.ts`, `decisionStates.test.ts`; `internal/model/decision.go` |
| an `awaiting-cells` record is a Needs me row with the verb Open and part of the header's waiting count (0164 FR-6 with leftovers-54 Amendment 6) | `frontend/src/lib/queue.ts`, `Home.tsx`, `InitiativeHeader.tsx`, `lib/header.ts` |
| Overview's gate rows print the bucket ("ruled") for applied and acknowledged, and `organizer decisions` prints "waiting" for awaiting-cells | `Overview.tsx:60`; `internal/cli/decisions.go` |
| owner `operator` shows raw in Needs me, Decisions and the rule box | UI review UI4, shots under `.wt-notes/l54-states-ui/` |

## Requirements

Card `lf61-decision-states-ui` (frontend and CLI):

- **FR-1 (DS1)** Needs me, its badge, the initiative header's "N decisions
  waiting" and the FSE panel's "waiting on you" count the records the lead
  can rule (`proposed`) only. This replaces 0164's FR-6 and leftovers-54
  Amendment 6 FR-6a for Needs me: no awaiting-cells row.
- **FR-2 (DS2)** Decisions has a group "With the cells · N" between To
  rule and Ruled, absent when N is 0; each record in the waiting pair
  (badge "awaiting cells", dashed bar to today), expanded with the line
  "Waits on the cells it affects. Themis settles it." and no Rule.
- **FR-3 (DS3)** The header reads `N decisions waiting · 1 with the cells`
  in muted text, no badge (`1 with the cells` alone when nothing waits on
  the lead); pressing it opens Decisions at that group.
- **FR-4 (DS4)** `applied` and `acknowledged` badges, bars and diamonds are
  in the ruled pair; status words are written with a space.
- **FR-5 (DS5)** Every place that names a status uses its word: Overview's
  gate rows read `applied 21 Oct`, `acknowledged 20 Oct`, `awaiting cells
  12d`; `organizer decisions` prints "awaiting cells". A bucket heading may
  group; a line never renames its record's status.
- **FR-6 (DS6)** The owner reads through the `ruled_by` person reader:
  `operator` shows as pablo everywhere, the raw value in the hover; the
  rule box names the owner only when someone else rules.

## Acceptance → gate

Fixture: the overlay with 0013 awaiting-cells, 0014 applied, 0015
acknowledged (as lf54-decision-states used). UI rows run in the review
build (`make review-build` in the worktree, never with auth: firebase),
launched by its own path with `eval "$(scripts/fixture-home.sh --review)"`,
read from the AX tree of the saved pid and shot with `screencapture -l`, at
1440x900 and 1024x640. No row changes desktops, moves the pointer or takes
focus.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| D1 | 1 | vitest of `needsMeRows` and the header and FSE panel counts over the fixture; the review build's Needs me | no 0013 row; the badge, the header's count and "waiting on you" leave it out and agree |
| D2 | 2 | vitest of the Decisions grouping; the review build's Decisions | "With the cells · 1" between To rule and Ruled, 0013 in it, waiting badge and dashed bar; expanded, the Themis line, no Rule |
| D3 | 3 | the review build's init-a header; AX press on its "with the cells" text | reads `N decisions waiting · 1 with the cells`, muted; the press opens Decisions at that group |
| D4 | 4 | vitest of the tone helper; the review build's Decisions and Overview | 0014 and 0015 badges, bars and diamonds in the ruled pair, words "applied", "acknowledged" |
| D5 | 5 | vitest of Overview's gate row text; `go test` of the CLI and `organizer decisions init-a` on the fixture | "awaiting cells", "applied", "acknowledged" on their lines |
| D6 | 6 | vitest of the owner reader; the review build's Needs me, Decisions and rule box | no screen text "operator" for 0013's owner; the hover holds it; the rule box drops "owner pablo" when the ruler is pablo |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs 54cf10d checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, then `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/lib/decisions.ts`, `queue.ts`, `header.ts`,
`decisionsPage.ts`, `initiativeState.ts` and their tests;
`frontend/src/components/Home.tsx`, `DecisionsView.tsx`,
`InitiativeHeader.tsx`, `Overview.tsx`, `TopBar.tsx` (the FSE panel's
count), `RuleDecisionBox.tsx`, and the decision styles in
`frontend/src/styles/global.css`; `internal/cli/decisions.go` and its test;
the fixture overlay's records 0013-0015 if a row needs them. Not
`internal/model/decision.go` unless the person reader has to be shared
there, then that function only.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf61-decision-states-ui` | D1-D6, X0 | lf54-decision-states (merged #16) | true |
