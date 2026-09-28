# Discovery has a shape and runs in a cell

status: ruled (0048, 2026-09-28)
owner: pablo
decisions: [0029 ruled, 0030 ruled, 0032 ruled, 0048 ruled]
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
  - the Home row's signals.
- **FR-2** If a seat has no `agents/<seat>.md`, then Bring crew up and
  `organizer crew` shall refuse, naming each missing file. The Crew row
  shows the seat as "no persona file".
- **FR-3** [NEEDS CLARIFICATION: how a roster gets drafted from goal, scope
  and people.md — pablo] (decision 0047, proposed). Whatever is chosen:
  - the draft is a proposal the human edits and accepts;
  - nothing launches from a draft;
  - acceptance is a ruled record in the initiative.
- **FR-4** The initiative's Overview in discovery shall show the gate into
  building. That is the gate of the first `building` stage, which the scan
  already checks (`roadmap.go:121-133`). It shows as waiting until its
  record is ruled, with a link to the record, or as "no gate record yet"
  when there is none.

## Acceptance → gate

| # | FR | Given / When / Then | Check | Expected |
|---|---|---|---|---|
| G1 | 1 | A fixture cell with seats and no sessions or runs derives "in definition"; one seat live or with a past run, it does not | a test in `internal/service`; screenshots of Crew and Home on the fixture | as stated |
| G2 | 2 | A fixture seat without `agents/<seat>.md` makes `organizer crew <id> --print` exit non-zero, naming the file; its Crew row says "no persona file" | the command's output and exit code; a screenshot | refused, named |
| G3 | 4 | A fixture initiative in discovery whose first building stage is gated by a proposed record shows that gate as waiting on Overview; with no gate, "no gate record yet" | screenshots | as stated |
| G4 | 3 | Per 0047, once ruled | added by amendment | — |
| G5 | 1–4 | Nothing else broke | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; the redesign's G18 grep | pass |

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
- **Must not touch:**
  - camp or any other initiative's files;
  - `~/.claude/skills`;
  - the discuss API.

## Rabbit holes

- **Moving a stage from a ruled record automatically.** Stages move by
  `done` in the roadmap, ruled by the owner (the roadmapping skill).
- **Drafting before 0047 is ruled.**

## Open questions

- [NEEDS CLARIFICATION: how a roster is drafted — pablo] (0047)

## Assumptions

- **A1** A seat "has run" if it has a record in `runs.jsonl` or a live
  session. That is enough to leave "in definition".

## Cards

| Card | Gate rows | Depends on |
|---|---|---|
| `cell-in-definition` | G1, G5 | — |
| `cell-persona-check` | G2, G5 | cell-in-definition (both touch `Crew.tsx`) |
| `discovery-gate-shown` | G3, G5 | — |
| the drafting card | G4 | 0047 |

## Amendments

- none yet
