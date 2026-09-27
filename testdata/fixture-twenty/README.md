# fixture-twenty

What `scripts/fixture-home.sh --twenty` lays out: twenty active initiatives
in the mix of FR-7 of `docs/specs/twenty-at-a-glance.md`, so Home can be read
at a glance (G7–G9), plus one archived (G12, below). Nothing from `testdata/home` is copied. It is never scanned by
the Go tests (no root points here), so `status.golden` is untouched.

How each state arises, from files except where noted:

- **waits on you** (3): a proposed record owned by `pablo`
  (`claims-portal` 0002, `vendor-audit` 0001), and a card whose next action
  starts `pablo:` in an initiative with a cell (`onboarding-flow`; the queue
  reads cards only through a cell).
- **executing** (4): cannot come from files. The scan reads agents from the
  process table, so the script starts one stand-in agent per line of
  `agents.txt`, a sleep named after the config's `agent_binary`, with its cwd
  in the card's `.wt/<slug>`; the scan joins it to the card (cardjoin.go).
  Two of those cards are seated `wave1-…` and `wave2-…`, so their waves read
  as building (`billing-api`, `auth-gateway`); the other two are plain cards
  (`field-app`, `ops-dashboard`).
- **waits on business** (2): a proposed record owned by someone who is
  neither the lead nor the FSE (`data-lake` owner carla, `pricing-model`
  owner rodrigo).
- **quiet** (11): the rest. Two on purpose: `mobile-sync` has two `now`
  cards with nobody on them (A3), and `email-digest` has a proposed record
  owned by `fse`, which is neither the lead's nor business's.

Phases: 5 in discovery, 10 building, 5 with no roadmap. Every staged
initiative has a ruled `0001-the-roadmap` record that gates its first
building stage, so no row carries a phase problem.

The 21st, `legacy-intranet`, is `status: archived` (FR-9, G12). Were it
active it would add two Needs me rows: its proposed record 0001 owned by
`pablo`, and its card `page-inventory`, whose next action starts `pablo:`
and which the queue reads through its cell. Being archived, it is missing
from Home and from Needs me and sits alone under "Not active (1)" at the
bottom of the rail. It has no roadmap and is not counted in the mix above.
