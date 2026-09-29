---
title: Draft the cell from the organizer, and never launch a draft
status: done
repos: [organizer]
branch: main
updated: 2026-09-29
next: "merge branch cell-draft (reviewed pass); then cell-definition-finish launches"
depends_on: []
boundary: ["internal/model/model.go (Cell: draft, drafted)", "internal/scan/scan.go (readCell only)", "internal/service/crew.go (cellState; CreateCrew's draft refusal)", "internal/service/draft.go (new)", "internal/prompt/ (the draft prompt)", "internal/cli/ (draft-cell)", "app.go (one binding)", "frontend/wailsjs (generated)", "frontend/src/hooks/useWails.ts", "frontend/src/components/AgentsView.tsx (the button, for an initiative without a cell)", "frontend/src/components/Crew.tsx (the waits text only)", "CLAUDE.md (one sentence in the Crew paragraph)", "testdata/", "tests"]
spec: "docs/specs/discovery-in-a-cell.md (FR-3, amendment 1); the procedure the prompt points at: ~/.claude/skills/persona-agents/references/drafting.md (read, never edit); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G4, G5; the Gate section below"
stage: discovery-in-a-cell
seat: draft-cell
review: pass
---

## Goal
Roadmap stage discovery-in-a-cell, exit (a): FR-3 of
`docs/specs/discovery-in-a-cell.md` as amended (0047 ruled "a drafting
session").

## Gate
- [x] G4: see `docs/specs/discovery-in-a-cell.md`, Acceptance, (i) to (iv)
- [x] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-29 cut from amendment 1 by the FSE
- 2026-09-29 built by seat draft-cell on branch cell-draft (68ee6ea scan, 88a9723 service+prompt, 0c18541 cli, c688606 binding, 0810add Agents/Crew, 24d978b fixtures, c08c75d CLAUDE.md); rebased on main.
- 2026-09-29 G4 met against the fixture home (`eval "$(scripts/fixture-home.sh)"`), `.wt-notes/draft-cell/g4-cli.txt`: (i) `organizer draft-cell init-draftable --print` exit 0, prompt names the root and "follow references/drafting.md at this root"; (ii) `draft-cell init-nopeople --print` exit 1 "no agents/people.md", `init-b` exit 1 "no goal … and no agents/people.md", `init-a` exit 1 "agents/cell.json exists"; (iii) `crew init-drafted --print` exit 1 "the cell is a draft; nothing launches until record 0001-the-cell-roster is ruled", test `TestDraftCellIsInDefinitionAndRefusedNamingItsAcceptRecord` (internal/service/draft_test.go) ok, screenshots `.wt-notes/draft-cell/g4-iii-drafted-crew.png` (in definition, "drafted 2026-09-28; waits on 0001 the-cell-roster"), `g4-iii-link-to-decisions.png`, `g4-iii-home.png`; (iv) `.wt-notes/draft-cell/g4-iv-draftable-enabled.png`, `g4-iv-nopeople-disabled.png`, hovers in `g4-iv-hover-titles.json`.
- 2026-09-29 G5 met after the rebase, `.wt-notes/draft-cell/g5.txt`: `XDG_DATA_HOME=$(mktemp -d) make test` all ok; `cd frontend && npm run build` "built in 1.05s"; G18 grep on main...cell-draft empty (grep exit 1).

## Next
1. a reviewer that is not the builder reviews branch cell-draft

## Blockers
none

## Notes
- 2026-09-29 sup16 runs this card (organizer-probe-sup16), spawned by the FSE after 0050; FR-7 stays out (0051 open)
- The prompt points at the skill and carries no role text (spec, Rabbit
  holes). No accept button: acceptance is the record's ruling.
- Camp's six seats all have `agents/<seat>.md` (checked 2026-09-29 by the
  FSE), so FR-2's refusal does not stop camp.
- 2026-09-29 draft-cell: on a draft the crew block still offers "1 retirable" and an enabled Bring crew up (FR-5/FR-6, cell-definition-finish's); the FR-3f refusal holds on click. `openAgentTerminal` in draft.go duplicates RunReview's terminal half (service.go is outside the boundary). Choices and refusal words: `.wt-notes/draft-cell/progress.md`.

## Review
- Verdict: **pass**. Branch cell-draft at c08c75d (main...cell-draft; main is ahead only by a card commit).
- Unmet gate items: none.
- G4 (i): `organizer draft-cell init-draftable --print` exit 0. The prompt names `"init-draftable"`, its root and "follow references/drafting.md at this root", and says it writes only under agents/ and working-on/decisions/. No prompt file written (`.wt-notes/draft-cell-review/g4-cli.txt`).
- G4 (ii): `init-nopeople` exit 1 "no agents/people.md"; `init-b` exit 1 naming both no goal and no people.md; `init-a` exit 1 "agents/cell.json exists" (same file).
- G4 (iii): `organizer crew init-drafted --print` exit 1 "the cell is a draft; nothing launches until record 0001-the-cell-roster is ruled" (same file). `TestDraftCellIsInDefinitionAndRefusedNamingItsAcceptRecord` passes on -count=1 (`g4-tests.txt`). Builder's `g4-iii-drafted-crew.png` shows "in definition" and "drafted 2026-09-28; waits on 0001 the-cell-roster". `g4-iii-link-to-decisions.png` shows the record in Decisions. `g4-iii-home.png` shows "cell in definition" and the Rule row.
- G4 (iv): `g4-iv-draftable-enabled.png` shows Draft the cell enabled. `g4-iv-nopeople-disabled.png` shows it disabled, with the reason inline. The hover is in `g4-iv-hover-titles.json` and is the wrapper's title in `AgentsView.tsx`.
- G5: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (`make-test.txt`); `npm run build` exit 0 (`npm-build.txt`); the redesign G18 grep on main...cell-draft is empty, grep exit 1 (`g18.txt`).
- Not covered by the gate: (1) On a draft, the crew block still offers "1 retirable" and an enabled Bring crew up. The FR-3f refusal holds, and FR-5/FR-6 belong to cell-definition-finish, which must cover the draft case too. (2) The accept-record rule (slug the-cell-roster, proposed, highest number) is written twice, `acceptRecord` in draft.go and in Crew.tsx, and the two can drift. (3) `openAgentTerminal` duplicates RunReview's terminal half. (4) The fixture persona files are 3 lines with no frontmatter or `metadata.draft`, and there is no `agents/README.md`. That is thinner than drafting.md §3–4, harmless for G4. (5) The gate does not check that the button's Open actually writes `<id>-draft-cell.md` and opens a terminal. That path is untested and was not pressed.
- Evidence: `/Users/pabloantipan/organizer/.wt-notes/draft-cell-review/`. Reviewer: draft-cell-review, 2026-09-29.
