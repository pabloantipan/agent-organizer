---
title: A roadmap is stages with outcomes, exit criteria and gating decisions
status: ruled
raised: 2026-09-26
raised_by: claude
owner: pablo
ruled: 2026-09-26
ruled_by: pablo
options: [stages, richer milestones, "now / next / later"]
chosen: stages
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

How does an initiative say where it is going and where it is now?

## Options

- **stages**: `working-on/roadmap.yaml`, each stage an outcome, a checkable exit, an optional real date and the decisions that gate it; cards and decisions carry `stage:`; the current stage is the first whose exit is unmet.
- **richer milestones**: smaller, no current stage.
- **now / next / later**: lightest, cannot say stage 2 of 4.

## Recommendation

Claude's: stages.

## Ruling

Pablo chose stages, 2026-09-26, in the session that reviewed the UI.

## Consequences

The format goes into the working-on skill, the method into a roadmapping skill; the FSE proposes stages and stage moves, Pablo rules them. `initiative.yaml` gains `goal`.
