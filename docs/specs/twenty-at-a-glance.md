# Twenty at a glance

status: ruled (0033, 2026-09-27)
owner: pablo
decisions: [0029 ruled, 0030 ruled, 0032 ruled, 0033 ruled, 0035 ruled, 0034 ruled, 0036 ruled, 0038 ruled]
roadmap: stage `twenty-at-a-glance` (appetite: one wave)

## Problem

The lead needs Home to say which of up to 20 initiatives are executing,
which are in discovery, which wait on business and which wait on him,
without opening one. Today (read 2026-09-27):

- **Signals, not a state.** Each Home row shows goal, a stepper, signals and
  a next date (`Home.tsx:167-236`). It shows no state per initiative, and
  `Initiative.Status` is not shown.
- **No scope.** Nothing reads `scope`: `model.Initiative`
  (`model.go:37-70`) has no field for it, and the non-strict YAML parse
  drops the key silently (`scan/yaml.go:5`).
- **No phase.** Stages have no `phase` (`model.go:76-93`), and nothing
  checks the skill's rule that the first building stage is gated.
- **A gate-matching bug.** The frontend matches gate numbers without
  zero-padding (`StageRoadmap.tsx:36-38`, `Overview.tsx:89-103`), while the
  Go check pads them (`roadmap.go:125-141`). A gate written `4` shows as
  "names no record".
- **The fixtures do not scale.** They give Home 2 initiatives
  (`scripts/fixture-home.sh`).

**Appetite:** one wave. If it needs a second, stop and amend this spec.

## Goals

- Every Home row says its phase and its state in words (never colour
  alone, per the design system).
- The initiative header shows scope in and out next to the goal.
- Stages carry their phase everywhere a stage is drawn.
- Home stays readable with 20 initiatives.

## Non-goals

- Writing goals or scopes for real initiatives. Those are each owner's, in
  their words; this stage's exit item "every active initiative has a goal"
  is met by owners and FSEs, not by a card.
- Identity, or business people using the app (stage 6).
- List virtualization. Twenty rows do not need it.

## Requirements

- **FR-1** The scan shall read `scope: {in: [...], out: [...]}` from
  `initiative.yaml` and carry both lists on the board initiative.
- **FR-2** The scan shall read `phase` on each stage, `discovery` or
  `building`. If a stage has another value, the scan shall report a problem
  and treat the stage as having no phase.
