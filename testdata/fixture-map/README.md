# fixture-map: the C4 map lens's fixture

Read by `internal/service/map_test.go` (leftovers-58 R1, R2) and by the
lens's review build (M1-M7). Each folder is its own initiative root, id =
folder name.

| Initiative | What it holds | For |
|---|---|---|
| `harbor` | the contract's map, byte for byte: `expected.json` as `map.json`, `expected-containers.md` as `containers.md`, `expected-modules.md` as `modules.md`, plus `context.md` | R1, M1, M3, M6, M7 |
| `harbor-ruled` | `ledger` (L2) `ruled`, grounded by record `0002`, which exists under `working-on/decisions/`; `web` (L2) `retiring` | M2 |
| `harbor-ungrounded` | `mail_relay` (L2) with no grounding row: `kind` and `status` null, `grounding` `[]` (its table row removed too) | M4 |
| `harbor-v2` | `schema: c4-map/2`, otherwise harbor | R2, M5 |
| `harbor-nomap` | no `docs/architecture/` at all | R2, M5 (the empty state) |
| `harbor-two-modules` | one `modules.md` holding two regions, `modules harbor_api` and `modules web`, after a block outside every region; `map.json` lists both modules levels (leftovers-84) | leftovers-84 R1 |

Every root also carries record `0001`, which grounds the context map's
`harbor` node. The variants' `map.json` say their own id in `initiative`.
`harbor` lists `repos: [harbor-api, harbor-web, harbor-ledger]` and holds
each as a directory, with `harbor-api/deploy/k8s.yaml` (the keys its `deploy`
entries name) and `harbor-api/src/booking`, `src/pricing`: every `repo`,
`deploy`, `record` and `curated` line of its panel acts (Amendment 2).
`home.sh` makes each listed directory a one-commit git checkout in the temp
copy, since the scan calls a repo with no `.git` missing and a committed
`.git` cannot be a fixture. The variants list no `repos:`, so their `repo`
lines show the `not on this machine` reason.

Source and pin:

- `expected.json`, `expected-containers.md`, `expected-modules.md`:
  agent-mailbox-specs `contracts/c4-map/`, copied at ca14f12 (contains
  54cf10d; the folder last changed in cee0b06).
- `context.md`: claudecode `tests/c4-map/fixture/docs/architecture/context.md`
  at 92890ed. The contract's L1 page is curated, not among its outputs;
  without it harbor's context level has no page and the reader refuses it.

The review build: `eval "$(testdata/fixture-map/home.sh)"` from the worktree
root, then launch `build/bin/Deltagos Review.app/Contents/MacOS/organizer`
by its path (see `home.sh`).
