# Discovery has a shape and runs in a cell

status: ruled (0048, 2026-09-28); amendment 1 proposed (0050)
owner: pablo
decisions: [0029 ruled, 0030 ruled, 0032 ruled, 0047 ruled, 0048 ruled, 0050 proposed, 0051 proposed]
roadmap: stage `discovery-in-a-cell` (appetite: one wave, set by this spec)

## Problem

An initiative in discovery needs a persona cell fed with its business
context, and the lead needs to see a cell while it is being defined: "we
need to see when agent persona cells are being define, helping to promp
roles acording the details of the initiative" (Pablo, 0030). Today (read
2026-09-28):

- **No state for a cell being defined.** The organizer reads `cell.json`
  (`scan.go:332-351`) and shows seats as live or off (`Crew.tsx:41`).
  0030 defines "in definition" as a cell with seats and no sessions yet.
- **Nothing drafts a roster.** Nothing reads `agents/people.md`, and nothing
  proposes seats from the goal, the scope or the people. The persona-agents
  skill has no drafting procedure either; that is relayed to Hephaistos.
- **Bring crew up does not check persona files.** It never checks that
  `agents/<seat>.md` exists (`crew.go:354-437`), so a drafted seat without
  its file would launch empty.
- **Camp is the live case.** Its cell has six seats and all of them run. It
  is still in discovery, on its first stage. Its `build` stage has no gate
  record (the scan reports it). Moving camp into building is camp's work:
  its FSE, its records, Pablo's ruling. It is not organizer code. This
  stage's exit item (b) is met there.

**Appetite:** one wave.

## Goals

- A cell being defined reads as "in definition" on Home, the rail and the
  Agents tab, and says what it waits on.
- A roster can be drafted from the initiative's goal, scope and
  `people.md`, and nothing launches until the human accepts it.
- Bring crew up refuses a seat whose persona file is missing.

## Non-goals

- Moving camp's stages. That is camp's work.
- Writing persona content inside the organizer's code: role texts are the
  persona-agents skill's.
- Identity for business people (stage 6).

## Requirements

- **FR-1** A cell whose seats all have no session and no ended run shall
  derive the state "in definition", as 0030 defines it. A cell with at
  least one seat that has run is not in definition. The state shows as a
  word on:
  - the Crew header;
  - the Agents tab;
  - the Home row's signals;
  - the rail's row for the initiative: the same mark, icon only in the
    collapsed strip with the word in its hover (amendment 1: the Goals named
    the rail and this list did not).
- **FR-2** If a seat has no `agents/<seat>.md`, then Bring crew up and
  `organizer crew` shall refuse, naming each missing file. The Crew row
  shows the seat as "no persona file".
- **FR-3** (0047: a drafting session; amendment 1) A roster is drafted by a
  Claude session following the persona-agents skill's
  `references/drafting.md`; the organizer starts that session and shows the
  draft, and writes no persona content itself.
  - **a.** An initiative with no `agents/cell.json` shall offer "Draft the
    cell" on its Agents sub-view, and `organizer draft-cell <id> [--print]`.
    It writes a prompt to `~/.local/share/organizer/prompts/<id>-draft-cell.md`
    and opens a terminal at the initiative root running
    `<agent> "$(cat <file>)"`, as `organizer prompt --run` does
    (`Service.RunReview`, `service.go:827`). `--print` prints the prompt and
    opens nothing.
  - **b.** The prompt names the initiative id and root, says "load the
    persona-agents skill and follow references/drafting.md at this root",
    and says the session writes only under `agents/` and
    `working-on/decisions/`. Nothing else: the inputs are the procedure's to
    read.
  - **c.** If the initiative has no `goal` or no `agents/people.md`, then
    draft-cell shall refuse, naming what is missing (drafting.md §1 stops
    there too). The button is disabled and its hover says why.
  - **d.** If `agents/cell.json` exists, then draft-cell shall refuse: the
    roster exists.
  - **e.** The scan shall read `draft` (bool) and `drafted` (date) from
    `cell.json` into `model.Cell`. A cell with `draft: true` is in
    definition whatever its seats' runs. Its waits text names the accept
    record, the initiative's `proposed` record whose slug is
    `the-cell-roster` (drafting.md §5), with a link to it in Decisions, or
    "no accept record yet" when there is none.
  - **f.** If `cell.json` has `draft: true`, then Bring crew up and
    `organizer crew` shall refuse, naming the accept record: nothing
    launches from a draft.
  - Accepting is the record's ruling and the session's edit of `cell.json`
    (drafting.md §5); the organizer adds no accept button.
