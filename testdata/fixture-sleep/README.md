# fixture-sleep

The Initiatives view's fixture (docs/specs/initiatives-view.md, I1-I13),
laid over the default fixture home by `scripts/fixture-home.sh`:

- `init-asleep`: paused, its status line carries the factory's
  `sleeping since @SINCE@` comment (the script writes a date a week ago),
  and one frozen session (`init-asleep-probe-otter`, a frozen dir and an
  exited layout under the fixture's probe state dir).
- `init-archived`: archived.
- `init-blind/deeper/init-blind`: active, but four levels under the
  fixture home, and the fake factory is not told its root, so the scan
  reads it and the factory does not see it (camp's case).
- `factory`: the fake on PATH, a wrapper over `testdata/factory/factory`
  driven by files in `$FIXTURE_FACTORY_DIR` (see the script's header).
