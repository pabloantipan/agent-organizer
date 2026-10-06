# fixture-overlay

What `scripts/fixture-home.sh` lays over a temp copy of `testdata/home` so the
redesign's wave 2 gate rows (G11–G16, G19 of `docs/specs/redesign.md`) have
something to show. The Go tests never scan it (they read `testdata/home`), so
`status.golden` and G9 are untouched.

- two proposed records raised by the FSE and owned by the human (G11, G15,
  G19); 0002 is "the fixture record" that G15 and G16 rule
- a proposed record owned by `alejandro` (0005), who is not the human, so
  the Decisions tab offers Rule on it and the ruling is signed by the ruler
  with the owner named (twenty-at-a-glance G17, 0045); it is not in Needs me
- the roadmap gates the current stage on 0002 as well, so the gate diamonds
  show one ruled and one waiting (G12, G14)
- `w-later`, a card from 16 to 30 Nov 2026, weeks after every other fixture
  date, so Cards at Days scrolls into November and its sticky label names it
  (roadmap-time-zoom A23)
- three cards seated `wave1-*`: one queued, one in review, one queued with no
  gate heading (G13)
- a cell whose project is `organizer-fixture` with an `fse` seat, so the FSE
  thread the script posts reaches Needs me (G19)
- phases on the roadmap's stages, foundations in discovery and the rest in
  building, for the header's stepper and Roadmap rows (twenty-at-a-glance G5)
- the views stage gates on `4`, which is record 0004 (ruled), so a gate
  without zero-padding resolves (twenty-at-a-glance G6)
- init-a's scope in and out lives in `testdata/home/init-a/working-on/initiative.yaml`
  and init-b has none, so the header shows both cases (twenty-at-a-glance G5)
- `init-a/working-on/initiative.yaml` replaces that file with the same fields
  and a goal and a measure each longer than two lines at 1280 px, so the
  header's clamp and "more" have something to fold (twenty-at-a-glance G13),
  and two more items on each side of its scope, so "Scope in, more" and
  "Scope out, more" show at 1024 px too (initiative-header FR-15, G17);
  keep its other fields in step with the one in `testdata/home`
- init-b and init-c are in discovery, each with a building stage next: init-b's
  is gated by 0001, a proposed record, and init-c's names no record, so the
  Overview shows the gate into building as waiting and as "no gate record yet"
  (discovery-in-a-cell G3); init-c is only this overlay's, and the scan
  reports its ungated stage
- `init-define`, an initiative whose cell (`define-fixture`) has three
  seats and no session or run, so it reads "in definition" on Crew, the
  Agents tab and Home beside init-a's live cell (discovery-in-a-cell G1)
- persona files for every overlay seat but `designer_diego` of `init-define`,
  so `organizer crew init-define --print` refuses naming
  `agents/designer_diego.md` and its Crew row says "no persona file", while
  init-a's seats carry no mark (discovery-in-a-cell G2); `agents/` is in
  `.gitignore`, so these are force-added
- three initiatives for "Draft the cell" (discovery-in-a-cell G4):
  `init-draftable` has a goal, `agents/people.md` and no cell, so
  `organizer draft-cell init-draftable --print` prints the prompt and the
  button is enabled; `init-nopeople` has a goal and no `people.md`, so both
  refuse naming it (init-b and init-c, with no goal, refuse naming that);
  init-a's cell makes draft-cell refuse; `init-drafted`'s cell is
  `draft: true` with a proposed `0001-the-cell-roster`, so it reads "in
  definition" waiting on that record and `organizer crew init-drafted --print`
  refuses naming it
- the same three cells cover discovery-in-a-cell G6 and G7 with no new file:
  `init-define` (in definition, not a draft, `designer_diego` without a
  persona file) is marked on the rail, offers "Retire…", has Bring crew up
  disabled naming `agents/designer_diego.md`, and makes the one Launch row in
  Needs me; `init-drafted` (a draft) is marked too, has Bring crew up
  disabled naming 0001 and no Launch row (its record is a Rule row);
  init-a, whose seats run as stand-ins, has no mark and no Launch row
