---
title: Organizer as the factory's registrar — keys and cell registration
status: next
repos: [internal]
branch: main
updated: 2026-09-05
next: "Set record_url to http://127.0.0.1:8090 and verify CreateCrew registers camp against the local record (it already is, by curl); the factory-key path waits for a record that can verify a Firebase token"
---

## Goal
The platform (agent-slack docs/platform.md) gives the organizer two jobs it
does not have yet: issue the factory key a laptop pushes with, and register
each cell with the record when it brings a crew up. It reads nothing from the
record — it stays one factory, one laptop.

## Where
| Repo | Branch | State |
|---|---|---|
| internal | main | built: internal/record, organizer factory-key, registerCell in CreateCrew |

## Done
- 2026-09-05 scoped from agent-slack's specs/factory-push-spec.md §7–8 and record-spec.md §4
- 2026-09-05 `internal/record` writes keys and cells and owns push.key, factory, projects.json (cec2e8d)
- 2026-09-05 `organizer factory-key [--rotate]` signs in, issues, writes 0600; rotate issues then revokes, in that order (1692ce8)
- 2026-09-05 CreateCrew registers the cell and merges its push flag into projects.json; 2xx or 409 both count (cb2f9f6)
- 2026-09-05 all three tested against an httptest fake of the record; `go test ./...` green

## Next
1. Verify against the real discuss-record once it exists: set `record_url`, run `organizer factory-key`, bring the camp crew up, confirm the cell registers
2. Decide whether `organizer doctor` should report the factory id, whether a key is present, and each cell's push flag

## Blockers
- `organizer factory-key` needs a Firebase-verified developer token; the local record on http://127.0.0.1:8090 cannot check one (RECORD_FIREBASE_PROJECT unset), so its key came from `--role key`. Registration is verifiable now; the key path waits for infra

## Notes
- 2026-09-06: preludeFor also starts `discuss-hook watch --external --parent $$` (eb47add); a crew launched by the organizer needs no manual wake
- the organizer tree carries older uncommitted work (the crew feature); it is Pablo's to commit, never sweep it
- Spec authority is in agent-slack: specs/factory-push-spec.md, specs/record-spec.md
- Never store the key anywhere but the 0600 file; never log it
- `registerCell`'s call site inside CreateCrew is uncommitted: `internal/service/crew.go` belongs to the crew-and-context card and is not in git yet. It ships when that card commits.
- `discuss_state_dir` moved into the committed config here, ahead of the crew work, because locating push.key needs it