- **FR-3** If a `building` stage follows a `discovery` stage and none of its
  `gates` is a record, then the scan shall report a problem. A roadmap that
  starts in building needs no such gate (the organizer's does).
- **FR-4** The initiative header shall show scope in and out under the goal,
  or "no scope yet". The stage stepper and each Roadmap stage row shall show
  the stage's phase as a word.
- **FR-5** The frontend shall match gates to records by number, so `4`,
  `04` and `0004` all resolve to record 0004.
- **FR-6** Each Home row shall show:
  - the current stage's phase, or "no roadmap";
  - one state, first match in this order:
    1. **waits on you**: the initiative has rows in Needs me;
    2. **executing**: a wave is running, or an agent is working on one of
       its cards;
    3. **waits on business**: it has a `proposed` record whose `owner` is
       not the lead and not the FSE;
    4. **quiet**: none of the above.

  The state is a word with an icon or shape. The lead is the cell's
  `human`, else "pablo" as the queue assumes today (`queue.ts:11`); see A1.
- **FR-7** The fixture shall be able to lay out 20 initiatives:
  - at least 4 executing, 3 in discovery, 2 waiting on business and
    3 waiting on you;
  - the rest quiet;
  - through `scripts/fixture-home.sh --twenty`.
- **FR-8** Needs me and its badge shall list only proposed records whose
  `owner` is the lead or empty (A1). Records owned by others stay on their
  initiative's Decisions tab and make its Home state "waits on business"
  (0034).
- **FR-9** Initiatives whose `status` is not `active` shall leave Home's
  list, the rail's groups, and Needs me (rows and badge). They sit in one
  collapsed "Not active (n)" group at the bottom of the rail and open
  read-only (0036).
- **FR-10** The initiative header shall show goal and measure clamped to two
  lines each, with a "more" toggle that shows the rest (0038).
- **FR-11** The page body under the initiative's tabs shall scroll on its
  own while the header and the tabs stay in place, so every tab's content
  can be reached at any window height (0038).
- **FR-12** An expanded record on the Decisions tab that is `proposed` and
  owned by the lead shall offer the same Rule box as Needs me
  (`RuleDecisionBox.tsx`, the redesign's FR-13 write path). A ruled,
  withdrawn or superseded record shall offer no Rule action (0038).

## Acceptance → gate

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| G1 | 1 | Given an `initiative.yaml` with scope in and out, both lists reach the board; without scope they are empty and there is no problem | a test in `internal/scan` and one in `internal/merge` | pass |
| G2 | 2 | A stage with `phase: building` carries it; `phase: later` is one problem and the board scans | a test in `internal/scan` | pass |
| G3 | 3 | A discovery stage then an ungated building stage is one problem; with a gate naming a record it is none; a roadmap that starts in building is none | a test in `internal/scan` | pass |
| G4 | 1–3 | Nothing else broke | `XDG_DATA_HOME=$(mktemp -d) make test`; `status.golden` refreshed only for the new fields, diff shown | pass |
| G5 | 4 | The header shows scope in and out, or "no scope yet"; the stepper and Roadmap rows show each stage's phase | screenshots, `wails dev` on `eval "$(scripts/fixture-home.sh)"` | both shown |
| G6 | 5 | A fixture gate written `4` resolves to record 0004 on Overview and Roadmap | screenshot | drawn, not "names no record" |
| G7 | 6 | Each Home row shows its phase and exactly one state word, following FR-6's order | screenshot on `--twenty` | each state appears as specified |
| G8 | 7 | `scripts/fixture-home.sh --twenty` lays out 20 initiatives in the stated mix | run it, then `go run . status` against its config | 20 initiatives, the mix |
| G9 | — | End to end: `wails build`, run the app on `--twenty`, screenshot Home at 1440×900. A reviewer who did not build it answers from that screenshot alone, timed: which initiatives execute, which are in discovery, which wait on business, which wait on you | the screenshot and the reviewer's timed answers in the review | all four right, under a minute |
| G11 | 8 | On `--twenty`, Needs me lists no record owned by business or the FSE, and the badge equals the count of rows that say "waits on you" | screenshot; the badge count against the Home rows | equal |
| G12 | 9 | A fixture initiative with `status: archived` is missing from Home and from Needs me, and appears under "Not active (1)" at the bottom of the rail, collapsed, and opens | screenshots | as stated |
| G13 | 10 | On the fixture initiative with a long goal and measure, the header shows two lines of each plus "more", and "more" shows the rest | screenshots, before and after "more" | as stated |
| G14 | 11 | At a 1280×720 window, the last row of the Decisions tab (one record expanded) and the bottom of Overview are reached by scrolling the body; the header and tabs stay | screenshots at the top and the bottom | as stated |
| G15 | 12 | Ruling a proposed fixture record from its expanded row on the Decisions tab writes it (the redesign's G8 checks, on a temp copy of the fixture) and the row shows as ruled; a ruled record shows no Rule action | screenshot and `git -C $FIXTURE_HOME/init-a log -1 --stat` | one file, one commit |
| G10 | 4–12 | The frontend builds, and no raw colour or font size is added outside `tokens.css` (FR-23 of the redesign) | `cd frontend && npm run build`; the redesign's G18 grep | pass, empty |

## Boundary

- **Backend card:**
  - `internal/model/model.go` (Initiative: scope; Stage: phase);
  - `internal/scan/scan.go` (`ReadInitiative`), `internal/scan/roadmap.go`
    and their tests;
  - `internal/merge/`;
  - `testdata/home/`, `testdata/fixture-overlay/`;
  - `internal/cli/testdata/status.golden`;
  - `app.go` only if Wails needs a type line, and the regenerated
    `frontend/wailsjs/`;
  - `CLAUDE.md` (the Decisions / roadmap bullet).
- **Header card:** `InitiativeHeader.tsx`, `StageRoadmap.tsx`,
  `Overview.tsx`, and their CSS.
- **Home card:** `Home.tsx`, a new `lib/initiativeState.ts`,
  `lib/queue.ts` (read only, unless the lead's name moves there),
  `scripts/fixture-home.sh`, a new `testdata/fixture-twenty/`, and their
  CSS.
- **Must not touch:**
  - any real initiative's `working-on/`;
  - `agents/`;
  - the discuss API;
  - `~/.claude/skills`.
- **No-gos:**
  - a new card status;
  - writing to any card or record;
  - colour alone for a state.

## Rabbit holes

- **Deriving "waits on business" from threads or cards.** Records with a
  non-lead owner are the one honest source today. There are none yet, so
  the fixture carries them.
- **A settings screen for who the lead is.** A1 is enough until identity
  (stage 6).
- **Virtualizing the list.** Twenty rows fit.

## Open questions

- none

## Assumptions

- **A1** The lead is the cell's `human` when the initiative has a cell, else
  "pablo", as `ASKED_RE` assumes today. Identity (stage 6) replaces this.
- **A2** The state order in FR-6 puts "waits on you" first, because the
  lead's queue is what Home is for.
- **A3** "Executing" means a wave is running or a live agent is joined to a
  card of the initiative, idle or working (0035: "working" flickers with the
  CPU sample). An initiative with `now` cards and nobody on them is quiet.

## Cards

| Card | Gate rows | Depends on |
|---|---|---|
| `glance-scope-phase` | G1, G2, G3, G4 | — |
| `glance-header-phase` | G5, G6, G10 | glance-scope-phase |
| `glance-home-state` | G7, G8, G9, G10 | glance-scope-phase |
| `glance-needs-me-lead` | G11, G10 | — |
| `glance-inactive-fold` | G12, G10 | glance-needs-me-lead |
| `glance-header-scroll` | G13, G14, G10 | — |
| `glance-rule-in-decisions` | G15, G10 | — |

## Amendments

- 2026-09-27: A3 amended per 0035 (any live agent on a card), matching the build (`done/glance-home-state.md` review, finding 3).
- 2026-09-27: FR-8 (0034) and FR-9 (0036) added, with gate rows G11 and G12 and two cards; both ruled after the wave landed.

- 2026-09-28: FR-10 to FR-12, gate rows G13 to G15 and two cards, from Pablo's review of the installed app (0038).
- 2026-09-28, from the supervisors' closing reports (threads 01M3HXM8B4S4P0NN128F2W8M8C, 01M3J1WGG3D15AS77Q8119V146):
  - FR-6's "waits on you" reads "has rows in Needs me". Since FR-8 (0034), those rows are only records the lead owns (or nobody), plus the queue. So "waits on business" is reachable, as built in `initiativeState.ts`.
  - G6 cannot be reproduced on the fixture, because the stage gated on record 4 is not current; the card passed on a unit check.
  - G11 compares the badge with rows, not with initiatives.
  - FR-9's "open read-only" was not built: the gate (G12) checked the rail only. Whether to build it is 0042.