- what a UI reviewer needs to see every row of Needs me (ui-leftovers FR-12):
  a thread of `organizer-fixture` that asks pablo (V1), copied from the
  discuss mailbox into the canned health by the script, which has the
  fixture's fse post one only when none is open; `init-drafted`'s
  `0001-the-cell-roster` shaped like the persona-agents skill's
  `references/drafting.md` §5, with a line per seat, the seats considered
  and the gaps (V2); and canned health for `define-fixture`,
  `drafted-fixture` and `ready-fixture` (V3), with only the human, so their
  Crew headers carry no "no project" line and `init-ready` shows
  Conversations without a token
- a second proposed record owned by the human in `init-drafted`
  (`0002-who-the-cell-reports-to`), so its header chip reads "2 decisions
  waiting on you", FR-2's longest words (initiative-header FR-16, G17); the
  draft still waits only on `0001-the-cell-roster`, which the organizer
  finds by slug, and no test counts init-drafted's records
- `work/init-c`'s `0001-a-ruling-nobody-signed`, a ruled record with no
  `ruled_by`, so the Decisions line shows and names "no ruler recorded"
  (leftovers-4 FR-8, L6); the scan reports it as a problem of init-c, which
  already carries one
- `0006`, a copy of the organizer's own 0032 with its wide yaml block, and
  `0007`, superseded by it, so a record body wider than its view and a
  superseded lozenge are both on Decisions (leftovers-4 L9)
- `0008`, the same record as it stood proposed (no ruling), taller than
  the view at 1024×640, so its head sticks and the rule box is capped under
  it (leftovers-4 L11); it adds one Needs me row
- `0009`, proposed, owned by pablo, with eight options and a long Question,
  so its rule box is taller than its room at a 1024×640 window and scrolls
  with Rule and Cancel inside (leftovers-5 FR-12, leftovers-6 S2); it adds
  one Needs me row
- `0010`, proposed, owned by pablo, and its card `w-wide`: each body holds
  a code block and a ten-column table wider than any box, so the rule box,
  the record on Decisions and the card back each scroll a body sideways
  inside itself with its edges (leftovers-7 FR-5, FR-9, P4); it adds one
  Needs me row
- the transversal roles (docs/ux/specs/transversal-roles.md R1-R4, roles-ui):
  the script writes a `roles` list into the config (the default list's names
  and globs, every bitácora inside the fixture home), starts two
  `probe-hefesto*` stand-ins (one in init-a, one in `agent-slack/`) and one
  `organizer-fixture-probe-aglaea`, each with a statusline record (42, 61
  and 28 % context), writes one ended Daedalus run in init-b two days ago
  into the fixture's own `runs.jsonl`, and adds an open `[for aglaea]`
  thread to organizer-fixture's canned threads. The bitácoras are here:
  `agent-slack/docs/bitacora/hephaistos_bitacora.md` with a HAND-OFF for
  this machine (`fixture`) and one for odyssey, `init-a/.../aglaea_bitacora.md`
  with log lines and no HAND-OFF, and `work/init-b/.../daedalus_bitacora.md`
  with a HAND-OFF ten days old (stale); Ariadna has none. Their `@D<n>@`
  marks are dated n days before today by the script
- `init-a/runs/`, three run records for the Roadmap's waves
  (roadmap-as-a-plan W4): `2026-09-20-prose-only.md` has no waves block and
  is a dot; `2026-09-24-joins-wave.md` is sup11's wave on w-review (joins)
  with a build, a failed review, a rework, a pass and Pablo's take;
  `2026-09-28-across-stages.md` is sup12's wave on w-queued, w-nogate
  (joins) and `working-on/done/w-founded.md` (foundations, done), so it sits
  under two stages, with a review and a UI review passing, then sup13's wave
  on w-later, which joins no stage and is open with its review in flight.
  `runs/` is in `.gitignore`, so these and `w-founded.md` are force-added
