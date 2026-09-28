---
title: Anyone may rule a proposed record in the app, and the record notes who did
status: ruled
raised: 2026-09-28
raised_by: pablo
owner: pablo
ruled: 2026-09-28
ruled_by: pablo
options: [record for the owner, the lead rules anything, only the owner, anyone may rule and it notes who did]
chosen: anyone may rule and it notes who did
cards: [rule-anyone, install-current-build-5]
threads: []
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Pablo could not rule camp's 0005 from the installed app. Its owner is
"alejandro", and the Rule box (FR-12 of twenty-at-a-glance, 0038) appears
only on records the lead owns. The write path also signs every ruling as the
record's owner (redesign A4, `rule.go`). So a record whose owner does not
use the app can never be ruled there.

## Options

The FSE asked:
- **record for the owner**: the Rule box takes the owner's words and where
  he said them.
- **the lead rules anything**: as the lead.
- **only the owner**: as today.

## Recommendation

The FSE's: record for the owner.

## Ruling

Pablo, 2026-09-28, in the FSE's session (organizer-probe-fse):
- To "who is Alejandro to the organizer?": "Me (Pablo)".
- To how a ruling gets recorded: "Ok. I get the intention now. It's a good
  one. But right now" … "Right now we need anyone could rule and note who
  did".

## Consequences

- The Rule box shows on every `proposed` record on the Decisions tab,
  whoever owns it. Needs me still lists only the lead's (0034).
- `ruled_by` is the person who ruled: the cell's `human`, else "pablo",
  until identity exists. The Ruling line names the ruler, the owner when
  different, and where ("in the organizer on <machine>").
- The redesign's A4 and twenty-at-a-glance's FR-12 are amended.
- "alejandro" in camp's records is Pablo; renaming them is camp's, not this
  record's.
