---
title: Stage review-map closes as moved to Elenx, exits 1-2 carried there
status: proposed
raised: 2026-10-24
raised_by: fse
owner: pablo
options: ["close as moved", "keep the stage open here"]
cards: [lf48-chat-landing, lf49-rule-questions, lf50-float-space]
stage: review-map
crossing: 0020
affects: [elenx]
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Crossing 0020 is ruled "move" (agent-slack
`working-on/decisions/0020-crossing-review-map-to-elenx.md`; Pablo,
2026-10-24, in the organizer on lodestar, ruling elenx 0004 in Deltagos:
"as recommended"). `organizer review` and the Review view now belong to
Elenx. Stage `review-map` (`working-on/roadmap.yaml`, gate 0137) has three
exits:

1. on odyssey, a real agent branch of another initiative opened in
   Deltagos, every changed symbol reached, the undeclared change flagged:
   **not met here**, carried to Elenx;
2. a question marked on a node reaches the card's supervisor as a thread:
   **not met here**, carried to Elenx;
3. records and specs show their mermaid diagrams in the four change
   classes: met 2026-10-16.

Close the stage now?

## Options

- **close as moved**: `review-map` gets `done: <the ruling's date>` with a
  comment "moved to Elenx (0020, 0159); exits 1-2 not met here". The cards
  still on it are not Review-view work and stay organizer's:
  - `lf48-chat-landing` (sup90, Conversations) and `lf50-float-space`
    (sup89, the floating icon) land under `review-map` as its last work;
  - `lf49-rule-questions` (the rule box, held for memory) drops its
    `stage:` until a next stage exists.
  No new work on organizer's Review code (`internal/review`, `organizer
  review`, `Review.tsx`, `ReviewSymbol.tsx`, the review-view spec). A card
  retiring those copies is cut once Elenx's tool reads a branch on its own.
- **keep the stage open here**: the exits stay organizer's, though the code
  moves; they would then be met by a tool this initiative no longer owns.

## Recommendation

close as moved. It is what 0020 rules, said in this initiative's roadmap.

review-map was the roadmap's last stage, so Deltagos has no current stage
after this. The next one (what Deltagos is for once review leaves) needs
your goal for it; I draft it with the roadmapping skill when you say.

## Forecast

No task: the ruling edits `roadmap.yaml` and one card's `stage:`, the FSE's
own work, minutes.
