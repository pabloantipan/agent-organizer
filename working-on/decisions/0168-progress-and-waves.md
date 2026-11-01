---
title: Progress over time joined with waves - which view first
status: ruled
raised: 2026-10-27
raised_by: fse
owner: pablo
options: ["Q1 B now A later | A first | C", "Q2 waves block | no waves block"]
cards: []
threads: [01M6022GYPSWMS5HTNC1Y5XJEA]
supersedes: []
superseded_by:
ruled: 2026-10-27
ruled_by: pablo
chosen: "Q1 B now A later, Q2 waves block"
---

## Question

You asked, relayed by Hephaistos on 2026-10-27: "we need to explore how to
use this kind of charts for joining information time-advancement-chart +
waves, visually in Deltagos". Aglaea's three options are in
`docs/ux/specs/progress-and-waves.md` (a2fb63a), each with a sketch. The
join rule is the same in all three: a card that passed belongs to the wave
whose run record lists it, and any other card reads "no wave", never a
guess.

- **A, one time axis.** It is drawn at hours. On top, the share of cards
  passed rises as a step. Below it is one lane per wave: build, then review
  passed or failed with its cause in a word (approach, execution, gate,
  environment), then merge. Dead time crosses every lane. It is the
  activity history made concrete, in Roadmap › History. It needs the 0042
  facts ledger first, so it comes later.
- **B, the run report's rows plus waves.** These are lf57's Overview rows,
  with a wave column. Each row opens to show what that jump cost: rounds,
  failures by cause, build time and tokens. A footer lists the waves in
  the window, each linking to Work's wave strip. It is cheap: it rides on
  lf57.
- **C, one small chart per wave, in Work.** It compares waves well and
  tells the night poorly.

The two questions are independent:

- **Q1** Which first: B now and A later, A first, or C?
- **Q2** Does `factory report`'s text also get a waves block, so the
  report the FSE pastes carries the waves and rounds too? That changes the
  factory's command, so Hephaistos builds it; Deltagos only draws it.

Cost is shown in tokens, not money. You ruled that in 0020 ("cards and
waves show token consumption, not dollars"), so it is not asked again.

## Options

- **Q1** B now A later | A first | C
- **Q2** waves block | no waves block

## Recommendation

**Q1 B now A later, Q2 waves block.** Both are Aglaea's picks too.

- **Q1:** B answers the morning question with what lf57 already builds. A
  waits for the facts ledger anyway. C's strength, the comparison across
  waves, lives on in B's footer and in A's lane headers.
- **Q2:** with a waves block, the pasted text and the screen say the same
  thing, which was your point in ruling one computation. It comes after B
  is built.

## Next

B joins lf57's build spec (leftovers-57) next to 0167's answers, as one
accept record with a forecast. A becomes its own card after the 0042
ledger lands. If you pick the waves block, Q2 goes to Hephaistos.

## Ruling

pablo, 2026-10-27, in the organizer on lodestar: Pablo in the FSE session, 2026-10-28: "excecute please", answering the FSE's ask to rule 0167 and 0168 as recommended.
