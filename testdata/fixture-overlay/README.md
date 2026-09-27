# fixture-overlay

What `scripts/fixture-home.sh` lays over a temp copy of `testdata/home` so the
redesign's wave 2 gate rows (G11–G16, G19 of `docs/specs/redesign.md`) have
something to show. It is never scanned by the Go tests (no `initiative.yaml`
here), so `status.golden` and G9 are untouched.

- two proposed records raised by the FSE and owned by the human (G11, G15,
  G19); 0002 is "the fixture record" that G15 and G16 rule
- the roadmap gates the current stage on 0002 as well, so the gate diamonds
  show one ruled and one waiting (G12, G14)
- three cards seated `wave1-*`: one queued, one in review, one queued with no
  gate heading (G13)
- a cell whose project is `organizer-fixture` with an `fse` seat, so the FSE
  thread the script posts reaches Needs me (G19)