- **FR-4** The initiative's Overview in discovery shall show the gate into
  building. That is the gate of the first `building` stage, which the scan
  already checks (`roadmap.go:121-133`). It shows as waiting until its
  record is ruled, with a link to the record, or as "no gate record yet"
  when there is none.
- **FR-5** (amendment 1, sup15's review) While a cell is in definition,
  `service.Retirable` shall return no seat, so the crew block offers
  "Retire…", never "N retirable": a roster being defined is not a wave that
  ended.
- **FR-6** (amendment 1, cell-persona-check's review) If any seat has no
  persona file, or the cell is a draft, then Bring crew up shall be
  disabled, and its hover names the missing files or the accept record. The
  refusals of FR-2 and FR-3f stay, for the CLI and for a stale view.
- **FR-7** (0051: a Launch row in Needs me; Pablo: "better for huamns")
  While a local cell is in definition and not a draft, `needsMeRows`
  (`lib/queue.ts`) shall hold one row for it: kind `launch`, key
  `launch:<initiative>`, verb **Launch**, which opens the initiative's Agents
  sub-view (`openInitiative(id, "agents")`). It has no date (`since: null`)
  and sorts after the dated rows. So the initiative's Home state reads "you"
  and the badge counts it, and "you" still means a Needs me row (0034). The
  row leaves by itself once a seat has run; it has no Solved mark. A draft
  gets no Launch row: its proposed accept record is already a Rule row.

## Acceptance → gate

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| G1 | 1 | A fixture cell with seats and no sessions or runs derives "in definition"; one seat live or with a past run, it does not | a test in `internal/service`; screenshots of Crew and Home on the fixture | as stated |
| G2 | 2 | A fixture seat without `agents/<seat>.md` makes `organizer crew <id> --print` exit non-zero, naming the file; its Crew row says "no persona file" | the command's output and exit code; a screenshot | refused, named |
| G3 | 4 | A fixture initiative in discovery whose first building stage is gated by a proposed record shows that gate as waiting on Overview; with no gate, "no gate record yet" | screenshots | as stated |
| G4 | 3 | On the fixture: (i) `organizer draft-cell <id> --print` on an initiative with a goal, `people.md` and no cell exits 0 and prints a prompt naming `references/drafting.md` and the root; (ii) with no `people.md` it exits non-zero naming it, and with a cell it refuses; (iii) a fixture cell with `draft: true` and a proposed `NNNN-the-cell-roster` record reads "in definition" naming that record, and `organizer crew <id> --print` exits non-zero naming it; (iv) the Agents sub-view shows "Draft the cell" enabled on (i) and disabled with its reason on (ii) | the commands' output and exit codes; a test in `internal/service` for (iii); screenshots for (iii) and (iv) | as stated |
| G7 | 7 | On the fixture, an in-definition cell that is not a draft makes one Launch row on Home; the badge counts it; the initiative's state reads "you"; Launch opens its Agents sub-view. A draft cell, and a cell with a seat that has run, make no Launch row | screenshots of Home and the badge; the row's click | as stated |
| G6 | 1, 5, 6 | On the fixture's in-definition cell: the rail marks it (expanded and collapsed); the crew block shows "Retire…", not "N retirable"; with a seat missing its file, Bring crew up is disabled and its hover names the file | a test in `internal/service` for Retirable in definition; screenshots | as stated |
| G5 | 1–7 | Nothing else broke | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; the redesign's G18 grep | pass |

## Boundary

- **in-definition card:**
  - `internal/service/crew.go` (the derived state; not `CreateCrew`);
  - `internal/model/model.go` (Cell: state);
  - `Crew.tsx`, `AgentsView.tsx`;
  - `Home.tsx` (the signal only);
  - fixtures, tests, CSS.
- **persona-file card:**
  - `internal/service/crew.go` (`CreateCrew`'s preflight only);
  - `internal/cli/crew.go`;
  - `Crew.tsx` (the seat row only; after the in-definition card);
  - fixtures, tests.
- **gate-into-building card:**
  - `Overview.tsx` (`StageGates`);
  - fixtures, CSS.
- **cell-draft card** (amendment 1):
  - `internal/model/model.go` (Cell: `draft`, `drafted`);
  - `internal/scan/scan.go` (`readCell` only);
  - `internal/service/crew.go` (`cellState`; `CreateCrew`'s draft refusal);
  - a new `internal/service/draft.go`; `internal/prompt/` (the draft prompt);
  - `internal/cli/` (`draft-cell`); `app.go` (one binding); `frontend/wailsjs`
    (generated); `hooks/useWails.ts`;
  - `AgentsView.tsx` (the button, for an initiative without a cell);
    `Crew.tsx` (the waits text only);
  - CLAUDE.md (one sentence in the Crew paragraph); fixtures, tests.
- **cell-definition-finish card** (amendment 1):
  - `Rail.tsx` (the mark);
  - `Crew.tsx` (the Bring crew up and Retire buttons only);
  - `internal/service/crew.go` (`Retirable` only);
  - FR-7: `lib/queue.ts` (`needsMeRows`, the launch row), `Home.tsx` (its
    row and verb), CLAUDE.md (Launch in the Navigation paragraph's verbs);
  - fixtures, tests, CSS.
- **Must not touch:**
  - camp or any other initiative's files;
  - `~/.claude/skills`;
  - the discuss API.

## Rabbit holes

- **Moving a stage from a ruled record automatically.** Stages move by
  `done` in the roadmap, ruled by the owner (the roadmapping skill).
- **Writing role texts in Go or TypeScript.** The prompt points at the
  skill; a template of seats in the organizer is the "role checklist" 0047
  did not choose.
- **An accept button.** Acceptance is the record's ruling (FR-3); a button
  that edits `cell.json` would make the organizer write persona state.

## Open questions

- ~~how a roster is drafted~~ ruled in 0047: a drafting session.
- ~~Home's state for a cell in definition~~ ruled in 0051: a Launch row in Needs me.

## Assumptions

- **A1** A seat "has run" if it has a record in `runs.jsonl` or a live
  session. That is enough to leave "in definition".

## Cards

| Card | Gate rows | Depends on |
|---|---|---|
| `cell-in-definition` | G1, G5 | — |
| `cell-persona-check` | G2, G5 | cell-in-definition (both touch `Crew.tsx`) |
| `discovery-gate-shown` | G3, G5 | — |
| `cell-draft` | G4, G5 | — (0047 ruled; 0050 accepts it) |
| `cell-definition-finish` | G6, G7, G5 | cell-draft (both touch `Crew.tsx` and `crew.go`) |

## Amendments

- **1, 2026-09-29, proposed (0050).** FR-3 written from 0047 and the
  persona-agents skill's `references/drafting.md` (claudecode 807cd47);
  G4 defined. sup15's closing points folded in: FR-1 adds the rail (the
  Goals named it, the list did not: the FSE's inconsistency); FR-5 (no
  "N retirable" in definition); FR-6 (Bring crew up says why before the
  click); FR-7 raised as 0051, ruled the same day (a Launch row), and added
  to `cell-definition-finish` before it launched. Not taken: sup15's point 5, a unit test for
  Overview's gate-into-building logic, because the frontend has no test
  runner; adding one is its own decision, logged in the bitácora. Cards
  `cell-draft`, `cell-definition-finish`.
