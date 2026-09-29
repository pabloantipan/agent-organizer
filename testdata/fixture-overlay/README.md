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
  header's clamp and "more" have something to fold (twenty-at-a-glance G13);
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
