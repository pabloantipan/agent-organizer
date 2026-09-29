---
title: Who owns docs/design-system.md
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [Aglaea owns the document, Hephaistos keeps it and Aglaea reviews, split by scope]
chosen:
cards: []
threads: [01M3PVTCBV0NSN9XZ8MBAFV5A7]
supersedes: []
superseded_by:
stage:
---

## Question

0053 left open whether Aglaea owns the organizer's design system or only
reviews against it (Pablo: "When an inititive requires, she does. That's an
open question to be answered with the FSE"). Aglaea's first look found the
document and the code disagree in two places: disabled opacity (.6 in the
code, .45 in the doc) and principle 3 against the inbox row's primary verb
(`docs/ux/reviews/2026-09-29-first-look.md`). The document says "when this
file and the code disagree, fix one of them in the same change", and no
seat's lane covers doing that. The Hephaistos skill also lists "the
organizer's design system" among the shared primitives it forges, so the
document already has a claimant.

## Options

- **Aglaea owns the document** (her proposal, thread
  01M3PVTCBV0NSN9XZ8MBAFV5A7): she writes `docs/design-system.md` (principles,
  component anatomy, anti-patterns) and keeps it and the code in agreement
  by raising findings. `tokens.css` and components stay code, changed only by
  builders from FSE cards, which she reviews against the document. A change
  touching a ruled brand choice (dark only, the accent, the palette) still
  needs your ruling as a record. Cost: the Hephaistos skill drops the
  organizer's design system from its lane; one owner.
- **Hephaistos keeps it, Aglaea reviews**: the document stays a factory
  primitive, changed in your pair sessions; Aglaea raises disagreements as
  findings to me and to Hephaistos. Cost: the document moves only when you
  and Hephaistos sit, so drift waits on your time.
- **Split by scope**: Aglaea owns everything below the brand (component
  anatomy, states, words, anti-patterns); the brand paragraph and the tokens'
  scales stay with you and Hephaistos. Cost: a boundary inside one file.

## Recommendation

The FSE's: Aglaea owns the document, as she proposes. The drift she found is
the kind nobody fixes while the owner is a pair session, and her proposal
already keeps the brand under your ruling and the code under cards. If you
choose it, Hephaistos amends its skill's lane; I relay.

## Ruling



## Consequences

On "Aglaea owns the document": Aglaea amends `docs/design-system.md` for the
two disagreements, and I cut the code side (disabled opacity) as a card. On
either other option, the relay goes to Hephaistos with the choice.
