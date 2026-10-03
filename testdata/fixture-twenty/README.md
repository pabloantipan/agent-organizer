# fixture-twenty

What `scripts/fixture-home.sh --twenty` lays out: twenty active initiatives
in the mix of FR-7 of `docs/specs/twenty-at-a-glance.md`, so Home can be read
at a glance (G7–G9), plus one archived (G12, below). Nothing from `testdata/home` is copied. It is never scanned by
the Go tests (no root points here), so `status.golden` is untouched.

How each state arises, from files except where noted:

- **waits on you** (3): a proposed record owned by `pablo`
  (`claims-portal` 0002, `vendor-audit` 0001), and a card whose next action
  starts `pablo:` in an initiative with a cell (`onboarding-flow`; the queue
  reads cards only through a cell). `vendor-audit` also has a proposed record
  with no owner, raised after its `pablo` one; a record with no owner is
  the lead's to rule (`ownedByLead` in `lib/queue.ts`), so it adds a Needs
  me row but no state, and the signal reads "2 waiting · pablo, no owner"
  (lead-side-fixes FR-10, G8).
- **executing** (4): cannot come from files. The scan reads agents from the
  process table, so the script starts one stand-in agent per line of
  `agents.txt`, a sleep named after the config's `agent_binary`, with its cwd
  in the card's `.wt/<slug>`; the scan joins it to the card (cardjoin.go).
  Two of those cards are seated `wave1-…` and `wave2-…`, so their waves read
  as building (`billing-api`, `auth-gateway`); the other two are plain cards
  (`field-app`, `ops-dashboard`).
- **waits on business** (2): a proposed record owned by someone who is
  neither the lead nor the FSE (`data-lake` owner carla, `pricing-model`
  owner rodrigo). `data-lake` has three, owned by carla, rodrigo, carla in
  the order raised, so its signal reads "3 waiting · carla, rodrigo"
  (lead-side-fixes FR-10, G8).
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

The 22nd, `partner-payouts` (responsive-home FR-25, the leftovers-3
ranking's G-d), is active and stretches a row on purpose: seven signals
(five waiting, one blocked, one now, wave 3 building, one live, its cell in
definition, one problem) and a long waiting list ("5 waiting · you, carla,
rodrigo, valentina, no owner"), so "+N" and a cut lozenge show without
forcing the DOM. Its card `partner-terms` has a next action starting
`pablo:`, read through its cell: a Needs me card row. The problem is
record 0007, ruled without `ruled_by`. Its stand-in agent is the last line
of `agents.txt`; its cell's seats have never run, so the cell is in
definition and Needs me also carries its Launch row. It makes Home 21
active rows, not twenty.
