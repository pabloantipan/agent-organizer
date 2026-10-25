---
title: Accept leftovers 53 - Deltagos's side of the factory contract map
status: ruled
raised: 2026-10-25
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf53-frontmatter, lf53-usage-contract, lf53-record-statusline]
forecast: 40-80m
supersedes: []
superseded_by:
ruled: 2026-10-25
ruled_by: pablo
chosen: accept as written
---

## Question

You ruled on 2026-10-25 (agent-slack docs `decisions.md` bfcefd1, relayed by
Hephaistos): "ok. Do. And let's solve all of these." Every contract between
two repos gets one sample under `~/agent-slack/specs/contracts/`, read by
both sides' tests. Deltagos's side (`docs/specs/leftovers-53.md`), three
cards, no shared file:

- **lf53-frontmatter** (F2): cards written with `boundary: "<prose>"` or
  `spec: [a, b]` stop being unread (18 on odyssey today); crossing statuses
  read without a problem; `assumptions.md` is a ledger; tested on the shared
  `contracts/working-on/` sample Hephaistos is writing.
- **lf53-usage-contract** (H3): the usage post's test reads hestia's
  `usage-batch.json` instead of hand-copied key names, every cost source is
  posted (`priced` included), and one refused batch no longer blocks every
  later row. No usage row has ever reached a record from odyssey.
- **lf53-record-statusline** (H2, L1): the dead 409 branch in cell
  registration goes; the statusline test reads a payload captured from a
  live session, so a renamed field fails a test instead of becoming zero.

The first two launch only once their samples exist.

## Options

- **accept as written**: three cards, one wave, each launched when its
  sample lands.
- **accept with amendments**: say which.
- **send back**.

## Recommendation

accept as written. It is what your ruling asks of this side.

## Forecast

forecast: 40-80m over 1 wave once both samples exist, plus waits on
Hephaistos's and hestia's samples and no lease data; basis: 7 tasks, this
initiative (Go-only cards: lf47-runs-cost and lf52-chosen-trim built and
reviewed within their waves).

## Ruling

pablo, 2026-10-25, in the organizer on lodestar: ok
